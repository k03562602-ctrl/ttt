import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Layout from "@/components/Layout";
import { BookingProvider } from "@/contexts/BookingContext";

function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <BookingProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public site — wrapped in Layout (Nav + Footer) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
            </Route>
            {/* Admin — completely standalone, no site Nav/Footer */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </BookingProvider>
  );
}

export default App;