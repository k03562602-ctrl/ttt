import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";
import {
  LayoutDashboard, CalendarDays, Scissors, Users, Clock,
  CalendarCheck, Instagram, LogOut, Menu, X, Plus, Edit2,
  Trash2, Loader2, Search, Check, TrendingUp, DollarSign,
  ChevronRight, Star, Phone, Mail, AlertCircle, RefreshCw,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const authH = (t) => ({ Authorization: `Bearer ${t}` });

// Returns current date + time in Greece (Europe/Athens)
function getGreeceNow() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: "Europe/Athens" });
  const timeStr = now.toLocaleTimeString("en-GB", { timeZone: "Europe/Athens", hour: "2-digit", minute: "2-digit", hour12: false });
  return { dateStr, timeStr };
}

// ─── NAV ITEMS ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview",   label: "Overview",       icon: LayoutDashboard },
  { id: "bookings",   label: "Bookings",        icon: CalendarDays },
  { id: "daily",      label: "Today",           icon: Clock },
  { id: "services",   label: "Services",        icon: Scissors },
  { id: "barbers",    label: "Barbers",         icon: Users },
  { id: "schedules",  label: "Availability",    icon: CalendarCheck },
  { id: "instagram",  label: "Instagram",       icon: Instagram },
];

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab]         = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings]       = useState([]);
  const [services, setServices]       = useState([]);
  const [barbers, setBarbers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) { navigate("/admin"); return; }
    load();
  }, []); // eslint-disable-line

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const h = authH(token);
      const [b, s, ba] = await Promise.all([
        axios.get(`${API}/admin/bookings`, { headers: h }),
        axios.get(`${API}/admin/services`,  { headers: h }),
        axios.get(`${API}/admin/barbers`,   { headers: h }),
      ]);
      setBookings(b.data); setServices(s.data); setBarbers(ba.data);
    } catch (err) {
      if (err?.response?.status === 401) { localStorage.removeItem("admin_token"); navigate("/admin"); }
      else toast.error("Failed to load data");
    } finally { setLoading(false); }
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  const confirmed = bookings.filter(b => b.status === "confirmed");
  const today     = new Date().toISOString().split("T")[0];
  const todayB    = confirmed.filter(b => b.date === today);
  const revenue   = confirmed.reduce((s, b) => s + b.price, 0);

  const ActiveTab = {
    overview:  () => <OverviewTab  bookings={confirmed} services={services} barbers={barbers} revenue={revenue} todayB={todayB} />,
    bookings:  () => <BookingsTab  bookings={bookings}  token={token} onRefresh={load} />,
    daily:     () => <DailyTab     bookings={bookings}  barbers={barbers} />,
    services:  () => <ServicesTab  services={services}  token={token} onRefresh={load} />,
    barbers:   () => <BarbersTab   barbers={barbers}    services={services} token={token} onRefresh={load} />,
    schedules: () => <SchedulesTab barbers={barbers}    token={token} />,
    instagram: () => <InstagramTab token={token}        onRefresh={load} />,
  }[tab] || (() => null);

  const currentNav = NAV.find(n => n.id === tab);

  return (
    <div className="flex h-screen bg-[#F5F5F7] overflow-hidden" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }} data-testid="admin-dashboard">
      <Toaster theme="light" position="top-right" />

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-60 bg-[#111] text-white flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} data-testid="admin-sidebar">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/[0.07]">
          <div className="font-black uppercase tracking-[-0.04em] text-3xl leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
            TZOUL
          </div>
          <div className="font-mono text-[0.55rem] tracking-[0.32em] uppercase text-white/30 mt-0.5">
            ADMIN PANEL
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === id
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-white/55 hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
              {tab === id && <ChevronRight size={12} className="ml-auto text-[#86868B]" />}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 pt-3 border-t border-white/[0.07]">
          <button
            data-testid="admin-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/45 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} className="shrink-0" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-black/[0.06] flex items-center gap-4 px-5 shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-[#1D1D1F] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {currentNav?.label}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-gray-100 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="text-xs text-[#86868B] font-mono hidden sm:block">
              {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          {loading
            ? <div className="flex items-center justify-center h-64">
                <Loader2 size={28} className="animate-spin text-[#A1A1A6]" />
              </div>
            : <ActiveTab />}
        </main>
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">{label}</div>
          <div className="mt-1.5 text-3xl font-black text-[#1D1D1F]" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</div>
          {sub && <div className="mt-1 text-xs text-[#A1A1A6]">{sub}</div>}
        </div>
        <div className="p-2.5 rounded-xl bg-[#F5F5F7] text-[#86868B]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function Badge({ status }) {
  const cls = status === "confirmed"
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[0.6rem] uppercase tracking-wider border ${cls}`}>
      {status}
    </span>
  );
}

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
function OverviewTab({ bookings, services, barbers, revenue, todayB }) {
  const thisMonth = bookings.filter(b => {
    const d = new Date(b.date), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });

  const svcMap = {};
  bookings.forEach(b => { svcMap[b.service_name] = (svcMap[b.service_name] || 0) + 1; });
  const topSvc = Object.entries(svcMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6" data-testid="overview-tab">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"    value={`€${revenue}`}       icon={DollarSign} sub="all confirmed" />
        <StatCard label="Total Bookings"   value={bookings.length}      icon={CalendarDays} sub="confirmed" />
        <StatCard label="Today"            value={todayB.length}        icon={Clock} sub="appointments" />
        <StatCard label="This Month"       value={thisMonth.length}     icon={TrendingUp} sub="bookings" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_6px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F] text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Today's Appointments
            </h3>
            <span className="font-mono text-[0.62rem] text-[#86868B]">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {todayB.length === 0
              ? <div className="p-10 text-center text-sm text-[#A1A1A6]">No appointments today</div>
              : todayB.sort((a, b) => a.time.localeCompare(b.time)).map(b => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#F5F5F7] transition-colors">
                    <div className="w-14 font-mono text-sm font-semibold text-[#1D1D1F] shrink-0">{b.time}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[#1D1D1F] truncate">{b.name}</div>
                      <div className="text-xs text-[#86868B] truncate">{b.service_name} · {b.barber_name}</div>
                    </div>
                    <div className="font-mono text-sm font-semibold text-[#1D1D1F] shrink-0">€{b.price}</div>
                  </div>
                ))}
          </div>
        </div>

        {/* Side stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5">
            <h3 className="font-semibold text-sm text-[#1D1D1F] mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Top Services</h3>
            <div className="space-y-3">
              {topSvc.length === 0
                ? <p className="text-xs text-[#A1A1A6]">No data yet</p>
                : topSvc.map(([name, count], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="font-mono text-[0.6rem] w-4 text-[#86868B]">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[#1D1D1F] truncate">{name}</div>
                        <div className="mt-1 h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1D1D1F] rounded-full" style={{ width: `${(count / bookings.length) * 100}%` }} />
                        </div>
                      </div>
                      <span className="font-mono text-[0.62rem] text-[#86868B] shrink-0">{count}</span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5 space-y-3">
            {[
              { l: "Active Barbers",      v: barbers.length },
              { l: "Services Available",  v: services.length },
              { l: "Avg Booking Value",   v: `€${bookings.length ? Math.round(revenue / bookings.length) : 0}` },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between items-center py-2 border-b border-black/[0.05] last:border-0">
                <span className="text-xs text-[#86868B]">{l}</span>
                <span className="font-semibold text-sm text-[#1D1D1F]" style={{ fontFamily: "'Outfit', sans-serif" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKINGS ────────────────────────────────────────────────────────────────
function BookingsTab({ bookings, token, onRefresh }) {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDate, setEditDate]   = useState("");
  const [editTime, setEditTime]   = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.name?.toLowerCase().includes(q) || b.phone?.includes(q) || b.service_name?.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || b.status === statusFilter;
    return matchQ && matchS;
  });

  const openEdit = (b) => { setEditingBooking(b); setEditDate(b.date); setEditTime(b.time); setEditNotes(b.notes || ""); };

  const handleUpdate = async () => {
    try {
      await axios.patch(`${API}/admin/bookings/${editingBooking.id}`,
        { date: editDate, time: editTime, notes: editNotes },
        { headers: authH(token) });
      toast.success("Booking updated");
      setEditingBooking(null);
      onRefresh();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed to update"); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await axios.delete(`${API}/admin/bookings/${id}`, { headers: authH(token) });
      toast.success("Booking cancelled");
      onRefresh();
    } catch { toast.error("Failed to cancel"); }
  };

  return (
    <div className="space-y-4" data-testid="bookings-tab">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 flex flex-wrap gap-3 items-center shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            data-testid="booking-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, service…"
            className="w-full pl-9 pr-4 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] placeholder-[#A1A1A6] focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["all", "confirmed", "cancelled"].map(s => (
            <button
              key={s}
              data-testid={`filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? "bg-[#1D1D1F] text-white"
                  : "bg-[#F5F5F7] text-[#86868B] hover:bg-[#ECECEE]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#A1A1A6] font-mono ml-auto">{filtered.length} results</span>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_6px_rgba(0,0,0,0.04)] overflow-hidden">
        {filtered.length === 0
          ? <div className="p-12 text-center text-sm text-[#A1A1A6]">No bookings match your search</div>
          : <div className="divide-y divide-black/[0.04]">
              {filtered.map(b => (
                <div
                  key={b.id}
                  data-testid={`booking-row-${b.id}`}
                  className={`px-5 py-4 hover:bg-[#F5F5F7] transition-colors ${b.status === "cancelled" ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-sm text-[#1D1D1F]">{b.name}</span>
                        <Badge status={b.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#86868B]">
                        <span className="flex items-center gap-1"><Phone size={11} />{b.phone}</span>
                        {b.email && <span className="flex items-center gap-1"><Mail size={11} />{b.email}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#86868B] mt-0.5">
                        <span>{b.service_name}</span>
                        <span>·</span>
                        <span>{b.barber_name}</span>
                        <span>·</span>
                        <span className="font-mono">{b.date} {b.time}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#1D1D1F]">€{b.price}</span>
                      </div>
                      {b.notes && (
                        <div className="text-xs text-[#86868B] italic mt-0.5">{b.notes}</div>
                      )}
                    </div>
                    {b.status === "confirmed" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          data-testid={`edit-booking-${b.id}`}
                          onClick={() => openEdit(b)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.10] rounded-lg text-xs text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                        >
                          <Edit2 size={12} /> Reschedule
                        </button>
                        <button
                          data-testid={`cancel-booking-${b.id}`}
                          onClick={() => handleCancel(b.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>}
      </div>

      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="bg-white rounded-2xl max-w-md">
          <DialogHeader><DialogTitle className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Reschedule Booking</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Date</Label>
              <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="mt-1.5" /></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Time (HH:MM)</Label>
              <Input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="mt-1.5" /></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Notes</Label>
              <Input value={editNotes} onChange={e => setEditNotes(e.target.value)} className="mt-1.5" placeholder="Internal note" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditingBooking(null)} className="flex-1 py-2.5 border border-black/[0.10] rounded-xl text-sm text-[#86868B] hover:bg-[#F5F5F7] transition-colors">Cancel</button>
              <button onClick={handleUpdate} className="flex-1 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors">Save changes</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DAILY SCHEDULE ──────────────────────────────────────────────────────────
function DailyTab({ bookings, barbers }) {
  const [barberId, setBarberId]     = useState(barbers[0]?.id || "");
  const [date, setDate]             = useState(new Date().toISOString().split("T")[0]);

  const slots = [];
  for (let h = 11; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) break;
      slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    }
  }

  const dayB = bookings.filter(b => b.barber_id === barberId && b.date === date && b.status === "confirmed");
  const dayRevenue = dayB.reduce((s, b) => s + b.price, 0);

  return (
    <div className="space-y-5" data-testid="daily-tab">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 flex flex-wrap gap-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex-1 min-w-[180px]">
          <label className="block font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B] mb-1.5">Barber</label>
          <select value={barberId} onChange={e => setBarberId(e.target.value)}
            className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10">
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B] mb-1.5">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10" />
        </div>
        <div className="flex items-end gap-4 text-sm">
          <div className="text-right">
            <div className="font-mono text-[0.58rem] uppercase tracking-wider text-[#86868B]">Appointments</div>
            <div className="font-bold text-lg text-[#1D1D1F]" style={{ fontFamily: "'Outfit', sans-serif" }}>{dayB.length}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[0.58rem] uppercase tracking-wider text-[#86868B]">Revenue</div>
            <div className="font-bold text-lg text-[#1D1D1F]" style={{ fontFamily: "'Outfit', sans-serif" }}>€{dayRevenue}</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] space-y-2">
        {slots.map(slot => {
          const b = dayB.find(b => b.time === slot);
          return (
            <div key={slot} className="flex items-stretch gap-3">
              <div className="w-16 font-mono text-xs text-[#A1A1A6] flex items-center shrink-0">{slot}</div>
              {b ? (
                <div className="flex-1 p-4 bg-[#1D1D1F] text-white rounded-xl flex flex-wrap items-center gap-3" data-testid={`daily-slot-${slot}`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{b.name}</div>
                    <div className="text-xs text-white/60 mt-0.5">{b.phone}</div>
                    <div className="text-xs text-white/70 mt-1">{b.service_name} · {b.duration} min</div>
                  </div>
                  <div className="font-bold text-xl shrink-0" style={{ fontFamily: "'Outfit', sans-serif" }}>€{b.price}</div>
                </div>
              ) : (
                <div className="flex-1 border border-dashed border-black/[0.10] rounded-xl py-3 flex items-center justify-center">
                  <span className="text-xs text-[#C5C5C7]">Available</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SERVICES ────────────────────────────────────────────────────────────────
function ServicesTab({ services, token, onRefresh }) {
  const blank = { name: "", duration: "", price: "", description: "", category: "Hair" };
  const [isCreating, setIsCreating]     = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(blank);

  const openCreate = () => { setForm(blank); setIsCreating(true); };
  const openEdit   = (s) => { setForm({ name: s.name, duration: s.duration, price: s.price, description: s.description, category: s.category }); setEditing(s); };

  const save = async () => {
    const payload = { ...form, duration: parseInt(form.duration), price: parseInt(form.price) };
    try {
      if (isCreating) {
        await axios.post(`${API}/admin/services`, payload, { headers: authH(token) });
        toast.success("Service created"); setIsCreating(false);
      } else {
        await axios.put(`${API}/admin/services/${editing.id}`, payload, { headers: authH(token) });
        toast.success("Service updated"); setEditing(null);
      }
      onRefresh();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await axios.delete(`${API}/admin/services/${id}`, { headers: authH(token) });
      toast.success("Deleted"); onRefresh();
    } catch { toast.error("Failed to delete"); }
  };

  const CATS = ["Hair", "Beard", "VIP", "Care"];

  return (
    <div className="space-y-4" data-testid="services-tab">
      <div className="flex justify-end">
        <button onClick={openCreate} data-testid="add-service-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-semibold hover:bg-[#333] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Plus size={15} /> Add Service
        </button>
      </div>

      <div className="grid gap-3">
        {services.map(s => (
          <div key={s.id} data-testid={`service-row-${s.id}`}
            className="bg-white rounded-2xl border border-black/[0.06] px-5 py-4 flex flex-wrap items-center gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-[#1D1D1F]">{s.name}</span>
                <span className="font-mono text-[0.58rem] px-2 py-0.5 bg-[#F5F5F7] text-[#86868B] rounded-full uppercase tracking-wider">{s.category}</span>
              </div>
              <div className="text-xs text-[#86868B]">{s.description}</div>
              <div className="flex gap-4 mt-1.5 text-xs text-[#86868B]">
                <span>{s.duration} min</span>
                <span className="font-semibold text-[#1D1D1F] font-mono">€{s.price}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(s)} data-testid={`edit-service-${s.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-black/[0.10] rounded-lg text-xs hover:bg-[#F5F5F7] transition-colors">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => del(s.id)} data-testid={`delete-service-${s.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCreating || !!editing} onOpenChange={() => { setIsCreating(false); setEditing(null); }}>
        <DialogContent className="bg-white rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {isCreating ? "New Service" : "Edit Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Duration (min)</Label>
                <Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Price (€)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Category</Label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="mt-1.5 w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10">
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1.5" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setIsCreating(false); setEditing(null); }} className="flex-1 py-2.5 border border-black/[0.10] rounded-xl text-sm text-[#86868B] hover:bg-[#F5F5F7] transition-colors">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors">
                {isCreating ? "Create" : "Save changes"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── BARBERS ─────────────────────────────────────────────────────────────────
function BarbersTab({ barbers, services, token, onRefresh }) {
  const blank = { name: "", role: "", bio: "", image: "", service_ids: [] };
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(blank);

  const openCreate = () => { setForm(blank); setIsCreating(true); };
  const openEdit   = (b) => { setForm({ name: b.name, role: b.role, bio: b.bio, image: b.image, service_ids: b.service_ids || [] }); setEditing(b); };

  const toggleSvc = (id) => setForm(f => ({
    ...f,
    service_ids: f.service_ids.includes(id) ? f.service_ids.filter(x => x !== id) : [...f.service_ids, id],
  }));

  const save = async () => {
    try {
      if (isCreating) {
        await axios.post(`${API}/admin/barbers`, form, { headers: authH(token) });
        toast.success("Barber added"); setIsCreating(false);
      } else {
        await axios.put(`${API}/admin/barbers/${editing.id}`, form, { headers: authH(token) });
        toast.success("Barber updated"); setEditing(null);
      }
      onRefresh();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this barber?")) return;
    try {
      await axios.delete(`${API}/admin/barbers/${id}`, { headers: authH(token) });
      toast.success("Deleted"); onRefresh();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-4" data-testid="barbers-tab">
      <div className="flex justify-end">
        <button onClick={openCreate} data-testid="add-barber-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-semibold hover:bg-[#333] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Plus size={15} /> Add Barber
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map(b => (
          <div key={b.id} data-testid={`barber-card-${b.id}`}
            className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="aspect-[4/3] bg-[#111] overflow-hidden">
              <img src={b.image} alt={b.name} className="w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
            </div>
            <div className="p-4">
              <div className="font-bold text-sm text-[#1D1D1F]" style={{ fontFamily: "'Outfit', sans-serif" }}>{b.name}</div>
              <div className="font-mono text-[0.6rem] uppercase tracking-wider text-[#86868B] mt-0.5">{b.role}</div>
              <p className="text-xs text-[#86868B] mt-2 line-clamp-2">{b.bio}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(b)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-black/[0.10] rounded-lg text-xs hover:bg-[#F5F5F7] transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => del(b.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCreating || !!editing} onOpenChange={() => { setIsCreating(false); setEditing(null); }}>
        <DialogContent className="bg-white rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {isCreating ? "Add Barber" : "Edit Barber"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Role</Label>
              <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="mt-1.5" placeholder="e.g. Master Barber, Founder" /></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2} className="mt-1.5" /></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Image URL</Label>
              <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="mt-1.5" placeholder="https://..." /></div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Services Offered</Label>
                <button type="button" onClick={() => setForm(f => ({ ...f, service_ids: [] }))}
                  className="text-xs text-[#86868B] hover:text-[#1D1D1F] font-mono uppercase tracking-wider transition-colors"
                  data-testid="barber-all-services">
                  All services
                </button>
              </div>
              <p className="text-xs text-[#A1A1A6] mb-2">
                {form.service_ids.length === 0 ? "Offering all services." : `${form.service_ids.length} of ${services.length} selected.`}
              </p>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 border border-black/[0.06] rounded-xl bg-[#F5F5F7]" data-testid="barber-services-list">
                {services.map(s => {
                  const on = form.service_ids.includes(s.id);
                  return (
                    <label key={s.id} data-testid={`barber-svc-${s.id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all ${on ? "bg-[#1D1D1F] text-white" : "bg-white border border-black/[0.06] hover:border-black/[0.12]"}`}>
                      <input type="checkbox" className="hidden" checked={on} onChange={() => toggleSvc(s.id)} />
                      <span className="truncate flex-1">{s.name}</span>
                      {on && <Check size={11} className="shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setIsCreating(false); setEditing(null); }} className="flex-1 py-2.5 border border-black/[0.10] rounded-xl text-sm text-[#86868B] hover:bg-[#F5F5F7] transition-colors">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors">
                {isCreating ? "Add Barber" : "Save changes"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── SCHEDULES / AVAILABILITY ─────────────────────────────────────────────────
const DEFAULT_SLOTS = [
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30",
];

function SchedulesTab({ barbers, token }) {
  const today = new Date().toISOString().slice(0, 10);
  const [barberId, setBarberId] = useState(barbers[0]?.id || "");
  const [date, setDate]         = useState(today);
  const [slots, setSlots]       = useState([]);
  const [notes, setNotes]       = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [newSlot, setNewSlot]   = useState("");

  useEffect(() => { if (barbers.length && !barberId) setBarberId(barbers[0].id); }, [barbers]); // eslint-disable-line

  useEffect(() => {
    if (!barberId || !date) return;
    setLoading(true);
    axios.get(`${API}/admin/schedules/${barberId}/${date}`, { headers: authH(token) })
      .then(r => { setSlots(r.data.time_slots || []); setNotes(r.data.notes || ""); setIsDefault(!!r.data.is_default); })
      .catch(() => toast.error("Failed to load schedule"))
      .finally(() => setLoading(false));
  }, [barberId, date]); // eslint-disable-line

  const toggle = (t) => setSlots(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t].sort());

  const addCustom = () => {
    const v = newSlot.trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) { toast.error("Use HH:MM"); return; }
    if (slots.includes(v)) { toast.error("Already exists"); return; }
    setSlots(s => [...s, v].sort()); setNewSlot("");
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/admin/schedules`, { barber_id: barberId, date, time_slots: slots, notes: notes || null }, { headers: authH(token) });
      toast.success("Schedule saved"); setIsDefault(false);
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  };

  const reset = async () => {
    if (isDefault) { toast.info("Already default"); return; }
    if (!window.confirm("Revert to default hours?")) return;
    try {
      await axios.delete(`${API}/admin/schedules/${barberId}/${date}`, { headers: authH(token) });
      toast.success("Reverted to default");
      const r = await axios.get(`${API}/admin/schedules/${barberId}/${date}`, { headers: authH(token) });
      setSlots(r.data.time_slots || []); setNotes(r.data.notes || ""); setIsDefault(true);
    } catch { toast.error("Failed to reset"); }
  };

  return (
    <div className="space-y-5" data-testid="schedules-tab">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 flex flex-wrap gap-4 items-end shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex-1 min-w-[160px]">
          <label className="block font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B] mb-1.5">Barber</label>
          <select value={barberId} onChange={e => setBarberId(e.target.value)} data-testid="sched-barber-select"
            className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10">
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B] mb-1.5">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} data-testid="sched-date-input"
            className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSlots([...DEFAULT_SLOTS])} data-testid="sched-apply-template"
            className="px-3.5 py-2 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl text-xs font-mono uppercase tracking-wider hover:bg-[#ECECEE] transition-colors">
            Full day
          </button>
          <button onClick={() => setSlots([])} data-testid="sched-close-day"
            className="px-3.5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-mono uppercase tracking-wider hover:bg-red-100 transition-colors">
            Close day
          </button>
        </div>
        <span className={`px-3 py-1.5 rounded-full font-mono text-[0.58rem] uppercase tracking-wider ${isDefault ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
          {isDefault ? "Default" : "Custom"}
        </span>
      </div>

      {/* Slot grid */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm text-[#1D1D1F]" style={{ fontFamily: "'Outfit', sans-serif" }}>Time Slots</h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              {slots.length} slot{slots.length !== 1 ? "s" : ""} active
              {date === getGreeceNow().dateStr && (
                <span className="ml-2 text-[#A1A1A6]">· faded = past (Greece time)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input value={newSlot} onChange={e => setNewSlot(e.target.value)} data-testid="sched-new-slot"
              placeholder="HH:MM" className="w-20 px-2.5 py-1.5 bg-[#F5F5F7] border border-black/[0.06] rounded-lg text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10"
              onKeyDown={e => e.key === "Enter" && addCustom()} />
            <button onClick={addCustom} data-testid="sched-add-slot"
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1D1D1F] text-white rounded-lg text-xs font-mono hover:bg-[#333] transition-colors">
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        {loading
          ? <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-[#A1A1A6]" /></div>
          : <>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2" data-testid="sched-slot-grid">
                {(() => {
                  const { dateStr: greeceToday, timeStr: greeceNow } = getGreeceNow();
                  const isToday = date === greeceToday;
                  return Array.from(new Set([...DEFAULT_SLOTS, ...slots])).sort().map(t => {
                    const on = slots.includes(t);
                    const isPast = isToday && t <= greeceNow;
                    return (
                      <button key={t} data-testid={`sched-slot-${t}`} onClick={() => toggle(t)}
                        title={isPast ? "Past slot" : undefined}
                        className={`py-2.5 rounded-xl text-xs font-mono transition-all relative ${
                          on
                            ? isPast
                              ? "bg-[#1D1D1F]/30 text-white/40 shadow-none cursor-pointer"
                              : "bg-[#1D1D1F] text-white shadow-sm"
                            : isPast
                              ? "bg-[#F5F5F7]/60 text-[#C5C5C7] line-through opacity-40 cursor-pointer"
                              : "bg-[#F5F5F7] text-[#A1A1A6] hover:bg-[#ECECEE] line-through"
                        }`}>
                        {t}
                        {isPast && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#86868B]/40" />
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
              {slots.length === 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={14} /> No slots — this day will appear as closed.
                </div>
              )}
            </>}
      </div>

      {/* Notes + actions */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <label className="block font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B] mb-1.5">Internal Note (optional)</label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} data-testid="sched-notes" rows={2}
          placeholder="e.g. Holiday, half-day, training" className="text-sm" />
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={reset} disabled={isDefault} data-testid="sched-reset"
          className="px-5 py-2.5 border border-black/[0.10] rounded-xl text-sm text-[#86868B] hover:bg-[#F5F5F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Reset to default
        </button>
        <button onClick={save} disabled={saving} data-testid="sched-save"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-semibold hover:bg-[#333] disabled:opacity-50 transition-colors shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CalendarCheck size={14} /> Save Schedule</>}
        </button>
      </div>
    </div>
  );
}

// ─── INSTAGRAM ───────────────────────────────────────────────────────────────
function InstagramTab({ token, onRefresh }) {
  const blank = { image_url: "", caption: "", post_url: "" };
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(blank);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/instagram-posts`, { headers: authH(token) });
      setPosts(data);
    } catch { toast.error("Failed to load posts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const openCreate = () => { setForm(blank); setIsCreating(true); };
  const openEdit   = (p) => { setForm({ image_url: p.image_url, caption: p.caption || "", post_url: p.post_url || "" }); setEditing(p); };

  const save = async () => {
    if (!form.image_url) { toast.error("Image URL required"); return; }
    try {
      if (isCreating) {
        await axios.post(`${API}/admin/instagram-posts`, form, { headers: authH(token) });
        toast.success("Post added"); setIsCreating(false);
      } else {
        await axios.patch(`${API}/admin/instagram-posts/${editing.id}`, form, { headers: authH(token) });
        toast.success("Post updated"); setEditing(null);
      }
      load(); onRefresh();
    } catch { toast.error("Failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API}/admin/instagram-posts/${id}`, { headers: authH(token) });
      toast.success("Deleted"); load(); onRefresh();
    } catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#A1A1A6]" /></div>;

  return (
    <div className="space-y-4" data-testid="instagram-tab">
      <div className="flex justify-end">
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Plus size={15} /> Add Post
        </button>
      </div>

      {posts.length === 0
        ? <div className="bg-white rounded-2xl border border-black/[0.06] p-12 text-center">
            <Instagram size={40} className="mx-auto text-[#C5C5C7] mb-3" />
            <p className="text-sm text-[#86868B]">No posts yet. Add your first one.</p>
          </div>
        : <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                <div className="aspect-square bg-[#111] overflow-hidden">
                  <img src={p.image_url} alt={p.caption || "Post"} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  {p.caption && <p className="text-xs text-[#86868B] line-clamp-2 mb-3">{p.caption}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border border-black/[0.10] rounded-lg text-xs hover:bg-[#F5F5F7] transition-colors">
                      <Edit2 size={11} /> Edit
                    </button>
                    <button onClick={() => del(p.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors">
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>}

      <Dialog open={isCreating || !!editing} onOpenChange={() => { setIsCreating(false); setEditing(null); }}>
        <DialogContent className="bg-white rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {isCreating ? "Add Post" : "Edit Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Image URL *</Label>
              <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="mt-1.5" placeholder="https://..." /></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Caption</Label>
              <Textarea value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} rows={2} className="mt-1.5" /></div>
            <div><Label className="font-mono text-[0.62rem] uppercase tracking-wider text-[#86868B]">Instagram Post URL</Label>
              <Input value={form.post_url} onChange={e => setForm({ ...form, post_url: e.target.value })} className="mt-1.5" placeholder="https://instagram.com/p/..." /></div>
            {form.image_url && (
              <div className="aspect-square rounded-xl overflow-hidden border border-black/[0.06]">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setIsCreating(false); setEditing(null); }} className="flex-1 py-2.5 border border-black/[0.10] rounded-xl text-sm text-[#86868B] hover:bg-[#F5F5F7] transition-colors">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                {isCreating ? "Add Post" : "Save changes"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
