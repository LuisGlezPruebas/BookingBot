import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

export default function MyReservations() {
  const [year, setYear] = useState<string>("2025");
  
  const { data: userReservations, isLoading } = useQuery({
    queryKey: [`/api/user/reservations/${year}`],
  });
  
  const getNights = (startDate: string, endDate: string) => {
    return Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
  };

  const reservations = userReservations || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 flex-grow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-foreground">Mis Reservas</h2>
        <div className="flex items-center">
          <label htmlFor="my-reservations-year" className="mr-2 text-muted-foreground">
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
                  <TableHead className="text-muted-foreground">Fecha Entrada</TableHead>
                  <TableHead className="text-muted-foreground">Fecha Salida</TableHead>
                  <TableHead className="text-muted-foreground">Noches</TableHead>
                  <TableHead className="text-muted-foreground">Personas</TableHead>
                  <TableHead className="text-muted-foreground">Notas</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation: any) => (
                  <TableRow key={reservation.id}>
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
                {reservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      {isLoading 
                        ? "Cargando reservas..." 
                        : "No tienes reservas para este año"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
