import { pgTable, varchar, pgEnum, integer, uuid, text, boolean } from "drizzle-orm/pg-core";

export const tokenTypeEnum = pgEnum("token_type", ["ACCESS", "REFRESH", "CONFIRMATION", "RESET"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 50 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar().notNull(),
  confirmed: boolean().notNull().default(false),
  createdAt: integer().notNull().default(Math.floor(Date.now() / 1000)),
  updatedAt: integer().notNull().default(Math.floor(Date.now() / 1000)),
  profilePictureUrl: varchar().notNull().default("https://api.dev.akastler.fr/pictures/default-avatar.png"),
});

export const tokensTable = pgTable("tokens", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar({ length: 512 }).notNull().unique(),
  type: tokenTypeEnum().notNull(),
  expiresAt: integer().notNull(),
  createdAt: integer().notNull().default(Math.floor(Date.now() / 1000)),
});