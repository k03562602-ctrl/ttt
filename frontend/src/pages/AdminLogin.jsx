import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { LogIn, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/admin/login`, { email, password });
      localStorage.setItem("admin_token", data.access_token);
      toast.success("Login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      const message = error?.response?.data?.detail || "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
      <Toaster theme="light" position="top-center" />
      
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white" data-testid="admin-login">
        <div className="bg-gradient-to-br from-[#1D1D1F] to-[#333] text-white p-8">
          <h1 className="title-massive text-3xl md:text-4xl">Admin Login<span className="text-white/80">.</span></h1>
          <p className="mt-2 text-white/85 text-sm">TZOUL BARBER Management</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <Label htmlFor="email" className="font-mono text-[0.66rem] uppercase tracking-wider text-gray-600">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              data-testid="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 bg-white border border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black/20 px-4 py-2 text-lg"
              placeholder="admin@tzoulbarber.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="font-mono text-[0.66rem] uppercase tracking-wider text-gray-600">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              data-testid="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 bg-white border border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black/20 px-4 py-2 text-lg"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            data-testid="admin-login-btn"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#1D1D1F] text-white rounded-xl font-display uppercase text-sm hover:bg-[#333] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Logging in...</>
            ) : (
              <><LogIn size={16} /> Login to Dashboard</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}