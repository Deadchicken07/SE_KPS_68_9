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
      <main
        className="flex-1 overflow-auto"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(63, 127, 109, 0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(192, 144, 87, 0.12), transparent 28%), linear-gradient(180deg, #f7f1ea 0%, #f3ede4 100%)",
        }}
      >
        <StaffTopBar />
        {children}
      </main>
    </div>
  );
}
