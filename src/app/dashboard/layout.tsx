import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
