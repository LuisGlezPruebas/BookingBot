import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema, updateReservationStatusSchema } from "@shared/schema";
import { z } from "zod";
import { EmailService } from "./services/email.service";
import { UserService } from "./services/user.service";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // === USER ROUTES ===
  
  // Get calendar data for a specific year
  app.get("/api/user/calendar/:year", async (req: Request, res: Response) => {
    try {
      const year = req.params.year;
      const calendarData = await storage.getCalendarDataByYear(year);
      res.json(calendarData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching calendar data" });
    }
  });
  
  // Get user reservations for a specific year
  app.get("/api/user/reservations/:year", async (req: Request, res: Response) => {
    try {
      const year = req.params.year;
      // Hardcoded user ID for Luis Glez (ID: 2)
      const userId = 2;
      const reservations = await storage.getUserReservationsByYear(userId, year);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user reservations" });
    }
  });
  
  // Create a new reservation
  app.post("/api/user/reservations", async (req: Request, res: Response) => {
    try {
      console.log("Received reservation data:", req.body);
      
      // Manual handling for date conversion
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          message: "Invalid date format", 
          received: { startDate: req.body.startDate, endDate: req.body.endDate } 
        });
      }
      
      // Verificar que no haya reservas aprobadas que se solapen con el rango de fechas solicitado
      const year = startDate.getFullYear().toString();
      const existingReservations = await storage.getReservationsByYear(year);
      
      // Función para verificar si dos rangos de fechas se solapan
      const datesOverlap = (startA: Date, endA: Date, startB: Date, endB: Date): boolean => {
        return startA <= endB && startB <= endA;
      };
      
      // Comprobar si hay alguna reserva aprobada que se solape
      const hasConflict = existingReservations.some(reservation => {
        // Solo considerar reservas aprobadas
        if (reservation.status !== 'approved') return false;
        
        // Verificar solapamiento
        return datesOverlap(
          startDate, 
          endDate,
          new Date(reservation.startDate), 
          new Date(reservation.endDate)
        );
      });
      
      if (hasConflict) {
        return res.status(400).json({ 
          message: "El rango de fechas seleccionado incluye días que ya están ocupados por otra reserva aprobada." 
        });
      }
      
      const validatedData = {
        userId: 2, // Hardcoded user ID for Luis Glez (ID: 2)
        startDate: startDate,
        endDate: endDate,
        numberOfGuests: parseInt(req.body.numberOfGuests) || 2,
        notes: req.body.notes || ""
      };
      
      console.log("Processed reservation data:", validatedData);
      
      const reservation = await storage.createReservation(validatedData);
      res.status(201).json(reservation);
    } catch (error) {
      console.error("Reservation error:", error);
      res.status(500).json({ message: "Error creating reservation" });
    }
  });
  
  // === ADMIN ROUTES ===
  
  // Get stats for a specific year
  app.get("/api/admin/stats/:year", async (req: Request, res: Response) => {
    try {
      const year = req.params.year;
      const stats = await storage.getReservationStatsByYear(year);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  
  // Get all reservations for a specific year
  app.get("/api/admin/reservations/:year", async (req: Request, res: Response) => {
    try {
      const year = req.params.year;
      const reservations = await storage.getReservationsByYear(year);
      
      // Get usernames for each reservation
      const reservationsWithUsernames = await Promise.all(
        reservations.map(async (reservation) => {
          const user = await storage.getUser(reservation.userId);
          return {
            ...reservation,
            username: user?.username || "Unknown User"
          };
        })
      );
      
      res.json(reservationsWithUsernames);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservations" });
    }
  });
  
  // Get pending reservations
  app.get("/api/admin/reservations/pending/:year", async (req: Request, res: Response) => {
    try {
      const year = req.params.year;
      const pendingReservations = await storage.getPendingReservationsByYear(year);
      
      // Get usernames for each reservation
      const pendingWithUsernames = await Promise.all(
        pendingReservations.map(async (reservation) => {
          const user = await storage.getUser(reservation.userId);
          return {
            ...reservation,
            username: user?.username || "Unknown User"
          };
        })
      );
      
      res.json(pendingWithUsernames);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pending reservations" });
    }
  });
  
  // Get reservation history (approved or rejected)
  app.get("/api/admin/reservations/history/:year", async (req: Request, res: Response) => {
    try {
      const year = req.params.year;
      const historyReservations = await storage.getReservationHistoryByYear(year);
      
      // Get usernames for each reservation
      const historyWithUsernames = await Promise.all(
        historyReservations.map(async (reservation) => {
          const user = await storage.getUser(reservation.userId);
          return {
            ...reservation,
            username: user?.username || "Unknown User"
          };
        })
      );
      
      res.json(historyWithUsernames);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservation history" });
    }
  });
  
  // Update reservation status
  app.patch("/api/admin/reservations/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateReservationStatusSchema.parse(req.body);
      
      const updatedReservation = await storage.updateReservationStatus(id, validatedData);
      
      if (!updatedReservation) {
        res.status(404).json({ message: "Reservation not found" });
        return;
      }
      
      res.json(updatedReservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating reservation status" });
      }
    }
  });

  return httpServer;
}
