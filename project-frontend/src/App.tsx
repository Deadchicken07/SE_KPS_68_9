import { Navigate, Route, Routes } from "react-router-dom";

import TopBar from "./pages/service/TopBar";
import OurService from "./pages/service/OurService";
import "./pages/service/service-ui.css";

function App() {
  return (
    <div className="service-shell">
      <TopBar />
      <div className="service-frame">
       
        <main className="service-main">
          <Routes>
            <Route path="/" element={<OurService />} />
            <Route path="/service" element={<OurService />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <div className="service-bottom-strip" aria-hidden="true" />
    </div>
  );
}

type PlaceholderPageProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
};

function PlaceholderPage({ title, subtitle, ctaLabel }: PlaceholderPageProps) {
  return (
    <section className="placeholder-panel">
      <h2 className="placeholder-panel__title">{title}</h2>
      <p className="placeholder-panel__subtitle">{subtitle}</p>
      <button className="placeholder-panel__button" type="button">
        {ctaLabel}
      </button>
    </section>
  );
}

export default App;
