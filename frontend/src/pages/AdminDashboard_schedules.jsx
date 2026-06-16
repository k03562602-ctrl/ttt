// Schedules Tab Component for Admin Dashboard
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Calendar, Plus, Edit, Trash2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Time slots from 09:00 to 21:00 in 30-minute intervals
const ALL_TIME_SLOTS = [];
for (let hour = 9; hour <= 21; hour++) {
  for (let min of [0, 30]) {
    if (hour === 21 && min === 30) break;
    const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    ALL_TIME_SLOTS.push(time);
  }
}

export default function SchedulesTab({ barbers, token, onRefresh }) {
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [notes, setNotes] = useState("");

  const loadSchedule = async () => {
    if (!selectedBarber || !selectedDate) return;
    
    try {
      const { data } = await axios.get(
        `${API}/admin/schedules/${selectedBarber}/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedule(data);
      setSelectedSlots(data.time_slots || []);
      setNotes(data.notes || "");
    } catch (error) {
      toast.error("Failed to load schedule");
    }
  };

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      loadSchedule();
    }
  }, [selectedBarber, selectedDate]);

  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot].sort());
    }
  };

  const handleSave = async () => {
    if (!selectedBarber || !selectedDate || selectedSlots.length === 0) {
      toast.error("Please select barber, date, and at least one time slot");
      return;
    }

    try {
      await axios.post(
        `${API}/admin/schedules`,
        {
          barber_id: selectedBarber,
          date: selectedDate,
          time_slots: selectedSlots,
          notes: notes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Schedule saved");
      setIsEditing(false);
      loadSchedule();
      onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this custom schedule? It will revert to default hours.")) return;

    try {
      await axios.delete(
        `${API}/admin/schedules/${selectedBarber}/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Schedule deleted");
      loadSchedule();
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const selectAllSlots = () => setSelectedSlots(ALL_TIME_SLOTS);
  const clearAllSlots = () => setSelectedSlots([]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-display uppercase text-lg mb-4">Select Barber & Date</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Barber</Label>
            <select
              value={selectedBarber}
              onChange={(e) => { setSelectedBarber(e.target.value); setSchedule(null); }}
              className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select barber...</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSchedule(null); }}
              className="mt-2"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setIsEditing(true)}
              disabled={!selectedBarber || !selectedDate}
              className="w-full px-4 py-2 bg-[#E63329] text-white rounded-lg font-display uppercase text-sm hover:bg-[#d62d25] disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              <Edit size={16} /> Edit Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Current Schedule Display */}
      {schedule && !isEditing && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display uppercase text-lg">{schedule.barber_name} - {selectedDate}</h3>
              {schedule.is_default && <p className="text-sm text-gray-500 mt-1">Using default shop hours</p>}
            </div>
            {!schedule.is_default && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete Custom Schedule
              </button>
            )}
          </div>
          
          {schedule.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-mono text-gray-600">Note: {schedule.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {schedule.time_slots?.map((slot) => (
              <div key={slot} className="px-3 py-2 bg-green-100 text-green-800 border border-green-300 rounded-lg text-center text-sm font-mono">
                {slot}
              </div>
            ))}
          </div>
          
          {schedule.time_slots?.length === 0 && (
            <p className="text-center text-gray-500 py-8">No available time slots for this date</p>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={() => { setIsEditing(false); loadSchedule(); }}>
        <DialogContent className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="title-massive text-2xl">
              Edit Schedule<span className="text-[#E63329]">.</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="flex gap-2">
              <button onClick={selectAllSlots} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Select All</button>
              <button onClick={clearAllSlots} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Clear All</button>
              <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
                <Clock size={14} />
                {selectedSlots.length} slots selected
              </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {ALL_TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                      isSelected
                        ? "bg-[#E63329] text-white border-2 border-[#E63329]"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
                placeholder="e.g., Half day, Special event, etc."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setIsEditing(false); loadSchedule(); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-display uppercase text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-[#E63329] text-white rounded-lg font-display uppercase text-sm hover:bg-[#d62d25] shadow-md"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
