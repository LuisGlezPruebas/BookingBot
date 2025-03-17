import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Check, 
  X 
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminReservations() {
  const [year, setYear] = useState<string>("2025");
  const { toast } = useToast();
  
  // Fetch pending reservation requests
  const { data: pendingReservations, isLoading: isPendingLoading } = useQuery({
    queryKey: [`/api/admin/reservations/pending/${year}`],
  });
  
  // Fetch reservation history
  const { data: reservationHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: [`/api/admin/reservations/history/${year}`],
  });
  
  // Mutations for accepting and rejecting reservations
  const acceptReservation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/admin/reservations/${id}/status`, { status: "approved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/pending/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/history/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/stats/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/${year}`] });
      
      toast({
        title: "Reserva aceptada",
        description: "La reserva ha sido aceptada con éxito.",
        variant: "default",
      });
    },
  });
  
  const rejectReservation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/admin/reservations/${id}/status`, { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/pending/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/history/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/stats/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/${year}`] });
      
      toast({
        title: "Reserva rechazada",
        description: "La reserva ha sido rechazada.",
        variant: "default",
      });
    },
  });
  
  const handleAccept = (id: number) => {
    acceptReservation.mutate(id);
  };
  
  const handleReject = (id: number) => {
    rejectReservation.mutate(id);
  };
  
  const getNights = (startDate: string, endDate: string) => {
    return Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
  };

  // Default empty arrays if data is not loaded yet
  const pendingList = pendingReservations || [];
  const historyList = reservationHistory || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 flex-grow">
      {/* Reservation Requests */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium text-foreground">Solicitudes de Reserva</h2>
          <div className="flex items-center">
            <label htmlFor="reservation-year" className="mr-2 text-muted-foreground">
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
        
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">Usuario</TableHead>
                    <TableHead className="text-muted-foreground">Fecha Entrada</TableHead>
                    <TableHead className="text-muted-foreground">Fecha Salida</TableHead>
                    <TableHead className="text-muted-foreground">Noches</TableHead>
                    <TableHead className="text-muted-foreground">Personas</TableHead>
                    <TableHead className="text-muted-foreground">Notas</TableHead>
                    <TableHead className="text-muted-foreground">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingList.map((reservation: any) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.username}</TableCell>
                      <TableCell>{formatDate(reservation.startDate)}</TableCell>
                      <TableCell>{formatDate(reservation.endDate)}</TableCell>
                      <TableCell>{getNights(reservation.startDate, reservation.endDate)}</TableCell>
                      <TableCell>{reservation.numberOfGuests}</TableCell>
                      <TableCell>{reservation.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="p-2 rounded-md bg-[#42be65]/10 text-[#42be65] hover:bg-[#42be65]/20 hover:text-[#42be65]"
                            onClick={() => handleAccept(reservation.id)}
                            disabled={acceptReservation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="p-2 rounded-md bg-[#fa4d56]/10 text-[#fa4d56] hover:bg-[#fa4d56]/20 hover:text-[#fa4d56]"
                            onClick={() => handleReject(reservation.id)}
                            disabled={rejectReservation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {isPendingLoading 
                          ? "Cargando solicitudes..." 
                          : "No hay solicitudes de reserva pendientes"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reservation History */}
      <div>
        <h2 className="text-2xl font-medium text-foreground mb-6">Historial de Reservas</h2>
        <Card className="bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">Usuario</TableHead>
                    <TableHead className="text-muted-foreground">Fecha Entrada</TableHead>
                    <TableHead className="text-muted-foreground">Fecha Salida</TableHead>
                    <TableHead className="text-muted-foreground">Noches</TableHead>
                    <TableHead className="text-muted-foreground">Personas</TableHead>
                    <TableHead className="text-muted-foreground">Notas</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyList.map((reservation: any) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.username}</TableCell>
                      <TableCell>{formatDate(reservation.startDate)}</TableCell>
                      <TableCell>{formatDate(reservation.endDate)}</TableCell>
                      <TableCell>{getNights(reservation.startDate, reservation.endDate)}</TableCell>
                      <TableCell>{reservation.numberOfGuests}</TableCell>
                      <TableCell>{reservation.notes || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full reservation-status-${reservation.status === 'approved' ? 'available' : reservation.status === 'pending' ? 'pending' : 'rejected'}`}>
                          {reservation.status === 'approved' 
                            ? 'Aceptada' 
                            : reservation.status === 'pending' 
                              ? 'En revisión' 
                              : 'Rechazada'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {historyList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {isHistoryLoading 
                          ? "Cargando historial..." 
                          : "No hay historial de reservas disponible"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
