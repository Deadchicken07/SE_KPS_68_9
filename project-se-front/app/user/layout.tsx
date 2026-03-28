import { ReactNode } from "react"
import NavTop from "@/components/nav/navTop";
import { App } from "antd";
import { Content } from "antd/es/layout/layout";

export default function UserLayout({
    children,
}:{
    children: ReactNode
}) {
  return (
  <App>
    <div>
      <NavTop/>
      <Content style={{ margin: 0, padding: 24 }}>
          {children}
      </Content>
    </div>
  </App>
  )
}
