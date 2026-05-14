import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, transactionsTable, productsTable } from "@workspace/db";
import {
  ListTransactionsQueryParams,
  GetTransactionParams,
  PlaceOrderBody,
} from "@workspace/api-zod";
import { logger } from "../../lib/logger";

const ISIPULSA_URL = "https://isipulsa.web.id/api/v2/get";
const ISIPULSA_USER = process.env.ISIPULSA_USER ?? "andyyuda";
const ISIPULSA_TOKEN = process.env.ISIPULSA_TOKEN ?? "";
const APP_VERSION = "250608";

function fmtTx(r: typeof transactionsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

const router: IRouter = Router();

router.get("/pulsa/transactions", async (req, res): Promise<void> => {
  const q = ListTransactionsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const { status, limit = 50, offset = 0 } = q.data;
  const rows = await db
    .select()
    .from(transactionsTable)
    .where(status ? eq(transactionsTable.status, status) : undefined)
    .orderBy(transactionsTable.createdAt)
    .limit(Number(limit))
    .offset(Number(offset));
  res.json(rows.map(fmtTx));
});

router.get("/pulsa/transactions/:id", async (req, res): Promise<void> => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, params.data.id));
  if (!row) { res.status(404).json({ error: "Transaction not found" }); return; }
  res.json(fmtTx(row));
});

router.post("/pulsa/order", async (req, res): Promise<void> => {
  const parsed = PlaceOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { productCode, target } = parsed.data;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.code, productCode));

  if (!product) {
    res.status(400).json({ error: "Produk tidak ditemukan" });
    return;
  }
  if (!product.isActive) {
    res.status(400).json({ error: "Produk tidak aktif" });
    return;
  }

  const [trx] = await db
    .insert(transactionsTable)
    .values({
      productCode,
      productName: product.nama,
      target,
      harga: product.harga,
      status: "pending",
    })
    .returning();

  const params = new URLSearchParams({
    auth_username: ISIPULSA_USER,
    auth_token: ISIPULSA_TOKEN,
    app_version_code: APP_VERSION,
    type: "transaction",
    voucher_id: product.voucherId,
    target,
    ref_id: String(trx.id),
  });

  let status = "gagal";
  let refId: string | null = null;
  let note: string | null = null;

  try {
    const resp = await fetch(ISIPULSA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await resp.json() as Record<string, unknown>;
    req.log.info({ data }, "isipulsa order response");

    const rc = String(data.rc ?? data.result_code ?? "");
    if (rc === "00" || rc === "0" || data.status === "success") {
      status = "success";
    } else if (rc === "68" || data.status === "pending") {
      status = "pending";
    } else {
      status = "gagal";
    }
    refId = String(data.ref_id ?? data.sn ?? trx.id);
    note = String(data.message ?? data.desc ?? "");
  } catch (err) {
    logger.error({ err }, "isipulsa order failed");
    note = "Gagal menghubungi server isipulsa";
  }

  const [updated] = await db
    .update(transactionsTable)
    .set({ status, refId, note })
    .where(eq(transactionsTable.id, trx.id))
    .returning();

  res.status(201).json(fmtTx(updated));
});

export default router;
