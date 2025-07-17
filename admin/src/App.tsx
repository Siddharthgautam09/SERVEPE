
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import Users from "@/pages/Users";
import Services from "@/pages/Services";
import Orders from "@/pages/Orders";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/users" element={<Users />} />
        <Route path="/services" element={<Services />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
