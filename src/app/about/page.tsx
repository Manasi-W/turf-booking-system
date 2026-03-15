import { Trophy, CheckCircle, ShieldCheck, Map } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-turf-green text-white shadow-xl shadow-turf-green/20 mb-6">
          <Trophy size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-turf-dark mb-6 tracking-tight">
          About Turf<span className="text-turf-green">Booking</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The ultimate platform for discovering and booking premier sports turfs near you. Whether you're planning a competitive 5-a-side football match, a cricket practice session, or a weekend tennis game, we connect you with the best venues in town.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="mx-auto w-14 h-14 bg-turf-green/10 text-turf-green rounded-2xl flex items-center justify-center mb-6">
            <Map size={28} />
          </div>
          <h3 className="text-xl font-bold text-turf-dark mb-3">Discover Venues</h3>
          <p className="text-muted-foreground text-sm">
            Easily search and filter through hundreds of high-quality sports turfs based on location, price, and sport type.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <CheckCircle size={28} />
          </div>
          <h3 className="text-xl font-bold text-turf-dark mb-3">Instant Booking</h3>
          <p className="text-muted-foreground text-sm">
            Check live availability calendars and instantly secure your time slot with our seamless booking engine.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="mx-auto w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl font-bold text-turf-dark mb-3">Secure Payments</h3>
          <p className="text-muted-foreground text-sm">
            Pay online securely or choose to pay at the venue. Our smart split-payment calculator helps you easily split costs with friends.
          </p>
        </div>
      </div>

      <div className="bg-turf-dark rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-6">Are you a Turf Owner?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join our platform to list your venues, manage bookings digitally, and increase your revenue with our comprehensive owner dashboard.
          </p>
          <a href="/register" className="inline-block px-8 py-4 bg-turf-green text-white font-bold rounded-full hover:bg-white hover:text-turf-dark transition-colors shadow-lg shadow-turf-green/20">
            List Your Turf Today
          </a>
        </div>
      </div>
    </div>
  );
}
