import { Navigate, Route, Routes } from "react-router-dom";

import TopBar from "./pages/service/TopBar";
import OurService from "./pages/service/service";
import CounselorPage from "./pages/counselor/CounselorPage";
import HomePage from "./pages/home/HomePage";
import "./pages/service/service-ui.css";

function App() {
  return (
    <div className="service-shell">
      <TopBar />
      <div className="service-frame">
       
        <main className="service-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/service" element={<OurService />} />
            <Route path="/counselor" element={<CounselorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <div className="service-bottom-strip" aria-hidden="true" />
    </div>
  );
}

export default App;
