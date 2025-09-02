// remark-iconify: inline Iconify icons in plain Markdown without client JS
// Syntax: :icon[collection:name]{class="..." width="20" height="20"}
// Shorthands: .cls #id; Helpers: size="1.25em", align="text-bottom|middle|-0.125em"

import { createRequire } from 'node:module';
import { getIconData, iconToSVG, replaceIDs } from '@iconify/utils';

const require = createRequire(import.meta.url);

// Load installed collections you want to support
const collections = Object.fromEntries(
	[
		['mdi', '@iconify-json/mdi/icons.json'],
		['line-md', '@iconify-json/line-md/icons.json'],
	].map(([k, pkg]) => {
		try {
			return [k, require(pkg)];
		} catch {
			return [k, null];
		}
	})
);

function parseAttrString(input = '') {
	const attrs = {};
	if (!input) return attrs;
	// Normalize smart quotes to regular quotes
	input = input
		.replace(/[\u201C\u201D]/g, '"') // smart double quotes
		.replace(/[\u2018\u2019]/g, "'"); // smart single quotes

	// .class #id shorthands
	const classMatches = [...input.matchAll(/\.[A-Za-z0-9_-]+/g)].map((m) => m[0].slice(1));
	if (classMatches.length) attrs.class = classMatches.join(' ');
	const idMatch = input.match(/#([A-Za-z0-9_-]+)/);
	if (idMatch) attrs.id = idMatch[1];

	// key=value pairs (supports "double", 'single', or unquoted until whitespace/})
	const pairRe = /([A-Za-z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'}]+))/g;
	for (const m of input.matchAll(pairRe)) {
		const k = m[1];
		const v = m[2] ?? m[3] ?? m[4] ?? '';
		if (k === 'class') {
			attrs.class = attrs.class ? `${attrs.class} ${v}` : v;
		} else if (k === 'className') {
			attrs.class = attrs.class ? `${attrs.class} ${v}` : v;
		} else {
			attrs[k] = v;
		}
	}
	return attrs;
}

function escapeAttr(v) {
	return String(v)
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

export default function remarkIconify() {
	return async function transformer(tree) {
		const ICON_RE = /:icon\[(?<full>[a-z0-9-]+:[a-z0-9-]+)\](?:\{(?<attrs>[^}]*)\})?/gi;

		function processParent(parent) {
			if (!parent || !Array.isArray(parent.children)) return;
			for (let i = 0; i < parent.children.length; i++) {
				const node = parent.children[i];
				if (node && node.type === 'text' && typeof node.value === 'string') {
					let value = node.value;
					let out = '';
					let last = 0;
					ICON_RE.lastIndex = 0;
					let m;
								while ((m = ICON_RE.exec(value))) {
						out += value.slice(last, m.index);

						const full = m.groups?.full || '';
						const [collection, name] = full.split(':');
									let attrStr = m.groups?.attrs;
									let advanceBy = 0;

						// If attrs not captured and next sibling begins with {...}, consume it
									if (attrStr === undefined) {
										// Try to consume `{...}` immediately in the same node
										const after = value.slice(ICON_RE.lastIndex);
										if (after.startsWith('{')) {
											const end = after.indexOf('}');
											if (end >= 0) {
												attrStr = after.slice(1, end);
												advanceBy = end + 1; // include closing brace
											}
										}
										// Or from next sibling text node
							const next = parent.children[i + 1];
							if (next && next.type === 'text' && typeof next.value === 'string' && next.value.startsWith('{')) {
								const end = next.value.indexOf('}');
								if (end >= 0) {
									attrStr = next.value.slice(1, end);
									next.value = next.value.slice(end + 1);
									if (!next.value) parent.children.splice(i + 1, 1);
								}
							}
						}

						const extra = parseAttrString(attrStr || '');
						const pkg = collections[collection];
						const iconData = pkg ? getIconData(pkg, name) : null;
						if (!iconData) {
							out += m[0];
						} else {
							const { attributes, body } = iconToSVG(iconData, { height: '1em' });
							const safeBody = replaceIDs(body);

							// Defaults: follow font size, avoid cropping, inline baseline alignment
							const baseStyle = 'overflow:visible;display:inline-block;vertical-align:-0.125em;';
							const mergedStyle = extra.style
								? `${baseStyle}${baseStyle.endsWith(';') ? '' : ';'}${String(extra.style)}`
								: baseStyle;

							const base = {
								...attributes,
								width: '1em',
								height: '1em',
								style: mergedStyle,
								fill: 'currentColor',
								'aria-hidden': 'true',
								role: 'img',
							};

							// Helpers
							const svgAttrs = { ...base, ...extra };
							if (svgAttrs.size) {
								svgAttrs.width = svgAttrs.size;
								svgAttrs.height = svgAttrs.size;
								delete svgAttrs.size;
							}
							if (svgAttrs.align) {
								svgAttrs.style = `${svgAttrs.style}${svgAttrs.style && !String(svgAttrs.style).trim().endsWith(';') ? ';' : ''}vertical-align:${svgAttrs.align};`;
								delete svgAttrs.align;
							}

							const attrsString = Object.entries(svgAttrs)
								.map(([k, v]) => `${k}="${escapeAttr(v)}"`)
								.join(' ');
							out += `<svg ${attrsString}>${safeBody}</svg>`;
						}
						last = ICON_RE.lastIndex + advanceBy;
					}
					if (out) {
						out += value.slice(last);
						// Clean up any trailing empty `{}` that may follow an inserted SVG when no attrs were provided
						out = out.replace(/(<svg\b[^>]*>.*?<\/svg>)\{\}/gs, '$1');
						parent.children[i] = { type: 'html', value: out };
					}
				}
				const child = parent.children[i];
				if (child && Array.isArray(child.children)) processParent(child);
			}
		}

		processParent(tree);
	};
}

