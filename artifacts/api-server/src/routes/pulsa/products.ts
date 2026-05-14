import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pulsa/products", async (req, res): Promise<void> => {
  const q = ListProductsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const { operator, search, limit = 100, offset = 0 } = q.data;

  const conditions = [];
  if (operator) conditions.push(eq(productsTable.operator, operator));
  if (search) conditions.push(ilike(productsTable.nama, `%${search}%`));

  const rows = await db
    .select()
    .from(productsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(productsTable.operator, productsTable.nama)
    .limit(Number(limit))
    .offset(Number(offset));

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/pulsa/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.get("/pulsa/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!row) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.put("/pulsa/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(productsTable)
    .set(parsed.data)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!row) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.delete("/pulsa/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Product not found" }); return; }
  res.sendStatus(204);
});

router.get("/pulsa/operators", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ operator: productsTable.operator })
    .from(productsTable)
    .orderBy(productsTable.operator);
  res.json(rows.map(r => r.operator));
});

export default router;
