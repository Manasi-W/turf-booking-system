"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, IndianRupee, Loader2, Calendar, Edit, Save, Copy } from "lucide-react";

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  price: number | null;
}

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function SlotManager({ turfId }: { turfId: string }) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [isTurfActive, setIsTurfActive] = useState(true);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00",
    price: "",
  });
  const [editSlotData, setEditSlotData] = useState<any>(null);

  useEffect(() => {
    fetchSlots();
    fetchTurfStatus();
  }, [turfId]);

  async function fetchSlots() {
    setLoading(true);
    try {
      const res = await fetch(`/api/turfs/${turfId}/slots`);
      const data = await res.json();
      if (res.ok) setSlots(data);
    } catch (err) {
      console.error("Failed to fetch slots", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTurfStatus() {
    try {
      const res = await fetch(`/api/turfs/${turfId}`);
      const data = await res.json();
      if (res.ok) setIsTurfActive(data.active);
    } catch (err) {
      console.error("Failed to fetch turf status", err);
    }
  }

  async function toggleTurfStatus() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/turfs/${turfId}/slots`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isTurfActive }),
      });
      if (res.ok) setIsTurfActive(!isTurfActive);
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/turfs/${turfId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });
      if (res.ok) {
        const data = await res.json();
        setSlots([...slots, data].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
        setNewSlot({ ...newSlot, startTime: newSlot.endTime, price: "" });
      }
    } catch (err) {
      console.error("Failed to add slot", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function bulkAddSlots() {
    if (!confirm("Add this slot for all days of the week?")) return;
    setSubmitting(true);
    const bulkData = DAYS.map((_, i) => ({
      ...newSlot,
      dayOfWeek: i,
    }));
    try {
      const res = await fetch(`/api/turfs/${turfId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkData),
      });
      if (res.ok) {
        fetchSlots(); // Refresh all slots
      }
    } catch (err) {
      console.error("Failed to bulk add slots", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateSlot(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/turfs/${turfId}/slots`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editSlotData, slotId: editingSlotId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(slots.map(s => s.id === editingSlotId ? data : s).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
        setEditingSlotId(null);
        setEditSlotData(null);
      }
    } catch (err) {
      console.error("Failed to update slot", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteSlot(slotId: string) {
    if (!confirm("Remove this time slot?")) return;
    try {
      const res = await fetch(`/api/turfs/${turfId}/slots?slotId=${slotId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSlots(slots.filter(s => s.id !== slotId));
      }
    } catch (err) {
      console.error("Failed to delete slot", err);
    }
  }

  function startEdit(slot: TimeSlot) {
    setEditingSlotId(slot.id);
    setEditSlotData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price || "",
    });
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-turf-green" /></div>;

  return (
    <div className="space-y-8">
      {/* Turf Status Toggle */}
      <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-turf-dark">Turf Availability</h3>
          <p className="text-sm text-muted-foreground">Temporarily hide your turf from the exploration page.</p>
        </div>
        <button
          onClick={toggleTurfStatus}
          disabled={submitting}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            isTurfActive 
              ? "bg-green-50 text-green-600 border border-green-100" 
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {isTurfActive ? "ACTIVE" : "MAINTENANCE / BUSY"}
        </button>
      </div>

      {/* Add/Edit Section */}
      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner">
        <h3 className="text-xl font-bold text-turf-dark mb-6 flex items-center gap-2">
          {editingSlotId ? <Edit className="text-turf-green" size={20} /> : <Plus className="text-turf-green" size={20} />} 
          {editingSlotId ? "Edit Slot" : "Add New Slot"}
        </h3>
        <form onSubmit={editingSlotId ? updateSlot : addSlot} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Day</label>
            <select 
              value={editingSlotId ? editSlotData.dayOfWeek : newSlot.dayOfWeek}
              onChange={(e) => editingSlotId ? setEditSlotData({...editSlotData, dayOfWeek: parseInt(e.target.value)}) : setNewSlot({...newSlot, dayOfWeek: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-turf-green/20 outline-none"
            >
              {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Start Time</label>
            <input 
              type="time" 
              value={editingSlotId ? editSlotData.startTime : newSlot.startTime}
              onChange={(e) => editingSlotId ? setEditSlotData({...editSlotData, startTime: e.target.value}) : setNewSlot({...newSlot, startTime: e.target.value})}
              required
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-turf-green/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">End Time</label>
            <input 
              type="time" 
              value={editingSlotId ? editSlotData.endTime : newSlot.endTime}
              onChange={(e) => editingSlotId ? setEditSlotData({...editSlotData, endTime: e.target.value}) : setNewSlot({...newSlot, endTime: e.target.value})}
              required
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-turf-green/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Special Price (Optional)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="number" 
                placeholder="Overide base price"
                value={editingSlotId ? editSlotData.price : newSlot.price}
                onChange={(e) => editingSlotId ? setEditSlotData({...editSlotData, price: e.target.value}) : setNewSlot({...newSlot, price: e.target.value})}
                className="w-full pl-8 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-turf-green/20 outline-none"
              />
            </div>
          </div>
          <div className="sm:col-span-full mt-2 flex flex-wrap gap-3">
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-grow py-4 bg-turf-dark text-white font-black rounded-2xl hover:bg-turf-green transition-all shadow-lg shadow-turf-dark/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingSlotId ? <><Save size={20}/> Update Slot</> : <><Plus size={20}/> Add Time Slot</>)}
            </button>
            {!editingSlotId && (
              <button 
                type="button"
                onClick={bulkAddSlots}
                disabled={submitting}
                className="px-8 py-4 bg-white text-turf-dark border border-gray-200 font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 shadow-sm"
              >
                <Copy size={18} /> Add for All Days
              </button>
            )}
            {editingSlotId && (
              <button 
                type="button"
                onClick={() => { setEditingSlotId(null); setEditSlotData(null); }}
                className="px-8 py-4 bg-gray-200 text-turf-dark font-bold rounded-2xl hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {DAYS.map((day, dayIdx) => {
          const daySlots = slots.filter(s => s.dayOfWeek === dayIdx);
          if (daySlots.length === 0) return null;

          return (
            <div key={dayIdx} className="space-y-3">
              <h4 className="text-sm font-black text-turf-dark uppercase tracking-widest flex items-center gap-2">
                <Calendar size={16} className="text-turf-green" /> {day}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {daySlots.map((slot) => (
                  <div key={slot.id} className={`bg-white p-4 rounded-2xl border ${editingSlotId === slot.id ? 'border-turf-green ring-2 ring-turf-green/10' : 'border-gray-100'} shadow-sm flex items-center justify-between group hover:border-turf-green/30 transition-all`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 ${editingSlotId === slot.id ? 'bg-turf-green text-white' : 'bg-turf-green/10 text-turf-green'} rounded-xl flex items-center justify-center transition-colors`}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-turf-dark">{slot.startTime} - {slot.endTime}</p>
                        {slot.price && <p className="text-[10px] font-black text-turf-green uppercase">₹{slot.price} (Special)</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => startEdit(slot)}
                        className="p-2 text-gray-300 hover:text-turf-green hover:bg-turf-green/5 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteSlot(slot.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {slots.length === 0 && (
          <div className="py-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-muted-foreground text-sm">No time slots programmed. Add some to make your turf bookable!</p>
          </div>
        )}
      </div>
    </div>
  );
}
