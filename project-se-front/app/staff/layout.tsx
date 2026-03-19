import { ReactNode } from "react"
import SlideBar from "@/components/nav/slideBar";
import StaffTopBar from "@/components/nav/staffTopBar";

export default function StaffLayout({ 
    children 
}:{
    children : ReactNode
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SlideBar/>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <StaffTopBar />
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  )
}
