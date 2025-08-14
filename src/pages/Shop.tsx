import { useState, useEffect, useContext } from 'react';
import { FaClock } from "react-icons/fa";
import { ShopContext } from '../App';
import { discordRPC } from '../utils/discordRPC';

interface ShopItem {
  id: number;
  cosmeticId: string;
  name: string;
  price: number;
  featuredIcon: string;
  icon: string;
  rarity: string;
}

interface ShopProps {
  user: {
    username: string;
    avatar_url: string;
    accountId: string;
    email: string;
    password: string;
    favoriteSkin: string;
    mtxCurrency?: string;
  };
}

export default function Shop({ user }: ShopProps) {
  const { shopData, isLoading, error, timeUntilRefresh } = useContext(ShopContext);
  const [currentFeaturedPage, setCurrentFeaturedPage] = useState(0);
  const [currentDailyPage, setCurrentDailyPage] = useState(0);
  const [featuredTransition, setFeaturedTransition] = useState(false);
  const [customSectionPages, setCustomSectionPages] = useState<{[key: string]: number}>({});


  useEffect(() => {
    discordRPC.setShopActivity(user?.avatar_url, user?.username);
  }, [user?.avatar_url, user?.username]);
  const [customSectionTransitions, setCustomSectionTransitions] = useState<{[key: string]: boolean}>({});

  const ITEMS_PER_PAGE_FEATURED = 2;
  const ITEMS_PER_PAGE_DAILY = 6;
  const ITEMS_PER_CUSTOM_FEATURED = 2;
  const FEATURED_ROTATION_INTERVAL = 5000;

  useEffect(() => {
    if (!shopData || shopData.featured.length <= ITEMS_PER_PAGE_FEATURED) return;
    
    const interval = setInterval(() => {
      setFeaturedTransition(true);
      setTimeout(() => {
        setCurrentFeaturedPage((prev) => 
          (prev + 1) % Math.ceil(shopData.featured.length / ITEMS_PER_PAGE_FEATURED)
        );
        setTimeout(() => {
          setFeaturedTransition(false);
        }, 30);
      }, 300);
    }, FEATURED_ROTATION_INTERVAL);
    
    return () => clearInterval(interval);
  }, [shopData]);

  useEffect(() => {
    if (!shopData || shopData.daily.length <= ITEMS_PER_PAGE_DAILY) return;

    const interval = setInterval(() => {
      setCurrentDailyPage((prev) =>
        (prev + 1) % Math.ceil(shopData.daily.length / ITEMS_PER_PAGE_DAILY)
      );
    }, 500);

    return () => clearInterval(interval);
  }, [shopData]);

 useEffect(() => {
  if (!shopData || !shopData.custom_sections) return;

  const intervals: number[] = [];

  Object.entries(shopData.custom_sections).forEach(([sectionName, items]) => {
    const typedItems = items as ShopItem[];
    if (typedItems.length > 8) {
      const extraItems = typedItems.slice(8);
      if (extraItems.length > ITEMS_PER_CUSTOM_FEATURED) {
        const interval = window.setInterval(() => {
          setCustomSectionTransitions(prev => ({ ...prev, [sectionName]: true }));
          setTimeout(() => {
            setCustomSectionPages(prev => ({
              ...prev,
              [sectionName]: ((prev[sectionName] || 0) + 1) % Math.ceil(extraItems.length / ITEMS_PER_CUSTOM_FEATURED)
            }));
            setTimeout(() => {
              setCustomSectionTransitions(prev => ({ ...prev, [sectionName]: false }));
            }, 30);
          }, 300);
        }, FEATURED_ROTATION_INTERVAL);

        intervals.push(interval);
      }
    }
  });

  return () => intervals.forEach(interval => window.clearInterval(interval));
   }, [shopData]);


  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'uncommon': return 'from-green-500/75 via-teal-500/20';
      case 'rare': return 'from-sky-500/75 via-blue-500/20';
      case 'epic': return 'from-purple-500/75 via-indigo-500/20';
      case 'legendary': return 'from-yellow-500/75 via-orange-500/20';
      case 'mythic': return 'from-orange-500/75 via-red-500/20';
      case 'dark': return 'from-purple-900/75 via-purple-700/20';
      case 'icon': return 'from-[#5cf2f3]/75 via-[#2bc9ca]/50 to-transparent';
      case 'dc': return 'from-[#007af1]/75 via-[#0053a9]/50 to-transparent';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getFeaturedItems = () => {
    if (!shopData) return [];
    const start = currentFeaturedPage * ITEMS_PER_PAGE_FEATURED;
    return shopData.featured.slice(start, start + ITEMS_PER_PAGE_FEATURED);
  };

  const getDailyItems = () => {
    if (!shopData) return [];
    const start = currentDailyPage * ITEMS_PER_PAGE_DAILY;
    return shopData.daily.slice(start, start + ITEMS_PER_PAGE_DAILY);
  };

  const totalDailyPages = shopData ? Math.ceil(shopData.daily.length / ITEMS_PER_PAGE_DAILY) : 0;

  const getCustomSectionFeaturedItems = (sectionName: string, items: ShopItem[]) => {
    if (items.length <= 8) {
      return items.slice(0, 2);
    } else {
      const extraItems = items.slice(8);
      const currentPage = customSectionPages[sectionName] || 0;
      const start = currentPage * ITEMS_PER_CUSTOM_FEATURED;
      return extraItems.slice(start, start + ITEMS_PER_CUSTOM_FEATURED);
    }
  };

  const getCustomSectionDailyItems = (items: ShopItem[]) => {
    return items.slice(0, Math.min(8, items.length));
  };

  return (
    <div className="p-6 h-screen overflow-y-scroll scrollbar-hide relative bg-gradient-to-br from-indigo-900/30 to-purple-900/20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-square left-[10%] top-[20%]"></div>
        <div className="floating-square left-[60%] top-[50%]"></div>
        <div className="floating-square left-[80%] top-[15%]"></div>
        <div className="floating-square left-[30%] top-[70%]"></div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full absolute inset-0 z-20">
          <div className="loading-spinner w-16 h-16"></div>
        </div>
      ) : error ? (
        <div className="bg-white/[0.02] rounded-md p-6 border border-white/[0.08] relative z-10">
          <p className="text-white/60 font-['Bricolage_Grotesque']">{error}</p>
        </div>
      ) : (
        <div className="market-container mt-4 w-full h-full flex flex-col pb-30 relative z-10 animate-slide-bounce">
          <div className="wallet-display w-full flex justify-end items-center gap-2 mb-8">
            <span className="py-1.5 px-5 bg-gradient-to-r from-black/40 to-black/30 hover:from-black/50 hover:to-black/40 transition-all duration-300 font-bold text-gray-300 cursor-pointer flex items-center gap-2 text-sm rounded-md border border-white/5 shadow-lg">
              <img src="https://image.fnbr.co/price/icon_vbucks.png" className="w-[18px]" alt="V-Bucks" /> 
              {user.mtxCurrency || "999"}
            </span>
          </div>

          <div className="section-header mb-2">
            <h3 className="text-white font-bold text-2xl uppercase tracking-wide">
              Rewind Item Shop
            </h3>
          </div>

          <div className="market-sections w-full flex gap-4 mt-2">
            <div className="showcase-panel w-[400px] h-[380px] shrink-0 flex items-end overflow-hidden bg-[rgba(255,255,255,0.02)] rounded-md border border-white/5 relative shadow-xl">
              <div className="panel-title w-full flex justify-between text-xs text-gray-300 font-bold py-2 px-4 uppercase absolute left-0 top-0 bg-gradient-to-r from-indigo-900/30 to-transparent backdrop-blur-sm border-b border-white/5 z-20">
                <div className="flex items-center gap-2">
                  <FaClock className="text-white/70" size={14} />
                  Featured
                </div>
                <span className="text-gray-400">{timeUntilRefresh}</span>
              </div>

              <div className="showcase-items absolute top-[30px] bottom-0 w-full flex">
                {getFeaturedItems().map((item: ShopItem) => (
                  <div 
                    key={item.name} 
                    className={`showcase-item group h-full cursor-pointer overflow-hidden relative w-full transition-all duration-300 hover:brightness-110 ${
                      featuredTransition ? 'translate-x-[-100%] opacity-0' : 'translate-x-0 opacity-100'
                    }`}
                    style={{ 
                      transitionTimingFunction: featuredTransition ? 'ease-in' : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <div className={`item-info w-full flex py-3 flex-col items-center justify-center absolute bottom-0 h-[60px] bg-gradient-to-t from-black/80 to-black/40 z-10 backdrop-blur-md transition-all duration-300 ${
                      featuredTransition ? 'translate-x-[100%]' : 'translate-x-0'
                    }`}>
                      <p className="text-white uppercase font-bold text-sm tracking-wide">{item.name}</p>
                      <p className="text-gray-200 font-bold text-sm flex gap-2 items-center mt-1">
                        <img src="https://image.fnbr.co/price/icon_vbucks.png" className="w-[16px]" alt="V-Bucks" />
                        {item.price}
                      </p>
                    </div>
                    <div className="progress-indicator absolute left-0 bottom-[60px] z-[99] h-0.5 w-full backdrop-blur-lg bg-white/30"></div>
                    <div className="item-overlay w-full absolute left-0 top-0 h-full bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                    <div className={`item-glow absolute inset-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-full bg-gradient-to-t ${getRarityColor(item.rarity)} to-transparent`}></div>
                    <img 
                      className={`item-preview absolute bottom-[20px] object-cover m-auto max-w-[280px] left-[-20px] transition-all duration-300 ${
                        featuredTransition ? 'translate-x-[100%]' : 'translate-x-0'
                      }`}
                      src={item.featuredIcon}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = item.icon;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="daily-panel flex-1 h-[380px] flex items-end overflow-hidden bg-[rgba(255,255,255,0.015)] rounded-md border border-white/5 relative shadow-xl">
              <div className="daily-header w-full flex justify-between text-xs text-gray-300 font-bold py-2 px-4 uppercase absolute left-0 top-0 bg-gradient-to-r from-indigo-900/30 to-transparent backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FaClock className="text-white/70" size={12} />
                  Daily
                </div>
                <span className="text-gray-400">{timeUntilRefresh}</span>
              </div>
              
              <div className="daily-grid grid grid-cols-3 w-full h-[calc(100%-24px)]">
                {getDailyItems().map((item: ShopItem) => (
                  <div key={item.id} className="daily-item group overflow-hidden cursor-pointer relative w-full">
                    <div className="item-info w-full flex py-2 flex-col items-center justify-center absolute bottom-0 h-[45px] bg-gradient-to-t from-black/80 to-black/40 z-10 backdrop-blur-md">
                      <p className="item-name text-white uppercase font-bold text-xs whitespace-nowrap">{item.name}</p>
                      <p className="item-price text-gray-200 font-bold text-xs flex gap-1 items-center mt-0.5">
                        <img src="https://image.fnbr.co/price/icon_vbucks.png" className="w-[12px]" alt="V-Bucks" />
                        {item.price}
                      </p>
                    </div>
                    <div className={`item-hover-bg absolute inset-0 w-full opacity-0 group-hover:opacity-100 transition-opacity h-full bg-gradient-to-t ${getRarityColor(item.rarity)} to-transparent`}></div>
                    <div className="item-default-bg absolute inset-0 w-full opacity-100 group-hover:opacity-0 transition-opacity h-full bg-gradient-to-t from-black/60 via-transparent to-black/20 to-transparent"></div>
                    <img
                      className="item-image absolute bottom-[-10px] object-cover transform transition-transform duration-300 scale-100 group-hover:scale-110 max-w-[170px] left-1/2 -translate-x-1/2"
                      src={item.icon}
                      alt={item.name}
                      onError={(e) => {
                        console.error(`could not load icon for ${item.name}: ${item.icon}`);
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {shopData && shopData.daily.length > ITEMS_PER_PAGE_DAILY && (
                <div className="absolute bottom-2 left-0 w-full flex justify-center gap-2 px-4 z-20">
                  {Array.from({ length: totalDailyPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDailyPage(index)}
                      className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                        currentDailyPage === index 
                          ? 'bg-white/80' 
                          : 'bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Page ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {shopData && shopData.custom_sections && Object.keys(shopData.custom_sections).length > 0 && (
            <div className="custom-sections-container mt-6 space-y-6">
              {Object.entries(shopData.custom_sections).map(([sectionName, items]) => {
                const typedItems = items as ShopItem[];
                const useFeaturedLayout = typedItems.length <= 2;
                const hasExtraItems = typedItems.length > 8;
                const featuredItems = hasExtraItems
                  ? getCustomSectionFeaturedItems(sectionName, typedItems)
                  : typedItems.slice(0, 2);
                const dailyItems = hasExtraItems
                  ? getCustomSectionDailyItems(typedItems).slice(2, 8)
                  : typedItems.slice(2);

                const sectionTransition = customSectionTransitions[sectionName] || false;

                return (
                  <div key={sectionName} className="custom-section">
                    <div className="section-header mb-4">
                      <h3 className="text-white font-bold text-xl uppercase tracking-wide">
                        {sectionName}
                      </h3>
                    </div>

                    {useFeaturedLayout ? (
                      <div className="market-sections w-full flex gap-4">
                        <div className="showcase-panel w-[400px] h-[380px] shrink-0 flex items-end overflow-hidden bg-[rgba(255,255,255,0.02)] rounded-md border border-white/5 relative shadow-xl">
                          <div className="panel-title w-full flex justify-between text-xs text-gray-300 font-bold py-2 px-4 uppercase absolute left-0 top-0 bg-gradient-to-r from-indigo-900/30 to-transparent backdrop-blur-sm border-b border-white/5 z-20">
                            <div className="flex items-center gap-2">
                              <FaClock className="text-white/70" size={14} />
                              {sectionName}
                            </div>
                            <span className="text-gray-400">{timeUntilRefresh}</span>
                          </div>

                          <div className="showcase-items absolute top-[30px] bottom-0 w-full flex">
                            {featuredItems.map((item: ShopItem) => (
                              <div
                                key={item.id}
                                className={`showcase-item group h-full cursor-pointer overflow-hidden relative w-full transition-all duration-300 hover:brightness-110 ${
                                  hasExtraItems && sectionTransition ? 'translate-x-[-100%] opacity-0' : 'translate-x-0 opacity-100'
                                }`}
                                style={{
                                  transitionTimingFunction: hasExtraItems && sectionTransition ? 'ease-in' : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                              >
                                <div className="item-info w-full flex py-3 flex-col items-center justify-center absolute bottom-0 h-[60px] bg-gradient-to-t from-black/80 to-black/40 z-10 backdrop-blur-md">
                                  <p className="text-white uppercase font-bold text-sm tracking-wide">{item.name}</p>
                                  <p className="text-gray-200 font-bold text-sm flex gap-2 items-center mt-1">
                                    <img src="https://image.fnbr.co/price/icon_vbucks.png" className="w-[16px]" alt="V-Bucks" />
                                    {item.price}
                                  </p>
                                </div>
                                <div className="progress-indicator absolute left-0 bottom-[60px] z-[99] h-0.5 w-full backdrop-blur-lg bg-white/30"></div>
                                <div className="item-overlay w-full absolute left-0 top-0 h-full bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                                <div className={`item-glow absolute inset-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-full bg-gradient-to-t ${getRarityColor(item.rarity)} to-transparent`}></div>
                                <img
                                  className={`item-preview absolute bottom-[20px] object-cover m-auto max-w-[280px] left-[-20px] transition-all duration-300 ${
                                    hasExtraItems && sectionTransition ? 'translate-x-[100%]' : 'translate-x-0'
                                  }`}
                                  src={item.featuredIcon}
                                  alt={item.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = item.icon;
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="market-sections w-full flex gap-4">
                        <div className="showcase-panel w-[400px] h-[380px] shrink-0 flex items-end overflow-hidden bg-[rgba(255,255,255,0.02)] rounded-md border border-white/5 relative shadow-xl">
                          <div className="panel-title w-full flex justify-between text-xs text-gray-300 font-bold py-2 px-4 uppercase absolute left-0 top-0 bg-gradient-to-r from-indigo-900/30 to-transparent backdrop-blur-sm border-b border-white/5 z-20">
                            <div className="flex items-center gap-2">
                              <FaClock className="text-white/70" size={14} />
                              {sectionName}
                            </div>
                            <span className="text-gray-400">{timeUntilRefresh}</span>
                          </div>

                          <div className="showcase-items absolute top-[30px] bottom-0 w-full flex">
                            {featuredItems.map((item: ShopItem) => (
                              <div
                                key={item.id}
                                className={`showcase-item group h-full cursor-pointer overflow-hidden relative w-full transition-all duration-300 hover:brightness-110 ${
                                  hasExtraItems && sectionTransition ? 'translate-x-[-100%] opacity-0' : 'translate-x-0 opacity-100'
                                }`}
                                style={{
                                  transitionTimingFunction: hasExtraItems && sectionTransition ? 'ease-in' : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }}
                              >
                                <div className="item-info w-full flex py-3 flex-col items-center justify-center absolute bottom-0 h-[60px] bg-gradient-to-t from-black/80 to-black/40 z-10 backdrop-blur-md">
                                  <p className="text-white uppercase font-bold text-sm tracking-wide">{item.name}</p>
                                  <p className="text-gray-200 font-bold text-sm flex gap-2 items-center mt-1">
                                    <img src="https://image.fnbr.co/price/icon_vbucks.png" className="w-[16px]" alt="V-Bucks" />
                                    {item.price}
                                  </p>
                                </div>
                                <div className="progress-indicator absolute left-0 bottom-[60px] z-[99] h-0.5 w-full backdrop-blur-lg bg-white/30"></div>
                                <div className="item-overlay w-full absolute left-0 top-0 h-full bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                                <div className={`item-glow absolute inset-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-full bg-gradient-to-t ${getRarityColor(item.rarity)} to-transparent`}></div>
                                <img
                                  className={`item-preview absolute bottom-[20px] object-cover m-auto max-w-[280px] left-[-20px] transition-all duration-300 ${
                                    hasExtraItems && sectionTransition ? 'translate-x-[100%]' : 'translate-x-0'
                                  }`}
                                  src={item.featuredIcon}
                                  alt={item.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = item.icon;
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        {dailyItems.length > 0 && (
                          <div className="daily-panel flex-1 h-[380px] flex items-end overflow-hidden bg-[rgba(255,255,255,0.015)] rounded-md border border-white/5 relative shadow-xl">
                            <div className="daily-header w-full flex justify-between text-xs text-gray-300 font-bold py-2 px-4 uppercase absolute left-0 top-0 bg-gradient-to-r from-indigo-900/30 to-transparent backdrop-blur-sm border-b border-white/5">
                              <div className="flex items-center gap-2">
                                <FaClock className="text-white/70" size={12} />
                                {sectionName}
                              </div>
                              <span className="text-gray-400">{timeUntilRefresh}</span>
                            </div>

                            <div className="daily-grid grid grid-cols-3 w-full h-[calc(100%-24px)]">
                              {dailyItems.slice(0, 6).map((item: ShopItem) => (
                                <div key={item.id} className="daily-item group overflow-hidden cursor-pointer relative w-full">
                                  <div className="item-info w-full flex py-2 flex-col items-center justify-center absolute bottom-0 h-[45px] bg-gradient-to-t from-black/80 to-black/40 z-10 backdrop-blur-md">
                                    <p className="item-name text-white uppercase font-bold text-xs whitespace-nowrap">{item.name}</p>
                                    <p className="item-price text-gray-200 font-bold text-xs flex gap-1 items-center mt-0.5">
                                      <img src="https://image.fnbr.co/price/icon_vbucks.png" className="w-[12px]" alt="V-Bucks" />
                                      {item.price}
                                    </p>
                                  </div>

                                  <div className="item-overlay w-full absolute left-0 top-0 h-full bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                                  <div className={`item-glow absolute inset-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-full bg-gradient-to-t ${getRarityColor(item.rarity)} to-transparent`}></div>
                                  <img
                                    className="item-image absolute bottom-[-10px] object-cover transform transition-transform duration-300 scale-100 group-hover:scale-110 max-w-[170px] left-1/2 -translate-x-1/2"
                                    src={item.icon}
                                    alt={item.name}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = item.featuredIcon;
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="legal-notice w-full mt-6 text-center bg-black/30 rounded-md py-2 px-4 border border-white/5">
            <p className="text-gray-400 text-sm">
              <span className="font-bold text-gray-300">Note:</span> These items are cosmetic only and grant no competitive advantage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}











