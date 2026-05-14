import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionsTable = pgTable("pulsa_transactions", {
  id: serial("id").primaryKey(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  target: text("target").notNull(),
  harga: integer("harga").notNull(),
  status: text("status").notNull().default("pending"),
  refId: text("ref_id"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
