import { Link } from "wouter";
import { Building, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  userType: 'admin' | 'user';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ userType, activeTab, onTabChange }: HeaderProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building className="text-primary h-6 w-6 mr-2" />
            <h1 className="text-xl font-medium text-foreground">Gestión de Reservas</h1>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="text-muted-foreground h-5 w-5 mr-2" />
                <span className="text-muted-foreground">
                  {userType === 'admin' ? 'Admin' : 'Luis Glez'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-primary"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        {userType === 'admin' ? (
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="dashboard"
                className={`py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent`}
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="reservations"
                className={`py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent`}
              >
                Gestión de Reservas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="reservations"
                className={`py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent`}
              >
                Reservas
              </TabsTrigger>
              <TabsTrigger
                value="my-reservations"
                className={`py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent`}
              >
                Mis Reservas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
    </header>
  );
}
