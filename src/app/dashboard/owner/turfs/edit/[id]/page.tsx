import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, IndianRupee, Tag, Info, Settings, Loader2 } from "lucide-react";
import EditTurfForm from "./EditTurfForm";
import SlotManager from "@/components/owner/SlotManager";

export default async function EditTurfPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const turf = await prisma.turf.findUnique({
    where: { id },
  });

  if (!turf) {
    notFound();
  }

  if (turf.ownerId !== session.user.id) {
    redirect("/dashboard/owner/turfs");
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Link href="/dashboard/owner/turfs" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-turf-green mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to My Turfs
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Edit Form */}
        <div className="flex-[3] space-y-10">
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-turf-dark mb-1">Edit Turf Details</h1>
                <p className="text-muted-foreground text-sm font-medium">Update the basic information for {turf.name}.</p>
              </div>
              <div className="h-14 w-14 bg-turf-green/10 text-turf-green rounded-2xl flex items-center justify-center">
                <Settings size={28} />
              </div>
            </div>
            
            <div className="p-10">
               <EditTurfForm turf={turf} />
            </div>
          </div>
        </div>

        {/* Right Column: Slot Management */}
        <div className="flex-[4] space-y-8">
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-turf-dark mb-1">Manage Time Slots</h2>
                <p className="text-muted-foreground text-sm font-medium">Setup your daily availability and special pricing.</p>
              </div>
              
              <SlotManager turfId={turf.id} />
           </div>

           <div className="bg-turf-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden">
               <Info className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5" />
               <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Info size={18} className="text-turf-lime" /> Pro Tip
               </h4>
               <p className="text-sm text-white/70 leading-relaxed">
                  Adding slots for the whole week helps players plan their matches in advance. You can set different prices for peak hours to maximize your earnings.
               </p>
           </div>
        </div>
      </div>
    </div>
  );
}
