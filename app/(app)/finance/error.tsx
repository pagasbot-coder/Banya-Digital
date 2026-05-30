"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Error boundary для /finance — не показываем generic Next.js 500. */
export default function FinanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[finance] page error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-heading text-xl font-semibold">
        Не удалось загрузить финансы
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Страница временно недоступна. Попробуйте обновить или вернитесь через
        минуту. Если ошибка повторяется — проверьте подключение к базе данных.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Повторить
        </Button>
        <Button type="button" variant="outline" onClick={() => window.location.assign("/dashboard")}>
          На сводку
        </Button>
      </div>
    </div>
  );
}
