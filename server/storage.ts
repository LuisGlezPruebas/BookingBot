import { 
  Reservation, 
  InsertReservation, 
  User, 
  InsertUser,
  UpdateReservationStatus,
  ReservationStats
} from "@shared/schema";
import { calculateStats } from "../client/src/lib/utils/reservation-utils";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reservation operations
  getReservation(id: number): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservationStatus(id: number, status: UpdateReservationStatus): Promise<Reservation | undefined>;
  getReservationsByYear(year: string): Promise<Reservation[]>;
  getPendingReservationsByYear(year: string): Promise<Reservation[]>;
  getReservationHistoryByYear(year: string): Promise<Reservation[]>;
  getUserReservationsByYear(userId: number, year: string): Promise<Reservation[]>;
  getReservationStatsByYear(year: string): Promise<ReservationStats>;
  getCalendarDataByYear(year: string): Promise<{date: string, status: string}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reservations: Map<number, Reservation>;
  private userIdCounter: number;
  private reservationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.reservations = new Map();
    this.userIdCounter = 1;
    this.reservationIdCounter = 1;
    
    // Initialize with default users
    this.createUser({ username: "admin", password: "123", isAdmin: true });
    this.createUser({ username: "Luis Glez", password: "", isAdmin: false });
    
    // No sample reservations - starting with a clean database
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    for (const user of users) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      id,
      username: user.username,
      password: user.password || null,
      isAdmin: user.isAdmin || false
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Reservation operations
  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async createReservation(reservationData: InsertReservation): Promise<Reservation> {
    const id = this.reservationIdCounter++;
    const now = new Date();
    
    const reservation: Reservation = {
      id,
      userId: reservationData.userId,
      startDate: reservationData.startDate,
      endDate: reservationData.endDate,
      numberOfGuests: reservationData.numberOfGuests,
      notes: reservationData.notes || null,
      status: "pending",
      createdAt: now,
    };
    
    this.reservations.set(id, reservation);
    return reservation;
  }

  async updateReservationStatus(id: number, statusUpdate: UpdateReservationStatus): Promise<Reservation | undefined> {
    const reservation = this.reservations.get(id);
    if (!reservation) return undefined;
    
    const updatedReservation: Reservation = {
      ...reservation,
      status: statusUpdate.status,
    };
    
    this.reservations.set(id, updatedReservation);
    return updatedReservation;
  }

  async getReservationsByYear(year: string): Promise<Reservation[]> {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
    
    const reservations = Array.from(this.reservations.values());
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.startDate);
      return reservationDate >= startOfYear && reservationDate < endOfYear;
    });
  }

  async getPendingReservationsByYear(year: string): Promise<Reservation[]> {
    const yearReservations = await this.getReservationsByYear(year);
    return yearReservations.filter(res => res.status === "pending");
  }

  async getReservationHistoryByYear(year: string): Promise<Reservation[]> {
    const yearReservations = await this.getReservationsByYear(year);
    return yearReservations.filter(res => res.status === "approved" || res.status === "rejected")
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async getUserReservationsByYear(userId: number, year: string): Promise<Reservation[]> {
    const yearReservations = await this.getReservationsByYear(year);
    return yearReservations.filter(res => res.userId === userId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async getReservationStatsByYear(year: string): Promise<ReservationStats> {
    const yearReservations = await this.getReservationsByYear(year);
    
    // Create a map of user IDs to usernames
    const usernames: Record<number, string> = {};
    const users = Array.from(this.users.values());
    for (const user of users) {
      usernames[user.id] = user.username;
    }
    
    return calculateStats(yearReservations, usernames);
  }

  async getCalendarDataByYear(year: string): Promise<{date: string, status: string}[]> {
    const yearReservations = await this.getReservationsByYear(year);
    const calendarData: {date: string, status: string}[] = [];
    
    // Process each day of the year
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
    
    // For each day, check if it's within any reservation period
    for (let day = new Date(startOfYear); day < endOfYear; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split('T')[0]; // YYYY-MM-DD format
      let status = 'available';
      
      // Check each reservation
      for (const reservation of yearReservations) {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        // Set to start of day for comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        day.setHours(0, 0, 0, 0);
        
        // Check if the current day is within the reservation period
        if (day >= startDate && day <= endDate) {
          if (reservation.status === 'approved') {
            status = 'occupied';
            break; // Priority: occupied > pending > available
          } else if (reservation.status === 'pending' && status !== 'occupied') {
            status = 'pending';
            // Don't break, continue checking in case there's an approved reservation
          }
        }
      }
      
      calendarData.push({ date: dateStr, status });
    }
    
    return calendarData;
  }
}

export const storage = new MemStorage();
