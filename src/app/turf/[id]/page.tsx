import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Star, Share2, Heart, Shield, CheckCircle2, Info } from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import CostSplitter from "@/components/booking/CostSplitter";
import ReviewSection from "@/components/turf/ReviewSection";
import TurfGallery from "@/components/turf/TurfGallery";
import TurfInteractionButtons from "@/components/turf/TurfInteractionButtons";
import TurfMapDisplay from "@/components/turf/TurfMapDisplay";

interface TurfPageProps {
  params: Promise<{ id: string }>;
}

export default async function TurfDetailPage({ params }: TurfPageProps) {
  const { id } = await params;
  const turf = await prisma.turf.findUnique({
    where: { id },
    include: { 
      owner: true,
      reviews: true 
    }
  }) as any;

  // Fail-safe for coordinates if Prisma Client is stale
  if (turf && (turf.lat === undefined || turf.lat === null)) {
    const rawCoords = await prisma.$queryRaw`SELECT lat, lng FROM "Turf" WHERE id = ${id} LIMIT 1` as any[];
    if (rawCoords && rawCoords[0]) {
      turf.lat = rawCoords[0].lat;
      turf.lng = rawCoords[0].lng;
    }
  }

  if (!turf) {
    notFound();
  }

  const reviewCount = turf.reviews.length;
  const averageRating = reviewCount > 0 
    ? turf.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount 
    : 0;

  const images = turf.images?.split(',') || [
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200"
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header / Gallery */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-turf-green/10 text-turf-green text-xs font-bold rounded-full uppercase tracking-wider">
                  {turf.sportType}
                </span>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
                    <Star size={16} className="fill-current" />
                    <span>{averageRating.toFixed(1)} ({reviewCount} Review{reviewCount !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-black text-turf-dark mb-2">{turf.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={18} className="text-turf-green" />
                <span>{turf.location}</span>
              </div>
            </div>
            <TurfInteractionButtons turfName={turf.name} />
          </div>

          <TurfGallery images={images} alt={turf.name} />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-turf-dark mb-4">About this Turf</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {turf.description || "Experience top-tier sports facilities at Arena One. Our pitch features premium FIFA-grade synthetic grass perfectly maintained for optimal performance. Equipped with professional floodlights, high-quality netting, and dedicated spectator areas."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-turf-dark mb-6">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { icon: <CheckCircle2 className="text-turf-green" />, label: "Floodlights" },
                  { icon: <CheckCircle2 className="text-turf-green" />, label: "Parking Space" },
                  { icon: <CheckCircle2 className="text-turf-green" />, label: "Changing Rooms" },
                  { icon: <CheckCircle2 className="text-turf-green" />, label: "Drinking Water" },
                  { icon: <CheckCircle2 className="text-turf-green" />, label: "First Aid" },
                  { icon: <CheckCircle2 className="text-turf-green" />, label: "Shower Room" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                    {item.icon}
                    <span className="font-medium text-sm text-turf-dark">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-turf-dark mb-6">Location</h2>
              <div className="h-96 w-full relative">
                {turf.lat && turf.lng ? (
                  <TurfMapDisplay 
                    turfs={[{
                      id: turf.id,
                      name: turf.name,
                      lat: turf.lat,
                      lng: turf.lng,
                      location: turf.location,
                      pricePerHour: turf.pricePerHour,
                      images: turf.images?.split(',') || []
                    }]} 
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 rounded-3xl flex items-center justify-center border border-dashed border-gray-300">
                    <p className="text-muted-foreground italic">Location map not available for this turf</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <BookingCalendar turfId={turf.id} pricePerHour={turf.pricePerHour} />
            </section>

            <section className="pt-12 border-t">
              <ReviewSection turfId={turf.id} />
            </section>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <CostSplitter totalPrice={turf.pricePerHour} turfName={turf.name} />
              
              <div className="bg-turf-green/5 border border-turf-green/10 rounded-3xl p-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 flex-shrink-0 bg-turf-green rounded-xl flex items-center justify-center text-white">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-turf-dark mb-1">Price Guarantee</h4>
                    <p className="text-sm text-muted-foreground">Book at the lowest possible price. No hidden service charges.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                 <h4 className="font-bold text-turf-dark mb-4 flex items-center gap-2">
                   <Info size={18} className="text-turf-green" />
                   Cancellation Policy
                 </h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   Free cancellation up to 4 hours before the slot time. Cancellations within 4 hours are non-refundable.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
