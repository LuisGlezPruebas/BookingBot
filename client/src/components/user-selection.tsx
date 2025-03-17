import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Building, User } from "lucide-react";

export default function UserSelection() {
  const [, setLocation] = useLocation();
  
  const handleUserSelect = (userType: 'admin' | 'user') => {
    if (userType === 'admin') {
      setLocation('/admin/login');
    } else {
      setLocation('/user');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold text-foreground mb-2">Gestión de Reservas</h1>
        <p className="text-xl text-muted-foreground">Selecciona tu perfil para continuar</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Admin Card */}
        <Card 
          className="shadow-md cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => handleUserSelect('admin')}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-medium text-foreground">Admin</h2>
              <p className="text-muted-foreground mt-2 text-center">
                Gestión de reservas y administración
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Card */}
        <Card 
          className="shadow-md cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => handleUserSelect('user')}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-medium text-foreground">Luis Glez</h2>
              <p className="text-muted-foreground mt-2 text-center">
                Solicitud y gestión de mis reservas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
