import { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { IoPersonCircle } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { FaPalette } from "react-icons/fa";
import { useTheme } from '../contexts/ThemeContext';


const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getThemeAlbumCover = (themeId: string): string | null => {
  const albumCovers: Record<string, string> = {
    'graduation': 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg',
    'seventeen': 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg',
    'deathrace': 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg',
    'question': 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg',
    'gbgr': 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg',
    'lnd': 'https://wallpaperaccess.com/full/6302625.png',
    'ye': 'https://wallpaperaccess.com/full/4198173.jpg',
    'yeezus': 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg',
    'morechaos': 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg',
    'unity': 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg',
    'teenagedream': 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg',
    'pinktape': 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
  };

  return albumCovers[themeId] || null;
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  initialSection?: 'profile' | 'themes';
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
}

interface NavItemProps {
  icon?: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const NavItem = ({ icon, text, isActive, onClick, className = '' }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center w-[94%] h-11 rounded-lg transition-all duration-200 px-4
              font-['Bricolage_Grotesque'] hover:scale-[1.02]
              ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
              ${className}`}
  >
    {icon && <span className="text-2xl">{icon}</span>}
    <span className={`font-medium text-[14px] ${icon ? 'ml-3.5' : ''}`}>{text}</span>
  </button>
);

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onLogout, initialSection = 'profile', user }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'themes'>(initialSection);
  const { currentTheme, setTheme, availableThemes } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setIsAnimating(false);
    setTimeout(onClose, 150);
  };

  const handleLogout = () => {
    handleClose();
    setTimeout(() => {
      onLogout();
    }, 150);
  };

  if (!isOpen) return null;

  const overlayClasses = `
    fixed top-[23px] inset-x-0 bottom-0 bg-black/50 z-[998]
    transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${!isAnimating ? 'opacity-0' : isClosing ? 'opacity-0' : 'opacity-100'}
  `;

  const contentClasses = `
    fixed top-[23px] inset-x-0 bottom-0 z-[999] bg-[#0f0f0f]
    transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${!isAnimating ? 'opacity-0 scale-110' : isClosing ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
  `;

  return (
    <>
      <div className={overlayClasses} onClick={handleClose} />
      <div
        className={contentClasses}
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom right, ${hexToRgba(currentTheme.colors.primary, 0.2)}, ${hexToRgba(currentTheme.colors.secondary, 0.1)})`
          }}
        ></div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-sm font-medium text-white/60">Close</span>
          <button
            onClick={handleClose}
            className="p-2 
                      text-white/60 hover:text-white 
                      transition-all duration-200 rounded-full 
                      border border-white/20 hover:border-white/40 hover:scale-[1.02]
                      w-8 h-8
                      flex items-center justify-center"
          >
            <IoClose size={20} />
          </button>
        </div>
    
        <div className="flex h-[calc(100vh-23px)]">
          <div
            className="w-64 border-r p-4 flex flex-col backdrop-blur-md"
            style={{
              borderColor: currentTheme.colors.border,
              background: currentTheme.colors.sidebar
            }}
          >
            <div className="mb-4">
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                User
              </div>
              <NavItem
                icon={<IoPersonCircle size={22} />}
                text="Profile"
                isActive={activeSection === 'profile'}
                onClick={() => setActiveSection('profile')}
              />
            </div>

            <div className="mb-4">
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                Appearance
              </div>
              <NavItem
                icon={<FaPalette size={22} />}
                text="Themes"
                isActive={activeSection === 'themes'}
                onClick={() => setActiveSection('themes')}
              />
            </div>

            <div className="mb-auto mt-[200px]">
              <div className="px-3 mb-6 space-y-3">
                <div className="h-[1px] bg-white/[0.08]" />
                <div className="flex flex-col items-center space-y-2">
                <p className="text-white/40 text-xs font-['Bricolage_Grotesque']">
                   rewindlauncher/offical
                  </p>
                  <p className="text-white/40 text-xs font-['Bricolage_Grotesque']">
                    Release 0.0.15
                  </p>
                  <p className="text-white/40 text-xs font-['Bricolage_Grotesque'] flex items-center gap-1">
                    Made with <FaHeart className="text-red-500" size={10} /> by mars
                  </p>
                </div>
                <div className="h-[1px] bg-white/[0.08]" />
              </div>

              <NavItem
                icon={<IoIosLogOut size={22} />}
                text="Log out"
                isActive={false}
                onClick={handleLogout}
                className="text-white/60 hover:bg-red-500/10 hover:text-red-500"
              />
            </div>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-3xl mt-8 space-y-4">
              {activeSection === 'profile' && (
                <div
                  className="backdrop-blur-md rounded-xl p-8 border"
                  style={{
                    backgroundColor: hexToRgba(currentTheme.colors.surface, 0.4),
                    borderColor: currentTheme.colors.border
                  }}
                >
                  <div className="flex items-start gap-6">
                    <div className="relative group">
                      <img
                        src={user.avatar_url}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10
                                  group-hover:ring-white/20 transition-all duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-white font-['Bricolage_Grotesque']">{user.username}</h2>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${user.role.color}15`,
                            color: user.role.color
                          }}
                        >
                          {user.role.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-white/40 font-mono text-xs">{user.accountId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'themes' && (
                <div
                  className="backdrop-blur-md rounded-xl p-8 border"
                  style={{
                    backgroundColor: hexToRgba(currentTheme.colors.surface, 0.4),
                    borderColor: currentTheme.colors.border
                  }}
                >
                  <h2 className="text-2xl font-bold text-white font-['Bricolage_Grotesque'] mb-4">Themes</h2>
                  <p className="text-white/60 mb-12 font-['Bricolage_Grotesque'] text-center">
                    Choose the perfect theme to customize your launcher experience!
                  </p>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 max-h-96 overflow-y-auto scrollbar-custom">
                    <div className="flex flex-wrap gap-8 justify-center items-center py-8">
                      {availableThemes.map((theme) => (
                        <div
                          key={theme.id}
                          onClick={() => setTheme(theme.id)}
                          className="relative cursor-pointer transition-all duration-300 hover:scale-110 group flex flex-col items-center"
                        >
                          <div
                            className="w-20 h-20 rounded-full border-3 transition-all duration-300 relative shadow-lg hover:scale-105 cursor-pointer overflow-hidden"
                            style={{
                              borderColor: currentTheme.id === theme.id ? theme.colors.primary : 'transparent',
                              background: getThemeAlbumCover(theme.id) ? 'transparent' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                              boxShadow: currentTheme.id === theme.id ? `0 0 20px ${hexToRgba(theme.colors.primary, 0.5)}` : '0 4px 15px rgba(0,0,0,0.2)'
                            }}
                          >
                            {getThemeAlbumCover(theme.id) && (
                              <img
                                src={getThemeAlbumCover(theme.id)!}
                                alt={theme.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {

                                  (e.target as HTMLElement).style.display = 'none';
                                  (e.target as HTMLElement).parentElement!.style.background = `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
                                }}
                              />
                            )}
                            {currentTheme.id === theme.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-green-600 text-xs font-bold">✓</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60] backdrop-blur-sm border border-white/20">
                            {theme.name}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                          </div>

                          <div
                            className="absolute top-4 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle, ${hexToRgba(theme.colors.primary, 0.3)}, transparent)`,
                              filter: 'blur(20px)',
                              transform: 'scale(1.5)'
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;





















