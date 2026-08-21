export async function safeFetchJSON<T>(url: string, fallback: T, timeoutMs: number = 4000): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data as T;
  } catch (error) {
    clearTimeout(id);
    console.warn(`Resilience fallback engaged for ${url}:`, error);
    return fallback;
  }
}
