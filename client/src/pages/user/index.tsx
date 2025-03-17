import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import Header from "@/components/layout/header";
import Calendar from "@/components/user/calendar";
import MyReservations from "@/components/user/my-reservations";

export default function UserPage() {
  const [activeTab, setActiveTab] = useState("reservations");
  const { userType, isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      login("user"); // Auto-login as user Luis Glez
    }
  }, [isAuthenticated, login]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userType="user" activeTab={activeTab} onTabChange={handleTabChange} />
      
      {activeTab === "reservations" ? (
        <Calendar />
      ) : (
        <MyReservations />
      )}
    </div>
  );
}
