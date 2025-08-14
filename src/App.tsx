import "./styles/App.css";
import LoginContainer from "./components/LoginContainer";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import { open } from "@tauri-apps/plugin-shell";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import Home from './pages/Home';
import Library from './pages/Library';
import Layout from './components/Layout';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import Servers from './pages/Servers';
import LaunchVersion from "./pages/LaunchVersion";
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import MusicPlayer from './components/MusicPlayer';
import { initializeSecurity } from './utils/security';
import { discordRPC } from './utils/discordRPC';



interface VersionCheckResponse {
  needs_update: boolean;
  download_url?: string;
}

export const ShopContext = createContext<{
  shopData: any | null;
  isLoading: boolean;
  error: string | null;
  timeUntilRefresh: string;
}>({
  shopData: null,
  isLoading: false,
  error: null,
  timeUntilRefresh: '',
});

interface LoginSuccessPayload {
  username: string;
  accountId: string;
  email: string;
  password: string;
  avatar_url: string;
  favoriteSkin: string;
  role: {
    name: string;
    color: string;
  };
}

interface VersionCheckResponse {
  type: 'UPDATE' | 'NO_UPDATE';
  download_url?: string;
}

interface Event {
  id: number;
  name: string;
  card_name: string;
  thumbnail: string;
  event_background: string;
  event_description: string;
  button_text: string;
  button_redirect_url: string;
  button_color: string;
  button_text_color: string;
  active: boolean;
  audio_url?: string;
  frame_text: string;
  ButtonIco?: string;
  IcoColor?: string;
}

interface idkprops {
   userData: {
    username: string;
    avatar_url: string;
    accountId: string;
    email: string;
    password: string;
    favoriteSkin: string;
  };
}

//testing for when login doesnt work
const TESTING = false;

const mockUser: LoginSuccessPayload = {
  username: "mars",
  accountId: "mars",
  email: "mars@rewind.co",
  password: "test",
  avatar_url: "https://cdn.discordapp.com/avatars/803615288549441557/a_0cdd64fd3e86a45719b22404644ec24c?size=1024",
  favoriteSkin: "cid_028_athena_commando_f",
  role: {
    name: "Developer",
    color: "#6366f1"
  }
};

