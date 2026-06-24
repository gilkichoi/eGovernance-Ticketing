import React, { useState } from 'react';
import { useAppContext } from '../store';
import { User, CheckCircle2, Play, AlertCircle, LogOut, Settings, Users, Info, Shield, XCircle, PauseCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Staff } from '../types';
import { StaffManagement } from './StaffManagement';

export const StaffPortal: React.FC = () => {
  const { 
    tickets, departments, serveTicket, completeTicket, 
    holdTicket, cancelTicket, escalateTicket,
    getDepartmentById, getServiceById, 
    currentStaff, requestOTP, verifyOTP, logoutStaff,
    staffMembers, updateStaffServices,
    displayedServices, updateDisplayedServices
  } = useAppContext();
  
  const [payrollNumber, setPayrollNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [staffTab, setStaffTab] = useState<'workspace' | 'history' | 'metrics' | 'management'>('workspace');
  const [loginError, setLoginError] = useState('');

  const [counterNumber, setCounterNumber] = useState<string>('1');
  const [ticketNotes, setTicketNotes] = useState<Record<string, string>>({});

  // Director state
  const [selectedStaffToManage, setSelectedStaffToManage] = useState<Staff | null>(null);

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (requestOTP(payrollNumber)) {
      setStep('verify');
    } else {
      setLoginError('Payroll number not found.');
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!verifyOTP(payrollNumber, otp)) {
      setLoginError('Invalid OTP.');
    }
  };

  if (!currentStaff) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-emerald-600 p-6 text-white text-center">
            <User className="mx-auto h-12 w-12 mb-3 opacity-90" />
            <h2 className="text-2xl font-bold">Staff Login</h2>
            <p className="text-emerald-100 mt-1 text-sm">Access the service management portal</p>
          </div>
          
          <div className="p-6">
            {loginError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                {loginError}
              </div>
            )}
            
            {step === 'request' ? (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Number</label>
                  <input 
                    type="text" 
                    required
                    value={payrollNumber}
                    onChange={(e) => setPayrollNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase"
                    placeholder="e.g. P001"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  Send OTP to Phone
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input 
                    type="text" 
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-center tracking-widest text-lg font-mono"
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  Verify & Login
                </button>
                <button 
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full py-2 text-sm text-gray-500 hover:text-emerald-600"
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const dept = getDepartmentById(currentStaff.departmentId);
  const directorate = dept?.directorates.find(d => d.id === currentStaff.directorateId);

  const myDeptTickets = tickets.filter(t => t.departmentId === currentStaff.departmentId);
  const myServiceTickets = myDeptTickets.filter(t => currentStaff.assignedServices.includes(t.serviceId));
  
  const waitingTickets = myServiceTickets.filter(t => t.status === 'waiting').sort((a, b) => a.createdAt - b.createdAt);
  const servingTickets = myServiceTickets.filter(t => t.status === 'serving').sort((a, b) => b.servedAt! - a.servedAt!);
  
  let jurisdictionTickets = tickets;
  if (currentStaff.role === 'staff') {
    jurisdictionTickets = myServiceTickets.filter(t => t.staffName === currentStaff.name);
  } else if (currentStaff.role === 'director') {
    jurisdictionTickets = myDeptTickets;
  }
  
  const historyTickets = jurisdictionTickets
    .filter(t => ['completed', 'hold', 'cancelled'].includes(t.status))
    .sort((a, b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));

  const workspaceHistoryTickets = myServiceTickets.filter(t => ['completed', 'hold', 'cancelled'].includes(t.status)).sort((a, b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Welcome, {currentStaff.name}</h2>
          <p className="text-sm text-gray-500">{dept?.name} • {directorate?.name} • <span className="font-medium text-emerald-600 capitalize">{currentStaff.role}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setStaffTab('workspace')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${staffTab === 'workspace' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Workspace
            </button>
            <button 
              onClick={() => setStaffTab('history')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${staffTab === 'history' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Follow-Up & History
            </button>
            <button 
              onClick={() => setStaffTab('metrics')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${staffTab === 'metrics' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Metrics
            </button>
            {['admin', 'director'].includes(currentStaff.role) && (
              <button 
                onClick={() => setStaffTab('management')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${staffTab === 'management' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Management
              </button>
            )}
          </div>
          <button 
            onClick={logoutStaff}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {staffTab === 'workspace' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Context / Tools */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Serving */}
          <div className="bg-emerald-600 p-6 rounded-2xl shadow-sm text-white">
            <h3 className="text-emerald-100 font-medium mb-4 uppercase tracking-wider text-sm">Active Counter</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-emerald-200 mb-1">My Counter</label>
              {currentStaff.assignedCounters && currentStaff.assignedCounters.length > 0 ? (
                <select 
                  value={counterNumber}
                  onChange={(e) => setCounterNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-500 bg-emerald-700 text-white focus:ring-2 focus:ring-white outline-none"
                >
                  <option value="">Select a counter...</option>
                  {currentStaff.assignedCounters.map(counterId => {
                    const counter = dept?.counters?.find(c => c.id === counterId);
                    return counter ? <option key={counter.id} value={counter.name}>{counter.name}</option> : null;
                  })}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={counterNumber}
                  onChange={(e) => setCounterNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-500 bg-emerald-700/50 text-white placeholder-emerald-400 focus:ring-2 focus:ring-white outline-none"
                  placeholder="e.g. 1"
                />
              )}
            </div>

            {servingTickets.filter(t => t.staffName === currentStaff.name).length > 0 ? (
              <div className="space-y-4">
                {servingTickets.filter(t => t.staffName === currentStaff.name).map(ticket => (
                  <div key={ticket.id} className="bg-emerald-700/50 p-4 rounded-xl border border-emerald-500/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-3xl font-bold">{ticket.number}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            completeTicket(ticket.id, ticketNotes[ticket.id]);
                            setTicketNotes(prev => { const n = {...prev}; delete n[ticket.id]; return n; });
                          }}
                          className="bg-white text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 flex items-center gap-1"
                          title="Complete"
                        >
                          <CheckCircle2 size={16} /> Complete
                        </button>
                        <button 
                          onClick={() => {
                            holdTicket(ticket.id, ticketNotes[ticket.id]);
                            setTicketNotes(prev => { const n = {...prev}; delete n[ticket.id]; return n; });
                          }}
                          className="bg-amber-100 text-amber-800 px-2 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-amber-200 flex items-center gap-1"
                          title="Hold"
                        >
                          <PauseCircle size={16} /> Hold
                        </button>
                        <button 
                          onClick={() => {
                            cancelTicket(ticket.id, ticketNotes[ticket.id]);
                            setTicketNotes(prev => { const n = {...prev}; delete n[ticket.id]; return n; });
                          }}
                          className="bg-red-100 text-red-800 px-2 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-red-200 flex items-center gap-1"
                          title="Cancel"
                        >
                          <XCircle size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                    <p className="font-medium text-emerald-50">
                      {ticket.citizenName} 
                      {ticket.citizenPhone && <span className="text-emerald-200 text-sm ml-2">({ticket.citizenPhone})</span>}
                    </p>
                    <p className="text-sm text-emerald-200 mt-1 mb-3">
                      {getServiceById(ticket.departmentId, ticket.serviceId)?.name}
                    </p>
                    <textarea
                      value={ticketNotes[ticket.id] || ''}
                      onChange={(e) => setTicketNotes(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                      placeholder="Add staff notes before completing (optional)..."
                      className="w-full text-sm rounded-lg bg-emerald-800/30 border border-emerald-600/50 text-emerald-50 placeholder-emerald-400/70 p-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none resize-none"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-emerald-200 flex flex-col items-center bg-emerald-700/30 rounded-xl">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No active ticket</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Queues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">Waiting Queue</h3>
                <p className="text-xs text-gray-500">For services assigned to you</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                {waitingTickets.length} waiting
              </span>
            </div>
            
            {waitingTickets.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <Users className="h-12 w-12 text-gray-300 mb-3" />
                <p>The queue is currently empty for your services.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {waitingTickets.map((ticket, index) => {
                  const service = getServiceById(ticket.departmentId, ticket.serviceId);
                  return (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      key={ticket.id} 
                      className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center font-bold text-xl text-emerald-700 border border-emerald-100">
                          {ticket.number}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {ticket.citizenName}
                            {ticket.citizenPhone && <span className="text-gray-500 text-sm font-normal ml-2">({ticket.citizenPhone})</span>}
                          </h4>
                          <p className="text-sm text-gray-600 mt-0.5">{service?.name}</p>
                          <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                            Wait time: {Math.floor((Date.now() - ticket.createdAt) / 60000)} mins
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => serveTicket(ticket.id, currentStaff.name, counterNumber)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                      >
                        <Play size={16} /> Serve
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <p className="text-xs text-gray-500">Completed, Held, and Cancelled tickets</p>
              </div>
            </div>
            
            {workspaceHistoryTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No recent activity.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                {workspaceHistoryTickets.map(ticket => {
                  const service = getServiceById(ticket.departmentId, ticket.serviceId);
                  
                  let statusBadge = null;
                  if (ticket.status === 'completed') {
                    statusBadge = <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium">Completed</span>;
                  } else if (ticket.status === 'hold') {
                    statusBadge = (
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">On Hold</span>
                        <button
                          onClick={() => serveTicket(ticket.id, currentStaff.name, counterNumber)}
                          className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <Play size={12} /> Resume
                        </button>
                      </div>
                    );
                  } else if (ticket.status === 'cancelled') {
                    statusBadge = <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-medium">Cancelled</span>;
                  }

                  return (
                    <div key={ticket.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between opacity-75 hover:opacity-100 transition-opacity gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-lg text-gray-400 border border-gray-100">
                          {ticket.number}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 text-sm">
                            {ticket.citizenName}
                            {ticket.citizenPhone && <span className="text-gray-400 font-normal ml-2">({ticket.citizenPhone})</span>}
                          </h4>
                          <p className="text-xs text-gray-500">{service?.name}</p>
                          {ticket.notes && (
                            <p className="text-xs text-gray-600 mt-1 italic border-l-2 border-gray-200 pl-2">
                              "{ticket.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right sm:ml-auto">
                        {statusBadge}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
      )}

      {staffTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">Follow-Up & History</h3>
              <p className="text-xs text-gray-500">
                {currentStaff.role === 'admin' && "All completed, held, and cancelled tickets"}
                {currentStaff.role === 'director' && "Tickets under your department's jurisdiction"}
                {currentStaff.role === 'staff' && "Tickets you have served"}
              </p>
            </div>
          </div>
          
          {historyTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No historical tickets found under your jurisdiction.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {historyTickets.map(ticket => {
                const service = getServiceById(ticket.departmentId, ticket.serviceId);
                
                let statusBadge = null;
                if (ticket.status === 'completed') {
                  statusBadge = <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium">Completed</span>;
                } else if (ticket.status === 'hold') {
                  statusBadge = <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">On Hold</span>;
                } else if (ticket.status === 'cancelled') {
                  statusBadge = <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-medium">Cancelled</span>;
                }

                return (
                  <div key={ticket.id} className={`p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${ticket.isEscalated ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-xl text-gray-500 border border-gray-200">
                        {ticket.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {ticket.citizenName}
                          </h4>
                          {ticket.citizenPhone && <span className="text-gray-500 text-sm">({ticket.citizenPhone})</span>}
                          {ticket.isEscalated && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold border border-red-200 uppercase tracking-wider">
                              Escalated
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-emerald-600 font-medium mb-1">{service?.name}</p>
                        <p className="text-xs text-gray-500 mb-3">Served by: <span className="font-medium text-gray-700">{ticket.staffName || 'Unknown'}</span> • Counter {ticket.counterNumber || 'N/A'}</p>
                        
                        {ticket.notes ? (
                          <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 border-l-4 border-gray-300">
                            <strong>Staff Notes:</strong> {ticket.notes}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">No notes provided.</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 sm:ml-auto">
                      {statusBadge}
                      <div className="text-xs text-gray-400 text-right">
                        {new Date(ticket.completedAt || ticket.createdAt).toLocaleString()}
                      </div>
                      {!ticket.isEscalated && (
                        <button
                          onClick={() => escalateTicket(ticket.id)}
                          className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                        >
                          Escalate Ticket
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {staffTab === 'metrics' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">Workload Metrics</h3>
              <p className="text-xs text-gray-500">
                {currentStaff.role === 'admin' && "Real-time metrics for all staff members"}
                {currentStaff.role === 'director' && "Real-time metrics for your department's staff"}
                {currentStaff.role === 'staff' && "Your real-time metrics"}
              </p>
            </div>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-sm text-gray-600">Staff Member</th>
                  <th className="py-3 px-4 font-semibold text-sm text-gray-600">Role</th>
                  <th className="py-3 px-4 font-semibold text-sm text-center text-gray-600">Total Served</th>
                  <th className="py-3 px-4 font-semibold text-sm text-center text-emerald-600">Completed</th>
                  <th className="py-3 px-4 font-semibold text-sm text-center text-amber-600">On Hold</th>
                  <th className="py-3 px-4 font-semibold text-sm text-center text-red-600">Cancelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(currentStaff.role === 'admin' ? staffMembers : (currentStaff.role === 'director' ? staffMembers.filter(s => s.departmentId === currentStaff.departmentId) : [currentStaff])).map(staff => {
                  const staffTickets = tickets.filter(t => t.staffName === staff.name);
                  const servedCount = staffTickets.filter(t => ['completed', 'hold', 'cancelled', 'serving'].includes(t.status)).length;
                  const completedCount = staffTickets.filter(t => t.status === 'completed').length;
                  const holdCount = staffTickets.filter(t => t.status === 'hold').length;
                  const cancelledCount = staffTickets.filter(t => t.status === 'cancelled').length;
                  
                  return (
                    <tr key={staff.payrollNumber} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-xs text-gray-500">{staff.payrollNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 capitalize">{staff.role}</td>
                      <td className="py-3 px-4 text-center font-bold text-gray-700">{servedCount}</td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-600">{completedCount}</td>
                      <td className="py-3 px-4 text-center font-semibold text-amber-600">{holdCount}</td>
                      <td className="py-3 px-4 text-center font-semibold text-red-600">{cancelledCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {staffTab === 'management' && (
        <StaffManagement />
      )}

    </div>
  );
};
