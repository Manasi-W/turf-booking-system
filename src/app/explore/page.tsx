import prisma from "@/lib/prisma";
import Link from "next/link";
import { Search, MapPin, Star } from "lucide-react";
import ExploreFilters from "@/components/explore/ExploreFilters";
import { Suspense } from "react";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const loc = params.loc || "";
  const price = params.price ? parseFloat(params.price) : undefined;
  const sport = params.sport || "";

  const whereClause: any = { active: true };

  if (q) {
    whereClause.name = { contains: q, mode: 'insensitive' };
  }
  if (loc) {
    whereClause.location = { contains: loc, mode: 'insensitive' };
  }
  if (price && !isNaN(price)) {
    whereClause.pricePerHour = { lte: price };
  }
  if (sport) {
    whereClause.sportType = { equals: sport };
  }

  const turfs = await prisma.turf.findMany({
    where: whereClause,
    include: { owner: true }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<div className="h-16 bg-gray-100 rounded-2xl animate-pulse mb-12"></div>}>
        <ExploreFilters />
      </Suspense>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {turfs.map((turf) => (
          <Link key={turf.id} href={`/turf/${turf.id}`} className="group flex flex-col h-full bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all transition-transform hover:-translate-y-1">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={turf.images?.split(',')[0] || "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop"} 
                alt={turf.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-turf-green text-white text-xs font-bold rounded-full shadow-lg">
                {turf.sportType}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-turf-dark group-hover:text-turf-green transition-colors">{turf.name}</h3>
                <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
                  <Star size={14} className="fill-current" />
                  <span>4.8</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
                <MapPin size={14} />
                <span>{turf.location}</span>
              </div>
              <div className="mt-auto flex items-center justify-between border-t pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-turf-dark">₹{turf.pricePerHour}</span>
                  <span className="text-xs text-muted-foreground font-medium">/ hr</span>
                </div>
                <div className="px-4 py-2 bg-turf-green/5 text-turf-green text-xs font-bold rounded-xl group-hover:bg-turf-green group-hover:text-white transition-all">
                  Book Slot
                </div>
              </div>
            </div>
          </Link>
        ))}

        {turfs.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-6">
               <Search size={40} />
             </div>
             <h3 className="text-xl font-bold text-turf-dark mb-2">No turfs found</h3>
             <p className="text-muted-foreground mb-8">Try adjusting your search or filters.</p>
             <Link href="/" className="px-8 py-3 bg-turf-green text-white font-bold rounded-2xl shadow-lg shadow-turf-green/20 hover:bg-turf-dark transition-all">
               Back to Home
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
