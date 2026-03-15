"use client";

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Loader2, AlertCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BookingCalendarProps {
  turfId: string;
  pricePerHour: number;
}

export default function BookingCalendar({ turfId, pricePerHour }: BookingCalendarProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select, 2: Payment/Confirm
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [splitEmails, setSplitEmails] = useState<string[]>([""]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setBookingStep(1);
    setError(null);
  };

  const handleConfirmBooking = async (paymentMethod: "ONLINE" | "OFFLINE") => {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=" + window.location.href);
      return;
    }

    if (!selectedSlot) return;

    setIsSubmitting(true);
    setError(null);

    const formattedStartTime = selectedSlot.start.includes("T") 
      ? selectedSlot.start.split("T")[1].substring(0, 5) 
      : selectedSlot.start;
    const formattedEndTime = selectedSlot.end.includes("T") 
      ? selectedSlot.end.split("T")[1].substring(0, 5) 
      : selectedSlot.end;

    const validSplitEmails = splitEmails.filter(e => e.trim() !== "");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          turfId,
          date: selectedSlot.start,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          numPlayers: isSplit ? validSplitEmails.length + 1 : 10,
          totalAmount: pricePerHour,
          paymentMethod,
          isSplit,
          splitEmails: isSplit ? validSplitEmails : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      setSuccess(true);
      setBookingStep(3); // Success step
    } catch (err: any) {
      setError(err.message);
      setBookingStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEmail = () => setSplitEmails([...splitEmails, ""]);
  const updateEmail = (index: number, val: string) => {
    const newEmails = [...splitEmails];
    newEmails[index] = val;
    setSplitEmails(newEmails);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden calendar-container">
        <h3 className="text-lg font-bold text-turf-dark mb-6 flex items-center gap-2">
          <CalendarIcon size={20} className="text-turf-green" />
          Select Your Slot
        </h3>
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek'
          }}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          slotDuration="01:00:00"
          select={handleDateSelect}
          height="auto"
          themeSystem="standard"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-fade-in">
          <AlertCircle size={20} />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {selectedSlot && !success && (
        <div className="bg-turf-dark text-white rounded-3xl p-8 shadow-xl animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Clock className="text-turf-lime" size={24} />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">Selected Slot</p>
                <h4 className="text-xl font-bold">
                  {new Date(selectedSlot.start).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}, 
                  {" "}{new Date(selectedSlot.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-white/60 text-sm font-medium">Total Amount</p>
                <p className="text-3xl font-black text-white">₹{pricePerHour}</p>
              </div>
              <button 
                onClick={() => setBookingStep(2)}
                className="px-8 py-4 bg-turf-green text-white font-bold rounded-2xl hover:bg-turf-lime hover:text-turf-dark transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingStep === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 animate-scale-in my-8">
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-black text-turf-dark mb-2">Confirm Booking</h2>
                 <p className="text-muted-foreground">Customize your booking options</p>
              </div>

              <div className="space-y-6 mb-8">
                 <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <Users className="text-turf-green" size={20} />
                        <div>
                            <p className="font-bold text-turf-dark">Split Cost with Friends</p>
                            <p className="text-xs text-muted-foreground">Invite friends to share the price</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSplit(!isSplit)}
                        className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            isSplit ? "bg-turf-green" : "bg-gray-300"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            isSplit ? "left-7" : "left-1"
                        )} />
                    </button>
                 </div>

                 {isSplit && (
                    <div className="space-y-3 animate-fade-in shadow-inner p-4 rounded-2xl bg-gray-50/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Friend's Emails</p>
                        {splitEmails.map((email, i) => (
                            <input 
                                key={i}
                                type="email"
                                placeholder={`friend${i+1}@example.com`}
                                value={email}
                                onChange={(e) => updateEmail(i, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-turf-green outline-none text-sm transition-all shadow-sm"
                            />
                        ))}
                        <button 
                            onClick={addEmail}
                            className="text-xs font-bold text-turf-green hover:underline flex items-center gap-1"
                        >
                            + Add another friend
                        </button>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleConfirmBooking("ONLINE")}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center p-6 border-2 border-turf-green bg-turf-green/5 rounded-2xl hover:bg-turf-green/10 transition-all disabled:opacity-50 group"
                    >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">💳</span>
                        <p className="font-bold text-turf-dark text-sm">Online</p>
                        {isSubmitting && <Loader2 className="animate-spin text-turf-green mt-2" size={16} />}
                    </button>

                    <button 
                      onClick={() => handleConfirmBooking("OFFLINE")}
                      disabled={isSubmitting}
                      className="flex flex-col items-center justify-center p-6 border border-gray-100 hover:border-turf-green/30 transition-all rounded-2xl disabled:opacity-50 group"
                    >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤝</span>
                        <p className="font-bold text-turf-dark text-sm">Venue</p>
                    </button>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setBookingStep(1)} className="flex-1 py-4 text-sm font-bold text-muted-foreground hover:text-turf-dark transition-all">Back to selection</button>
              </div>
           </div>
        </div>
      )}

      {bookingStep === 3 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 animate-scale-in text-center">
              <div className="mx-auto h-24 w-24 bg-turf-green text-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-turf-green/20">
                 <CheckCircle2 size={56} />
              </div>
              <h2 className="text-4xl font-black text-turf-dark mb-4">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-10 leading-relaxed">
                {isSplit 
                    ? "Your booking is set! We've sent links to your friends to pay their share." 
                    : "Your slot has been successfully booked. You can view your current bookings in your dashboard."}
              </p>
              <div className="flex flex-col gap-4">
                 <button 
                   onClick={() => router.push("/dashboard/customer")}
                   className="w-full py-5 bg-turf-dark text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
                 >
                    Go to Dashboard
                 </button>
                 <button 
                   onClick={() => { setBookingStep(1); setSelectedSlot(null); setSuccess(false); setIsSplit(false); setSplitEmails([""]); }}
                   className="w-full py-4 text-turf-green font-bold hover:bg-turf-green/5 rounded-2xl transition-all"
                 >
                    Book Another Slot
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
