import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/admin/login`, { email, password });
      localStorage.setItem("admin_token", data.access_token);
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <Toaster theme="light" position="top-center" />

      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111] text-white flex-col justify-between p-12">
        <div>
          <div className="font-black uppercase tracking-[-0.04em] text-5xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
            TZOUL
          </div>
          <div className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-white/40 mt-1">
            BARBER · ATHENS
          </div>
        </div>
        <div>
          <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/30 mb-4">
            MANAGEMENT SYSTEM
          </div>
          <h2 className="text-3xl font-bold leading-tight text-white/90" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Control every<br />appointment.
          </h2>
          <p className="mt-3 text-sm text-white/45 leading-relaxed max-w-xs">
            Manage bookings, services, barbers and availability from a single dashboard.
          </p>
        </div>
        <div className="font-mono text-[0.58rem] text-white/20 tracking-wider uppercase">
          © 2026 TZOUL BARBER
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F7] p-6">
        <div className="w-full max-w-sm" data-testid="admin-login">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="font-black uppercase tracking-[-0.04em] text-4xl text-[#1D1D1F]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              TZOUL
            </div>
            <div className="font-mono text-[0.58rem] tracking-[0.3em] uppercase text-[#86868B] mt-1">
              ADMIN
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] p-8 border border-black/[0.05]">
            <h1 className="text-2xl font-bold text-[#1D1D1F] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Sign in
            </h1>
            <p className="text-sm text-[#86868B] mb-7">TZOUL BARBER Management</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block font-mono text-[0.65rem] uppercase tracking-wider text-[#86868B] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  data-testid="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@tzoulbarber.com"
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] border border-black/[0.08] rounded-xl text-sm text-[#1D1D1F] placeholder-[#A1A1A6] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[0.65rem] uppercase tracking-wider text-[#86868B] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    data-testid="admin-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 bg-[#F5F5F7] border border-black/[0.08] rounded-xl text-sm text-[#1D1D1F] placeholder-[#A1A1A6] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                data-testid="admin-login-btn"
                disabled={loading}
                className="w-full py-3 bg-[#1D1D1F] text-white rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-[#333] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.12)] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                  : <><LogIn size={15} /> Sign in to Dashboard</>}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[#A1A1A6] mt-5 font-mono tracking-wider uppercase">
            Restricted access · Staff only
          </p>
        </div>
      </div>
    </div>
  );
}
