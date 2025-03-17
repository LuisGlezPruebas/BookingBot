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
  const [selectionStep, setSelectionStep] = useState<"entrada" | "salida" | "completo">("entrada");
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
    
    if (selectionStep === "entrada" || (selectedStartDate && selectedEndDate)) {
      // Starting new selection, or resetting after complete selection
      setSelectedStartDate(dateStr);
      setSelectedEndDate(null);
      setValue("startDate", dateStr);
      setValue("endDate", "");
      setSelectionStep("salida");
    } else if (selectionStep === "salida") {
      // Adding end date (must be after start date)
      if (new Date(dateStr) > new Date(selectedStartDate!)) {
        setSelectedEndDate(dateStr);
        setValue("endDate", dateStr);
        setSelectionStep("completo");
      } else {
        // If clicked date is before start date, start over with this as new start date
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
        setValue("startDate", dateStr);
        setValue("endDate", "");
        setSelectionStep("salida");
      }
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
  
  // Helper for formatting dates to DD/MM/YYYY
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Helper to calculate nights between two dates
  const calculateNights = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
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
            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
                <span>Anterior</span>
              </Button>
              <h3 className="text-xl font-semibold text-foreground">
                {monthNames[currentMonth]} {year}
              </h3>
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={goToNextMonth}>
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-px mb-px border border-border rounded-md overflow-hidden">
              {dayNames.map((day, index) => (
                <div key={index} className="text-center py-2 bg-muted font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            
              {calendarDays.map((day, index) => {
                let cellClass = "calendar-cell ";
                
                if (day.isPadding) {
                  cellClass += "text-muted-foreground bg-muted/30";
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
            
            <div className="mt-4 p-3 border border-border rounded-md bg-muted/20">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-50 border border-border mr-2"></div>
                  <span className="text-sm text-muted-foreground">Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-amber-500 mr-2"></div>
                  <span className="text-sm text-muted-foreground">En revisión</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 mr-2"></div>
                  <span className="text-sm text-muted-foreground">Ocupado</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectionStep === "entrada" 
                  ? "Selecciona las fechas de entrada y salida en el calendario." 
                  : selectionStep === "salida" 
                    ? `Fecha de entrada: ${formatDate(selectedStartDate!)}. Ahora selecciona la fecha de salida.`
                    : `Estancia seleccionada: ${formatDate(selectedStartDate!)} - ${formatDate(selectedEndDate!)}`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Form */}
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Detalles de la reserva</h3>
            <form id="reservation-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <Label htmlFor="user-name">Miembro familiar</Label>
                <Select defaultValue="Luis Glez">
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Seleccionar miembro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Luis Glez">Luis Glez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1 mb-4">
                <p className="text-sm text-muted-foreground mb-2">Entrada: {selectedStartDate ? formatDate(selectedStartDate) : 'No seleccionada'}</p>
                <p className="text-sm text-muted-foreground mb-2">Salida: {selectedEndDate ? formatDate(selectedEndDate) : 'No seleccionada'}</p>
                <p className="text-sm text-muted-foreground">Estancia: {(selectedStartDate && selectedEndDate) ? `${calculateNights(selectedStartDate, selectedEndDate)} noches` : 'No definida'}</p>
                
                <input type="hidden" {...register("startDate")} />
                <input type="hidden" {...register("endDate")} />
                
                {errors.startDate && (
                  <p className="text-destructive text-sm mt-1">{errors.startDate.message}</p>
                )}
                {errors.endDate && (
                  <p className="text-destructive text-sm mt-1">{errors.endDate.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="guests">Número de huéspedes</Label>
                <Select defaultValue="2" 
                  onValueChange={(val) => setValue("numberOfGuests", parseInt(val))}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Seleccionar número" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'persona' : 'personas'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...register("numberOfGuests", { valueAsNumber: true })} />
                {errors.numberOfGuests && (
                  <p className="text-destructive text-sm mt-1">{errors.numberOfGuests.message}</p>
                )}
              </div>
              
              <div className="mb-6">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea 
                  id="notes" 
                  rows={3} 
                  placeholder="Incluye cualquier información adicional para tu estancia"
                  className="mt-2" 
                  {...register("notes")}
                />
              </div>
              
              <div className="mt-8 mb-4">
                <h4 className="text-base font-medium mb-2">Resumen</h4>
                {!selectedStartDate || !selectedEndDate ? (
                  <p className="text-sm text-muted-foreground">Fechas no seleccionadas</p>
                ) : (
                  <div className="text-sm">
                    <p>Entrada: {formatDate(selectedStartDate)}</p>
                    <p>Salida: {formatDate(selectedEndDate)}</p>
                    <p>Estancia: {calculateNights(selectedStartDate, selectedEndDate)} noches</p>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground"
                disabled={createReservation.isPending || !selectedStartDate || !selectedEndDate}
              >
                {createReservation.isPending ? "Enviando..." : "Reservar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
