/**
 * List endpoints in this app paginate with a plain page-number offset
 * (`skip`/`take`, ordered by `createdAt desc`) while the underlying rows can
 * change at any time (new posts, follows, notifications, ...). If a row is
 * inserted while a client is paging through, everything shifts down by one
 * and the same row can be returned on two consecutive pages.
 *
 * Callers that accumulate pages (e.g. `useInfiniteQuery`'s
 * `pages.flatMap(...)`) should run the merged list through this before
 * rendering, so a duplicated row doesn't turn into a duplicate React/RN key.
 */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
