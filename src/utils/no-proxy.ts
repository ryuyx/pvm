/**
 * Utilities for managing NO_PROXY comma-separated list
 */

export function parseNoProxyList(list: string): string[] {
  if (!list) return [];
  return list
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function formatNoProxyList(items: string[]): string {
  return items.filter((item) => item.trim().length > 0).join(',');
}

export function addToNoProxyList(list: string, item: string): string {
  if (!item || !item.trim()) return list;

  const items = parseNoProxyList(list);
  const trimmedItem = item.trim();

  if (items.includes(trimmedItem)) {
    return list; // Already exists
  }

  items.push(trimmedItem);
  return formatNoProxyList(items);
}

export function removeFromNoProxyList(list: string, item: string): string {
  if (!item || !item.trim()) return list;

  const items = parseNoProxyList(list);
  const trimmedItem = item.trim();
  const filtered = items.filter((i) => i !== trimmedItem);

  return formatNoProxyList(filtered);
}

export function containsInNoProxyList(list: string, item: string): boolean {
  if (!item || !item.trim()) return false;

  const items = parseNoProxyList(list);
  return items.includes(item.trim());
}
