import { ReactNode } from "react"
import SlideBar from "@/components/nav/slideBar";
import StaffTopBar from "@/components/nav/staffTopBar";

export default function StaffLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <SlideBar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <StaffTopBar />
        {children}
      </main>
    </div>
  )
}
