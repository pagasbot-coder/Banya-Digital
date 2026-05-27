import { revalidatePath } from "next/cache";

/** revalidatePath не должен ронять server action при сбое кэша. */
export function safeRevalidatePaths(paths: string[]): void {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error(`[revalidate] failed for ${path}:`, error);
    }
  }
}
