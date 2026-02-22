import type { ReactNode } from "react";
import TopBar from "./service/TopBar";

type SiteShellProps = {
  children: ReactNode;
};

export default function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="service-shell">
      <TopBar />
      <div className="service-frame">
        <main className="service-main">{children}</main>
      </div>
      <div aria-hidden="true" className="service-bottom-strip" />
    </div>
  );
}
