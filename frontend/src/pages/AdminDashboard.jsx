import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { LogOut, Trash2, Edit, Loader2, Calendar, User, Scissors, Clock, Plus, X, TrendingUp, DollarSign, Users, CalendarCheck, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchAllData();
  }, [token, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [bookingsRes, servicesRes, barbersRes] = await Promise.all([
        axios.get(`${API}/admin/bookings`, { headers }),
        axios.get(`${API}/admin/services`, { headers }),
        axios.get(`${API}/admin/barbers`, { headers })
      ]);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
      setBarbers(barbersRes.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
        toast.error("Session expired");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
    toast.success("Logged out successfully");
  };

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const todayBookings = confirmedBookings.filter((b) => b.date === new Date().toISOString().split('T')[0]);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-5">
      <Toaster theme="light" position="top-center" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gradient-to-br from-[#1D1D1F] to-[#333] text-white p-6 md:p-8 flex items-center justify-between mb-8">
          <div>
            <h1 className="title-massive text-3xl md:text-5xl" data-testid="admin-dashboard-title">
              Admin Dashboard<span className="text-white/80">.</span>
            </h1>
            <p className="mt-2 text-white/85">Manage your barbershop</p>
          </div>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-display uppercase text-xs transition-all shadow-lg flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "daily", label: "Daily Schedule", icon: CalendarCheck },
            { id: "bookings", label: "Bookings", count: bookings.length },
            { id: "services", label: "Services", count: services.length },
            { id: "barbers", label: "Barbers", count: barbers.length },
            { id: "schedules", label: "Availability", count: 0 },
            { id: "instagram", label: "Instagram", icon: Instagram }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-display uppercase text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#1D1D1F] text-white shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.icon && <tab.icon size={16} />}
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl">
            <Loader2 size={32} className="animate-spin mx-auto text-[#A1A1A6]" />
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab bookings={confirmedBookings} services={services} barbers={barbers} totalRevenue={totalRevenue} todayBookings={todayBookings} />}
            {activeTab === "daily" && <DailyScheduleTab bookings={bookings} barbers={barbers} services={services} token={token} onRefresh={fetchAllData} />}
            {activeTab === "bookings" && <BookingsTab bookings={bookings} token={token} onRefresh={fetchAllData} />}
            {activeTab === "services" && <ServicesTab services={services} token={token} onRefresh={fetchAllData} />}
            {activeTab === "barbers" && <BarbersTab barbers={barbers} services={services} token={token} onRefresh={fetchAllData} />}
            {activeTab === "schedules" && <SchedulesTab barbers={barbers} token={token} onRefresh={fetchAllData} />}
            {activeTab === "instagram" && <InstagramTab token={token} onRefresh={fetchAllData} />}
          </>
        )}
      </div>
    </div>
  );
}

