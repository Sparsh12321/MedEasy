import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Search from "@/pages/search";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import ConsumerDashboard from "./components/consumer-dashboard";
import RetailerDashboard from "./components/retailer-dashboard";
import WholesalerDashboard from "./components/wholesaler-dashboard";
import Login from "./pages/login";


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/consumer" element={<ConsumerDashboard />} />
            <Route path="/retailer" element={<RetailerDashboard />} />
            <Route path="/wholesaler" element={<WholesalerDashboard />} />

  

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
