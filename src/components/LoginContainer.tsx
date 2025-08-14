import { useState, useEffect } from 'react';
import { IoIosInformationCircleOutline } from "react-icons/io";
import { invoke } from '@tauri-apps/api/core';

interface VersionCheckResponse {
  type: 'UPDATE' | 'NO_UPDATE';
  message: string;
  version?: string;
  download_url?: string;
}

interface ServerStatus {
  isServerReady: boolean;
}

interface LoginContainerProps {
  stage: 'initial' | 'loading' | 'waiting' | 'error';
  onLogin: () => void;
  onCancel: () => void;
  isFromLogout?: boolean;
  errorMessage?: string;
}

const UpdateCheckStage = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
    <div className="p-6 rounded-xl min-w-[260px] transition bg-[#222222]/20 backdrop-blur-md z-10 shadow-lg flex flex-col gap-5 border border-white/[0.08] animate-slide-bounce">
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
        <p className="text-white/70 text-[16px] font-medium tracking-wide font-['Bricolage_Grotesque']">Checking for updates!</p>
      </div>
    </div>
  </div>
);

const ServerOfflineStage = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
    <div className="p-6 rounded-xl min-w-[280px] transition bg-[#222222]/20 backdrop-blur-md z-10 shadow-lg flex flex-col gap-5 border border-white/[0.08] animate-slide-bounce">
      <div className="flex flex-col items-center gap-5" style={{ opacity: 1 }}>
        <IoIosInformationCircleOutline className="text-white" size={48} />
        <p className="text-white/70 text-[16px] font-medium tracking-wide font-['Bricolage_Grotesque']">Servers Offline!</p>
      </div>
    </div>
  </div>
);



const ErrorStage = ({ onCancel, errorMessage = "Unknown error occurred" }: { onCancel: () => void; errorMessage?: string }) => (
  <div className="transition-opacity duration-500 opacity-100">
    <div className="bg-red-600 text-white p-2.5 rounded-lg mb-3 text-center font-medium">
      <p>{errorMessage}</p>
      <p className="text-sm opacity-80 mt-1">Please try again or contact support if the issue persists.</p>
    </div>

    <button 
      onClick={onCancel}
      className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 transition-all duration-300 rounded-lg text-white font-semibold shadow-lg"
    >
       CANCEL
    </button>
  </div>
);


const DownloadContentStage = ({ progress }: { progress: number }) => (
  <div className="fixed inset-0 bg-[#0f0f0f] flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
    <div className="p-6 rounded-xl min-w-[280px] bg-[#222222]/20 backdrop-blur-md shadow-lg w-[280px] border border-white/[0.08] animate-slide-bounce">
      <div className="flex flex-col items-center gap-4 preparing" style={{ opacity: 1 }}>
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
        <p className="text-white/70 text-[16px] font-medium tracking-wide font-['Bricolage_Grotesque']">Downloading Content...</p>
        <div className="w-full bg-white/10 rounded-full h-2 mt-1">
          <div 
            className="bg-white/80 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white/50 text-[14px] font-['Bricolage_Grotesque']">{progress}%</p>
      </div>
    </div>
  </div>
);

export default function LoginContainer({ stage, onLogin, onCancel, isFromLogout = false, errorMessage }: LoginContainerProps) {
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [isServerStatusChecked, setIsServerStatusChecked] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const serverStatus = await invoke<ServerStatus>('check_server_status');
        setIsServerOnline(serverStatus.isServerReady === true);
        setIsServerStatusChecked(true);
      
        if (!serverStatus.isServerReady) {
          setIsCheckingUpdates(false);
          setTimeout(() => setShowContent(true), 100);
          return;
        }
        
        const versionInfo = await invoke<VersionCheckResponse>('check_version');
        
        if (versionInfo.type === 'UPDATE' && versionInfo.download_url) {
          setIsDownloading(true);
          setDownloadProgress(0);
          
          const interval = setInterval(() => {
            setDownloadProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                return 100;
              }
              return prev + 1;
            });
          }, 50);

          try {
            await invoke('download_and_install_update', { 
              downloadUrl: versionInfo.download_url 
            });
          } catch (error) {
            console.error('failed to download and install update:', error);
          }
        } else {
          setIsCheckingUpdates(false);
          setTimeout(() => setShowContent(true), 100);
        }
      } catch (error) {
        console.error('server or version check failed:', error);
        setIsServerOnline(false);
        setIsServerStatusChecked(true);
        setIsCheckingUpdates(false);
        setTimeout(() => setShowContent(true), 100);
      }
    };

    checkForUpdates();
  }, []);

  if (isServerStatusChecked && !isServerOnline) {
    return <ServerOfflineStage />;
  }

  if (isDownloading) {
    return <DownloadContentStage progress={downloadProgress} />;
  }

  if (isCheckingUpdates) {
    return <UpdateCheckStage />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
      <div className="floating-square" style={{ top: '10%', left: '15%', animationDelay: '0s' }}></div>
      <div className="floating-square" style={{ top: '60%', left: '80%', animationDelay: '5s' }}></div>
      <div className="floating-square" style={{ top: '30%', left: '70%', animationDelay: '10s' }}></div>
      <div className="floating-square" style={{ top: '80%', left: '20%', animationDelay: '15s' }}></div>
      <div className="floating-square" style={{ top: '20%', left: '50%', animationDelay: '20s' }}></div>

      {showContent && (
        <div className="login-panel animate-slide-bounce bg-[#222222]/40 backdrop-blur-md border border-white/[0.08] relative z-10">
          {stage === 'initial' && (
            <div className="flex flex-col items-center w-full">
              <h1 className="text-white text-6xl font-bold mb-6 mt-8 font-['Bricolage_Grotesque']">
                Rewind
              </h1>
              <p className="text-white/70 text-center mb-8 text-base leading-relaxed max-w-md font-['Bricolage_Grotesque']">
                {isFromLogout ? "In order to use any of our ingame-services you need to authenticate via Discord." :
                  "In order to use any of our ingame-services you need to authenticate via Discord."}
              </p>
              <button
                className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb]
                         transition-all duration-200 rounded-lg
                         text-white font-semibold text-base
                         hover:scale-[1.02] active:scale-[0.98]
                         shadow-lg flex items-center justify-center gap-2"
                onClick={onLogin}
              >
                Authenticate
              </button>
            </div>
          )}
          {(stage === 'loading' || stage === 'waiting') && (
            <div className="flex flex-col items-center w-full">
              <h1 className="text-white text-6xl font-bold mb-6 mt-8 font-['Bricolage_Grotesque']">
                Rewind
              </h1>
              <p className="text-white/70 text-center mb-8 text-base leading-relaxed max-w-md font-['Bricolage_Grotesque']">
                In order to use any of our ingame-services you need to authenticate via Discord.
              </p>
              <button
                className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb]
                         transition-all duration-200 rounded-lg
                         text-white font-semibold text-base
                         hover:scale-[1.02] active:scale-[0.98]
                         shadow-lg flex items-center justify-between
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={onLogin}
                disabled={stage === 'loading' || stage === 'waiting'}
              >
                {stage === 'waiting' ? (
                  <>
                    <span className="ml-4">Waiting for callback</span>
                    <svg
                      className="animate-spin w-4 h-4 mr-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  <span className="mx-auto">Authenticate</span>
                )}
              </button>
            </div>
          )}
          {stage === 'error' && <ErrorStage onCancel={onCancel} errorMessage={errorMessage} />}
        </div>
      )}
    </div>
  );
}
