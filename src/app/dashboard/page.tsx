import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRoot() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  if (role === "SUPER_ADMIN") {
    redirect("/dashboard/admin");
  } else if (role === "TURF_OWNER") {
    redirect("/dashboard/owner");
  } else {
    redirect("/dashboard/customer");
  }

  return null;
}
