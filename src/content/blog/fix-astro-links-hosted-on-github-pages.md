---
title: Fix Astro Links when Hosting on GitHub Pages
description: Using a simple, short-term javascript function to fix site links missing the github page repo name path
createdDate: 2025-09-02
heroImage: "@assets/hero/fix-astro-links-hero.jpeg"
updatedDate: 2025-09-02T17:19
---
# The Issue

Setting up Astro with Obsidian was surprising simple-ish but once I had ironed out my first set of AI hallucination issues I was on to my next set... ***Hosting***.

Being cheap and working on a PoC that would later be hosted on a proper domain I decided to use GitHub Pages for an easy and automatic system. But when I finally strangled the Github Action into working, I found that all my links and loading was hopelessly broken. Because Github Pages adds the repo-name to the start of the path, all my astro pages expecting a blank base path instantly folded like wet spaghetti. The solution (at least one of them, of... quality) is below.

# The Solution

I wanted a minimally intrusive solution so when it is inevitably completely reconfigured to be moved to a subdomain of a personal domain name with a blank base path I could fix everything.

## The Good

The below was added to indicate the url that would be used and more importantly the base url that would be used in a completely reasonable and intended use of the software.

`astro.config.mjs`
```mjs
...

export default defineConfig({
  site: 'https://phantomoffkanagawa.github.io',
  base: '/personal-blog/',
  ...

});
```

## The Bad

The imports for fonts and favicon done in the head are mostly easily hard-coded. At the least they don't appear in a lot of place but it still feels bad to not have an elegant variable solution. Some variable use in the BaseHead can mitigate this hell but only some.

`BaseHead.astro`
```astro
const base = "/personal-blog/";
---

...

<link rel="icon" type="image/svg+xml" href={`${base}/favicon.svg`} />
<link rel="sitemap" href={`${base}/sitemap-index.xml`} />

...

<link rel="preload" href={`${base}fonts/JetBrainsMono-Regular.woff2`} as="font" type="font/woff2" crossorigin />
<link rel="preload" href={`${base}fonts/JetBrainsMono-Bold.woff2`} as="font" type="font/woff2" crossorigin />
<link rel="preload" href={`${base}fonts/JetBrainsMono-Italic.woff2`} as="font" type="font/woff2" crossorigin />

...
```

`global.css`
```astro
...
@font-face {
	font-family: "JetBrainsMono";
	src: url("/personal-blog/fonts/JetBrainsMono-Regular.woff2") format("woff2");
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}
...
```

## The Ugly

Yeah... in the light of no remotely elegant solution to the many links I had already designed with no support for a changing base path I instead turned to the dark side where mild performance hits can let you be crazy lazy, as long as you cross your fingers when you think about possible complications.

For this I added a small javascript function to the head that runs on document load and rewrites all href values to include the base

`BaseHead.astro`
```astro
...

<script>
    // Function to fix a single URL
    function fixUrl(url) {
    // Check if the URL is an internal, absolute path
    if (url.startsWith('/') && !url.startsWith('//')) {
        // Get the base path from the current URL
        const basePath = window.location.pathname.split('/')[1];

        // Check if the link already includes the base path
        if (url.startsWith(`/${basePath}/`)) {
        return url; // Already correct
        }

        // Prepend the base path
        return `/${basePath}${url}`;
    }
    return url; // Return as is for external or relative links
    }

    // Function to fix all links on the page
    function fixAllLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        link.href = fixUrl(link.getAttribute('href'));
    });
    }

    // Run the function when the page loads
    document.addEventListener('DOMContentLoaded', fixAllLinks);
</script>

...
```

## The End
This simple fix saved a lot of time rewriting links and moving to a new paradigm, trying to thread base path variables through files for what might ultimately be a useless change. But for the interim, I am glad to have an easy elegant adjacent solution for an adaptable blog hosting project.

##### Additional Files
###### Github Action

```yml
name: Deploy Astro site to GitHub Pages

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build Astro site
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```