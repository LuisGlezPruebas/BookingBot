import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, CalendarIcon, BarChart3, Users } from "lucide-react";
import { ReservationStats } from '../../../shared/schema';
import AnnualCalendar from './annual-calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para tarjetas de estadísticas
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  suffix?: string;
}

function StatsCard({ title, value, icon, suffix }: StatsCardProps) {
  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-6 flex items-center">
        <div className="mr-4 p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-bold mt-1">
            {value}{suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
          </h4>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [currentYear, setCurrentYear] = useState<string>(new Date().getFullYear().toString());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  
  useEffect(() => {
    // Cargar estadísticas para el año actual
    fetch(`/api/admin/stats/${currentYear}`)
      .then(res => res.json())
      .then(data => {
        console.log("Datos de estadísticas recibidos:", data);
        setStats(data);
      })
      .catch(error => {
        console.error("Error al cargar estadísticas:", error);
      });

    // Cargar datos de calendario
    fetch(`/api/user/calendar/${currentYear}`)
      .then(res => res.json())
      .then(data => {
        setCalendarData(data);
      })
      .catch(error => {
        console.error("Error al cargar datos del calendario:", error);
      });

    // Cargar reservas aprobadas
    fetch(`/api/admin/reservations/${currentYear}`)
      .then(res => res.json())
      .then(data => {
        console.log("Todas las reservaciones:", data);
        const approvedReservations = data.filter((r: any) => r.status === 'approved');
        console.log("Reservas aprobadas:", approvedReservations);
        setReservations(approvedReservations);
      })
      .catch(error => {
        console.error("Error al cargar reservas:", error);
      });
  }, [currentYear]);

  // Stats placeholder
  const statsData: ReservationStats = stats || {
    totalReservations: 0,
    occupiedDays: 0,
    frequentUser: "-",
    occupancyRate: 0,
    reservationsByMonth: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 })),
    reservationsByUser: []
  };

  // Calcular las noches para cada reserva
  const calculateNights = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Formatear fecha para mostrar en español
  const formatDateLocale = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy', { locale: es });
  };

  return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* 1. Calendario Anual */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Calendario Anual {currentYear}</h3>
        <div className="bg-white rounded-lg shadow-sm">
          <AnnualCalendar year={currentYear} calendarData={calendarData} reservations={reservations} />
        </div>
      </div>
      
      {/* 2. Tabla de Reservas Aprobadas */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Reservas Aprobadas</h3>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Fecha Entrada</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Fecha Salida</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Noches</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Personas</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length > 0 ? (
                  reservations.map((reservation: any) => (
                    <tr key={reservation.id} className="border-b">
                      <td className="py-4 px-4">{reservation.username}</td>
                      <td className="py-4 px-4">{formatDateLocale(reservation.startDate)}</td>
                      <td className="py-4 px-4">{formatDateLocale(reservation.endDate)}</td>
                      <td className="py-4 px-4">{calculateNights(reservation.startDate, reservation.endDate)}</td>
                      <td className="py-4 px-4">{reservation.numberOfGuests}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-muted-foreground">
                      No hay reservas aprobadas para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* 3. Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="mr-4 p-2 bg-primary/10 rounded-full">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reservas Totales</p>
            <h4 className="text-2xl font-bold mt-1">
              {statsData.totalReservations}
            </h4>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="mr-4 p-2 bg-primary/10 rounded-full">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Noches Ocupadas</p>
            <h4 className="text-2xl font-bold mt-1">
              {statsData.occupiedDays}
            </h4>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="mr-4 p-2 bg-primary/10 rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Usuario Frecuente</p>
            <h4 className="text-2xl font-bold mt-1">
              {statsData.frequentUser}
            </h4>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="mr-4 p-2 bg-primary/10 rounded-full">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tasa de Ocupación</p>
            <h4 className="text-2xl font-bold mt-1">
              {statsData.occupancyRate}<span className="text-sm font-normal ml-1">%</span>
            </h4>
          </div>
        </div>
      </div>
      
      {/* 4. Gráficos de Estadísticas */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Noches Reservadas por Usuario</h3>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-md">
              {statsData.reservationsByUser.length > 0 ? (
                statsData.reservationsByUser.map((user: any, index: number) => {
                  const maxCount = Math.max(...statsData.reservationsByUser.map((u: any) => u.count), 1);
                  const width = `${(user.count / maxCount) * 100}%`;
                  
                  return (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">{user.username}</span>
                        <span className="text-foreground font-medium">{user.count} noches</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className="bg-primary h-3 rounded-full" style={{ width }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground">
                  No hay datos de reservas para mostrar
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}