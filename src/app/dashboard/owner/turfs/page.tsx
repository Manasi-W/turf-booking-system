import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus, MapPin, Edit, Trash2, IndianRupee } from "lucide-react";
import { redirect } from "next/navigation";
import DeleteTurfButton from "@/components/owner/DeleteTurfButton";

export default async function OwnerTurfsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const turfs = await prisma.turf.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { bookings: true } } }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-turf-dark mb-1">My Turfs</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage and monitor your sporting grounds.</p>
        </div>
        <Link 
          href="/dashboard/owner/turfs/new" 
          className="flex items-center gap-2 px-6 py-3 bg-turf-green text-white font-bold rounded-2xl shadow-lg shadow-turf-green/20 hover:bg-turf-dark transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <Plus size={20} /> Add New Turf
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {turfs.map((turf) => (
          <div key={turf.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all">
            <div className="relative h-48">
              <img 
                src={turf.images?.split(',')[0] || "https://images.unsplash.com/photo-1551958219-acbc608c6377"} 
                alt={turf.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-turf-dark">
                {turf.sportType}
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-turf-dark mb-1">{turf.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin size={14} className="text-turf-green" />
                    {turf.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Price</p>
                  <p className="text-xl font-black text-turf-green">₹{turf.pricePerHour}<span className="text-xs text-muted-foreground font-medium">/hr</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-dashed">
                 <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Bookings</p>
                    <p className="text-xl font-black text-turf-dark">{turf._count.bookings}</p>
                 </div>
                 <div className="p-4 bg-turf-green/5 rounded-2xl">
                    <p className="text-[10px] font-bold text-turf-green uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-xl font-black text-turf-green">₹{turf._count.bookings * turf.pricePerHour}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <Link href={`/dashboard/owner/turfs/edit/${turf.id}`} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-turf-dark flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                    <Edit size={16} /> Edit
                 </Link>
                 <DeleteTurfButton turfId={turf.id} />
              </div>
            </div>
          </div>
        ))}

        {turfs.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
             <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300 mb-6 font-black text-4xl">?</div>
             <h3 className="text-2xl font-black text-turf-dark mb-2">No turfs listed yet</h3>
             <p className="text-muted-foreground mb-10 max-w-sm mx-auto">Start by adding your first turf and start receiving bookings from players nearby.</p>
             <Link 
              href="/dashboard/owner/turfs/new" 
              className="px-10 py-5 bg-turf-green text-white font-bold rounded-[1.5rem] shadow-xl shadow-turf-green/30 hover:bg-turf-dark transition-all transform hover:-translate-y-1"
             >
                Add Your First Turf
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
