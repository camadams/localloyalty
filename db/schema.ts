import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// export const user = pgTable("user", {
//   id: serial("id").notNull().primaryKey(),
//   name: text("name").notNull(),
//   email: text("email").notNull().unique(),
//   emailVerified: timestamp("emailVerified", { mode: "date" }),
//   image: text("image"),
// });

//-----------------------auth--------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

//-----------------------auth--------------------------

// Businesses table
export const businesses = pgTable("business", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loyalty Cards table
export const loyaltyCards = pgTable("loyalty_card", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  description: text("description").notNull(),
  // points: integer("points").default(0).notNull(),
  maxPoints: integer("max_points").default(10).notNull(),
  status: text("status", {
    enum: ["active", "expired", "suspended", "revoked"],
  })
    .default("active")
    .notNull(),
  artworkUrl: text("artwork_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business employees join table with permissions
export const businessEmployees = pgTable(
  "business_employee",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    canGivePoints: boolean("can_give_points").notNull().default(true),
    assignedBy: text("assigned_by").references(() => user.id),
    assignedAt: timestamp("assigned_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  }
  // (table) => ({
  //   primaryKey: primaryKey({ columns: [table.userId, table.businessId] }),
  // })
);

export const cardsInUse = pgTable("users_loyalty_cards", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  loyaltyCardId: integer("loyalty_card_id")
    .notNull()
    .references(() => loyaltyCards.id),
  points: integer("points").default(1).notNull(),
  // maxPoints: integer("max_points").default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Points transaction history
export const pointsTransactions = pgTable("points_transaction", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .notNull()
    .references(() => loyaltyCards.id),
  employeeId: text("employee_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// export const auditEventType = pgTable("audit_event_type", {
//   name: text("name").primaryKey(),
// });

// export const auditTargetType = pgTable("audit_target_type", {
//   name: text("name").primaryKey(),
// });

// Audit Log table
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  eventType: text("event_type", {
    enum: [
      "CARD_STATUS_CHANGE",
      "EMPLOYEE_PERMISSION_CHANGE",
      "CARD_ARTWORK_UPDATE",
      "POINTS_TRANSACTION",
      "USER_ACCOUNT_CHANGE",
      "BUSINESS_INFO_UPDATE",
    ],
  }).notNull(),
  actorId: text("actor_id")
    .references(() => user.id)
    .notNull(),
  targetType: text("target_type", {
    enum: ["CARD", "USER", "BUSINESS", "EMPLOYEE_PERMISSION"],
  }).notNull(),
  targetId: integer("target_id").notNull(),
  affectedUserId: text("affected_user_id").references(() => user.id),
  affectedBusinessId: integer("affected_business_id").references(
    () => businesses.id
  ),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations (updated with card relationships)
export const usersRelations = relations(user, ({ many }) => ({
  businesses: many(businesses),
  cards: many(loyaltyCards),
  givenTransactions: many(pointsTransactions),
  auditLogs: many(auditLog),
}));

export const businessesRelations = relations(businesses, ({ many }) => ({
  // employees: many(businessEmployees),
  cards: many(loyaltyCards),
  transactions: many(pointsTransactions),
  auditLogs: many(auditLog),
}));

export const cardsRelations = relations(loyaltyCards, ({ one, many }) => ({
  business: one(businesses, {
    fields: [loyaltyCards.businessId],
    references: [businesses.id],
  }),
  transactions: many(pointsTransactions),
}));
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Card = typeof loyaltyCards.$inferSelect;
export type NewCard = typeof loyaltyCards.$inferInsert;
export type CardInUse = typeof cardsInUse.$inferSelect;
export type NewCardInUse = typeof cardsInUse.$inferInsert;
// export type BusinessEmployee = typeof businessEmployees.$inferSelect;
// export type NewBusinessEmployee = typeof businessEmployees.$inferInsert;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type NewPointsTransaction = typeof pointsTransactions.$inferInsert;
