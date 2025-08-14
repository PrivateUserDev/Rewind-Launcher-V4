import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient: string;
    titlebar: string;
    titlebarSolid: string;
    sidebar: string;
    sidebarSolid: string;
  };
  backgroundImage?: string;
  backgroundType?: 'full' | 'corner';
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#0f0f0f',
      surface: '#222222',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(255, 255, 255, 0.08)',
      gradient: 'from-indigo-900/20 to-purple-900/10',
      titlebar: 'rgba(30, 30, 44, 0.95)',
      titlebarSolid: '#222222',
      sidebar: 'rgba(34, 34, 34, 0.2)',
      sidebarSolid: '#222222',
    },
  },
  graduation: {
    id: 'graduation',
    name: 'Graduation',
    colors: {
      primary: '#3B82F6',
      secondary: '#EC4899',
      accent: '#F59E0B',
      background: '#1E3A8A',
      surface: '#3730A3',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(255, 255, 255, 0.25)',
      gradient: 'from-blue-500/50 via-indigo-600/45 via-purple-600/40 via-pink-500/40 to-orange-400/50',
      titlebar: 'linear-gradient(135deg, #3B82F6, #6366F1, #8B5CF6, #EC4899, #F59E0B)',
      titlebarSolid: '#3B82F6',
      sidebar: 'linear-gradient(180deg, rgba(59, 130, 246, 0.5), rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.35), rgba(236, 72, 153, 0.3), rgba(245, 158, 11, 0.25))',
      sidebarSolid: '#3730A3',
    },
  },
  seventeen: {
    id: 'seventeen',
    name: '17',
    colors: {
      primary: '#3A3A3A',
      secondary: '#5A5A5A',
      accent: '#7A7A7A',
      background: '#0A0A0A',
      surface: 'rgba(45, 45, 45, 0.4)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.95)',
      border: 'rgba(255, 255, 255, 0.3)',
      gradient: 'from-black/30 via-gray-900/25 to-gray-800/20',
      titlebar: 'linear-gradient(135deg, rgba(58, 58, 58, 0.6), rgba(90, 90, 90, 0.5), rgba(122, 122, 122, 0.4))',
      titlebarSolid: 'rgba(58, 58, 58, 0.6)',
      sidebar: 'linear-gradient(180deg, rgba(45, 45, 45, 0.5), rgba(58, 58, 58, 0.45), rgba(74, 74, 74, 0.4))',
      sidebarSolid: 'rgba(45, 45, 45, 0.5)',
    },
    backgroundImage: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg',
    backgroundType: 'full',
  },
  deathrace: {
    id: 'deathrace',
    name: 'Death Race for Love',
    colors: {
      primary: '#2A0A2A',
      secondary: '#3B0B1A',
      accent: '#4B1F2B',
      background: '#050205',
      surface: 'rgba(15, 5, 10, 0.3)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)',
      gradient: 'from-purple-950/20 via-red-950/15 to-black/10',
      titlebar: 'linear-gradient(135deg, rgba(42, 10, 42, 0.8), rgba(59, 11, 26, 0.8), rgba(75, 31, 43, 0.8))',
      titlebarSolid: 'rgba(42, 10, 42, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(42, 10, 42, 0.3), rgba(59, 11, 26, 0.25), rgba(75, 31, 43, 0.2))',
      sidebarSolid: 'rgba(15, 5, 10, 0.4)',
    },
    backgroundImage: 'https://cdn.wallpapersafari.com/95/88/DcOkol.jpg',
    backgroundType: 'full',
  },
  question: {
    id: 'question',
    name: '?',
    colors: {
      primary: '#1A1A1A',
      secondary: '#2D2D2D',
      accent: '#404040',
      background: '#0A0A0A',
      surface: 'rgba(20, 20, 20, 0.4)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 255, 255, 0.15)',
      gradient: 'from-gray-950/30 via-black/25 to-gray-900/20',
      titlebar: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(45, 45, 45, 0.8), rgba(64, 64, 64, 0.7))',
      titlebarSolid: 'rgba(26, 26, 26, 0.9)',
      sidebar: 'linear-gradient(180deg, rgba(26, 26, 26, 0.4), rgba(45, 45, 45, 0.3), rgba(64, 64, 64, 0.2))',
      sidebarSolid: 'rgba(20, 20, 20, 0.5)',
    },
    backgroundImage: 'https://wallpapercave.com/wp/wp8420078.png',
    backgroundType: 'full',
  },
  gbgr: {
    id: 'gbgr',
    name: 'Goodbye & Good Riddance',
    colors: {
      primary: '#2563EB',
      secondary: '#F59E0B',
      accent: '#10B981',
      background: '#0F172A',
      surface: 'rgba(30, 41, 59, 0.4)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 255, 255, 0.15)',
      gradient: 'from-blue-600/20 via-yellow-500/15 to-emerald-500/10',
      titlebar: 'linear-gradient(135deg, rgba(37, 99, 235, 0.8), rgba(245, 158, 11, 0.7), rgba(16, 185, 129, 0.6))',
      titlebarSolid: 'rgba(37, 99, 235, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(37, 99, 235, 0.3), rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.2))',
      sidebarSolid: 'rgba(30, 41, 59, 0.5)',
    },
    backgroundImage: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg',
    backgroundType: 'full',
  },
  lnd: {
    id: 'lnd',
    name: 'Legends Never Die',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#F59E0B',
      background: '#1A0B2E',
      surface: 'rgba(59, 39, 89, 0.4)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 255, 255, 0.15)',
      gradient: 'from-purple-600/20 via-pink-500/15 to-orange-400/10',
      titlebar: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.7), rgba(245, 158, 11, 0.6))',
      titlebarSolid: 'rgba(139, 92, 246, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.25), rgba(245, 158, 11, 0.2))',
      sidebarSolid: 'rgba(59, 39, 89, 0.5)',
    },
    backgroundImage: 'https://wallpaperaccess.com/full/6302625.png',
    backgroundType: 'full',
  },
  ye: {
    id: 'ye',
    name: 'ye',
    colors: {
      primary: '#22C55E',
      secondary: '#16A34A',
      accent: '#15803D',
      background: '#0A1A0F',
      surface: 'rgba(34, 197, 94, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(34, 197, 94, 0.3)',
      gradient: 'from-green-500/20 via-green-600/15 to-green-700/10',
      titlebar: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.7), rgba(21, 128, 61, 0.6))',
      titlebarSolid: 'rgba(34, 197, 94, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.25), rgba(21, 128, 61, 0.2))',
      sidebarSolid: 'rgba(34, 197, 94, 0.1)',
    },
    backgroundImage: 'https://wallpaperaccess.com/full/4198173.jpg',
    backgroundType: 'full',
  },
  yeezus: {
    id: 'yeezus',
    name: 'Yeezus',
    colors: {
      primary: '#DC2626',
      secondary: '#B91C1C',
      accent: '#991B1B',
      background: '#1A0A0A',
      surface: 'rgba(220, 38, 38, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(220, 38, 38, 0.3)',
      gradient: 'from-red-600/20 via-red-700/15 to-red-800/10',
      titlebar: 'linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(185, 28, 28, 0.7), rgba(153, 27, 27, 0.6))',
      titlebarSolid: 'rgba(220, 38, 38, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.25), rgba(153, 27, 27, 0.2))',
      sidebarSolid: 'rgba(220, 38, 38, 0.1)',
    },
    backgroundImage: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg',
    backgroundType: 'full',
  },
  morechaos: {
    id: 'morechaos',
    name: 'More Chaos',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#1F1F1F',
      background: '#0A0A0A',
      surface: 'rgba(139, 92, 246, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(139, 92, 246, 0.3)',
      gradient: 'from-purple-600/20 via-pink-500/15 to-black/10',
      titlebar: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.7), rgba(31, 31, 31, 0.6))',
      titlebarSolid: 'rgba(139, 92, 246, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.25), rgba(31, 31, 31, 0.2))',
      sidebarSolid: 'rgba(139, 92, 246, 0.1)',
    },
    backgroundImage: 'https://hip-hopvibe.com/wp-content/uploads/2025/04/unnamed-2025-04-04T153021.952-1-788x440.jpg',
    backgroundType: 'full',
  },
  unity: {
    id: 'unity',
    name: 'Unity',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#B45309',
      background: '#1C1917',
      surface: 'rgba(245, 158, 11, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(245, 158, 11, 0.3)',
      gradient: 'from-amber-500/20 via-orange-600/15 to-amber-800/10',
      titlebar: 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.7), rgba(180, 83, 9, 0.6))',
      titlebarSolid: 'rgba(245, 158, 11, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.25), rgba(180, 83, 9, 0.2))',
      sidebarSolid: 'rgba(245, 158, 11, 0.1)',
    },
    backgroundImage: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg',
    backgroundType: 'full',
  },
  teenagedream: {
    id: 'teenagedream',
    name: 'Teenage Dream',
    colors: {
      primary: '#FF69B4',
      secondary: '#FF1493',
      accent: '#DA70D6',
      background: '#1A0B2E',
      surface: 'rgba(255, 105, 180, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 105, 180, 0.3)',
      gradient: 'from-pink-500/20 via-purple-600/15 to-pink-800/10',
      titlebar: 'linear-gradient(135deg, rgba(255, 105, 180, 0.8), rgba(255, 20, 147, 0.7), rgba(218, 112, 214, 0.6))',
      titlebarSolid: 'rgba(255, 105, 180, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(255, 105, 180, 0.3), rgba(255, 20, 147, 0.25), rgba(218, 112, 214, 0.2))',
      sidebarSolid: 'rgba(255, 105, 180, 0.1)',
    },
    backgroundImage: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg',
    backgroundType: 'full',
  },
  pinktape: {
    id: 'pinktape',
    name: 'Pink Tape',
    colors: {
      primary: '#FF1493',
      secondary: '#FF69B4',
      accent: '#C71585',
      background: '#0D0D0D',
      surface: 'rgba(255, 20, 147, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 20, 147, 0.3)',
      gradient: 'from-pink-600/20 via-pink-500/15 to-pink-800/10',
      titlebar: 'linear-gradient(135deg, rgba(255, 20, 147, 0.8), rgba(255, 105, 180, 0.7), rgba(199, 21, 133, 0.6))',
      titlebarSolid: 'rgba(255, 20, 147, 0.8)',
      sidebar: 'linear-gradient(180deg, rgba(255, 20, 147, 0.3), rgba(255, 105, 180, 0.25), rgba(199, 21, 133, 0.2))',
      sidebarSolid: 'rgba(255, 20, 147, 0.1)',
    },
    backgroundImage: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg',
    backgroundType: 'full',
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeId(savedTheme);
    }
  }, []);

  useEffect(() => {
    const theme = themes[currentThemeId];
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.colors.primary);
      root.style.setProperty('--theme-secondary', theme.colors.secondary);
      root.style.setProperty('--theme-accent', theme.colors.accent);
      root.style.setProperty('--theme-background', theme.colors.background);
      root.style.setProperty('--theme-surface', theme.colors.surface);
      root.style.setProperty('--theme-text', theme.colors.text);
      root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
      root.style.setProperty('--theme-border', theme.colors.border);

      root.style.setProperty('--theme-gradient', `linear-gradient(to bottom right, ${theme.colors.primary}30, ${theme.colors.secondary}20)`);
      const frameStyle = document.querySelector('.tauriFrame') as HTMLElement;
      if (frameStyle) {
        frameStyle.style.background = theme.colors.titlebar;
      }
    }
  }, [currentThemeId]);

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentThemeId(themeId);
      localStorage.setItem('selectedTheme', themeId);
    }
  };

  const value: ThemeContextType = {
    currentTheme: themes[currentThemeId],
    setTheme,
    availableThemes: Object.values(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
