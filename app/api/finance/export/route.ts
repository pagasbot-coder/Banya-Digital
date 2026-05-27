import { auth } from "@/auth";
import { isDemoSkipAuth } from "@/lib/demo-auth";
import { buildFinanceExportCsv } from "@/modules/finance/services/build-finance-export-csv";

export const dynamic = "force-dynamic";

/** GET — CSV выгрузка финансов (T-023 MVP, без 1С). */
export async function GET() {
  if (!isDemoSkipAuth()) {
    const session = await auth();
    if (!session?.user) {
      return new Response("Требуется вход персонала", { status: 401 });
    }
  }

  const result = await buildFinanceExportCsv();
  if (!result.ok) {
    return new Response(result.message, { status: result.status });
  }

  return new Response(result.body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
