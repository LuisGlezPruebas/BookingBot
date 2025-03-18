import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getDaysInMonth, isPastDate } from "@/lib/utils/date-utils";

// Colores para usuarios (en formato tailwind)
const userColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500"
];

interface CalendarDayProps {
  date: string; // YYYY-MM-DD
  status: string;
  userId?: number;
  reservationIds?: number[];
  userColors: Record<number, string>;
  usernames: Record<number, string>;
}

interface MonthViewProps {
  month: number; // 1-12
  year: number;
  calendarData: CalendarDayProps[];
  userColors: Record<number, string>;
  usernames: Record<number, string>;
}

// Componente para un mes individual
function MonthView({ month, year, calendarData, userColors, usernames }: MonthViewProps) {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNamesShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  
  // Obtiene el número de días del mes
  const daysInMonth = getDaysInMonth(year, month - 1);
  
  // Obtiene el primer día del mes (0-6, donde 0 es domingo)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  
  // Ajusta para que la semana comience en lunes (0 = lunes, 6 = domingo)
  const firstDayAdjusted = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Construye los días para la vista de mes
  const days = [];
  
  // Días del mes anterior (padding)
  for (let i = 0; i < firstDayAdjusted; i++) {
    days.push(null);
  }
  
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Encuentra los datos para esta fecha en calendarData
    const dayData = calendarData.find(d => d.date === dateString);
    
    days.push({
      day,
      date: dateString,
      status: dayData?.status || "available",
      userId: dayData?.userId,
      reservationIds: dayData?.reservationIds,
      isPast: isPastDate(dateString)
    });
  }
  
  return (
    <div className="month-view">
      <h4 className="text-sm font-medium mb-2">{monthNames[month - 1]}</h4>
      <div className="grid grid-cols-7 gap-1">
        {/* Nombres de días */}
        {dayNamesShort.map((day, index) => (
          <div key={`header-${index}`} className="text-center text-xs text-muted-foreground h-6 flex items-center justify-center">
            {day}
          </div>
        ))}
        
        {/* Días del mes */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-6 w-6 rounded-full"></div>;
          }
          
          let bgClass = "bg-gray-200 text-gray-400"; // Días pasados
          
          if (!day.isPast) {
            if (day.status === "occupied" && day.userId) {
              bgClass = userColors[day.userId] || "bg-green-100"; // Color del usuario
            } else if (day.status === "pending") {
              bgClass = "bg-amber-200"; // Pendiente
            } else {
              bgClass = "bg-green-100"; // Disponible
            }
          }
          
          return (
            <div 
              key={`day-${day.date}`}
              className={`${bgClass} h-6 w-6 rounded-full flex items-center justify-center text-xs cursor-default transition-colors`}
              title={day.userId ? `${usernames[day.userId] || 'Usuario'} - ${day.date}` : day.date}
            >
              {day.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AnnualCalendarProps {
  year: string;
  calendarData: any[];
  reservations: any[];
}

export default function AnnualCalendar({ year, calendarData, reservations }: AnnualCalendarProps) {
  const [processedData, setProcessedData] = useState<CalendarDayProps[]>([]);
  const [userColors, setUserColors] = useState<Record<number, string>>({});
  const [usernames, setUsernames] = useState<Record<number, string>>({});
  
  useEffect(() => {
    // Construir un mapa de usuario -> color
    const userIds = Array.from(new Set(reservations.map((r: any) => r.userId)));
    const colors: Record<number, string> = {};
    
    userIds.forEach((userId: number, index: number) => {
      colors[userId] = userColors[index % 8]; // 8 es el número total de colores
    });
    
    setUserColors(colors);
    
    // Construir un mapa de usuario -> nombre
    const names: Record<number, string> = {};
    reservations.forEach((r: any) => {
      if (r.username && r.userId) {
        names[r.userId] = r.username;
      }
    });
    
    setUsernames(names);
    
    // Procesar datos de calendario para incluir información de reservas y usuarios
    const processed: CalendarDayProps[] = [];
    
    if (Array.isArray(calendarData)) {
      calendarData.forEach((day: any) => {
        if (!day || !day.date) return;
        
        // Encontrar reservas que incluyen esta fecha
        const dayReservations = reservations.filter((r: any) => {
          const startDate = new Date(r.startDate);
          const endDate = new Date(r.endDate);
          const currentDate = new Date(day.date);
          
          return currentDate >= startDate && currentDate <= endDate && r.status === 'approved';
        });
        
        // Si hay reservas para esta fecha, usa el ID del usuario y reserva
        if (dayReservations.length > 0) {
          processed.push({
            date: day.date,
            status: "occupied",
            userId: dayReservations[0].userId,
            reservationIds: dayReservations.map((r: any) => r.id),
            userColors,
            usernames
          });
        } else {
          processed.push({
            date: day.date,
            status: day.status,
            userColors,
            usernames
          });
        }
      });
    }
    
    setProcessedData(processed);
  }, [calendarData, reservations]);
  
  // Generar todos los meses del año
  const months = [];
  for (let month = 1; month <= 12; month++) {
    months.push(
      <MonthView 
        key={`month-${month}`}
        month={month} 
        year={parseInt(year)} 
        calendarData={processedData}
        userColors={userColors}
        usernames={usernames}
      />
    );
  }
  
  return (
    <Card className="bg-card shadow-sm mb-8">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">
          Calendario Anual {year}
        </h3>
        
        {/* Leyenda de usuarios */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(usernames).map(([userId, name], index) => (
            <div key={`legend-${userId}`} className="flex items-center">
              <div 
                className={`${userColors[Number(userId)] || userColors[0]} w-3 h-3 rounded-full mr-1`} 
              ></div>
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="bg-amber-200 w-3 h-3 rounded-full mr-1"></div>
            <span className="text-xs text-muted-foreground">Pendiente</span>
          </div>
          <div className="flex items-center">
            <div className="bg-green-100 w-3 h-3 rounded-full mr-1"></div>
            <span className="text-xs text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center">
            <div className="bg-gray-200 w-3 h-3 rounded-full mr-1"></div>
            <span className="text-xs text-muted-foreground">Pasado</span>
          </div>
        </div>
        
        {/* Grid de meses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {months}
        </div>
      </CardContent>
    </Card>
  );
}