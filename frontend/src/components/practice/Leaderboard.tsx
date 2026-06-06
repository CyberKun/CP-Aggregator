import React from 'react';

export function Leaderboard() {
  return (
    <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl p-5 w-full flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h2>
        <div className="w-5 h-5 rounded-full border border-gray-500 text-gray-500 flex items-center justify-center text-xs font-bold cursor-pointer hover:text-white hover:border-white">
          i
        </div>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-1 flex mb-8">
        <button className="flex-1 bg-transparent text-white font-medium py-1.5 rounded-md text-sm">Users</button>
        <button className="flex-1 text-gray-400 font-medium py-1.5 rounded-md text-sm hover:text-gray-300">Institutes</button>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 mb-8 mt-12 px-2">
        {/* Rank 2 */}
        <div className="flex flex-col items-center w-1/3 relative">
          <div className="absolute -top-16 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-600 border-2 border-purple-400 flex items-center justify-center text-white font-bold text-lg mb-1 shadow-[0_0_15px_rgba(147,51,234,0.5)]">S</div>
            <span className="text-white text-xs font-medium truncate w-20 text-center">Shatansh...</span>
            <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
              <span className="text-[10px]">★</span> 372
            </div>
          </div>
          <div className="w-full h-24 bg-gradient-to-b from-[#60a5fa] to-[#1e3a8a] rounded-t-lg relative">
            <div className="absolute inset-x-0 top-0 h-4 bg-white/20 rounded-t-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/50">2</div>
          </div>
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center w-1/3 relative z-10">
          <div className="absolute -top-20 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-yellow-400 overflow-hidden mb-1 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Parth" alt="Parth" className="w-full h-full object-cover bg-white"/>
            </div>
            <span className="text-white text-xs font-medium truncate w-20 text-center">Parth Lan...</span>
            <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
              <span className="text-[10px]">★</span> 372
            </div>
          </div>
          <div className="w-full h-32 bg-gradient-to-b from-[#93c5fd] to-[#2563eb] rounded-t-lg shadow-xl relative">
            <div className="absolute inset-x-0 top-0 h-4 bg-white/30 rounded-t-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white">1</div>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center w-1/3 relative">
          <div className="absolute -top-16 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-600 border-2 border-gray-400 flex items-center justify-center text-white font-bold text-lg mb-1 shadow-[0_0_10px_rgba(156,163,175,0.5)]">S</div>
            <span className="text-white text-xs font-medium truncate w-20 text-center">sohit seh...</span>
            <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
              <span className="text-[10px]">★</span> 372
            </div>
          </div>
          <div className="w-full h-20 bg-gradient-to-b from-[#60a5fa] to-[#1e3a8a] rounded-t-lg relative">
            <div className="absolute inset-x-0 top-0 h-4 bg-white/10 rounded-t-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white/30">3</div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-bold w-4">#4</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajat" alt="Rajat" className="w-full h-full object-cover"/>
            </div>
            <span className="text-gray-300 font-medium text-sm">Rajat Mantri</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
            <span className="text-xs">★</span> 372
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-bold w-4">#5</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan" alt="Aryan" className="w-full h-full object-cover"/>
            </div>
            <span className="text-gray-300 font-medium text-sm">Aryan Garg</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-semibold">
            <span className="text-xs">★</span> 372
          </div>
        </div>
      </div>
    </div>
  );
}
