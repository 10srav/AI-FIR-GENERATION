"use client";

import { useState, useEffect } from "react";
import LoginPage from "@/components/fir/LoginPage";
import Dashboard from "@/components/fir/Dashboard";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const savedUser = sessionStorage.getItem("fir_user");
    if (savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    sessionStorage.setItem("fir_user", username);
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fir_user");
    setIsLoggedIn(false);
    setCurrentUser("");
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
}
