import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Reservations table
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReservationSchema = createInsertSchema(reservations).pick({
  userId: true,
  startDate: true,
  endDate: true,
  numberOfGuests: true,
  notes: true,
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"])
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type UpdateReservationStatus = z.infer<typeof updateReservationStatusSchema>;

// Statistics type for dashboard
export type ReservationStats = {
  totalReservations: number;
  occupiedDays: number;
  frequentUser: string;
  occupancyRate: number;
  reservationsByMonth: { month: number; count: number }[];
  reservationsByUser: { username: string; count: number }[];
};
