import { Outlet } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export default function Layout() {
  return (
    <div className="min-h-screen text-[#1D1D1F] overflow-x-hidden">
      <Nav />
      <PageTransition>
        <main>
          <Outlet />
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
}
