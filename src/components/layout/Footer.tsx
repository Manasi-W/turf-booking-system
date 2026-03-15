import Link from "next/link";
import { Trophy, Instagram, Twitter, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-turf-green text-white">
                <Trophy size={20} />
              </div>
              <span className="text-lg font-bold text-turf-dark">
                Turf<span className="text-turf-green">ivo</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Find and book the best sports turfs in your city. Elevate your game with our seamless booking experience.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-turf-dark mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-turf-green transition-colors">Find Turfs</Link></li>
              <li><Link href="/explore" className="hover:text-turf-green transition-colors">Pricing</Link></li>
              <li><Link href="/register?role=owner" className="hover:text-turf-green transition-colors">List Your Turf</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-turf-dark mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-turf-green transition-colors">Help Center</Link></li>
              <li><Link href="/" className="hover:text-turf-green transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-turf-green transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-turf-dark mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white rounded-full border hover:text-turf-green transition-colors shadow-sm"><Instagram size={18} /></a>
              <a href="#" className="p-2 bg-white rounded-full border hover:text-turf-green transition-colors shadow-sm"><Twitter size={18} /></a>
              <a href="#" className="p-2 bg-white rounded-full border hover:text-turf-green transition-colors shadow-sm"><Facebook size={18} /></a>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={16} />
              <span>contact@turfivo.com</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Turfivo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
