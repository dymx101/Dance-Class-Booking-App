import React from 'react';
import { Lock, Check } from 'lucide-react';

interface SpotSelectorProps {
  classId: string;
  reservedspots: string[];
  selectedSpot: string | null;
  onSelectSpot: (spot: string) => void;
  theme: string;
}

export default function SpotSelector({
  classId,
  reservedspots = [],
  selectedSpot,
  onSelectSpot,
  theme
}: SpotSelectorProps) {
  const isDark = theme === 'midnight-cyber';
  const isMint = theme === 'cool-mint';

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6];

  // Helper to determine spot details
  const getSpotZone = (row: string) => {
    if (row === 'A' || row === 'B') {
      return { 
        name: '前排靠镜 (Front / Mirror)', 
        color: 'pink', 
        glowClass: 'glow-jazz', 
        selectedClass: 'selected-glow-pink' 
      };
    }
    if (row === 'C' || row === 'D') {
      return { 
        name: '中排C位 (Middle)', 
        color: 'purple', 
        glowClass: 'glow-hiphop', 
        selectedClass: 'selected-glow-purple' 
      };
    }
    return { 
      name: '后排友好 (Back / Beginner)', 
      color: 'cyan', 
      glowClass: 'glow-contemporary', 
      selectedClass: 'selected-glow-cyan' 
    };
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Legend / Proximity Zones indicator */}
      <div className="flex flex-wrap justify-center gap-4 mb-5 text-[10px] md:text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></span>
          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>前排靠镜</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse"></span>
          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>中排黄金</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse"></span>
          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>后排新手</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded border border-zinc-700 bg-zinc-800/40 flex items-center justify-center"><Lock className="w-2.5 h-2.5 text-zinc-500" /></span>
          <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>已被占用</span>
        </div>
      </div>

      {/* Classroom Container */}
      <div className={`w-full max-w-[480px] p-6 rounded-[28px] border ${
        isDark 
          ? 'bg-black/40 border-white/5 shadow-2xl' 
          : isMint
            ? 'bg-teal-950/5 border-teal-500/10 shadow-xl'
            : 'bg-slate-50 border-slate-200/60 shadow-lg'
      }`}>
        
        {/* Mirror indicator representing classroom front */}
        <div className="w-full mb-8 relative flex flex-col items-center">
          <div className={`w-[90%] h-2.5 rounded-full relative overflow-hidden border ${
            isMint 
              ? 'bg-teal-500/20 border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.4)]' 
              : 'bg-rose-500/20 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r via-white/40 from-transparent to-transparent animate-pulse" />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-[0.25em] mt-2 ${
            isDark ? 'text-zinc-500' : 'text-slate-400'
          }`}>
            🪞 镜面墙 (MIRROR WALL)
          </span>
        </div>

        {/* 3D slant view Grid wrapper */}
        <div className="perspective-container w-full overflow-visible flex justify-center py-2">
          <div className="stage-3d-grid w-full grid grid-cols-6 gap-3 md:gap-4 select-none">
            {rows.map((row) =>
              cols.map((col) => {
                const spotCode = `${row}${col}`;
                const isReserved = reservedspots.includes(spotCode);
                const isSelected = selectedSpot === spotCode;
                const zone = getSpotZone(row);

                // Classes depending on state
                let buttonClass = 'relative aspect-square w-full rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-300 border ';
                
                if (isReserved) {
                  buttonClass += isDark
                    ? 'bg-zinc-900/60 border-zinc-800/40 text-zinc-650 cursor-not-allowed opacity-40'
                    : 'bg-slate-200/50 border-slate-300/20 text-slate-400 cursor-not-allowed opacity-50';
                } else if (isSelected) {
                  buttonClass += ` cursor-pointer scale-110 z-10 text-white ${zone.selectedClass}`;
                } else {
                  buttonClass += isDark
                    ? ` text-zinc-300 hover:scale-105 active:scale-95 cursor-pointer spot-glass ${zone.glowClass}`
                    : ` text-slate-700 hover:scale-105 active:scale-95 cursor-pointer spot-glass-light border-slate-200/80 ${zone.glowClass}`;
                }

                return (
                  <button
                    key={spotCode}
                    disabled={isReserved}
                    onClick={() => onSelectSpot(spotCode)}
                    className={buttonClass}
                    title={`${spotCode} 号位 - ${zone.name}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* 3D text layers */}
                    <span 
                      className="text-[10px] md:text-[11px] font-bold"
                      style={{ transform: 'translateZ(10px)' }}
                    >
                      {spotCode}
                    </span>

                    {/* Status icons inside button */}
                    <div 
                      className="absolute bottom-1 right-1"
                      style={{ transform: 'translateZ(5px)' }}
                    >
                      {isReserved && <Lock className="w-2 h-2 md:w-2.5 md:h-2.5 text-zinc-500" />}
                      {isSelected && <Check className="w-2 md:w-2.5 h-2 md:h-2.5 text-white animate-bounce" />}
                    </div>

                    {/* Ripple background ring */}
                    {isSelected && (
                      <span className="absolute inset-0 rounded-2xl border-2 animate-ping opacity-60 pointer-events-none" style={{ borderColor: 'inherit' }}></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Small tips at the bottom */}
        <div className={`mt-8 text-center text-[9px] md:text-[10px] font-medium leading-relaxed ${
          isDark ? 'text-zinc-500' : 'text-slate-400'
        }`}>
          <span>💡 提示：越靠近镜子视角越开阔，后排更适合观察动作与跟跳</span>
        </div>
      </div>
    </div>
  );
}
