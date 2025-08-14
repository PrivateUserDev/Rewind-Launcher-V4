import { FaDiscord } from 'react-icons/fa';

export default function Leaderboard() {
  return (
    <div className="p-8 h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 pointer-events-none"></div>
      
      <div className="flex flex-col items-center justify-center h-full relative z-10">
        <iframe
          src="https://backend-services-prod.privateuser.xyz/api/v2/rewind/leaderboard"
          title="Leaderboard"
          className="w-full max-w-4xl h-[80vh] rounded-xl border shadow-lg"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          frameBorder="0"
        />
        <p className="mt-6 text-white/80 font-['Bricolage_Grotesque'] text-center text-sm">
          If the leaderboard is not loading, please visit it directly on{' '}
          <a
            href="https://backend-services-prod.privateuser.xyz/api/v2/rewind/leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            the leaderboard page
          </a>
          .
        </p>
        <a 
          href="https://discord.gg/rewindogfn" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white hover:text-indigo-300 transition-colors duration-200 mt-4"
        >
          <FaDiscord size={24} />
          <span className="font-['Bricolage_Grotesque'] font-medium text-lg">discord.gg/rewindogfn</span>
        </a>
      </div>
    </div>
  );
}
