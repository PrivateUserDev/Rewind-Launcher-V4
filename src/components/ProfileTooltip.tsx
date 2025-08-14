interface ProfileTooltipProps {
  username: string;
  role: string;
}

export const ProfileTooltip = ({ username, role }: ProfileTooltipProps) => (
  <div className="relative">
    <div 
      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] border-l border-b border-white/[0.08] rotate-45"
    />
    <div className="bg-[#1a1a1a] rounded-lg p-3 w-[140px] border border-white/[0.08] shadow-lg">
      <div className="text-left">
        <p className="text-white font-medium">{username}</p>
        <p className="text-white/60 text-sm">{role}</p>
      </div>
    </div>
  </div>
);


