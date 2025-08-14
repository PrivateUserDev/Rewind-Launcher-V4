import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FaPlay, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { discordRPC } from '../utils/discordRPC';

export default function LaunchVersion() {
  const navigate = useNavigate();
  const location = useLocation();
  const version = location.state?.version;
  const user = location.state?.user;
  const autoLaunch = location.state?.autoLaunch;

  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchStatus, setLaunchStatus] = useState('');
  const [launchProgress, setLaunchProgress] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [gameMonitorInterval, setGameMonitorInterval] = useState<number | null>(null);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsAnimating(true));
    checkGameStatus();
  }, []);

  useEffect(() => {
    if (showLaunchModal) {
      setIsModalAnimating(true);
      setIsModalClosing(false);
    }
  }, [showLaunchModal]);


  useEffect(() => {
    if (autoLaunch && !isLaunching && !isGameRunning) {
      const timer = setTimeout(() => {
        handleLaunch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoLaunch]);

  const checkGameStatus = async () => {
    try {
      const isRunning = await invoke('is_game_running');
      if (isRunning) {
        setIsGameRunning(true);
        startGameMonitoring();
      }
    } catch (err) {
    }
  };

  if (!version) return <div className="text-white p-8">Version not found. Contact Support.</div>;
  if (!user) return <div className="text-white p-8">User not found. Contact Support.</div>;

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => navigate('/library'), 200);
  };

  const handleLaunch = async () => {
    let errorMessages: string[] = [];

    if (isGameRunning) {
      try {
        await invoke('stop_game_process');
        setIsGameRunning(false);
        stopGameMonitoring();
        discordRPC.setLauncherActivity(user?.avatar_url, user?.username);
      } catch (err) {
        console.error('Failed to stop game:', err);
      }
      return;
    }

    setIsLaunching(true);
    setShowLaunchModal(true);
    setIsModalClosing(false);
    setHasError(false);
    setLaunchProgress(0);
    
    discordRPC.setPlayingActivity(version.version, user?.avatar_url);

    setTimeout(() => {
      setIsModalAnimating(true);
    }, 10);

    try {
      setLaunchStatus('Initializing...');
      setLaunchProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setLaunchStatus('Downloading Update...');
      setLaunchProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLaunchStatus('Verifying files...');
      setLaunchProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setLaunchStatus('Launching game...');
      setLaunchProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { email, password, username, avatar_url } = user;
      await invoke('version_card_clicked', {
        path: version.path,
        email,
        password,
        username,
        avatar_url,
        version: version.version,
      });
    
      setLaunchStatus('Successfully launched game!');
      setLaunchProgress(100);
      await new Promise(resolve => setTimeout(resolve, 700));
      try {
        const isRunning = await invoke('is_game_running');
        if (isRunning) {
          setIsGameRunning(true);
          closeModalWithAnimation();
          startGameMonitoring();

          discordRPC.setPlayingActivity(version.version, user?.avatar_url);
        } else {
          throw new Error('process not detected');
        }
      } catch (verifyErr) {
        setHasError(true);
        setLaunchStatus(`Error: ${errorMessages.join('; ')}`);
        setTimeout(() => {
          closeModalWithAnimation();
          setHasError(false);
        }, 3000);
      }
    } catch (err) {
      setHasError(true);
      setLaunchStatus(`Error: ${errorMessages.join('; ')}`);
      setLaunchProgress(0);

      setTimeout(() => {
        closeModalWithAnimation();
        setHasError(false);
      }, 3000);
    } finally {
      setIsLaunching(false);
    }
  };

  const startGameMonitoring = () => {
    if (gameMonitorInterval) {
      clearInterval(gameMonitorInterval);
    }

   const interval = window.setInterval(async () => {
    try {
    const isRunning = await invoke('is_game_running');
    if (!isRunning && isGameRunning) {
      setIsGameRunning(false);
      stopGameMonitoring();
    }
     } catch (err) {
    }
    }, 3000);

setGameMonitorInterval(interval);

  };

  const stopGameMonitoring = () => {
    if (gameMonitorInterval) {
      clearInterval(gameMonitorInterval);
      setGameMonitorInterval(null);
    }
  };

  useEffect(() => {
    return () => {
      stopGameMonitoring();
    };
  }, [gameMonitorInterval]);

  const closeModalWithAnimation = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowLaunchModal(false);
      setIsModalAnimating(false);
      setIsModalClosing(false);
    }, 300);
  };

  const getSeasonName = (versionStr: string): string => {
    const major = parseInt(versionStr.split('.')[0]);
    const seasonMap: Record<number, string> = {
      1: 'Chapter 1 Season 1', 2: 'Chapter 1 Season 2', 3: 'Chapter 1 Season 3',
      4: 'Chapter 1 Season 4', 5: 'Chapter 1 Season 5', 6: 'Chapter 1 Season 6',
      7: 'Chapter 1 Season 7', 8: 'Chapter 1 Season 8', 9: 'Chapter 1 Season 9',
      10: 'Chapter 1 Season X', 11: 'Chapter 2 Season 1', 12: 'Chapter 2 Season 2',
      13: 'Chapter 2 Season 3', 14: 'Chapter 2 Season 4', 15: 'Chapter 2 Season 5',
      16: 'Chapter 2 Season 6', 17: 'Chapter 2 Season 7', 18: 'Chapter 2 Season 8',
      19: 'Chapter 3 Season 1', 20: 'Chapter 3 Season 2', 21: 'Chapter 3 Season 3',
      22: 'Chapter 3 Season 4', 23: 'Chapter 4 Season 1', 24: 'Chapter 4 Season 2',
      25: 'Chapter 4 Season 3', 26: 'Chapter 4 Season 4',
    };
    return seasonMap[major] || 'dude??? idk';
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-300 ease-out ${
        isExiting
          ? 'opacity-0 scale-110'
          : isAnimating
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-90'
      }`}
      style={{
        background: 'transparent'
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={handleBack}
          className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-2xl text-white/70 hover:text-white transition-all duration-500 border border-white/10 hover:border-white/20 shadow-2xl"
        >
          <FaArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="font-medium">Return to Library</span>
        </button>
      </div>

      <div className="relative">
        <div
          className="h-screen overflow-hidden relative"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${version.splash_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-12">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h1 className="text-5xl font-black text-white mb-4 font-['Bricolage_Grotesque'] leading-none tracking-tighter drop-shadow-2xl">
                        {getSeasonName(version.version)}
                      </h1>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-1 w-20 bg-white/30 rounded-full"></div>
                        <span className="text-white/60 text-lg font-medium">Version {version.version}</span>
                      </div>
                    </div>
                    <p className="text-white/80 text-2xl mb-12 leading-relaxed max-w-3xl font-light">
                      The battle is building! Drop into the Battle Royale. Loot, build, explore, and fight in a game of 100 players competing to be the last one standing.
                    </p>

                    <div className="flex items-center gap-8">
                      <button
                        onClick={handleLaunch}
                        disabled={isLaunching}
                        className={`group relative overflow-hidden px-12 py-6 rounded-full font-bold text-xl transition-all duration-500 transform hover:scale-110 ${
                          isGameRunning
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-2xl hover:shadow-3xl'
                            : isLaunching
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-sky-400 hover:bg-sky-300 text-white shadow-2xl hover:shadow-3xl'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center gap-4">
                          {isLaunching ? (
                            <>
                              <div className="w-6 h-6 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                              LAUNCHING...
                            </>
                          ) : isGameRunning ? (
                            <>
                              <FaTimes size={22} className="transition-transform duration-300 group-hover:scale-110" />
                              STOP
                            </>
                          ) : (
                            <>
                              <FaPlay size={22} className="transition-transform duration-300 group-hover:scale-110" />
                              LAUNCH
                            </>
                          )}
                        </div>
                      </button>
                      <div className="flex items-center gap-4">
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="text-left">
                        <h3 className="text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Installation Path</h3>
                        <code className="text-white/70 text-xs font-mono break-all">{version.path}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

      {showLaunchModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300
              ${isModalClosing ? 'opacity-0' : 'opacity-100'}`}
          />
          <div
            className={`bg-gray-900/95 backdrop-blur-sm rounded-lg p-5 shadow-xl max-w-md w-full mx-4 relative z-10
              transition-all duration-300 ease-out
              ${isModalClosing ? 'opacity-0 scale-90' : isModalAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={version.splash_image}
                alt="Fortnite"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base leading-tight">
                  Fortnite {version.version.split(' (CL-')[0]}
                </h3>
                <p className="text-gray-400 text-xs">{version.version}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {hasError ? (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                ) : (
                  <div className="w-3 h-3 border border-gray-400 border-t-white rounded-full animate-spin"></div>
                )}
                <span className={`text-sm ${hasError ? 'text-red-400' : 'text-gray-300'}`}>
                  {launchStatus}
                </span>
              </div>

              {!hasError && (
                <div className="w-full bg-gray-700 h-0.5">
                  <div
                    className="bg-white h-0.5 transition-all duration-500 ease-out"
                    style={{ width: `${launchProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}