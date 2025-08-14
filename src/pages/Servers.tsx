import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FaCircle, FaGlobe, FaFire, FaArrowLeft } from 'react-icons/fa';
import { BiRefresh } from 'react-icons/bi';
import { FiClock } from 'react-icons/fi';
import { listen } from '@tauri-apps/api/event';
import { useNavigate } from 'react-router-dom';

interface Session {
  started: boolean;
  ownerId: string;
  publicPlayers: string[];
  sessionId: string;
  sessionName: string;
  isArena?: boolean;
  region?: string;
  actualPlayerCount?: number;
}

export default function Servers() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(30);
  const [hasAnimated, setHasAnimated] = useState(false);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await invoke('fetch_sessions') as Session[];
      
      const serversDATA = data.map(session => {
        const sessionName = session.sessionName.toLowerCase();
        
        let region = '';
        if (sessionName.includes('eu')) {
          region = 'EU';
        } else if (sessionName.includes('na')) {
          region = 'NA';
        } else {
          region = 'TBD';
        }
        
        const actualPlayerCount = session.publicPlayers.filter(player => player !== session.ownerId).length;
        
        return {
          ...session,
          isArena: sessionName.includes('arena'),
          region,
          actualPlayerCount
        };
      });
      
      setSessions(serversDATA);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
      setTimeUntilRefresh(30);
    }
  };

  useEffect(() => {
    const playercounter = async () => {
      try {

        const unlisten = await listen('session-update', (event: any) => {
          const updatedSession = event.payload as { sessionId: string, playerCount: number };
          
          setSessions(prevSessions => 
            prevSessions.map(session => {
              if (session.sessionId === updatedSession.sessionId) {

                const newPublicPlayers = Array(updatedSession.playerCount).fill('');

                const actualPlayerCount = updatedSession.playerCount - 1;
                
                return {
                  ...session,
                  publicPlayers: newPublicPlayers,
                  actualPlayerCount
                };
              }
              return session;
            })
          );
        });
        
        return unlisten;
      } catch (error) {
        console.error('Failed to update player count', error);
      }
    };
    
    const unlistenPromise = playercounter();
    
    return () => {
      unlistenPromise.then(unlisten => {
        if (unlisten) unlisten();
      });
    };
  }, []);

  useEffect(() => {
    fetchSessions();
    
    const interval = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          fetchSessions();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimeout(() => {
      setHasAnimated(true);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 h-screen overflow-y-scroll scrollbar-hide">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
      
      <div className="mt-6 flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/home')}
          className={`flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-3 py-1.5 rounded-md transition-all duration-200 border border-white/10 text-sm relative z-10
            ${!hasAnimated ? 'animate-home opacity-0' : 'opacity-100'}`}
        >
          <FaArrowLeft size={14} />
          <span>Back</span>
        </button>
        
        <h1 className={`text-3xl font-bold text-white font-['Bricolage_Grotesque'] 
          ${!hasAnimated ? 'animate-home opacity-0' : 'opacity-100'}`}>
          Servers
        </h1>
        
        <button 
          onClick={fetchSessions}
          className={`flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-3 py-1.5 rounded-md transition-all duration-200 border border-white/10 text-sm relative z-10
            ${!hasAnimated ? 'animate-home opacity-0' : 'opacity-100'}`}
          style={{ animationDelay: '100ms' }}
        >
          <BiRefresh size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className={`flex items-center gap-2 bg-white/5 px-4 py-2 rounded-md border border-white/10 mb-5 relative z-10
        ${!hasAnimated ? 'animate-home opacity-0' : 'opacity-100'}`}
        style={{ animationDelay: '200ms' }}
      >
        <FiClock size={14} className="text-white/70" />
        <span className="text-white/70 text-sm">Auto-refresh in {timeUntilRefresh}s</span>
        <div className="relative w-4 h-4 ml-1">
          <svg className="w-4 h-4" viewBox="0 0 36 36">
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke="#ffffff10" 
              strokeWidth="3" 
            />
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke="#ffffff60" 
              strokeWidth="3" 
              strokeDasharray={`${100 - (timeUntilRefresh/30 * 100)} 100`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 pb-8 relative z-10">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-white/60 text-lg font-['Bricolage_Grotesque']">No servers available</p>
              <p className="text-white/40 text-sm mt-1">Check back later or refresh</p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <div 
                key={session.sessionId}
                className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/8 hover:border-indigo-500/20
                  ${!hasAnimated ? 'animate-bounce-up opacity-0' : 'opacity-100'}`}
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center flex-wrap">
                      <h3 className="text-white font-medium text-base font-['Bricolage_Grotesque'] mr-2">
                        {session.sessionName}
                      </h3>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          <FaCircle size={7} className={session.started ? 'text-orange-500' : 'text-indigo-400'} />
                          <span className="ml-1.5 text-xs text-white/70">
                            {session.started ? 'In Progress' : 'Waiting'}
                          </span>
                        </div>
                        
                        {session.region && (
                          <div className="flex items-center ml-2 bg-sky-500/20 px-2 py-0.5 rounded-md">
                            <FaGlobe size={9} className="text-sky-400" />
                            <span className="ml-1 text-xs text-sky-300 font-medium">
                              {session.region}
                            </span>
                          </div>
                        )}
                        
                        {session.isArena && (
                          <div className="flex items-center ml-2 bg-purple-500/20 px-2 py-0.5 rounded-md">
                            <FaFire size={9} className="text-purple-400" />
                            <span className="ml-1 text-xs text-purple-300 font-medium">
                              Arena
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-white/90 text-sm font-medium">
                        {session.actualPlayerCount}
                        <span className="text-white/40 text-xs">/100</span>
                      </div>
                      <div className="text-white/50 text-xs">players</div>
                    </div>
                  </div>
                  
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        session.started ? 'bg-orange-500' : 'bg-indigo-500'
                      }`}
                      style={{ 
                        width: `${Math.max(session.actualPlayerCount || 0, 3)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}







