import { Routes, Route } from "react-router-dom";
import AdminReport from "./pages/admin/AdminReport";
import AdminReportExport from "./pages/admin/AdminReportExport";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminReport />} />
      <Route path="/admin/report" element={<AdminReport />} />
      <Route path="/admin/report/export" element={<AdminReportExport />} />
    </Routes>
  );
}

export default App;

