import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Save, Info, Percent, Mail, Phone, Globe } from "lucide-react";
import ConfigForm from "./ConfigForm";

export default async function AdminSettingsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/");

  const configs = await prisma.platformConfig.findMany();
  
  // Transform to a key-value map for easier form handling
  const configMap = configs.reduce((acc: any, c: any) => ({ ...acc, [c.key]: c.value }), {} as any);

  // Default values if not set
  const defaults = {
    COMMISSION_RATE: "5",
    SUPPORT_EMAIL: "support@turfbook.com",
    SUPPORT_PHONE: "+91 98765 43210",
    PLATFORM_NAME: "Turf Booking System",
  };

  const initialData = { ...defaults, ...configMap };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-turf-dark mb-1 flex items-center gap-3">
          <Settings className="text-turf-green" size={36} />
          Platform Settings
        </h1>
        <p className="text-muted-foreground font-medium">Manage global configurations and business rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-turf-dark mb-8 flex items-center gap-2">
              <Percent size={20} className="text-turf-green" />
              Financial & Revenue
            </h3>
            <ConfigForm initialData={initialData} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-turf-green/5 border border-turf-green/10 rounded-[2rem] p-8">
            <h4 className="font-bold text-turf-dark mb-4 flex items-center gap-2">
              <Info size={18} className="text-turf-green" />
              Configuration Info
            </h4>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Commission Rate:</strong> This percentage is deducted from each successful online booking. Changes take effect on new bookings only.
              </p>
              <p>
                <strong>Support Contact:</strong> These details are shown to customers on receipts and in the help section.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
             <h4 className="font-bold text-turf-dark mb-4 group-hover:text-turf-green transition-colors">Quick Links</h4>
             <div className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-turf-green transition-colors font-medium">
                   <Mail size={14} /> Email Templates
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-turf-green transition-colors font-medium">
                   <Phone size={14} /> SMS Provider
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-turf-green transition-colors font-medium">
                   <Globe size={14} /> Domain Logic
                </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
