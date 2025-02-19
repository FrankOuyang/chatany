import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role_enum", ["assistant", "user"]);

export const chats = pgTable("chats", {
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    // pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: varchar('user_id', { length: 256 }).notNull(),
    fileKey: text('file_key').notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id')
        .references(() => chats.id)
        .notNull(), // one-to-many relationship
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    role: roleEnum('role').notNull(),
})
