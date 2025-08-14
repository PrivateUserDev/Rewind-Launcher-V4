import { useState, useEffect, useRef, useContext } from 'react';
import { open } from "@tauri-apps/plugin-shell";
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import * as FaIcons from 'react-icons/fa';
import * as BsIcons from 'react-icons/bs';
import { listen } from '@tauri-apps/api/event';
import { ShopContext } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import {discordRPC} from '../utils/discordRPC';

interface ServerStats {
  player_count: number;
  server_count: number;
}

interface ShopItem {
  id: number;
  cosmeticId: string;
  name: string;
  price: number;
  featuredIcon: string;
  icon: string;
  rarity: string;
}

const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return null;


  let IconComponent = FaIcons[iconName as keyof typeof FaIcons];

  if (!IconComponent) {
    IconComponent = BsIcons[iconName as keyof typeof BsIcons];
  }

  return IconComponent;
};

const getRarityColor = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'common': return 'from-gray-500 to-gray-600';
    case 'uncommon': return 'from-green-500 to-green-600';
    case 'rare': return 'from-blue-500 to-blue-600';
    case 'epic': return 'from-purple-500 to-purple-600';
    case 'legendary': return 'from-yellow-500 to-orange-500';
    case 'mythic': return 'from-orange-500 to-red-500';
    case 'dark': return 'from-purple-900 to-purple-700';
    case 'icon': return 'from-cyan-400 to-cyan-600';
    case 'dc': return 'from-blue-600 to-blue-800';
    default: return 'from-gray-500 to-gray-600';
  }
};

interface CosmeticDetails {
  id: string;
  name: string;
  description: string;
  type: {
    value: string;
    displayValue: string;
    backendValue: string;
  };
  rarity: {
    value: string;
    displayValue: string;
    backendValue: string;
  };
}

interface HomeProps {
  user: {
    username: string;
    accountId: string;
    email: string;
    avatar_url: string;
    password: string;
    favoriteSkin: string;
    mtxCurrency?: string;
    hype?: string;
  };
  isPreparing: boolean;
  events: Event[];
  isEventsLoading: boolean;
}

interface Event {
  id: number;
  name: string;
  card_name?: string;
  cardName?: string;
  thumbnail?: string;
  Thumbnail?: string;
  event_background?: string;
  eventBackground?: string;
  event_description?: string;
  eventDescription?: string;
  button_text?: string;
  ButtonText?: string;
  button_redirect_url?: string;
  ButtonRedirectURL?: string;
  button_color?: string;
  ButtonColor?: string;
  button_text_color?: string;
  ButtonTextColor?: string;
  active: boolean;
  audio_url?: string;
  audioUrl?: string;
  frame_text?: string;
  frameText?: string;
  ButtonIco?: string;
  IcoColor?: string;
}





// const Card = ({ children }: { children: React.ReactNode }) => (
//   <div 
//     className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.02]"
//     style={{
//       background: 'var(--bg-overlay)',
//       border: '1px solid var(--border-color)'
//     }}
//   >
//     {children}
//   </div>
// );

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

