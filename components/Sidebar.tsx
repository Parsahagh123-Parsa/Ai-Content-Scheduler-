"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Calendar,
  Plus,
  Search,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigationItems = [
    { id: "create", label: "Create Content", icon: Plus, description: "Generate AI content plans" },
    { id: "dashboard", label: "My Plans", icon: BarChart3, description: "View saved content plans" },
    { id: "trends", label: "Trends", icon: TrendingUp, description: "Live trending topics" },
    { id: "calendar", label: "Calendar", icon: Calendar, description: "Content calendar view" },
    { id: "analytics", label: "Analytics", icon: BarChart3, description: "Performance insights" },
    { id: "search", label: "Search", icon: Search, description: "Find your content" },
    { id: "settings", label: "Settings", icon: Settings, description: "Account & preferences" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed top-0 left-0 h-full w-80 bg-card border-r z-50 lg:relative lg:translate-x-0 lg:opacity-100
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Content Scheduler</h1>
                <p className="text-xs text-muted-foreground">AI-Powered</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-4">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-200
                  ${darkMode ? 'bg-primary' : 'bg-muted'}
                `}
              >
                <motion.div
                  animate={{ x: darkMode ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>

            {/* User info */}
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">Demo User</div>
                <div className="text-xs text-muted-foreground truncate">demo@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
