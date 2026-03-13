import { ReactNode } from "react"
import NavTop from "@/components/nav/navTop";

export default function UserLayout({ 
    children,
}:{
    children: ReactNode
}) {
  return (
    <div>
      <NavTop/>
      <main>{children}</main>
    </div>
  )
}