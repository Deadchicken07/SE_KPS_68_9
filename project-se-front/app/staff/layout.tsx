import { ReactNode } from "react"
import SlideBar from "@/components/nav/slideBar";

export default function StaffLayout({ 
    children 
}:{
    children : ReactNode
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <SlideBar/>
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>{children}</main>
    </div>
  )
}
