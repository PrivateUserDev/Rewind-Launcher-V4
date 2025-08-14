import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

interface ImportVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVersion: (version: Version) => void;
}

interface VersionInfo {
  version: string;
  technical_version: string;
  splash_image: string;
}

interface Version {
  path: string;
  version: string;
  technical_version: string;
  splash_image: string;
  access_type: string;
  build_name: string;
}

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.93a2 2 0 01-1.66-.89l-.82-1.22A2 2 0 008.93 3H4a2 2 0 00-2 2v13a2 2 0 002 2z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-white/40"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="group-hover:translate-x-0.5 transition-transform duration-200"
  >
    <path 
      d="M5 12h14M12 5l7 7-7 7" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const FolderTag = ({ name }: { name: string }) => (
  <span className="inline-flex items-center mx-1.5 px-1.5 py-0.5 bg-[#1a1a1a] rounded-md border border-white/[0.08] text-white/90">
    📁 {name}
  </span>
);

const ModalHeader = () => (
  <div className="mb-4">
    <h2 className="text-2xl font-bold text-white font-['Bricolage_Grotesque'] tracking-tight">
      Import Installation
    </h2>
    <p className="mt-1 text-[13px] text-white/50 font-['Bricolage_Grotesque']">
      Select your Fortnite installation path to import an existing version.
    </p>
  </div>
);

const PathSelector = ({ selectedPath, onSelect }: { selectedPath: string, onSelect: (path: string) => void }) => {
  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: undefined
      });
      
      if (selected && typeof selected === 'string') {
        onSelect(selected);
      }
    } catch (err) {
      console.error("Could not select folder:", err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 flex items-center gap-3 bg-[#0f0f0f] border border-white/[0.08] rounded-xl px-4 py-2.5">
        <FolderIcon />
        <span className="text-white/40 text-sm font-['Bricolage_Grotesque']">
          {selectedPath || 'Choose your path!'}
        </span>
      </div>
      <button 
        onClick={handleSelectFolder}
        className="px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] border border-white/[0.08]
          text-white/90 rounded-xl transition-all duration-200 font-['Bricolage_Grotesque'] text-sm
          hover:scale-[1.02] active:scale-[0.98]"
      >
        Browse
      </button>
    </div>
  );
};

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const ImportVersionModal = ({ isOpen, onClose, onAddVersion }: ImportVersionModalProps) => {
  const [selectedPath, setSelectedPath] = useState('');
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const resetState = () => {
    setSelectedPath('');
    setVersionInfo(null);
    setIsLoading(false);
    setError(null);
    setStep('select');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
      resetState();
    }, 200);
  };

  const handleSelectPath = (path: string) => {
    setSelectedPath(path);
    setVersionInfo(null);
    setError(null);
  };

  const handleNext = async () => {
    if (!selectedPath) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const info = await invoke<VersionInfo>('detect_fortnite_version', { path: selectedPath });
      setVersionInfo(info);
      setStep('configure');
    } catch (err) {

      setVersionInfo(null);
      setStep('select');
      setError("Version not found. Please try another folder.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddToLibrary = async () => {
    if (!versionInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      const versionData = {
        path: selectedPath,
        version: versionInfo.version,
        technical_version: versionInfo.technical_version,
        splash_image: versionInfo.splash_image,
        access_type: '',
        build_name: '',
      };

      const updatedVersions = await invoke<Version[]>('add_version', { ...versionData });
      const addedVersion = updatedVersions.find(v => v.path === selectedPath);
      if (addedVersion) {
        onAddVersion(addedVersion);
        handleClose();
      } else {
        setError("Failed to add version.");
      }
    } catch (error) {
      setError(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const SelectPathContent = () => (
    <div className="space-y-4">
      <div className="w-full p-3 rounded-xl bg-black/40 border border-white/[0.08]">
        <p className="text-[13px] text-white/70 leading-relaxed">
          Select the path that contains both 
          <FolderTag name="FortniteGame" /> &nbsp;
          <FolderTag name="Engine" /> 
          folders.
        </p>
      </div>

      <PathSelector selectedPath={selectedPath} onSelect={handleSelectPath} />

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button 
        className={`w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-indigo-600/80 to-blue-600/80 hover:from-indigo-600/90 hover:to-blue-600/90 border border-white/[0.08]
          text-white rounded-xl transition-all duration-200 font-['Bricolage_Grotesque'] text-sm 
          flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] group
          ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
        onClick={handleNext}
        disabled={!selectedPath || isLoading}
      >
        <span>{isLoading ? 'Fetching Version...' : 'Next'}</span>
        {isLoading ? <LoadingSpinner /> : <ArrowIcon />}
      </button>
    </div>
  );

  const ConfigureContent = () => (
    <div className="space-y-3">
      {versionInfo ? (
        <div className="flex gap-4">
          <div className="rounded-xl overflow-hidden w-[200px]">
            <img src={versionInfo.splash_image} alt="splash.bmp" className="w-full h-auto object-cover" />
          </div>
          <div className="flex-1">
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] h-full space-y-3">
              <div>
                <h3 className="text-white font-semibold mb-1 text-sm">Fortnite Version:</h3>
                <p className="text-white/90 text-sm">{versionInfo.version}</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1 text-sm">Build Path:</h3>
                <div className="flex items-center gap-2 bg-[#0f0f0f] p-2 rounded-lg border border-white/[0.08]">
                  <FolderIcon />
                  <p className="text-white/70 text-sm font-['Bricolage_Grotesque'] truncate">
                    {selectedPath}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-600/20 border border-red-600 rounded-lg text-red-400 font-semibold text-center">
          Version Not Found
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        className={`w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-indigo-600/80 to-blue-600/80 hover:from-indigo-600/90 hover:to-blue-600/90 border border-white/[0.08]
          text-white rounded-xl transition-all duration-200 font-['Bricolage_Grotesque'] text-sm 
          flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] group
          ${isLoading || !versionInfo ? 'cursor-not-allowed opacity-70' : ''}`}
        onClick={handleAddToLibrary}
        disabled={isLoading || !versionInfo}
      >
        <span>{isLoading ? 'Adding...' : 'Add to Library'}</span>
        {isLoading ? <LoadingSpinner /> : <ArrowIcon />}
      </button>
    </div>
  );

  if (!isOpen && !isAnimating) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200
          ${!isAnimating ? 'opacity-0' : isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div
        className={`bg-gradient-to-b from-[#141414] to-[#0a0a0a] rounded-2xl
          border border-white/[0.08] p-6 w-[600px] max-h-[80vh] relative z-10 shadow-2xl
          transition-all duration-200
          ${!isAnimating ? 'opacity-0 scale-95' : isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={{ overflowY: 'auto', scrollbarWidth: 'thin' }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-thumb {
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 4px;
            }
          `}
        </style>

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/15 to-purple-900/10 pointer-events-none rounded-2xl" />
        <ModalHeader />
        {step === 'select' ? <SelectPathContent /> : <ConfigureContent />}
      </div>
    </div>
  );
};

export default ImportVersionModal;
