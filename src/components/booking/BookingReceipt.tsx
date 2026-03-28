"use client";

import { CheckCircle2, MapPin, Calendar, Clock, Download, CreditCard, Printer, X } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface BookingReceiptProps {
  booking: any;
  onClose: string | (() => void);
}

export default function BookingReceipt({ booking, onClose }: BookingReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const CloseAction = typeof onClose === "string" ? (
    <Link href={onClose} className="p-2 text-muted-foreground hover:text-turf-dark transition-colors">
      <X size={20} />
    </Link>
  ) : (
    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-turf-dark transition-colors">
      <X size={20} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-turf-dark/20 backdrop-blur-sm animate-fade-in no-print-overlay overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl my-auto overflow-hidden print:shadow-none print:rounded-none flex flex-col max-h-[95vh]">
        {/* Actions - Hidden on Print */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 print:hidden shrink-0">
          <h3 className="font-bold text-turf-dark">Booking Receipt</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-turf-green text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-turf-dark transition-all"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            {CloseAction}
          </div>
        </div>

        {/* Receipt Content - Scrollable if too long */}
        <div className="p-10 print:p-0 overflow-y-auto" id="receipt-content">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-2 text-turf-green mb-4">
                <div className="h-10 w-10 bg-turf-green rounded-xl flex items-center justify-center text-white">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-2xl font-black tracking-tighter text-turf-dark">Turfivo</span>
              </div>
              <h1 className="text-3xl font-black text-turf-dark mb-1">Official Receipt</h1>
              <p className="text-sm text-muted-foreground font-medium">Booking ID: <span className="text-turf-green font-bold uppercase">{booking.id.slice(-8)}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Date Issued</p>
              <p className="font-bold text-turf-dark">{format(new Date(), "MMM dd, yyyy")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Billed To</h4>
              <p className="font-bold text-turf-dark text-lg">{booking.customer.name}</p>
              <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Venue Details</h4>
              <p className="font-bold text-turf-dark text-lg">{booking.turf.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={12} className="text-turf-green" />
                {booking.turf.location}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 mb-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Match Schedule</h4>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-turf-green shadow-sm">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                  <p className="font-bold text-turf-dark">{format(new Date(booking.date), "EEEE, MMM dd, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-turf-green shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time Slot</p>
                  <p className="font-bold text-turf-dark">{booking.startTime} - {booking.endTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Payment Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Base Amount</span>
                <span className="text-turf-dark">₹{booking.totalAmount + (booking.discountAmount || 0)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm font-bold text-turf-green">
                  <span>Discount ({booking.promoCode})</span>
                  <span>- ₹{booking.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-lg font-black text-turf-dark uppercase tracking-tighter">Total Paid</span>
                <span className="text-2xl font-black text-turf-green">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between p-6 bg-turf-dark rounded-2xl text-white">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-turf-lime" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Payment Method</p>
                <p className="font-bold text-sm">{booking.paymentMethod} • PAID</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-white/50 italic underline decoration-turf-lime/50">Keep this for entry at the venue</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center border-t border-gray-50 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          Thank you for choosing Turfivo! • www.turfivo.com
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print-overlay {
            background: white !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