export default function Home({ user, isPreparing, events, isEventsLoading }: HomeProps) {
  const { shopData } = useContext(ShopContext);
  const { currentTheme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [cosmeticDetails, setCosmeticDetails] = useState<CosmeticDetails | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [isSlideOut, setIsSlideOut] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMuteState = localStorage.getItem('audioMuted');
    return savedMuteState ? JSON.parse(savedMuteState) : false;
  });
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(() => {
    const savedVideoMuteState = localStorage.getItem('videoMuted');
    return savedVideoMuteState ? JSON.parse(savedVideoMuteState) : true;
  });
  const [news] = useState<Event[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [showTrailer, setShowTrailer] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [serverStats, setServerStats] = useState<ServerStats>(() => {
    const savedStats = localStorage.getItem('serverStats');
    return savedStats 
      ? JSON.parse(savedStats) 
      : { player_count: 0, server_count: 0 };
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const eventVideoRef = useRef<HTMLVideoElement | null>(null);
  const [showVBucks, setShowVBucks] = useState(true);
  showVBucks; // read ts so launcher builds  //wow
  serverStats;  // read ts so launcher builds  //wow
  isEventsLoading; // read ts so launcher builds  //wow
  setIsMuted; // read ts so launcher builds //wow

  useEffect(() => {
    discordRPC.setHome(user?.avatar_url, user?.username);
  }, [user?.avatar_url, user?.username]);

  const toggleVideoMute = () => {
    const newMuteState = !isVideoMuted;
    console.log('Toggling video mute:', isVideoMuted, '->', newMuteState);
    setIsVideoMuted(newMuteState);
    localStorage.setItem('videoMuted', JSON.stringify(newMuteState));

    if (eventVideoRef.current) {
      eventVideoRef.current.muted = newMuteState;
      eventVideoRef.current.volume = newMuteState ? 0 : 0.3;
    } else {
      console.log('Video ref is null');
    }
  };

  const isVideoFile = (url: string | undefined) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const trailerId = `trailer-seen-s2-${user.accountId}`;

  useEffect(() => {
    const hasSeenTrailer = localStorage.getItem(trailerId);
    if (hasSeenTrailer) {
      setShowTrailer(false);
    }
  }, [user.accountId]);

  useEffect(() => {
    if (!isPreparing && !showTrailer) {
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isPreparing, showTrailer]);

  useEffect(() => {
    const skipButtonTimer = setTimeout(() => {
      if (showTrailer) {
        setShowSkipButton(true);
      }
    }, 10000);

    return () => clearTimeout(skipButtonTimer);
  }, [showTrailer]);

  const handleSkipTrailer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowTrailer(false);
    localStorage.setItem(trailerId, 'true');
  };

  const handleTrailerEnded = () => {
    setShowTrailer(false);
    localStorage.setItem(trailerId, 'true');
  };

  useEffect(() => {
    if (events.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);


  useEffect(() => {
    if (showContent && events[currentSlide]?.audio_url && audioRef.current) {
      audioRef.current.src = events[currentSlide].audio_url;
      audioRef.current.volume = 0.1;
      if (!isMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(console.error);
        }
      }
    }
  }, [showContent, events, currentSlide]);

  useEffect(() => {
    if (showContent && events[currentSlide]?.event_background && isVideoFile(events[currentSlide].event_background) && eventVideoRef.current) {
      console.log('Setting up video with muted state:', isVideoMuted);
      eventVideoRef.current.src = events[currentSlide].event_background;
      eventVideoRef.current.muted = isVideoMuted;
      eventVideoRef.current.loop = true;
      eventVideoRef.current.volume = isVideoMuted ? 0 : 0.3;

      const playPromise = eventVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(console.error);
      }
    }
  }, [showContent, events, currentSlide, isVideoMuted]);

  useEffect(() => {
    if (showContent && events[currentSlide]?.audio_url && audioRef.current) {
      audioRef.current.src = events[currentSlide].audio_url;
      audioRef.current.volume = 0.1;
      if (!isMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(console.error);
        }
      }
    }
  }, [currentSlide, events, isMuted]);
    useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          const next = (selectedIndex + 1) % news.length;
          setSelectedIndex(next);
          return 0;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [selectedIndex, news.length]);

  const navigate = useNavigate();

  const handleButtonClick = async (url: string | undefined) => {
    try {
      if (!url) return;
      if (url.startsWith('launcher://')) {
        const fullRoute = url.replace('launcher://', '');
        const [route, hash] = fullRoute.split('#');

        if (route === 'settings') {
          const settingsEvent = new CustomEvent('openSettings', {
            detail: { section: hash || 'profile' }
          });
          window.dispatchEvent(settingsEvent);
          return;
        }

        navigate(`/${route}`);
        if (hash) {
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 100);
        }
      } else if (url.startsWith('com.rewindservices://launch/quickaction/launcher')) {

        const params = new URLSearchParams(url.split('?')[1]);
        const version = params.get('v');

        navigate('/library');

        if (version) {

          const versions = await invoke<Array<{
            path: string;
            version: string;
            technical_version: string;
            splash_image: string;
          }>>('get_versions');
          
          console.log('Available versions:', versions);

          const matchingVersion = versions.find((v) => {

            const versionNumber = v.version.split(' ')[0];
            const techVersionNumber = v.technical_version.split('.')[0];
 
            return versionNumber === version || 
                   techVersionNumber === version || 
                   v.technical_version === version || 
                   v.version.includes(version);
          });
          
          if (matchingVersion) {
            navigate(`/version/${encodeURIComponent(matchingVersion.path)}`, {
              state: {
                version: {
                  version: matchingVersion.version,
                  technical_version: matchingVersion.technical_version,
                  splash_image: matchingVersion.splash_image,
                  path: matchingVersion.path,
                  access_type: 'public',
                  build_name: matchingVersion.version
                },
                user: {
                  email: user.email,
                  password: user.password
                },
                autoLaunch: true
              }
            });
          } else {
            console.log('No matching version found for:', version);
          }
        }
      } else {
        await open(url);
      }
    } catch (error) {
      console.error("failed to open url", error);
    }
  };

  useEffect(() => {
    
    const fetchServerStats = async () => {
      try {
        const stats = await invoke<ServerStats>('fetch_server_stats');
        setServerStats(stats);

        localStorage.setItem('serverStats', JSON.stringify(stats));
      } catch (error) {
        console.error('Failed to fetch server stats:', error);
      }
    };

     fetchServerStats();

    const unlistenLoginSuccess = listen('login-success', () => {
      fetchServerStats();
    });

    const interval = setInterval(fetchServerStats, 60000); //dis is uno minuto
    
    return () => {
      clearInterval(interval);
      unlistenLoginSuccess.then(unlisten => unlisten());
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowVBucks(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getAllShopItems = () => {
    if (!shopData) return [];
    const allItems = [
      ...(shopData.featured || []),
      ...(shopData.daily || [])
    ];

    if (shopData.custom_sections) {
      Object.values(shopData.custom_sections).forEach(sectionItems => {
        allItems.push(...(sectionItems as ShopItem[]));
      });
    }

    return allItems;
  };

  useEffect(() => {
    const allItems = getAllShopItems();
    if (allItems.length <= 1) return;

    const interval = setInterval(() => {
      setIsSlideOut(true);
      setTimeout(() => {
        setCurrentOutfitIndex((prev) => (prev + 1) % allItems.length);
        setAnimationKey(prev => prev + 1);
        setIsSlideOut(false);
      }, 250);
    }, 5000);

    return () => clearInterval(interval);
  }, [shopData]);

  useEffect(() => {
    const fetchCosmeticDetails = async () => {
      const allItems = getAllShopItems();
      if (allItems.length === 0) return;

      const currentItem = allItems[currentOutfitIndex];
      if (!currentItem) return;

      try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${currentItem.cosmeticId}`);
        if (response.ok) {
          const data = await response.json();
          setCosmeticDetails(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch cosmetic details:', error);
      }
    };

    fetchCosmeticDetails();
  }, [shopData, currentOutfitIndex]);

  // const nextSlide = () => {
  //   setCurrentSlide((prev) => (prev + 1) % events.length);
  // };

  // const prevSlide = () => {
  //   setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  // };
return (
  <>
    {isPreparing && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
        <div className="p-6 rounded-xl min-w-[260px] transition bg-[#222222]/20 backdrop-blur-md z-10 shadow-lg flex flex-col gap-5 border border-white/[0.08] animate-slide-bounce">
          <div className="flex flex-col items-center gap-5 preparing">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              className="animate-spin text-white/80"
              height="36"
              width="36"
            >
              <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" />
            </svg>
            <p className="text-white/70 text-[16px] font-medium tracking-wide font-['Bricolage_Grotesque'] animate-fade-in">
              Preparing Launcher!
            </p>
          </div>
        </div>
      </div>
    )}

    {!isPreparing && showTrailer && (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-fade-in">
        <video
          ref={videoRef}
          src="https://public-service-live.ol.privateuser.xyz/Rewind_Trailer.mp4"
          className="w-full h-full object-contain"
          autoPlay
          onEnded={handleTrailerEnded}
        />
        {showSkipButton && (
          <button
            onClick={handleSkipTrailer}
            className="absolute bottom-10 right-10 bg-white text-black font-medium px-6 py-2 rounded-lg shadow-md hover:bg-white/90 transition-all duration-200 animate-fade-in delay-300"
          >
            Skip
          </button>
        )}
      </div>
    )}

    {showContent && (
      <div className="p-4 pt-12 relative text-white min-h-screen overflow-y-auto scrollbar-hide">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-6 animate-fade-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md">
              <img
                src={user.avatar_url}
                alt="fav"
                className="object-cover w-full h-full scale-110"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl font-['Bricolage_Grotesque']">
                {getTimeBasedGreeting()}, {user.username}!
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 animate-fade-slide-up-delay-1">
          <div className="flex flex-col gap-4">
            <div className="relative h-[340px] overflow-hidden rounded-2xl shadow-lg animate-fade-slide-up-delay-2" style={{ backgroundColor: `${currentTheme.colors.surface}` }}>
             <AnimatePresence mode="wait">

               {events[currentSlide] && (
      <motion.div
        key={events[currentSlide].id}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {isVideoFile(events[currentSlide].event_background) ? (
          <video
            ref={eventVideoRef}
            src={events[currentSlide].event_background}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
          />
        ) : (
          <img
            src={events[currentSlide].event_background}
            alt={events[currentSlide].name}
            className="w-full h-full object-cover"
          />
        )}

    
        {isVideoFile(events[currentSlide].event_background) && (
          <button
            onClick={toggleVideoMute}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm z-50 cursor-pointer"
          >
            {isVideoMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 flex flex-col justify-end">
          <h1 className="text-2xl font-bold mb-2">{events[currentSlide].name}</h1>
          <p className="uppercase text-sm font-semibold text-white/90 tracking-wider mb-2">
            {events[currentSlide].frame_text}
          </p>
          <p className="text-white/80 line-clamp-2 max-w-2xl text-sm">{events[currentSlide].event_description}</p>
          <button
            onClick={() => handleButtonClick(events[currentSlide].button_redirect_url)}
            className="mt-3 font-semibold py-2 px-6 rounded-md flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{
              backgroundColor: events[currentSlide].button_color || events[currentSlide].ButtonColor || '#FACC15',
              color: events[currentSlide].button_text_color || events[currentSlide].ButtonTextColor || '#FFFFFF',
              border: 'none',
              boxShadow: `0 4px 15px ${(events[currentSlide].button_color || events[currentSlide].ButtonColor || '#FACC15')}40`
            }}
          >
            {events[currentSlide].ButtonIco &&
              (() => {
                const IconComponent = getIconComponent(events[currentSlide].ButtonIco);
                return IconComponent ? (
                  <IconComponent
                    size={18}
                    color={events[currentSlide].IcoColor || events[currentSlide].button_text_color || '#000'}
                  />
                ) : null;
              })()}
            {events[currentSlide].button_text || 'Launch'}
             </button>
            </div>
           </motion.div>
            )}
           </AnimatePresence>
            </div>
            <div className="flex gap-3 animate-fade-slide-up-delay-3">
              {(() => {
                const allItems = getAllShopItems();
                const currentItem = allItems[currentOutfitIndex] || {
                  id: 1,
                  cosmeticId: "CID_028_Athena_Commando_F",
                  name: "Renegade Raider",
                  price: 2000,
                  featuredIcon: user.favoriteSkin || "https://fortnite-api.com/images/cosmetics/br/CID_028_Athena_Commando_F/featured.png",
                  icon: user.favoriteSkin || "https://fortnite-api.com/images/cosmetics/br/CID_028_Athena_Commando_F/icon.png",
                  rarity: "epic"
                };

                const displayName = cosmeticDetails?.name || currentItem.name;
                const displayDescription = cosmeticDetails?.description || "description here,";
                const displayCategory = cosmeticDetails?.type?.displayValue || "OUTFIT";
                const displayRarity = cosmeticDetails?.rarity?.value || currentItem.rarity;

                return (
                  <div className={`w-[330px] rounded-xl relative overflow-hidden h-[310px] cursor-pointer group transition-all duration-500 hover:scale-[1.02] hover:brightness-110 shadow-lg bg-gradient-to-br ${getRarityColor(displayRarity)}`}>
                    <div className="item-overlay w-full absolute left-0 top-0 h-full bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                    <div className="absolute top-3 left-3 bg-black/70 px-3 py-1.5 rounded-md backdrop-blur-sm z-20 border border-white/10">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">{displayCategory}</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-md backdrop-blur-sm z-20 border border-white/10">
                      <img src="https://image.fnbr.co/price/icon_vbucks.png" className="w-4 h-4" alt="V-Bucks" />
                      <span className="text-white text-sm font-bold">{currentItem.price.toLocaleString()}</span>
                    </div>
                    <img
                      key={`${currentItem.cosmeticId}-${animationKey}`}
                      className={`item-preview absolute bottom-[20px] object-cover m-auto max-w-[280px] left-1/2 transform -translate-x-1/2 group-hover:scale-105 ${
                        isSlideOut ? 'animate-slide-out-left' : 'animate-slide-in-right'
                      }`}
                      src={currentItem.featuredIcon || currentItem.icon}
                      alt={displayName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = currentItem.icon;
                      }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-10">
                      <div>
                        <h3 className="text-white font-bold text-lg uppercase tracking-wide">{displayName}</h3>
                        <p className="text-white/80 text-sm">{displayDescription}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-2">
                <div className="bg-gradient-to-br from-[#5a6bff] via-[#7a3dff] to-[#9a4dff] border border-purple-400/30 rounded-xl p-5 flex items-center gap-4 min-w-[370px] h-[90px] shadow-md">
                  <img
                    src="https://i.pinimg.com/originals/da/69/d4/da69d41b352a04cad462f03ff83e3549.png"
                    className="w-10 h-10"
                    alt="Arena Hype"
                  />
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-wide">ARENA HYPE</p>
                    <p className="text-white font-bold text-lg">{user.hype || "0"} POINTS</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#3db8e8] via-[#1ea7d6] to-[#0a4a5c] border border-cyan-400/30 rounded-xl p-5 flex items-center gap-4 min-w-[370px] h-[90px] shadow-md">
                  <img
                    src="https://image.fnbr.co/price/icon_vbucks.png"
                    className="w-10 h-10"
                    alt="V-Bucks"
                  />
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-wide">V-BUCKS</p>
                    <p className="text-white font-bold text-lg">{user.mtxCurrency || "0 V-BUCKS"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[440px] pr-1 animate-fade-slide-up-delay-4 scrollbar-hide">
            {events.map((event, index) => (
              <div
                key={event.id}
                onClick={() => {
                  setCurrentSlide(index);
                  setProgress(0);
                }}
                className={`relative cursor-pointer rounded-xl overflow-hidden h-28 flex items-end p-4 border ${
                  index === currentSlide ? 'border-[#2f46ff]' : 'border-transparent'
                } transition-all duration-300 group`}
                style={{ backgroundColor: currentTheme.colors.surface }}
              >
                <img
                  src={event.event_background}
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="relative z-10">
                  <h2 className="font-bold uppercase text-white/100">{event.name}</h2>
                  <p className="text-xs uppercase text-white/60">{event.frame_text}</p>
                </div>
                {index === currentSlide && (
                  <div
                    className="absolute top-0 left-0 h-full bg-white/10 z-0 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        </div>
    )}
  </>
);
};