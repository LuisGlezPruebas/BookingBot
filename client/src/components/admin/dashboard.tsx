import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  CalendarDays, 
  Hotel, 
  User, 
  PieChart
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/date-utils";
import AnnualCalendar from "./annual-calendar";
import { ReservationStats } from "@shared/schema";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  suffix?: string;
}

function StatsCard({ title, value, icon, suffix }: StatsCardProps) {
  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">{title}</span>
          {icon}
        </div>
        <div className="flex items-end">
          <div className="text-3xl font-semibold text-foreground">{value}</div>
          {suffix && <span className="ml-1 text-muted-foreground pb-1">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [year, setYear] = useState<string>("2025");
  
  // Consultas para obtener datos
  const { data: stats, isLoading } = useQuery<ReservationStats>({
    queryKey: [`/api/admin/stats/${year}`],
  });
  
  // Modificamos para obtener solo las reservaciones del historial (aprobadas)
  const { data: reservations, isLoading: isLoadingReservations } = useQuery({
    queryKey: [`/api/admin/reservations/history/${year}`],
  });
  
  const { data: calendarData } = useQuery({
    queryKey: [`/api/user/calendar/${year}`],
  });

  // Valores por defecto para evitar errores
  const statsData: ReservationStats = stats || {
    totalReservations: 0,
    occupiedDays: 0,
    frequentUser: '-',
    occupancyRate: 0,
    reservationsByMonth: Array(12).fill(0).map((_, i) => ({ month: i + 1, count: 0 })),
    reservationsByUser: []
  };

  const reservationsList = Array.isArray(reservations) ? reservations : [];
  const calendarDataList = Array.isArray(calendarData) ? calendarData : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 flex-grow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-foreground">Dashboard</h2>
        <div className="flex items-center">
          <label htmlFor="dashboard-year" className="mr-2 text-muted-foreground">
            Año:
          </label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendario Anual - Primero como solicitado */}
      <AnnualCalendar 
        year={year} 
        calendarData={calendarDataList} 
        reservations={reservationsList} 
      />

      {/* Listado de Reservas Aprobadas - Segundo como solicitado */}
      <Card className="bg-card shadow-sm mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Listado de Reservas Aprobadas</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Usuario</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Entrada</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Salida</TableHead>
                  <TableHead className="text-muted-foreground">Noches</TableHead>
                  <TableHead className="text-muted-foreground">Personas</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservationsList.map((reservation: any) => {
                  const nights = Math.ceil(
                    (new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.username}</TableCell>
                      <TableCell>{formatDate(reservation.startDate)}</TableCell>
                      <TableCell>{formatDate(reservation.endDate)}</TableCell>
                      <TableCell>{nights}</TableCell>
                      <TableCell>{reservation.numberOfGuests}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full reservation-status-${
                          reservation.status === 'approved' 
                            ? 'available' 
                            : reservation.status === 'pending' || reservation.status === 'modified'
                              ? 'pending' 
                              : 'rejected'
                        }`}>
                          {reservation.status === 'approved' 
                            ? 'Aceptada' 
                            : reservation.status === 'pending' 
                              ? 'En revisión'
                              : reservation.status === 'modified'
                                ? 'Modificada (pendiente)'
                                : reservation.status === 'cancelled'
                                  ? 'Cancelada'
                                  : 'Rechazada'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {reservationsList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      {isLoadingReservations ? "Cargando reservas..." : "No hay reservas disponibles"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Ahora en tercera posición */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Reservas Aprobadas" 
          value={statsData.totalReservations} 
          icon={<CalendarDays className="text-primary h-5 w-5" />} 
        />
        <StatsCard 
          title="Días Ocupados" 
          value={statsData.occupiedDays} 
          icon={<Hotel className="text-destructive h-5 w-5" />} 
        />
        <StatsCard 
          title="Usuario Frecuente" 
          value={statsData.frequentUser} 
          icon={<User className="text-secondary h-5 w-5" />} 
        />
        <StatsCard 
          title="Ocupación" 
          value={`${statsData.occupancyRate}%`} 
          icon={<PieChart className="text-[#ff832b] h-5 w-5" />} 
          suffix="anual" 
        />
      </div>

      {/* Charts Row - Al final */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Reservations Chart */}
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Noches Reservadas por Mes (Aprobadas)</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {Array(12).fill(0).map((_, index) => {
                const monthData = statsData.reservationsByMonth.find(m => m.month === index + 1);
                const monthCount = monthData?.count || 0;
                const maxCount = Math.max(...statsData.reservationsByMonth.map(m => m.count), 1);
                const height = `${(monthCount / maxCount) * 100}%`;
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="chart-bar w-full" style={{ height }}></div>
                    <span className="text-xs text-muted-foreground mt-1">{monthNames[index]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Stats Chart */}
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Noches Reservadas por Usuario (Aprobadas)</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full max-w-md">
                {statsData.reservationsByUser.map((user, index: number) => {
                  const maxCount = Math.max(...statsData.reservationsByUser.map(u => u.count), 1);
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
