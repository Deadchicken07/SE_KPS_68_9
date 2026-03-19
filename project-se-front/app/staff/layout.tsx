import { ReactNode } from "react"
import SlideBar from "@/components/nav/slideBar";

export default function StaffLayout({ 
    children 
}:{
    children : ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f4f1ea]">
      <SlideBar/>
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
