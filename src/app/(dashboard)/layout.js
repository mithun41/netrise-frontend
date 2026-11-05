import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata = {
  title: "Dashboard Overview | NetRise BOB",
  description: "Enterprise multi-module commerce and MLM platform",
};

export const instant = false;

export default function DashboardRouteLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

