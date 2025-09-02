import type { APIContext } from 'astro';
import Fuse from 'fuse.js';
import { getCollection } from 'astro:content';

type Item = { id: string; url: string; title: string; type: string; description?: string; tags?: string[] };

export async function GET({ url }: APIContext) {
  const q = url.searchParams.get('q')?.trim() || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(25, Math.max(5, parseInt(url.searchParams.get('limit') || '10')));

  const [blog, reviews, tracking] = await Promise.all([
    getCollection('blog'),
    getCollection('reviews'),
    getCollection('tracking').catch(() => [] as any[]),
  ]);

  const items: Item[] = [
    ...blog.map(b => ({ id: b.id, url: `/blog/${b.id}/`, title: b.data.title, type: 'blog', description: b.data.description, tags: (b.data as any).tags })),
    ...reviews.map(r => ({ id: r.id, url: `/reviews/${r.id}/`, title: r.data.productName, type: 'review', description: r.data.brand, tags: r.data.tags })),
    ...tracking.map(t => ({ id: t.id, url: `/tracking/${t.id}/`, title: t.data.type + ' ' + new Date(t.data.date).toLocaleDateString(), type: 'tracking', description: t.data.notes, tags: t.data.tags })),
  ];

  let results = items;
  if (q) {
    const fuse = new Fuse<Item>(items, {
      includeScore: true,
      keys: ['title','description','tags'],
      threshold: 0.4,
      ignoreLocation: true,
    });
    results = fuse.search(q).map((r) => r.item);
  }

  const total = results.length;
  const start = (page - 1) * limit;
  const pageItems = results.slice(start, start + limit);

  return new Response(JSON.stringify({ query: q, total, page, limit, results: pageItems }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
