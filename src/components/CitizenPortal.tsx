import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Ticket } from '../types';
import { Clock, CheckCircle2, AlertCircle, Ticket as TicketIcon, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const CitizenPortal: React.FC = () => {
  const { departments, createTicket, getDepartmentById, getServiceById, tickets, submitFeedback, displayedServices } = useAppContext();
  
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenPhone, setCitizenPhone] = useState<string>('');
  const [myTicket, setMyTicket] = useState<Ticket | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [aiEstimatedWaitTime, setAiEstimatedWaitTime] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !selectedService || !citizenName) return;
    
    const newTicket = createTicket(selectedDept, selectedService, citizenName, citizenPhone);
    setMyTicket(newTicket);
    setAiEstimatedWaitTime(null);
  };

  // Automatically update local state if my ticket status changes in the global store
  const currentTicket = myTicket ? tickets.find(t => t.id === myTicket.id) || myTicket : null;

  const peopleAhead = currentTicket ? tickets.filter(t => 
    t.departmentId === currentTicket.departmentId && 
    t.status === 'waiting' && 
    t.createdAt < currentTicket.createdAt
  ).length : 0;

  React.useEffect(() => {
    if (currentTicket && currentTicket.status === 'waiting') {
      const fetchEstimate = async () => {
        setIsEstimating(true);
        try {
          const service = getServiceById(currentTicket.departmentId, currentTicket.serviceId);
          const dept = getDepartmentById(currentTicket.departmentId);
          
          const servedTickets = tickets.filter(t => t.departmentId === currentTicket.departmentId && t.servedAt);
          let historicalAvgWaitTime = 0;
          if (servedTickets.length > 0) {
            const totalWait = servedTickets.reduce((acc, t) => acc + (t.servedAt! - t.createdAt), 0);
            historicalAvgWaitTime = Math.floor((totalWait / servedTickets.length) / 60000);
          }

          const response = await fetch('/api/estimateWaitTime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              departmentName: dept?.name,
              serviceName: service?.name,
              peopleAhead,
              defaultEstimatedWaitMinutes: service?.estimatedWaitMinutes,
              historicalAvgWaitTime
            })
          });

          if (response.ok) {
            const data = await response.json();
            setAiEstimatedWaitTime(data.estimatedWaitTimeMinutes);
          }
        } catch (error) {
          console.error("Failed to fetch AI estimate:", error);
        } finally {
          setIsEstimating(false);
        }
      };

      fetchEstimate();
    }
  }, [currentTicket?.id, currentTicket?.status, peopleAhead, getServiceById, getDepartmentById, tickets]);

  const handleFeedbackSubmit = () => {
    if (currentTicket && feedbackRating > 0) {
      submitFeedback(currentTicket.id, feedbackRating, feedbackComment);
    }
  };

  const calculateWaitTime = () => {
    if (!currentTicket) return 0;
    const service = getServiceById(currentTicket.departmentId, currentTicket.serviceId);
    
    // Find how many people are waiting ahead of this person for the SAME department
    const peopleAhead = tickets.filter(t => 
      t.departmentId === currentTicket.departmentId && 
      t.status === 'waiting' && 
      t.createdAt < currentTicket.createdAt
    ).length;

    return (peopleAhead + 1) * (service?.estimatedWaitMinutes || 10);
  };

  if (currentTicket) {
    const isServing = currentTicket.status === 'serving';
    const isCompleted = currentTicket.status === 'completed';
    const dept = getDepartmentById(currentTicket.departmentId);
    const service = getServiceById(currentTicket.departmentId, currentTicket.serviceId);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className={`p-8 text-white ${
          isCompleted ? 'bg-gray-500' : isServing ? 'bg-amber-500' : 'bg-emerald-600'
        }`}>
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-80">Your Ticket Number</p>
            <h2 className="text-5xl font-bold tracking-tight">{currentTicket.number}</h2>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{citizenName}</h3>
            <p className="text-gray-500 mt-1">{dept?.name} - {service?.name}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-gray-200 text-gray-600' : isServing ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isCompleted ? <CheckCircle2 size={24} /> : isServing ? <AlertCircle size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{currentTicket.status}</p>
                </div>
              </div>
            </div>

            {currentTicket.status === 'waiting' && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center">
                <p className="text-sm font-medium mb-1">Estimated Wait Time</p>
                {isEstimating ? (
                  <p className="text-2xl font-bold animate-pulse text-emerald-400">Calculating...</p>
                ) : (
                  <p className="text-2xl font-bold">~{aiEstimatedWaitTime !== null ? aiEstimatedWaitTime : calculateWaitTime()} mins</p>
                )}
                {aiEstimatedWaitTime !== null && !isEstimating && (
                   <p className="text-xs font-medium mt-2 bg-emerald-100 text-emerald-700 inline-block px-2 py-0.5 rounded-full">✨ AI Prediction</p>
                )}
              </div>
            )}

            {isServing && currentTicket.counterNumber && (
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-xl text-center"
              >
                <p className="text-sm font-bold uppercase tracking-wider mb-1">Please proceed to</p>
                <p className="text-4xl font-black">Counter {currentTicket.counterNumber}</p>
                <p className="text-sm mt-3 opacity-80">Served by: {currentTicket.staffName}</p>
              </motion.div>
            )}

            {isCompleted && !currentTicket.feedbackRating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-gray-50 border border-gray-100 rounded-xl"
              >
                <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Rate your experience</h4>
                <p className="text-sm text-gray-500 text-center mb-4">How was the service provided by {currentTicket.staffName}?</p>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={`p-2 transition-colors ${feedbackRating >= star ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                      <Star size={32} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Any additional comments? (Optional)"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-20 mb-3"
                />
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackRating === 0}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Submit Feedback
                </button>
              </motion.div>
            )}

            {isCompleted && currentTicket.feedbackRating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-emerald-800"
              >
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-600" />
                <h4 className="font-bold">Thank you!</h4>
                <p className="text-sm mt-1">Your feedback has been submitted successfully.</p>
              </motion.div>
            )}
          </div>

          <button 
            onClick={() => {
              setMyTicket(null);
              setFeedbackRating(0);
              setFeedbackComment('');
              setCitizenName('');
              setCitizenPhone('');
              setSelectedDept('');
              setSelectedService('');
            }}
            className="w-full py-3 mt-4 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium rounded-xl transition-colors"
          >
            Book Another Service
          </button>
        </div>
      </motion.div>
    );
  }

  const selectedDepartmentObj = getDepartmentById(selectedDept);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <TicketIcon className="mx-auto h-12 w-12 mb-3 opacity-90" />
          <h2 className="text-2xl font-bold">Service Portal</h2>
          <p className="text-emerald-100 mt-1 text-sm">Book a service ticket instantly</p>
        </div>
        
        <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              required
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedService('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="">Select Department...</option>
              {departments.filter(d => d.services.some(s => displayedServices.includes(s.id))).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {selectedDepartmentObj && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Required</label>
              <select 
                required
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
              >
                <option value="">Select Service...</option>
                {selectedDepartmentObj.services.filter(s => displayedServices.includes(s.id)).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </motion.div>
          )}

          {selectedService && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. 0700123456"
                />
              </div>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={!selectedDept || !selectedService || !citizenName}
            className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200"
          >
            Get Ticket
          </button>
        </form>
      </div>
    </div>
  );
};
