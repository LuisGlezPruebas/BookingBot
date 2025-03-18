import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Check, 
  X,
  MessageSquare
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminReservations() {
  const [year, setYear] = useState<string>("2025");
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminMessage, setAdminMessage] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
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
  const updateReservationStatus = useMutation({
    mutationFn: async ({ id, status, message }: { id: number, status: "approved" | "rejected", message?: string }) => {
      return await apiRequest("PATCH", `/api/admin/reservations/${id}/status`, { 
        status,
        adminMessage: message 
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/pending/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/history/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/stats/${year}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reservations/${year}`] });
      
      // Limpiar el estado
      setDialogOpen(false);
      setSelectedReservationId(null);
      setActionType(null);
      setAdminMessage("");
      
      toast({
        title: variables.status === "approved" ? "Reserva aceptada" : "Reserva rechazada",
        description: variables.status === "approved" 
          ? "La reserva ha sido aceptada con éxito." 
          : "La reserva ha sido rechazada.",
        variant: "default",
      });
    },
  });
  
  // Manejadores para abrir el diálogo de confirmación
  const openAcceptDialog = (id: number) => {
    setSelectedReservationId(id);
    setActionType("approve");
    setDialogOpen(true);
  };
  
  const openRejectDialog = (id: number) => {
    setSelectedReservationId(id);
    setActionType("reject");
    setDialogOpen(true);
  };
  
  // Función para procesar la acción con el mensaje
  const handleStatusUpdate = () => {
    if (selectedReservationId && actionType) {
      updateReservationStatus.mutate({
        id: selectedReservationId,
        status: actionType === "approve" ? "approved" : "rejected",
        message: adminMessage.trim() || undefined
      });
    }
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
                  {(Array.isArray(pendingList) ? pendingList : []).map((reservation: any) => (
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
                            onClick={() => openAcceptDialog(reservation.id)}
                            disabled={updateReservationStatus.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="p-2 rounded-md bg-[#fa4d56]/10 text-[#fa4d56] hover:bg-[#fa4d56]/20 hover:text-[#fa4d56]"
                            onClick={() => openRejectDialog(reservation.id)}
                            disabled={updateReservationStatus.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!Array.isArray(pendingList) || pendingList.length === 0) && (
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
                  {(Array.isArray(historyList) ? historyList : []).map((reservation: any) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.username}</TableCell>
                      <TableCell>{formatDate(reservation.startDate)}</TableCell>
                      <TableCell>{formatDate(reservation.endDate)}</TableCell>
                      <TableCell>{getNights(reservation.startDate, reservation.endDate)}</TableCell>
                      <TableCell>{reservation.numberOfGuests}</TableCell>
                      <TableCell>{reservation.notes || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full reservation-status-${
                          reservation.status === 'approved' 
                            ? 'available' 
                            : reservation.status === 'pending' 
                              ? 'pending' 
                              : 'rejected'
                        }`}>
                          {reservation.status === 'approved' 
                            ? 'Aceptada' 
                            : reservation.status === 'pending' 
                              ? 'En revisión' 
                              : reservation.status === 'cancelled'
                                ? 'Cancelada por usuario'
                                : 'Rechazada'
                          }
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!Array.isArray(historyList) || historyList.length === 0) && (
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

      {/* Diálogo para mensaje al cambiar estado de reserva */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Aprobar Reserva" : "Rechazar Reserva"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "La reserva será aprobada y se notificará al usuario." 
                : "La reserva será rechazada y se notificará al usuario."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="admin-message">Mensaje para el usuario (opcional)</Label>
              <Textarea 
                id="admin-message"
                placeholder="Escribe un mensaje personalizado para el usuario..."
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Este mensaje se incluirá en el email que reciba el usuario.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleStatusUpdate}
              disabled={updateReservationStatus.isPending}
            >
              {updateReservationStatus.isPending ? "Procesando..." : 
                actionType === "approve" ? "Aprobar Reserva" : "Rechazar Reserva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
