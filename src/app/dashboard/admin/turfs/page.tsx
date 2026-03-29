import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin, ShieldAlert, CheckCircle2, XCircle, Search } from "lucide-react";
import StatusToggle from "./StatusToggle";
import FeaturedToggle from "./FeaturedToggle";
import Link from "next/link";

export default async function AdminTurfsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/");

  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || "";

  const turfs = await prisma.turf.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ]
    } : {},
    include: { owner: true }
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-1">Turf Management</h1>
          <p className="text-muted-foreground font-medium">Control turf visibility and status across the platform.</p>
        </div>
        <form className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            name="q"
            defaultValue={q}
            placeholder="Search by name or location..." 
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all shadow-sm"
          />
        </form>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Turf Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Owner</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Approval</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Featured</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Visible / Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {turfs.length > 0 ? (
                turfs.map((turf) => (
                  <tr key={turf.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                          <img 
                            src={turf.images?.split(',')[0]} 
                            className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                          />
                        </div>
                        <div>
                          <p className="font-bold text-turf-dark">{turf.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {turf.location.split(',')[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-medium text-turf-dark text-sm">{turf.owner.name}</p>
                      <p className="text-[10px] text-muted-foreground">{turf.owner.email}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {turf.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full">
                          <ShieldAlert size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <FeaturedToggle turfId={turf.id} initialFeatured={turf.isFeatured} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <StatusToggle turfId={turf.id} initialStatus={turf.active} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-50 italic">
                    <p className="text-sm font-medium">No turfs found matches your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
