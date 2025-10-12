import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

// ==================
// Users Table
// ==================
export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	reviews: many(reviews),
}));

// ==================
// Restaurants Table
// ==================
export const restaurants = pgTable(
	"restaurants",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		address: text("address").notNull(),
		latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
		longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
		cuisine: varchar("cuisine", { length: 100 }),
		tags: text("tags").array(), // Array of tags: ["végétarien", "terrasse", etc.]
		averageRating: decimal("average_rating", {
			precision: 3,
			scale: 2,
		}).default("0"),
		reviewCount: integer("review_count").default(0).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		// Index for geospatial queries (later can be upgraded to PostGIS)
		latLngIdx: index("lat_lng_idx").on(table.latitude, table.longitude),
		nameIdx: index("name_idx").on(table.name),
	}),
);

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
	reviews: many(reviews),
}));

// ==================
// Reviews Table
// ==================
export const reviews = pgTable(
	"reviews",
	{
		id: serial("id").primaryKey(),
		restaurantId: integer("restaurant_id")
			.notNull()
			.references(() => restaurants.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		rating: integer("rating").notNull(), // 1-5
		comment: text("comment"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		restaurantIdx: index("restaurant_idx").on(table.restaurantId),
		userIdx: index("user_idx").on(table.userId),
		// Unique constraint: one review per user per restaurant
		uniqueUserRestaurant: index("unique_user_restaurant").on(
			table.userId,
			table.restaurantId,
		),
	}),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
	restaurant: one(restaurants, {
		fields: [reviews.restaurantId],
		references: [restaurants.id],
	}),
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id],
	}),
}));

// ==================
// TypeScript Types
// ==================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