export default function App({userData}: idkprops) {
  const location = useLocation();
  const [loginStage, setLoginStage] = useState<'initial' | 'loading' | 'waiting' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [user, setUser] = useState<LoginSuccessPayload | null>(TESTING ? mockUser : null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isFromLogout, setIsFromLogout] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResponse | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  const [shopData, setShopData] = useState<any | null>(null);
  const [isShopLoading, setIsShopLoading] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState('');
  const [shopExpiration, setShopExpiration] = useState<string | null>(null);
  const navigate = useNavigate();

  const calculateTimeUntilRefresh = () => {
    if (shopExpiration) {
      const now = new Date();
      const expirationTime = new Date(shopExpiration);

      if (expirationTime > now) {
        const diffMs = expirationTime.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

        return `${diffHrs}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
      }
    }
    const now = new Date();
    const refreshTime = new Date();

    const easternDate = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const easternHour = easternDate.getHours();
    const easternMinute = easternDate.getMinutes();
    refreshTime.setUTCHours(
      now.getUTCHours() + (20 - easternHour),
      1 - easternMinute, 0, 0
    );

    if (now > refreshTime) {
      refreshTime.setDate(refreshTime.getDate() + 1);
    }

    const diffMs = refreshTime.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${diffHrs}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
  };

  const fetchShopData = async (forceRefresh = false) => {
    try {
      setIsShopLoading(true);
      setShopError(null);

      if (!forceRefresh) {
        const cachedData = localStorage.getItem('shopData');
        const cacheTimestamp = localStorage.getItem('shopDataTimestamp');

        if (cachedData && cacheTimestamp) {
          const cachedExpiration = localStorage.getItem('shopExpiration');
          if (cachedExpiration) {
            const expirationTime = new Date(cachedExpiration);
            const now = new Date();

            if (now < expirationTime) {
              setShopData(JSON.parse(cachedData));
              setShopExpiration(cachedExpiration);
              setIsShopLoading(false);
              return;
            }
          } else {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            const cacheValidDuration = 30 * 60 * 1000;

            if (cacheAge < cacheValidDuration) {
              setShopData(JSON.parse(cachedData));
              setIsShopLoading(false);
              return;
            }
          }
        }
      }
      console.log('Fetching fresh shop data');
      const data = await invoke<any>("fetch_shop_items");
      setShopData(data);
      if (data.expiration) {
        setShopExpiration(data.expiration);
        localStorage.setItem('shopExpiration', data.expiration);
      }

      localStorage.setItem('shopData', JSON.stringify(data));
      localStorage.setItem('shopDataTimestamp', Date.now().toString());

    } catch (err) {
      const cachedData = localStorage.getItem('shopData');
      if (cachedData) {
        setShopData(JSON.parse(cachedData));
      } else {
        setShopError("failed to load shop items");
      }
      console.error("could not fetch shop:", err);
    } finally {
      setIsShopLoading(false);
    }
  };
  
  useEffect(() => {
    initializeSecurity();

     (async () => {
    const initialized = await discordRPC.init();
    if (initialized) {
      await discordRPC.setLauncherActivity(user?.avatar_url, user?.username);
    }
  })();

    fetchShopData();


    setTimeUntilRefresh(calculateTimeUntilRefresh());
    const timer = setInterval(() => {
      setTimeUntilRefresh(calculateTimeUntilRefresh());
    }, 1000);
    
    const scheduleNextRefresh = () => {
      const now = new Date();
      const refreshTime = new Date();
      
      const easternDate = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
      const easternHour = easternDate.getHours();
      const easternMinute = easternDate.getMinutes();
      
      refreshTime.setUTCHours(
        now.getUTCHours() + (20 - easternHour),
        1 - easternMinute, 0, 0
      );

      if (now > refreshTime) {
        refreshTime.setDate(refreshTime.getDate() + 1);
      }
      
      const timeUntilRefresh = refreshTime.getTime() - now.getTime();
      
      setTimeout(() => {
        fetchShopData(true);
        scheduleNextRefresh();
      }, timeUntilRefresh);
    };
    
    scheduleNextRefresh();
    
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!shopExpiration) return;

    const now = new Date();
    const expirationTime = new Date(shopExpiration);

    if (now >= expirationTime) {
      console.log('Shop already expired, fetching new data...');
      fetchShopData(true);
      return;
    }

    const timeUntilExpiration = expirationTime.getTime() - now.getTime();

    console.log(`Shop will expire in ${Math.round(timeUntilExpiration / 1000 / 60)} minutes`);

    const expirationTimeout = setTimeout(() => {
      console.log('Shop expired, fetching new data...');
      fetchShopData(true);
    }, timeUntilExpiration);

    return () => clearTimeout(expirationTimeout);
  }, [shopExpiration]);

  const handleNavigation = (path: string) => {
    if (path === '/home') {
      setIsPreparing(true);
      setTimeout(() => {
        setIsPreparing(false);
      }, 2000);
    } else {
      setIsPreparing(false);
    }
    navigate(path);
  };

  useEffect(() => {
    const GetStoredToken = async () => {
      try {
        const [versionInfo, tokenResult] = await Promise.all([
          invoke<VersionCheckResponse>('check_version'),
          invoke<{ user?: LoginSuccessPayload; token_info: { expired: boolean } }>('check_stored_token')
        ]);
        
        if (versionInfo.type === 'UPDATE') {
          setIsDownloading(true);
          setUpdateInfo(versionInfo);
          setDownloadProgress(0);

          try {
            if (versionInfo.download_url) {
              await invoke('download_and_install_update', {
                downloadUrl: versionInfo.download_url
              });
            }
          } catch (error) {
            console.error('Update failed:', error);
            setIsDownloading(false);
          }
          return;
        }

        if (!tokenResult.token_info.expired && tokenResult.user) {
          setUser(tokenResult.user);
          handleNavigation('/home');
        } else {
          setLoginStage('initial');
        }
      } catch (error) {
        console.error('could not check stored token:', error);
        setLoginStage('initial');
      }
    };

    GetStoredToken();
  }, []);

  useEffect(() => {
    if (location.pathname !== '/home') {
      setIsPreparing(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (!TESTING) {
        await invoke('clear_stored_token');
      }
      setUser(null);
      setIsFromLogout(true);
      setIsPreparing(false);
      setLoginStage('initial');
      navigate('/login');
    } catch (error) {
      console.error('failed to clear token:', error);
    }
  };

  const handleDiscordLogin = async () => {
    setIsFromLogout(false);
    setLoginStage('loading');
    try {
      await open('https://backend-services-prod.privateuser.xyz/api/v2/rewind/discord');
      setLoginStage('waiting');
    } catch (error) {
      console.error("could not open browser:", error);
      setLoginStage('error');
    }
  };

  const handleCancel = () => {
    setLoginStage('initial');
  };

  useEffect(() => {
    if (!TESTING) {
      const unlisten = listen<LoginSuccessPayload>('login-success', (event) => {
        const userData = event.payload;
        setUser(userData);
        handleNavigation('/home');
        setLoginStage('initial');
      });

      const unlistenError = listen<string>('login-error', (event) => {
        console.error('Login failed:', event.payload);
        setErrorMessage(event.payload);
        setLoginStage('error');
      });

      return () => {
        unlisten.then(fn => fn());
        unlistenError.then(fn => fn());
      };
    }
  }, [navigate, location.pathname]);

  useEffect(() => {

    if (events.length > 0) return;
    
    setIsEventsLoading(true);
    const controller = new AbortController();
    
    invoke<Event[]>('fetch_events')
      .then(fetchedEvents => {
        if (!controller.signal.aborted) {
          console.log('Fetched events:', fetchedEvents);
          setEvents(fetchedEvents);
        }
      })
      .catch(err => {
        console.error('could not fetch events:', err);
        if (!controller.signal.aborted) {
          setEvents([
            {
              id: 1,
              name: "Servers Down",
              card_name: "Servers Down",
              thumbnail: "https://pbs.twimg.com/media/Gnb0JHgXIAAR2ap.jpg:large",
              event_background: "https://pbs.twimg.com/media/Gnb0JHgXIAAR2ap.jpg:large",
              event_description: "Ahh! Man! We werent able to connect to the servers! Check the status in the Rewind Official Discord!",
              button_text: "Discord",
              button_redirect_url: "https://discord.gg/rewindogfn",
              button_color: "7289DA",
              button_text_color: "#FFFFFF",
              frame_text: "Servers Down",
              active: true
            }
          ]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsEventsLoading(false);
        }
      });
      
    return () => controller.abort();
  }, []);

  return (
    <ThemeProvider>
      <AppContent
        user={user}
        setUser={setUser}
        isPreparing={isPreparing}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        updateInfo={updateInfo}
        shopData={shopData}
        isShopLoading={isShopLoading}
        shopError={shopError}
        timeUntilRefresh={timeUntilRefresh}
        events={events}
        isEventsLoading={isEventsLoading}
        handleLogout={handleLogout}
        handleDiscordLogin={handleDiscordLogin}
        handleCancel={handleCancel}
        loginStage={loginStage}
        isFromLogout={isFromLogout}
        errorMessage={errorMessage}
      />
    </ThemeProvider>
  );
}

interface AppContentProps {
  user: any;
  setUser: (user: LoginSuccessPayload | null) => void;
  isPreparing: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  updateInfo: VersionCheckResponse | null;
  shopData: any;
  isShopLoading: boolean;
  shopError: string | null;
  timeUntilRefresh: string;
  events: any[];
  isEventsLoading: boolean;
  handleLogout: () => void;
  handleDiscordLogin: () => void;
  handleCancel: () => void;
  loginStage: 'initial' | 'loading' | 'waiting' | 'error';
  isFromLogout: boolean;
  errorMessage: string;
}

const AppContent: React.FC<AppContentProps> = ({
  user,
  setUser,
  isPreparing,
  isDownloading,
  downloadProgress,
  shopData,
  isShopLoading,
  shopError,
  timeUntilRefresh,
  events,
  isEventsLoading,
  handleLogout,
  handleDiscordLogin,
  handleCancel,
  loginStage,
  isFromLogout,
  errorMessage
}) => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (user) {
      discordRPC.setHome(user.avatar_url, user.username);
    }
  }, [user]);


  return (
    <ShopContext.Provider value={{
      shopData,
      isLoading: isShopLoading,
      error: shopError,
      timeUntilRefresh
    }}>
      <div className="min-h-screen relative overflow-hidden bg-[#0f0f0f]">
            {currentTheme.backgroundImage && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: `url(${currentTheme.backgroundImage})`,
                  opacity: 0.6
                }}
              ></div>
            )}
            {!currentTheme.backgroundImage && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
            )}
            {currentTheme.backgroundImage && (
              <div className="absolute inset-0 pointer-events-none bg-black/20"></div>
            )}
        <Layout user={user} isPreparing={isPreparing} onLogout={handleLogout}>
          {isDownloading && (
            <div className="fixed inset-0 bg-[#0f0f0f] flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
              <div className="p-6 rounded-md min-w-[260px] transition bg-[#222222]/20 backdrop-blur-md z-10 shadow-lg flex flex-col gap-5 border border-white/[0.08] animate-slide-bounce">
                <div className="flex flex-col items-center gap-5 preparing" style={{ opacity: 1 }}>
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    className="animate-spin text-white/80"
                    height="36"
                    width="36"
                  >
                    <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path>
                  </svg>
                  <p className="text-white/70 text-[14px] font-medium tracking-wide font-['Bricolage_Grotesque']">Downloading Content...</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-sm mt-1">
                    <div
                      className="bg-white/80 h-1.5 rounded-sm transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!isDownloading && (
            <>
              <div className="absolute inset-0 overflow-hidden">
                <div className="floating-square left-[10%] top-[20%]"></div>
                <div className="floating-square left-[60%] top-[50%]"></div>
                <div className="floating-square left-[80%] top-[15%]"></div>
                <div className="floating-square left-[30%] top-[70%]"></div>
              </div>
              <Routes>
                <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
                <Route
                  path="/login"
                  element={user ? <Navigate to="/home" replace /> : (
                    TESTING ? (
                      <div className="flex items-center justify-center min-h-screen">
                        <button
                          onClick={() => setUser(mockUser)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Login as Test User
                        </button>
                      </div>
                    ) : (
                      <LoginContainer
                        stage={loginStage}
                        onLogin={handleDiscordLogin}
                        onCancel={handleCancel}
                        isFromLogout={isFromLogout}
                        errorMessage={errorMessage}
                      />
                    )
                  )}
                />
                <Route path="/home" element={user ? <Home user={user} isPreparing={isPreparing} events={events} isEventsLoading={isEventsLoading} /> : <Navigate to="/login" replace />} />
                <Route path="/library" element={user ? <Library user={user} /> : <Navigate to="/login" replace />} />
                <Route path="/shop" element={user ? <Shop user={user} />  : <Navigate to="/login" replace />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/servers" element={<Servers />} />
                <Route path="/version/:versionId" element={<LaunchVersion/>} />
              </Routes>
            </>
          )}
        </Layout>
        {(currentTheme.id === 'graduation' || currentTheme.id === 'seventeen' || currentTheme.id === 'deathrace' || currentTheme.id === 'question' || currentTheme.id === 'gbgr' || currentTheme.id === 'lnd' || currentTheme.id === 'ye' || currentTheme.id === 'yeezus' || currentTheme.id === 'morechaos' || currentTheme.id === 'unity' || currentTheme.id === 'teenagedream' || currentTheme.id === 'pinktape') && (
          <MusicPlayer theme={
            currentTheme.id === 'graduation' ? 'graduation' :
            currentTheme.id === 'deathrace' ? 'deathrace' :
            currentTheme.id === 'question' ? 'question' :
            currentTheme.id === 'gbgr' ? 'gbgr' :
            currentTheme.id === 'lnd' ? 'lnd' :
            currentTheme.id === 'ye' ? 'ye' :
            currentTheme.id === 'yeezus' ? 'yeezus' :
            currentTheme.id === 'morechaos' ? 'morechaos' :
            currentTheme.id === 'unity' ? 'unity' :
            currentTheme.id === 'teenagedream' ? 'teenagedream' :
            currentTheme.id === 'pinktape' ? 'pinktape' :
            'seventeen'
            
          } 
          />
        )}
      </div>
    </ShopContext.Provider>
  );
};
