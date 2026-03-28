"use client";

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Clock, User, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OwnerCalendarPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const fetchEvents = async (fetchInfo: any, successCallback: any, failureCallback: any) => {
    try {
      if (!fetchInfo.startStr || !fetchInfo.endStr) {
        console.warn("Missing fetch range strings:", fetchInfo);
        successCallback([]);
        return;
      }

      const res = await fetch(`/api/owner/bookings?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Owner Schedule API Data:", data);
        const formattedEvents = data.map((b: any) => {
          const datePart = b.date.split('T')[0];
          return {
            id: b.id,
            title: `${b.turf.name} - ${b.customer.name}`,
            start: `${datePart}T${b.startTime}:00`,
            end: `${datePart}T${b.endTime}:00`,
            extendedProps: {
              customerName: b.customer.name,
              customerEmail: b.customer.email,
              turfName: b.turf.name,
              paymentStatus: b.paymentStatus,
              paymentMethod: b.paymentMethod,
              amount: b.totalAmount
            },
            backgroundColor: b.paymentStatus === 'PAID' ? '#22c55e' : '#f97316',
            borderColor: 'transparent',
            textColor: '#ffffff'
          };
        });
        successCallback(formattedEvents);
      } else {
        failureCallback(new Error("Failed to fetch"));
      }
    } catch (err) {
      failureCallback(err);
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedBooking(info.event.extendedProps);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-turf-dark tracking-tight mb-2">Schedule Manager</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <CalendarIcon size={18} className="text-turf-green" />
            Manage all your turf bookings in one place.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500" /> PAID
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100">
            <div className="w-2 h-2 rounded-full bg-orange-500" /> PENDING
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden owner-calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          events={fetchEvents}
          eventClick={handleEventClick}
          height="75vh"
          nowIndicator={true}
          themeSystem="standard"
          dayMaxEvents={true}
          allDaySlot={false}
        />
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 relative animate-scale-in">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>

            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-turf-green mb-2">Booking Details</p>
              <h2 className="text-3xl font-black text-turf-dark">{selectedBooking.customerName}</h2>
              <p className="text-muted-foreground text-sm">{selectedBooking.customerEmail}</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-turf-green shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Turf Name</p>
                  <p className="font-bold text-turf-dark">{selectedBooking.turfName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-turf-green shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Revenue</p>
                  <p className="font-bold text-turf-dark">₹{selectedBooking.amount}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-turf-green shadow-sm">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment</p>
                    <p className="font-bold text-turf-dark">{selectedBooking.paymentMethod}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                  selectedBooking.paymentStatus === 'PAID' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                )}>
                  {selectedBooking.paymentStatus}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-5 bg-turf-dark text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