// Instagram Tab Component
function InstagramTab({ token, onRefresh }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ image_url: "", caption: "", post_url: "" });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/instagram-posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(data);
    } catch (error) {
      toast.error("Failed to load Instagram posts");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({ image_url: "", caption: "", post_url: "" });
    setIsCreating(true);
  };

  const openEditDialog = (post) => {
    setFormData({ image_url: post.image_url, caption: post.caption || "", post_url: post.post_url || "" });
    setEditingPost(post);
  };

  const handleCreate = async () => {
    if (!formData.image_url) {
      toast.error("Image URL is required");
      return;
    }
    try {
      await axios.post(`${API}/admin/instagram-posts`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post added");
      setIsCreating(false);
      loadPosts();
      onRefresh();
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`${API}/admin/instagram-posts/${editingPost.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post updated");
      setEditingPost(null);
      loadPosts();
      onRefresh();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API}/admin/instagram-posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post deleted");
      loadPosts();
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return <div className="text-center py-12"><Loader2 size={32} className="animate-spin mx-auto text-[#A1A1A6]" /></div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreateDialog} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-display uppercase text-sm hover:from-purple-700 hover:to-pink-700 shadow-lg flex items-center gap-2">
          <Plus size={16} /> Add Instagram Post
        </button>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
            <div className="aspect-square bg-gray-900 overflow-hidden">
              <img src={post.image_url} alt={post.caption || "Instagram post"} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              {post.caption && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.caption}</p>}
              <div className="flex gap-2">
                <button onClick={() => openEditDialog(post)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(post.id)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Instagram size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No Instagram posts yet. Add your first post!</p>
        </div>
      )}

      <Dialog open={isCreating || !!editingPost} onOpenChange={() => { setIsCreating(false); setEditingPost(null); }}>
        <DialogContent className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="title-massive text-2xl">
              {isCreating ? "Add" : "Edit"} Instagram Post<span className="text-[#86868B]">.</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Image URL *</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="mt-2"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Caption</Label>
              <Textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={3}
                className="mt-2"
                placeholder="Optional caption for the post"
              />
            </div>
            <div>
              <Label>Instagram Post URL (optional)</Label>
              <Input
                value={formData.post_url}
                onChange={(e) => setFormData({ ...formData, post_url: e.target.value })}
                className="mt-2"
                placeholder="https://instagram.com/p/..."
              />
            </div>
            {formData.image_url && (
              <div>
                <Label>Preview</Label>
                <div className="mt-2 aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setIsCreating(false); setEditingPost(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-display uppercase text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-display uppercase text-sm hover:from-purple-700 hover:to-pink-700 shadow-md"
              >
                {isCreating ? "Add Post" : "Update Post"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Overview Tab with Analytics
function OverviewTab({ bookings, services, barbers, totalRevenue, todayBookings }) {
  const thisMonth = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    const now = new Date();
    return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
  });

  const serviceStats = {};
  bookings.forEach(b => {
    serviceStats[b.service_name] = (serviceStats[b.service_name] || 0) + 1;
  });
  const topServices = Object.entries(serviceStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`€${totalRevenue}`} icon={<DollarSign size={20} />} color="green" />
        <StatCard label="Total Bookings" value={bookings.length} icon={<Calendar size={20} />} color="blue" />
        <StatCard label="Today's Bookings" value={todayBookings.length} icon={<CalendarCheck size={20} />} color="red" />
        <StatCard label="This Month" value={thisMonth.length} icon={<TrendingUp size={20} />} color="purple" />
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="title-massive text-2xl mb-4">Today's Appointments<span className="text-[#86868B]">.</span></h3>
        {todayBookings.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No appointments for today</p>
        ) : (
          <div className="space-y-3">
            {todayBookings.sort((a, b) => a.time.localeCompare(b.time)).map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="px-3 py-2 bg-[#38BDF8] text-[#0F172A] rounded-lg font-mono text-sm font-bold">{booking.time}</div>
                <div className="flex-1">
                  <div className="font-display uppercase text-base">{booking.name}</div>
                  <div className="text-sm text-gray-600">{booking.service_name} • {booking.barber_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg text-[#86868B]">€{booking.price}</div>
                  <div className="text-xs text-gray-500">{booking.duration} min</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Services */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="title-massive text-xl mb-4">Top Services<span className="text-[#86868B]">.</span></h3>
          <div className="space-y-3">
            {topServices.map(([service, count], idx) => (
              <div key={service} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#E63329] text-white rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</div>
                <div className="flex-1">
                  <div className="font-display uppercase text-sm">{service}</div>
                  <div className="text-xs text-gray-500">{count} bookings</div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full flex-1 max-w-[100px]">
                  <div className="h-full bg-[#E63329] rounded-full" style={{ width: `${(count / bookings.length) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="title-massive text-xl mb-4">Quick Stats<span className="text-[#86868B]">.</span></h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Active Barbers</span>
              <span className="font-display text-2xl">{barbers.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Available Services</span>
              <span className="font-display text-2xl">{services.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg. Booking Value</span>
              <span className="font-display text-2xl">€{bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Daily Schedule View
function DailyScheduleTab({ bookings, barbers, services, token, onRefresh }) {
  const [selectedBarber, setSelectedBarber] = useState(barbers[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const timeSlots = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let min of [0, 30]) {
      if (hour === 21 && min === 30) break;
      timeSlots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
  }

  const dayBookings = bookings.filter(b => b.barber_id === selectedBarber && b.date === selectedDate && b.status === "confirmed");

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Select Barber</Label>
            <select value={selectedBarber} onChange={(e) => setSelectedBarber(e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg">
              {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Select Date</Label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-2" />
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="title-massive text-2xl">
            {barbers.find(b => b.id === selectedBarber)?.name}'s Schedule<span className="text-[#86868B]">.</span>
          </h3>
          <div className="text-sm text-gray-600">
            {dayBookings.length} appointments • €{dayBookings.reduce((sum, b) => sum + b.price, 0)} revenue
          </div>
        </div>

        <div className="space-y-2">
          {timeSlots.map(slot => {
            const booking = dayBookings.find(b => b.time === slot);
            return (
              <div key={slot} className="flex items-stretch gap-3">
                <div className="w-20 py-3 font-mono text-sm text-gray-600 flex items-center">{slot}</div>
                {booking ? (
                  <div className="flex-1 p-4 bg-gradient-to-r from-[#1D1D1F] to-[#333] text-white rounded-lg border-2 border-[#E63329] shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-display uppercase text-base font-bold">{booking.name}</div>
                        <div className="text-sm text-white/90 mt-1">{booking.phone}</div>
                        <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
                          <span className="flex items-center gap-1"><Scissors size={12} /> {booking.service_name}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {booking.duration} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-display font-bold">€{booking.price}</div>
                        {booking.notes && (
                          <div className="mt-2 text-xs bg-white/20 px-2 py-1 rounded">{booking.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-400 text-center">Available</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// (Keep all the other tab components from the previous version: BookingsTab, ServicesTab, BarbersTab, SchedulesTab)
// I'll add them after this...
// Bookings Tab Component
function BookingsTab({ bookings, token, onRefresh }) {
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const openEditDialog = (booking) => {
    setEditingBooking(booking);
    setEditDate(booking.date);
    setEditTime(booking.time);
    setEditNotes(booking.notes || "");
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${API}/admin/bookings/${editingBooking.id}`,
        { date: editDate, time: editTime, notes: editNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Booking updated");
      setEditingBooking(null);
      onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to update");
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await axios.delete(`${API}/admin/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking cancelled");
      onRefresh();
    } catch (error) {
      toast.error("Failed to cancel");
    }
  };

  return (
    <>
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5">
          <h2 className="title-massive text-2xl">All Bookings</h2>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className={`p-5 md:p-6 hover:bg-gray-50 transition-colors ${booking.status === "cancelled" ? "bg-red-50/50" : ""}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="font-display text-lg uppercase">{booking.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{booking.phone} {booking.email && `· ${booking.email}`}</div>
                      </div>
                      <span className={`px-3 py-1 text-xs uppercase font-mono tracking-wider rounded-full ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{booking.status}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600"><Scissors size={14} className="text-[#86868B]" />{booking.service_name}</div>
                      <div className="flex items-center gap-2 text-gray-600"><User size={14} className="text-[#86868B]" />{booking.barber_name}</div>
                      <div className="flex items-center gap-2 text-gray-600"><Calendar size={14} className="text-[#86868B]" />{booking.date}</div>
                      <div className="flex items-center gap-2 text-gray-600"><Clock size={14} className="text-[#86868B]" />{booking.time}</div>
                    </div>
                  </div>
                  {booking.status === "confirmed" && (
                    <div className="flex gap-2">
                      <button onClick={() => openEditDialog(booking)} className="px-4 py-2 border border-gray-300 rounded-lg font-display uppercase text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"><Edit size={14} /> Edit</button>
                      <button onClick={() => handleCancel(booking.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-display uppercase text-sm transition-colors shadow-md flex items-center gap-2"><Trash2 size={14} /> Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="bg-white rounded-2xl border border-gray-200 shadow-2xl">
          <DialogHeader><DialogTitle className="title-massive text-2xl">Edit Booking<span className="text-[#86868B]">.</span></DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="font-mono text-xs uppercase tracking-wider text-gray-600">Date</Label><Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="mt-2 border border-gray-200 rounded-lg" /></div>
            <div><Label className="font-mono text-xs uppercase tracking-wider text-gray-600">Time</Label><Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="mt-2 border border-gray-200 rounded-lg" /></div>
            <div><Label className="font-mono text-xs uppercase tracking-wider text-gray-600">Notes</Label><Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="mt-2 border border-gray-200 rounded-lg" /></div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setEditingBooking(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-display uppercase text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdate} className="flex-1 px-4 py-2 bg-[#E63329] text-white rounded-lg font-display uppercase text-sm hover:bg-[#d62d25] shadow-md">Update</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Services Tab Component
function ServicesTab({ services, token, onRefresh }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: "", duration: "", price: "", description: "", category: "Hair" });

  const openCreateDialog = () => {
    setFormData({ name: "", duration: "", price: "", description: "", category: "Hair" });
    setIsCreating(true);
  };

  const openEditDialog = (service) => {
    setFormData({ name: service.name, duration: service.duration, price: service.price, description: service.description, category: service.category });
    setEditingService(service);
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/admin/services`, { ...formData, duration: parseInt(formData.duration), price: parseInt(formData.price) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Service created");
      setIsCreating(false);
      onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to create");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/admin/services/${editingService.id}`, { ...formData, duration: parseInt(formData.duration), price: parseInt(formData.price) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Service updated");
      setEditingService(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm("Delete this service?")) return;
    try {
      await axios.delete(`${API}/admin/services/${serviceId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Service deleted");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreateDialog} className="px-6 py-3 bg-[#E63329] text-white rounded-lg font-display uppercase text-sm hover:bg-[#d62d25] shadow-lg flex items-center gap-2"><Plus size={16} /> Add Service</button>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display uppercase text-lg">{service.name}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono">{service.category}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">Duration: <strong>{service.duration} min</strong></span>
                  <span className="text-[#86868B] font-display text-lg">€{service.price}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditDialog(service)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Edit size={16} /></button>
                <button onClick={() => handleDelete(service.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCreating || !!editingService} onOpenChange={() => { setIsCreating(false); setEditingService(null); }}>
        <DialogContent className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl">
          <DialogHeader><DialogTitle className="title-massive text-2xl">{isCreating ? "Create" : "Edit"} Service<span className="text-[#86868B]">.</span></DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duration (min)</Label><Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="mt-2" /></div>
              <div><Label>Price (€)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-2" /></div>
            </div>
            <div><Label>Category</Label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg"><option>Hair</option><option>Beard</option><option>VIP</option><option>Care</option></select></div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="mt-2" /></div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => { setIsCreating(false); setEditingService(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={isCreating ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-[#E63329] text-white rounded-lg shadow-md">{isCreating ? "Create" : "Update"}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Barbers Tab Component
function BarbersTab({ barbers, services, token, onRefresh }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "", bio: "", image: "", service_ids: [] });

  const openCreateDialog = () => {
    setFormData({ name: "", role: "", bio: "", image: "", service_ids: [] });
    setIsCreating(true);
  };

  const openEditDialog = (barber) => {
    setFormData({
      name: barber.name,
      role: barber.role,
      bio: barber.bio,
      image: barber.image,
      service_ids: barber.service_ids || [],
    });
    setEditingBarber(barber);
  };

  const toggleService = (sid) => {
    setFormData((cur) => ({
      ...cur,
      service_ids: cur.service_ids.includes(sid)
        ? cur.service_ids.filter((x) => x !== sid)
        : [...cur.service_ids, sid],
    }));
  };

  const selectAllServices = () => setFormData((cur) => ({ ...cur, service_ids: [] }));

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/admin/barbers`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Barber added");
      setIsCreating(false);
      onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to create");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/admin/barbers/${editingBarber.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Barber updated");
      setEditingBarber(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (barberId) => {
    if (!confirm("Delete this barber?")) return;
    try {
      await axios.delete(`${API}/admin/barbers/${barberId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Barber deleted");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreateDialog} className="px-6 py-3 bg-[#E63329] text-white rounded-lg font-display uppercase text-sm hover:bg-[#d62d25] shadow-lg flex items-center gap-2"><Plus size={16} /> Add Barber</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((barber) => (
          <div key={barber.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
            <div className="aspect-[3/4] bg-gray-900 overflow-hidden">
              <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
            </div>
            <div className="p-4">
              <h3 className="font-display uppercase text-base">{barber.name}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{barber.role}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{barber.bio}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEditDialog(barber)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"><Edit size={14} className="inline mr-1" />Edit</button>
                <button onClick={() => handleDelete(barber.id)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"><Trash2 size={14} className="inline mr-1" />Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCreating || !!editingBarber} onOpenChange={() => { setIsCreating(false); setEditingBarber(null); }}>
        <DialogContent className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl">
          <DialogHeader><DialogTitle className="title-massive text-2xl">{isCreating ? "Add" : "Edit"} Barber<span className="text-[#86868B]">.</span></DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2" /></div>
            <div><Label>Role</Label><Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-2" placeholder="e.g. Master Barber, Founder" /></div>
            <div><Label>Bio</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="mt-2" /></div>
            <div><Label>Image URL</Label><Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="mt-2" placeholder="https://..." /></div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Services offered</Label>
                <button
                  type="button"
                  onClick={selectAllServices}
                  className="text-xs font-mono uppercase tracking-wider text-[#86868B] hover:underline"
                  data-testid="barber-all-services"
                >
                  All services
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {formData.service_ids.length === 0
                  ? "Currently offers ALL services. Pick specific ones to restrict."
                  : `Offers ${formData.service_ids.length} of ${services.length} services.`}
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50" data-testid="barber-services-list">
                {services.map((s) => {
                  const checked = formData.service_ids.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      data-testid={`barber-svc-${s.id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${checked ? "bg-[#E63329] text-white" : "bg-white border border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => toggleService(s.id)}
                      />
                      <span className="truncate">{s.name}</span>
                      <span className={`ml-auto text-xs font-mono ${checked ? "text-white/80" : "text-gray-400"}`}>€{s.price}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => { setIsCreating(false); setEditingBarber(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={isCreating ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-[#E63329] text-white rounded-lg shadow-md">{isCreating ? "Add" : "Update"}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({ label, value, icon, color = "red" }) {
  const colors = {
    red: "text-[#86868B]",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600"
  };
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-gray-500">{label}</div>
          <div className="title-massive text-4xl mt-2">{value}</div>
        </div>
        <div className={colors[color]}>{icon}</div>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------
// Availability / Schedules tab
// ---------------------------------------------------------------------
const DEFAULT_TEMPLATE = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00",
];

function SchedulesTab({ barbers, token }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(todayISO);
  const [slots, setSlots] = useState([]);
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState("");

  useEffect(() => {
    if (barbers.length > 0 && !barberId) setBarberId(barbers[0].id);
  }, [barbers, barberId]);

  const loadSchedule = async () => {
    if (!barberId || !date) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/schedules/${barberId}/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSlots(data.time_slots || []);
      setNotes(data.notes || "");
      setIsDefault(!!data.is_default);
    } catch (e) {
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchedule(); /* eslint-disable-next-line */ }, [barberId, date]);

  const toggleSlot = (t) => {
    setSlots((cur) => cur.includes(t) ? cur.filter((s) => s !== t) : [...cur, t].sort());
  };

  const addCustomSlot = () => {
    const v = newSlot.trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) {
      toast.error("Use HH:MM (e.g. 09:45)");
      return;
    }
    if (slots.includes(v)) {
      toast.error("Slot already exists");
      return;
    }
    setSlots([...slots, v].sort());
    setNewSlot("");
  };

  const save = async () => {
    if (!barberId || !date) return;
    setSaving(true);
    try {
      await axios.post(`${API}/admin/schedules`, {
        barber_id: barberId, date, time_slots: slots, notes: notes || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Schedule saved");
      setIsDefault(false);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (isDefault) {
      toast.info("Already on default schedule");
      return;
    }
    if (!confirm("Revert to default hours for this date?")) return;
    try {
      await axios.delete(`${API}/admin/schedules/${barberId}/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Reverted to default");
      loadSchedule();
    } catch (e) {
      toast.error("Failed to reset");
    }
  };

  const closeDay = () => setSlots([]);
  const applyTemplate = () => setSlots([...DEFAULT_TEMPLATE]);

  return (
    <div className="space-y-6" data-testid="schedules-tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="title-massive text-3xl">Availability<span className="text-[#86868B]">.</span></h2>
          <p className="text-sm text-gray-500 mt-1">Pick a barber and a date to manage time slots.</p>
        </div>
        <span className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full ${isDefault ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
          {isDefault ? "Default hours" : "Custom schedule"}
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white rounded-xl border border-gray-200">
        <div>
          <Label className="font-mono text-[0.66rem] uppercase tracking-wider text-gray-600">Barber</Label>
          <select
            data-testid="sched-barber-select"
            value={barberId}
            onChange={(e) => setBarberId(e.target.value)}
            className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {barbers.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
        </div>
        <div>
          <Label className="font-mono text-[0.66rem] uppercase tracking-wider text-gray-600">Date</Label>
          <Input
            data-testid="sched-date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            data-testid="sched-apply-template"
            onClick={applyTemplate}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-display uppercase transition-colors"
          >
            Full template
          </button>
          <button
            data-testid="sched-close-day"
            onClick={closeDay}
            className="flex-1 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-display uppercase transition-colors"
          >
            Close day
          </button>
        </div>
      </div>

      {/* Slots */}
      <div className="p-5 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display uppercase text-base">Time Slots ({slots.length})</h3>
          <div className="flex items-center gap-2">
            <Input
              data-testid="sched-new-slot"
              placeholder="HH:MM"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="w-24 h-9 text-sm"
            />
            <button
              data-testid="sched-add-slot"
              onClick={addCustomSlot}
              className="px-3 py-2 bg-black text-white rounded-lg text-xs font-display uppercase hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex items-center justify-center text-gray-500"><Loader2 className="animate-spin mr-2" size={16} /> Loading…</div>
        ) : (
          <>
            {/* Quick palette - tap to toggle from default template */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2" data-testid="sched-slot-grid">
              {Array.from(new Set([...DEFAULT_TEMPLATE, ...slots])).sort().map((t) => {
                const active = slots.includes(t);
                return (
                  <button
                    key={t}
                    data-testid={`sched-slot-${t}`}
                    onClick={() => toggleSlot(t)}
                    className={`py-2 rounded-lg text-sm font-mono transition-all ${
                      active
                        ? "bg-[#E63329] text-white shadow-md"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100 line-through"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {slots.length === 0 && (
              <p className="mt-4 text-sm text-red-600">⚠ No slots = closed for this date.</p>
            )}
          </>
        )}
      </div>

      {/* Notes */}
      <div className="p-5 bg-white rounded-xl border border-gray-200">
        <Label className="font-mono text-[0.66rem] uppercase tracking-wider text-gray-600">Notes (optional)</Label>
        <Textarea
          data-testid="sched-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Internal note for this date (e.g. holiday, half-day)"
          className="mt-2"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          data-testid="sched-reset"
          onClick={resetToDefault}
          disabled={isDefault}
          className="px-5 py-2.5 border border-gray-300 rounded-lg font-display uppercase text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Reset to default
        </button>
        <button
          data-testid="sched-save"
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-[#E63329] text-white rounded-lg font-display uppercase text-sm hover:bg-[#d62d25] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving ? <><Loader2 className="animate-spin" size={14} /> Saving…</> : <><CalendarCheck size={14} /> Save schedule</>}
        </button>
      </div>
    </div>
  );
}
