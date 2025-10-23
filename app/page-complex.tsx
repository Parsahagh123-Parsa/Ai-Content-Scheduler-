"use client";

import { useState } from "react";
import EnhancedContentForm from "@/components/EnhancedContentForm";
import PlansDashboard from "@/components/PlansDashboard";
import TrendsDashboard from "@/components/TrendsDashboard";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userId = "demo-user-123"; // In a real app, this would come from auth

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <EnhancedContentForm />;
      case "dashboard":
        return <PlansDashboard userId={userId} />;
      case "trends":
        return <TrendsDashboard />;
      case "calendar":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Content Calendar</h1>
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-xl font-semibold mb-2">Calendar View Coming Soon</h2>
              <p className="text-muted-foreground">
                Interactive calendar with drag-and-drop scheduling
              </p>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-xl font-semibold mb-2">Analytics Coming Soon</h2>
              <p className="text-muted-foreground">
                Performance insights and content analytics
              </p>
            </div>
          </div>
        );
      case "search":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Search Content</h1>
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold mb-2">Search Coming Soon</h2>
              <p className="text-muted-foreground">
                Search and filter through your content plans
              </p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <h2 className="text-xl font-semibold mb-2">Settings Coming Soon</h2>
              <p className="text-muted-foreground">
                Account settings and preferences
              </p>
            </div>
          </div>
        );
      default:
        return <EnhancedContentForm />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">AI Content Scheduler</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>
        
        <main className="min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
