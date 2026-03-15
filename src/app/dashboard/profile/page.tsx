import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { User } from "lucide-react";

export default async function CustomerProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-turf-dark flex items-center gap-3">
          <User className="text-turf-green" size={32} />
          My Profile
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Manage your account details and contact information.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
