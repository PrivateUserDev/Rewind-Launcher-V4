import { useLocation } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Frame from "./Frame";
import Sidebar from "./Sidebar";
import { useTheme } from '../contexts/ThemeContext';

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface LayoutProps {
  children: React.ReactNode;
  user: any | null;
  isPreparing: boolean;
  onLogout: () => void;
}

export default function Layout({ children, user, isPreparing, onLogout }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isInitialPath = location.pathname === '/';
  const { currentTheme } = useTheme();

  const showSidebar = !isLoginPage && !isInitialPath && user && !isPreparing;

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
   <div className="min-h-screen" style={{
     backgroundColor: currentTheme.colors.background,
     background: currentTheme.id === 'default' ? currentTheme.colors.background : `linear-gradient(to bottom, ${hexToRgba(currentTheme.colors.primary, 0.4)}, ${hexToRgba(currentTheme.colors.secondary, 0.35)}, ${hexToRgba(currentTheme.colors.accent, 0.3)})`
   }}>
        <Frame />
        <div className="flex h-screen">
          {showSidebar && <Sidebar user={user} onLogout={onLogout} />}
          <main className={`flex-1 transition-all duration-300 ${showSidebar ? (isCollapsed ? 'ml-[85px]' : 'ml-[210px]') : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
