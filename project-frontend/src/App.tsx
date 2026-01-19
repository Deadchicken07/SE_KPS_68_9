import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TestHome from "./pages/test/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<TestHome />} />
    </Routes>
  );
}

export default App;