"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const VALID_USERS = [
  { username: "admin", password: "admin123" },
  { username: "officer", password: "officer123" },
  { username: "user", password: "user123" },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const found = VALID_USERS.find(
        (u) => u.username === username && u.password === password
      );
      if (found) {
        onLogin(found.username);
      } else {
        setError("Invalid username or password");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#F8FAFC' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute animate-aurora-1" style={{ top: '-15%', left: '-10%', width: '800px', height: '800px', borderRadius: '50%', filter: 'blur(150px)', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 40%, transparent 70%)' }} />
        <div className="absolute animate-aurora-2" style={{ bottom: '-15%', right: '-10%', width: '700px', height: '700px', borderRadius: '50%', filter: 'blur(130px)', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 40%, transparent 70%)' }} />
      </div>
      <div className="fixed inset-0 -z-5 bg-grid-light" />

      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-10 animate-reveal">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 mb-6">
            <span className="text-white text-2xl font-serif font-bold tracking-wider">FIR</span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-wide bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent uppercase">
            FIR Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-2 tracking-wide">
            AI-powered First Information Report System
          </p>
        </div>

        <div className="glass-card card-shadow rounded-3xl p-8 animate-reveal" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3 mb-7 pb-5 border-b border-blue-100">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
              <span className="text-blue-600 text-sm">&#128274;</span>
            </div>
            <h2 className="text-base font-serif font-bold text-foreground tracking-tight uppercase">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-theme rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-theme rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                <span>&#9888;</span> {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:opacity-90 transition-all duration-300 font-bold py-6 uppercase tracking-wider text-sm rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-blue-100">
            <p className="text-xs text-muted-foreground text-center mb-3">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2">
              {VALID_USERS.map((u) => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => { setUsername(u.username); setPassword(u.password); setError(""); }}
                  className="text-xs px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 hover:border-blue-200 transition-all duration-300 font-medium"
                >
                  {u.username}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          This is an AI-powered tool for educational purposes only.
        </p>
      </div>
    </main>
  );
}
