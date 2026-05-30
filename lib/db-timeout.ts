/** Ограничение ожидания Prisma на Vercel/Neon — зависший запрос не должен ронять RSC. */
export async function withDbTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  ms = 8_000
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("db_timeout")), ms);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
