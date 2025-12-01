import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Search from "@/pages/search";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import RetailerDashboard from "./components/retailer-dashboard";
import WholesalerDashboard from "./components/wholesaler-dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";
import PartnerLogin from "./pages/Partnerlogin";
import { ProtectedRoute } from "./pages/ProtectedRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login/wholesaleretail" element={<PartnerLogin />} />
            <Route path="/search" element={<Search />} />

            {/* PROTECTED ROUTES */}

            {/* Customer Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowed={["customer"]}>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Retailer Dashboard */}
            <Route
              path="/retailer"
              element={
                <ProtectedRoute allowed={["retailer"]}>
                  <RetailerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Wholesaler Dashboard */}
            <Route
              path="/wholesaler"
              element={
                <ProtectedRoute allowed={["wholesaler"]}>
                  <WholesalerDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
