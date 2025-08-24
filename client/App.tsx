import "./global.css";
import "./utils/resizeObserverErrorHandler";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "./contexts/RoleContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProjectDetail from "./pages/ProjectDetail";
import Approval from "./pages/Approval";
import DocumentViewer from "./pages/DocumentViewer";
import Organizations from "./pages/Organizations";
import OrganizationEmployees from "./pages/OrganizationEmployees";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import Monitoring from "./pages/Monitoring";
import Documents from "./pages/Documents";
import Tasks from "./pages/Tasks";
import Processes from "./pages/Processes";
import Team from "./pages/Team";
import ObjectTeam from "./pages/ObjectTeam";
import ObjectOrganizations from "./pages/ObjectOrganizations";
import PlaceholderPage from "./components/PlaceholderPage";

// Icons for placeholder pages
import { 
  Building2, 
  Users, 
  BarChart, 
  Settings, 
  List, 
  FileText, 
  Monitor 
} from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <RoleProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/objects" element={<Index />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/team" element={<ObjectTeam />} />
            <Route path="/projects/:id/organizations" element={<ObjectOrganizations />} />
            <Route path="/approval" element={<Approval />} />
            <Route path="/documents/:id" element={<DocumentViewer />} />
            
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/:id/employees" element={<OrganizationEmployees />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />

            <Route path="/monitoring" element={<Monitoring />} />

            {/* Placeholder pages */}
            <Route path="/processes" element={<Processes />} />
            <Route path="/team" element={<Team />} />
            <Route 
              path="/settings" 
              element={
                <PlaceholderPage 
                  title="Настройки системы"
                  description="Конфигурация системы и управление параметрами"
                  icon={<Settings className="w-12 h-12 text-gray-300" />}
                />
              } 
            />
            <Route path="/documents" element={<Documents />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route 
              path="/reports" 
              element={
                <PlaceholderPage 
                  title="Отчеты"
                  description="Аналитика и отчетность по проектам и документам"
                  icon={<BarChart className="w-12 h-12 text-gray-300" />}
                />
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RoleProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
