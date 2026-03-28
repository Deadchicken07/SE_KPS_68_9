import { ReactNode } from "react";
import SlideBar from "@/components/nav/slideBar";
import StaffTopBar from "@/components/nav/staffTopBar";
import StaffRouteGuard from "@/components/providers/StaffRouteGuard";

export default function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <StaffRouteGuard />
      <SlideBar />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <StaffTopBar />
        {children}
      </main>
    </div>
  );
}
