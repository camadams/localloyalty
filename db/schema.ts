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

export const users = pgTable("user", {
  id: serial("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Businesses table
export const businesses = pgTable("business", {
  id: serial("id").notNull().primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;

// Loyalty Cards table
export const cards = pgTable("card", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id),
  name: text("name").notNull(),
  points: integer("points").default(0).notNull(),
  maxPoints: integer("max_points").default(10).notNull(),
  status: text("status", {
    enum: ["active", "expired", "suspended", "revoked"],
  })
    .default("active")
    .notNull(),
  artworkUrl: text("artwork_url"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

// Business employees join table with permissions
export const businessEmployees = pgTable(
  "business_employee",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    businessId: integer("business_id").references(() => businesses.id),
    canGivePoints: boolean("can_give_points").default(false),
    assignedBy: integer("assigned_by").references(() => users.id),
    assignedAt: timestamp("assigned_at").defaultNow(),
  }
  // (table) => ({
  //   primaryKey: primaryKey({ columns: [table.userId, table.businessId] }),
  // })
);
export type BusinessEmployee = typeof businessEmployees.$inferSelect;
export type NewBusinessEmployee = typeof businessEmployees.$inferInsert;

// Points transaction history
export const pointsTransactions = pgTable("points_transaction", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type NewPointsTransaction = typeof pointsTransactions.$inferInsert;

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
  actorId: integer("actor_id")
    .references(() => users.id)
    .notNull(),
  targetType: text("target_type", {
    enum: ["CARD", "USER", "BUSINESS", "EMPLOYEE_PERMISSION"],
  }).notNull(),
  targetId: integer("target_id").notNull(),
  affectedUserId: integer("affected_user_id").references(() => users.id),
  affectedBusinessId: integer("affected_business_id").references(
    () => businesses.id
  ),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations (updated with card relationships)
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  cards: many(cards),
  givenTransactions: many(pointsTransactions),
  auditLogs: many(auditLog),
}));

export const businessesRelations = relations(businesses, ({ many }) => ({
  employees: many(businessEmployees),
  cards: many(cards),
  transactions: many(pointsTransactions),
  auditLogs: many(auditLog),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [cards.businessId],
    references: [businesses.id],
  }),
  transactions: many(pointsTransactions),
}));
