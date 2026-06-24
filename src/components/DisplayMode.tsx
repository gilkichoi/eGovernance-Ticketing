import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity } from 'lucide-react';

interface DisplayModeProps {
  onClose: () => void;
}

export const DisplayMode: React.FC<DisplayModeProps> = ({ onClose }) => {
  const { tickets, getServiceById } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate the 30-second auto-refresh requirement
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setLastRefreshed(new Date());
      // In a real app with backend, we would fetch fresh queue data here
    }, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  const servingTickets = tickets.filter(t => t.status === 'serving').sort((a, b) => b.servedAt! - a.servedAt!).slice(0, 5);
  const waitingTickets = tickets.filter(t => t.status === 'waiting').sort((a, b) => a.createdAt - b.createdAt).slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-400 tracking-tight">Queue Status</h1>
          <p className="text-gray-400 mt-2 text-xl md:text-2xl">Please wait for your number to be called</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-5xl md:text-6xl font-mono font-bold tracking-wider">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-gray-400 text-xl md:text-2xl mt-2 font-medium flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm text-emerald-500/70 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full">
              <Activity size={14} className="animate-pulse" /> Live Sync (30s)
            </span>
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 min-h-0">
        {/* Left: Now Serving */}
        <div className="lg:col-span-7 flex flex-col min-h-0">
          <h2 className="text-3xl font-bold text-emerald-400 mb-6 uppercase tracking-wider">
             Now Serving
          </h2>
          <div className="flex-1 space-y-4 overflow-hidden">
            <AnimatePresence>
              {servingTickets.length === 0 ? (
                <div className="bg-gray-900/50 rounded-3xl p-12 text-center text-gray-500 text-2xl border border-gray-800">
                  No tickets being served
                </div>
              ) : (
                servingTickets.map((ticket, index) => {
                  const service = getServiceById(ticket.departmentId, ticket.serviceId);
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`rounded-3xl border ${
                        index === 0 
                          ? 'bg-emerald-900/40 border-emerald-500 p-8 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                          : 'bg-gray-900/80 border-gray-800 p-6 opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className={`font-bold font-mono ${index === 0 ? 'text-7xl md:text-8xl text-emerald-300' : 'text-5xl text-gray-300'}`}>
                          {ticket.number}
                        </div>
                        <div className={`text-right ${index === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                          <div className={index === 0 ? 'text-emerald-100 font-bold' : 'text-gray-400 font-medium'}>Counter {ticket.counterNumber}</div>
                          <div className={index === 0 ? 'text-emerald-400 text-xl md:text-2xl mt-1' : 'text-gray-500 text-lg mt-1'}>{service?.name}</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Waiting */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          <h2 className="text-3xl font-bold text-gray-500 mb-6 uppercase tracking-wider">
            Waiting Queue
          </h2>
          <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
               {waitingTickets.map(ticket => (
                 <div key={ticket.id} className="bg-gray-800/80 rounded-2xl p-5 border border-gray-700 flex justify-center items-center shadow-sm">
                   <div className="text-4xl md:text-5xl font-bold font-mono text-gray-300">{ticket.number}</div>
                 </div>
               ))}
            </div>
            {waitingTickets.length === 0 && (
              <div className="text-center text-gray-600 text-2xl h-full flex items-center justify-center">
                Queue is empty
              </div>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="fixed bottom-6 right-6 p-4 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-colors shadow-lg opacity-50 hover:opacity-100 group"
        title="Exit Display Mode"
      >
        <X size={24} />
      </button>
    </div>
  );
};
