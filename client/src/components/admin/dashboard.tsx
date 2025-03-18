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
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Reservas Totales"
          value={statsData.totalReservations}
          icon={<CalendarIcon className="h-6 w-6 text-primary" />}
        />
        
        <StatsCard
          title="Noches Ocupadas"
          value={statsData.occupiedDays}
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
        />
        
        <StatsCard
          title="Usuario Frecuente"
          value={statsData.frequentUser}
          icon={<User className="h-6 w-6 text-primary" />}
        />
        
        <StatsCard
          title="Tasa de Ocupación"
          value={statsData.occupancyRate}
          icon={<Users className="h-6 w-6 text-primary" />}
          suffix="%"
        />
      </div>
      
      {/* 1. Calendario Anual */}
      <AnnualCalendar year={currentYear} calendarData={calendarData} reservations={reservations} />
      
      {/* 2. Tabla de Reservas Aprobadas */}
      <Card className="bg-card shadow-sm mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Reservas Aprobadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">Usuario</th>
                  <th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">Entrada</th>
                  <th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">Salida</th>
                  <th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">Noches</th>
                  <th className="text-left py-2 px-4 font-medium text-sm text-muted-foreground">Huéspedes</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length > 0 ? (
                  reservations.map((reservation: any) => (
                    <tr key={reservation.id} className="border-b">
                      <td className="py-3 px-4">{reservation.username}</td>
                      <td className="py-3 px-4">{formatDateLocale(reservation.startDate)}</td>
                      <td className="py-3 px-4">{formatDateLocale(reservation.endDate)}</td>
                      <td className="py-3 px-4">{calculateNights(reservation.startDate, reservation.endDate)}</td>
                      <td className="py-3 px-4">{reservation.numberOfGuests}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-muted-foreground">
                      No hay reservas aprobadas para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* 3. Gráficos de Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Reservations Chart */}
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Noches Reservadas por Mes</h3>
            <div className="h-64 flex flex-col relative">
              {/* Contenedor principal */}
              <div className="flex w-full h-full">
                {/* Eje Y con números */}
                <div className="flex flex-col justify-between w-10 pr-2">
                  <span className="text-xs text-muted-foreground">31</span>
                  <span className="text-xs text-muted-foreground">15</span>
                  <span className="text-xs text-muted-foreground">0</span>
                </div>
                
                {/* Área del gráfico */}
                <div className="flex-grow relative">
                  {/* Líneas de guía horizontales */}
                  <div className="absolute w-full border-t border-dashed border-muted-foreground/20 top-0"></div>
                  <div className="absolute w-full border-t border-dashed border-muted-foreground/20 top-1/2"></div>
                  <div className="absolute w-full border-t border-dashed border-muted-foreground/20 bottom-0"></div>
                  
                  {/* Barras del gráfico */}
                  <div className="h-full flex items-end justify-between">
                    {Array(12).fill(0).map((_, index) => {
                      const monthData = statsData.reservationsByMonth.find((m: any) => m.month === index + 1);
                      const monthCount = monthData?.count || 0;
                      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                      
                      // Cálculo de altura: 0 = 0%, 15 = 50%, 31 = 100%
                      const height = `${Math.min(100, (monthCount / 31) * 100)}%`;
                      
                      return (
                        <div key={index} className="flex flex-col items-center w-full mx-1">
                          <div className="h-full w-full flex flex-col justify-end relative">
                            {monthCount > 0 && (
                              <div className="absolute -top-6 text-xs font-semibold">
                                {monthCount}
                              </div>
                            )}
                            <div 
                              className={`w-full bg-primary rounded-t-sm transition-all duration-300 ${monthCount > 0 ? 'opacity-100' : 'opacity-0'}`} 
                              style={{ height }}
                              title={`${monthCount} noches en ${monthNames[index]}`}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">{monthNames[index]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stats Chart */}
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Noches Reservadas por Usuario</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full max-w-md">
                {statsData.reservationsByUser.map((user: any, index: number) => {
                  const maxCount = Math.max(...statsData.reservationsByUser.map((u: any) => u.count), 1);
                  const width = `${(user.count / maxCount) * 100}%`;
                  
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">{user.username}</span>
                        <span className="text-foreground font-medium">{user.count} noches</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}