import { ReactNode } from "react"
import SlideBar from "@/components/nav/slideBar";
import StaffTopBar from "@/components/nav/staffTopBar";
import StaffRouteGuard from "@/components/providers/StaffRouteGuard";

export default function StaffLayout({ 
    children 
}:{
    children : ReactNode
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <StaffRouteGuard />
      <SlideBar/>
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        <StaffTopBar />
        {children}
      </main>
    </div>
  )
}
