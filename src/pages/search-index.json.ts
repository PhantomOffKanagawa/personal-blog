import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

type Item = {
  id: string;
  url: string;
  title: string;
  type: 'blog' | 'review' | 'tracking';
  description?: string;
  tags?: string[];
  when?: number; // epoch ms for sorting
};

export async function GET(_ctx: APIContext) {
  const [blog, reviews, tracking] = await Promise.all([
    getCollection('blog'),
    getCollection('reviews'),
    getCollection('tracking').catch(() => [] as any[]),
  ]);

  const items: Item[] = [
    ...blog.map((b) => ({
      id: b.id,
      url: `/blog/${b.id}/`,
      title: b.data.title,
      type: 'blog' as const,
      description: b.data.description,
      tags: (b.data as any).tags,
      when: Number(new Date(b.data.createdDate)),
    })),
    ...reviews.map((r) => ({
      id: r.id,
      url: `/reviews/${r.id}/`,
      title: r.data.productName,
      type: 'review' as const,
      description: r.data.brand,
      tags: r.data.tags,
      when: Number(new Date(r.data.createdDate)),
    })),
    ...tracking.map((t) => ({
      id: t.id,
      url: `/tracking/${t.id}/`,
      title: `${t.data.type} ${new Date(t.data.date).toLocaleDateString()}`,
      type: 'tracking' as const,
      description: t.data.notes,
      tags: t.data.tags,
      when: Number(new Date(t.data.date)),
    })),
  ];

  // Sorted newest first for a nicer default view
  items.sort((a, b) => (b.when || 0) - (a.when || 0));

  return new Response(JSON.stringify({ items }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
