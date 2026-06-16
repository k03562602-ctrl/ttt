import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Layout from "@/components/Layout";
import { BookingProvider } from "@/contexts/BookingContext";

function App() {
  return (
    <BookingProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </BookingProvider>
  );
}

export default App;