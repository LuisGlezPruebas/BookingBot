import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Additional validation schema for reservation form
const reservationSchema = z.object({
  startDate: z.string().min(1, "Fecha de entrada es requerida"),
  endDate: z.string().min(1, "Fecha de salida es requerida"),
  numberOfGuests: z.number().min(1, "Mínimo 1 persona").max(10, "Máximo 10 personas"),
  notes: z.string().optional(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "La fecha de salida debe ser posterior a la fecha de entrada",
  path: ["endDate"]
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function Calendar() {
  const [year, setYear] = useState<string>("2025");
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: calendarData, isLoading } = useQuery({
    queryKey: [`/api/user/calendar/${year}`],
  });
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      numberOfGuests: 1,
      notes: ''
    }
  });
  
  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  
  // Update nights calculation when dates change
  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      const start = new Date(watchStartDate);
      const end = new Date(watchEndDate);
      if (end > start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setValue("nights", diffDays);
      }
    }
  }, [watchStartDate, watchEndDate, setValue]);
  
  // Mutation for creating a reservation
  const createReservation = useMutation({
    mutationFn: async (data: ReservationFormValues) => {
      return await apiRequest("POST", "/api/user/reservations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/calendar/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/reservations/${year}`] });
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de reserva ha sido enviada con éxito y está pendiente de aprobación.",
        variant: "default",
      });
      reset();
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo enviar la reserva: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ReservationFormValues) => {
    createReservation.mutate(data);
  };
  
  // Calendar month navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setYear(String(parseInt(year) - 1));
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setYear(String(parseInt(year) + 1));
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Calendar date selection
  const handleDateClick = (dateStr: string, status: string) => {
    if (status !== 'available') return;
    
    if (!selectedStartDate) {
      setSelectedStartDate(dateStr);
      setValue("startDate", dateStr);
    } else if (!selectedEndDate) {
      // Ensure end date is after start date
      if (new Date(dateStr) > new Date(selectedStartDate)) {
        setSelectedEndDate(dateStr);
        setValue("endDate", dateStr);
      } else {
        // If not, reset and set this as start date
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
        setValue("startDate", dateStr);
        setValue("endDate", "");
      }
    } else {
      // Reset selection and start new
      setSelectedStartDate(dateStr);
      setSelectedEndDate(null);
      setValue("startDate", dateStr);
      setValue("endDate", "");
    }
  };
  
  // Helpers for building the calendar
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  
  // Build calendar data
  const buildCalendar = () => {
    const yearNum = parseInt(year);
    const daysInMonth = getDaysInMonth(yearNum, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(yearNum, currentMonth);
    const prevMonthDays = getFirstDayOfMonth(yearNum, currentMonth) === 0 ? 6 : firstDayOfMonth - 1;
    
    // Calendar array with prev month days for padding
    const days = [];
    
    // Get days from previous month for padding
    if (prevMonthDays > 0) {
      const prevMonthDaysCount = getDaysInMonth(yearNum, currentMonth - 1);
      for (let i = prevMonthDays - 1; i >= 0; i--) {
        days.push({
          day: prevMonthDaysCount - i,
          month: currentMonth - 1,
          year: yearNum,
          isPadding: true,
          status: 'unavailable'
        });
      }
    }
    
    // Current month days with status
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${yearNum}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      let status = 'available';
      // Check in calendarData for status, defaulting to available
      if (calendarData) {
        const dateStatus = calendarData.find((d: any) => d.date === dateStr)?.status;
        if (dateStatus) status = dateStatus;
      }
      
      // Check if date is selected
      let isSelected = false;
      if (selectedStartDate && selectedEndDate) {
        isSelected = dateStr === selectedStartDate || dateStr === selectedEndDate ||
                    (dateStr > selectedStartDate && dateStr < selectedEndDate);
      } else if (selectedStartDate) {
        isSelected = dateStr === selectedStartDate;
      }
      
      days.push({
        day: i,
        month: currentMonth,
        year: yearNum,
        isPadding: false,
        status,
        dateStr,
        isSelected
      });
    }
    
    // Next month days for padding to complete grid
    const totalDaysShown = Math.ceil(days.length / 7) * 7;
    const nextMonthDays = totalDaysShown - days.length;
    
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        day: i,
        month: currentMonth + 1,
        year: yearNum,
        isPadding: true,
        status: 'unavailable'
      });
    }
    
    return days;
  };
  
  const calendarDays = buildCalendar();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 flex-grow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-foreground">Calendario de Reservas</h2>
        <div className="flex items-center">
          <label htmlFor="calendar-year" className="mr-2 text-muted-foreground">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" className="p-2 text-muted-foreground hover:text-primary" onClick={goToPrevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h3 className="text-xl font-medium text-foreground">
                {monthNames[currentMonth]} {year}
              </h3>
              <Button variant="ghost" className="p-2 text-muted-foreground hover:text-primary" onClick={goToNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day, index) => (
                <div key={index} className="text-center text-muted-foreground text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                let cellClass = "calendar-cell text-center py-2 ";
                
                if (day.isPadding) {
                  cellClass += "opacity-50 text-muted-foreground";
                } else if (day.isSelected && day.status === 'available') {
                  cellClass += "bg-primary text-white";
                } else if (day.status === 'available') {
                  cellClass += "calendar-day-available";
                } else if (day.status === 'pending') {
                  cellClass += "calendar-day-pending";
                } else if (day.status === 'occupied') {
                  cellClass += "calendar-day-occupied";
                }
                
                return (
                  <div
                    key={index}
                    className={cellClass}
                    onClick={() => !day.isPadding && handleDateClick(day.dateStr, day.status)}
                  >
                    {day.day}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#42be65]/10 mr-2"></div>
                <span className="text-sm text-muted-foreground">Disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#ff832b] mr-2"></div>
                <span className="text-sm text-muted-foreground">En revisión</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#fa4d56] mr-2"></div>
                <span className="text-sm text-muted-foreground">Ocupado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Form */}
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Solicitar Reserva</h3>
            <form id="reservation-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <Label htmlFor="user-name">Nombre</Label>
                <Input id="user-name" value="Luis Glez" readOnly className="mt-2 bg-muted" />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="check-in-date">Fecha de Entrada</Label>
                <Input 
                  id="check-in-date" 
                  type="date" 
                  className="mt-2" 
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-destructive text-sm mt-1">{errors.startDate.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="check-out-date">Fecha de Salida</Label>
                <Input 
                  id="check-out-date" 
                  type="date" 
                  className="mt-2" 
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-destructive text-sm mt-1">{errors.endDate.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="nights">Noches</Label>
                <Input 
                  id="nights" 
                  type="number" 
                  className="mt-2 bg-muted" 
                  readOnly 
                  {...register("nights", { valueAsNumber: true })}
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="guests">Número de Personas</Label>
                <Input 
                  id="guests" 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="mt-2" 
                  {...register("numberOfGuests", { valueAsNumber: true })}
                />
                {errors.numberOfGuests && (
                  <p className="text-destructive text-sm mt-1">{errors.numberOfGuests.message}</p>
                )}
              </div>
              
              <div className="mb-6">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea 
                  id="notes" 
                  rows={3} 
                  className="mt-2" 
                  {...register("notes")}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground"
                disabled={createReservation.isPending}
              >
                {createReservation.isPending ? "Enviando..." : "Solicitar Reserva"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
