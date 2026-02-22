import { NavLink } from "react-router-dom";

export default function TopBar() {
  return (
    <nav className="service-topbar">
      <h2 className="service-topbar__brand">jitdee</h2>
      <div className="service-topbar__links">
        <NavLink className={getLinkClassName} to="/">
          หน้าแรก
        </NavLink>
        <NavLink className={getLinkClassName} to="/service">
          บริการ
        </NavLink>
        <NavLink className={getLinkClassName} to="/counselor">
          ผู้ให้คำปรึกษา
        </NavLink>
        <NavLink className={getLinkClassName} to="/c">
          login
        </NavLink>
        <NavLink className="service-topbar__signup" to="/d">
          Sign Up
        </NavLink>
      </div>
    </nav>
  );
}

function getLinkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "service-topbar__link is-active" : "service-topbar__link";
}
