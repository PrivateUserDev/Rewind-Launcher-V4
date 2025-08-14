import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GrHomeRounded } from "react-icons/gr";
import { MdOutlineFolder } from "react-icons/md";
import { IoCartOutline } from "react-icons/io5";
import { MdLeaderboard } from "react-icons/md";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Settings from './Settings';
import { useSidebar } from './Layout';
import { useTheme } from '../contexts/ThemeContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  isCollapsed: boolean;
}

interface SidebarProps {
  user: {
    username: string;
    avatar_url: string;
    email: string;
    accountId: string;
    role: {
      name: string;
      color: string;
    };
  };
  onLogout: () => void;
}

const NavItem = ({ to, icon, text, isActive, isCollapsed }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center w-[97%] h-10 rounded-lg transition-all duration-200 mb-2.5 ${isCollapsed ? 'px-2 justify-center' : 'px-4'}
                font-['Bricolage_Grotesque'] group relative
                ${isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
  >
    <span className={`${isCollapsed ? 'text-4xl' : 'text-2xl'} transition-all duration-200`}>{icon}</span>
    {!isCollapsed && <span className="ml-3.5 font-medium text-[14px]">{text}</span>}
    {isCollapsed && !isActive && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900/95 backdrop-blur-md rounded-md text-white text-sm font-['Bricolage_Grotesque'] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[100]">
        {text}
      </div>
    )}
  </Link>
);

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'profile' | 'themes'>('profile');
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { currentTheme } = useTheme();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const handleOpenSettings = (event: CustomEvent) => {
      const section = event.detail?.section;
      if (section === 'themes') {
        setSettingsSection('themes');
      } else {
        setSettingsSection('profile');
      }
      setIsSettingsOpen(true);
    };

    window.addEventListener('openSettings', handleOpenSettings as EventListener);
    return () => {
      window.removeEventListener('openSettings', handleOpenSettings as EventListener);
    };
  }, []);

  return (
    <>
      <div className={`${isCollapsed ? 'w-[85px]' : 'w-[210px]'} h-screen fixed left-0 top-0 z-10 transition-all duration-300`}>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ background: currentTheme.colors.sidebar }}
        ></div>
        <div className="absolute inset-0 backdrop-blur-md pointer-events-none overflow-hidden"></div>

        <div className="flex flex-col h-full p-2 pt-16 relative z-10">
          <div className="flex items-center justify-center mb-10 mt-2 ml-[3px]">
            {isCollapsed ? (
              <img
                src="../SidebarRewind.png"
                alt="Rewind Icon"
                className="w-19 h-18"
              />
            ) : (
              <h2 className="text-white font-bold font-['Bricolage_Grotesque'] text-[45px]">
                Rewind
              </h2>
            )}
          </div>

          <div className={`px-1 ${isCollapsed ? 'mt-8' : ''}`}>
            <NavItem
              to="/home"
              icon={<GrHomeRounded size={19} />}
              text="Home"
              isActive={currentPath === '/home'}
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/library"
              icon={<MdOutlineFolder size={22} />}
              text="Library"
              isActive={currentPath === '/library'}
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/shop"
              icon={<IoCartOutline size={22} />}
              text="Shop"
              isActive={currentPath === '/shop'}
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/leaderboard"
              icon={<MdLeaderboard size={22} />}
              text="Leaderboard"
              isActive={currentPath === '/leaderboard'}
              isCollapsed={isCollapsed}
            />
          </div>

          <div className="mt-auto">
            <div className="flex justify-center mb-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
              >
                {isCollapsed ? <HiChevronRight size={18} /> : <HiChevronLeft size={18} />}
              </button>
            </div>
            <div className="h-[2px] bg-white/[0.08] mb-3 mx-1" />

            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3 mx-1">
                <button
                  className="p-2 transition-all duration-200 hover:bg-white/10 rounded-lg group relative"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <img src="/setting.png" alt="Settings" className="w-7 h-7" />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900/95 backdrop-blur-md rounded-md text-white text-sm font-['Bricolage_Grotesque'] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[100]">
                    Settings
                  </div>
                </button>
                <div className="w-11 h-11 rounded-full overflow-hidden transition-all duration-200 hover:scale-[1.02] group relative">
                  <img
                    src={user.avatar_url}
                    alt={`${user.username}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900/95 backdrop-blur-md rounded-md text-white text-sm font-['Bricolage_Grotesque'] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[100]">
                    {user.username}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-[10px] flex items-center mx-3">
                <div className="w-8 h-8 rounded-full overflow-hidden transition-all duration-200 hover:scale-[1.02]">
                  <img
                    src={user.avatar_url}
                    alt={`${user.username}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2 flex-grow overflow-hidden">
                  <p className="text-white font-medium font-['Bricolage_Grotesque'] text-xs truncate">
                    <strong style={{
                      fontSize: user.username.length > 12 ?
                        `${Math.max(10, 12 - (user.username.length - 12) * 0.5)}px` :
                        '12px'
                    }}>
                      {user.username}
                    </strong>
                  </p>
                  <p
                    className="text-[10px] font-['Bricolage_Grotesque']"
                    style={{ color: user.role.color }}
                  >
                    {user.role.name}
                  </p>
                </div>
                <button
                  className="ml-1 p-1 transition-all duration-200 hover:bg-white/5 hover:scale-[1.02] rounded-lg"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <img src="/setting.png" alt="Settings" className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSection={settingsSection}
        user={user}
        onLogout={onLogout}
      />
    </>
  );
}
