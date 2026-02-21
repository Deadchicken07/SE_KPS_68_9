import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MainLayout from "./layouts/mainLayout";


function App() {
  return (
    <Routes>
      <Route element={<MainLayout/>}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;