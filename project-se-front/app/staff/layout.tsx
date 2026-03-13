import { ReactNode } from "react"
import SlideBar from "@/components/nav/slideBar";

export default function StaffLayout({ 
    children 
}:{
    children : ReactNode
}) {
  return (
    <div style={{ display: "flex" }}>
      <SlideBar/>
      <main>{children}</main>
    </div>
  )
}