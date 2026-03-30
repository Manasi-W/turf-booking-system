import Link from "next/link";
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";
import HeroSearch from "@/components/home/HeroSearch";
import prisma from "@/lib/prisma";

export default async function Home() {
  let featuredTurfs: any[] = [];
  try {
    featuredTurfs = await prisma.turf.findMany({
      where: { isFeatured: true, isApproved: true, active: true },
      take: 3,
      include: { reviews: true }
    });
  } catch (error) {
    console.error("Error fetching featured turfs:", error);
    featuredTurfs = [];
  }
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" 
            alt="Sports Turf" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-turf-dark/80 via-turf-dark/60 to-turf-dark/90"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md text-turf-lime text-sm font-bold mb-8 border border-white/10 animate-fade-in shadow-xl">
              <Star size={16} className="fill-current" />
              <span className="uppercase tracking-widest">Rated #1 Platform for Sports Bookings</span>
            </div>
            <h1 className="text-5xl sm:text-8xl font-black tracking-tight text-white mb-8 leading-[1]">
              Your Game Begins <br />
              <span className="text-turf-green">With a Perfect Slot.</span>
            </h1>
            <p className="text-xl text-white/70 mb-12 max-w-2xl leading-relaxed">
              Discover premium sports turfs nearby, check real-time availability, and book your next match in seconds. No more phone calls, just play.
            </p>
            
            <div className="w-full max-w-2xl mx-auto mb-12">
              <HeroSearch />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm font-bold text-white/50">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="h-2 w-2 rounded-full bg-turf-green"></div>
                <span>500+ TURFS</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="h-2 w-2 rounded-full bg-turf-green"></div>
                <span>10K+ PLAYERS</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="h-2 w-2 rounded-full bg-turf-green"></div>
                <span>24/7 SUPPORT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-turf-dark mb-4">Everything You Need to Play</h2>
            <p className="text-muted-foreground">We've simplified the entire process from finding a turf to splitting the cost with your team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="text-turf-green" size={32} />,
                title: "Real-time Availability",
                desc: "Check live slots and book instantly. No more double bookings or waiting for confirmations."
              },
              {
                icon: <Users className="text-turf-green" size={32} />,
                title: "Split Cost Calculator",
                desc: "Easily calculate and share the booking cost among your team members right from the app."
              },
              {
                icon: <Shield className="text-turf-green" size={32} />,
                title: "Secure Payments",
                desc: "Safe and secure payment options including 'Pay at Venue'. Transparency in every transaction."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6 inline-block p-4 bg-turf-green/5 rounded-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-turf-dark mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Turfs (Social Proof / Demo) */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-turf-dark mb-4">Trending Turfs</h2>
              <p className="text-muted-foreground">Most booked spots this week. Check them out!</p>
            </div>
            <Link href="/explore" className="text-turf-green font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTurfs.map((turf) => {
              const reviewCount = turf.reviews.length;
              const averageRating = reviewCount > 0 
                ? turf.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewCount 
                : 4.8; // Fallback rating
              const images = turf.images?.split(',') || [];

              return (
                <div key={turf.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all h-[400px] flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={images[0] || "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop"} 
                      alt={turf.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-turf-dark flex items-center gap-1">
                      <Star size={12} className="text-orange-400 fill-current" />
                      {averageRating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-turf-dark mb-1">{turf.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin size={14} />
                      {turf.location}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-turf-green">₹{turf.pricePerHour}</span>
                        <span className="text-xs text-muted-foreground"> / hour</span>
                      </div>
                      <Link 
                        href={`/turf/${turf.id}`}
                        className="px-4 py-2 border border-turf-green text-turf-green text-sm font-bold rounded-xl hover:bg-turf-green hover:text-white transition-all text-center"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {featuredTurfs.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-100">
                    <p className="text-muted-foreground font-medium italic">New top-rated turfs are coming soon!</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats / Impact */}
      <section className="py-24 bg-turf-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: "50+", lab: "Cities" },
              { val: "200k+", lab: "Matches Hosted" },
              { val: "99.9%", lab: "Booking Success" },
              { val: "4.9/5", lab: "User Satisfaction" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-black text-turf-lime mb-2">{stat.val}</div>
                <div className="text-sm font-medium text-white/70 uppercase tracking-widest">{stat.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="bg-turf-green rounded-[3rem] p-12 sm:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-turf-green/40">
           <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
           <div className="relative z-10 max-w-2xl mx-auto">
             <h2 className="text-4xl sm:text-5xl font-black mb-6">Ready to Kick Off?</h2>
             <p className="text-xl text-white/80 mb-10">Join thousands of athletes who trust us for their weekly games.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/register" className="px-10 py-5 bg-white text-turf-green font-bold rounded-2xl hover:bg-turf-lime hover:text-turf-dark transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg">
                 Join as a Player
               </Link>
               <Link href="/register?role=owner" className="px-10 py-5 bg-turf-dark text-white font-bold rounded-2xl hover:bg-black transition-all transform hover:-translate-y-1 active:scale-95 border border-white/20">
                 Join as Turf Owner
               </Link>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
