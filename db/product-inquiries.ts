import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const pannaKidsInquiries = sqliteTable("panna_kids_inquiries", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().unique(),
  payloadHash: text("payload_hash").notNull(),
  configurationJson: text("configuration_json").notNull(),
  contactJson: text("contact_json").notNull(),
  commercialSnapshotJson: text("commercial_snapshot_json").notNull(),
  catalogueVersion: integer("catalogue_version").notNull(),
  status: text("status").notNull().default("received"),
  createdAt: integer("created_at").notNull(),
});
