import { Router, type IRouter } from "express";
import { sql, desc } from "drizzle-orm";
import { db, productsTable, transactionsTable } from "@workspace/db";
import { logger } from "../../lib/logger";

const ISIPULSA_URL = "https://isipulsa.web.id/api/v2/get";
const ISIPULSA_USER = process.env.ISIPULSA_USER ?? "andyyuda";
const ISIPULSA_TOKEN = process.env.ISIPULSA_TOKEN ?? "";
const APP_VERSION = "250608";

const router: IRouter = Router();

router.get("/pulsa/balance", async (req, res): Promise<void> => {
  const params = new URLSearchParams({
    auth_username: ISIPULSA_USER,
    auth_token: ISIPULSA_TOKEN,
    app_version_code: APP_VERSION,
    type: "balance",
  });

  try {
    const resp = await fetch(ISIPULSA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await resp.json() as Record<string, unknown>;
    req.log.info({ data }, "isipulsa balance response");

    const balance = data.balance != null ? Number(data.balance) : null;
    const username = data.username != null ? String(data.username) : ISIPULSA_USER;
    const message = data.message != null ? String(data.message) : null;
    res.json({ balance, username, message });
  } catch (err) {
    logger.error({ err }, "isipulsa balance failed");
    res.json({ balance: null, username: ISIPULSA_USER, message: "Gagal mengambil saldo" });
  }
});

router.get("/pulsa/stats", async (_req, res): Promise<void> => {
  const [prodRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable);

  const [trxRow] = await db
    .select({
      total: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(harga), 0)::int`,
      success: sql<number>`count(*) filter (where status = 'success')::int`,
      fail: sql<number>`count(*) filter (where status = 'gagal')::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
    })
    .from(transactionsTable);

  const recent = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(10);

  res.json({
    totalProducts: prodRow.count,
    totalTransactions: trxRow.total,
    totalRevenue: trxRow.revenue,
    successCount: trxRow.success,
    failCount: trxRow.fail,
    pendingCount: trxRow.pending,
    recentTransactions: recent.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
  });
});

export default router;
