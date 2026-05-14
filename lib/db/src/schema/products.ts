import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("pulsa_products", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  voucherId: text("voucher_id").notNull(),
  nama: text("nama").notNull(),
  harga: integer("harga").notNull(),
  operator: text("operator").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
