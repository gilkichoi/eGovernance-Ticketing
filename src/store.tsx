import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, Department, TicketStatus, Staff } from './types';
import { INITIAL_DEPARTMENTS, INITIAL_STAFF } from './data';
import { generateTicketNumber, playAudioAnnouncement } from './utils';

interface AppContextType {
  tickets: Ticket[];
  departments: Department[];
  staffMembers: Staff[];
  currentStaff: Staff | null;
  createTicket: (departmentId: string, serviceId: string, citizenName: string) => Ticket;
  serveTicket: (ticketId: string, staffName: string, counterNumber: string) => void;
  completeTicket: (ticketId: string, notes?: string) => void;
  holdTicket: (ticketId: string, notes?: string) => void;
  cancelTicket: (ticketId: string, notes?: string) => void;
  escalateTicket: (ticketId: string) => void;
  submitFeedback: (ticketId: string, rating: number, comment: string) => void;
  getDepartmentById: (id: string) => Department | undefined;
  getServiceById: (deptId: string, serviceId: string) => any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  requestOTP: (payrollNumber: string) => boolean;
  verifyOTP: (payrollNumber: string, otp: string) => boolean;
  logoutStaff: () => void;
  updateStaffServices: (staffId: string, serviceIds: string[]) => void;
  updateStaffCounters: (staffId: string, counterIds: string[]) => void;
  displayedServices: string[];
  updateDisplayedServices: (serviceIds: string[]) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  addCounter: (departmentId: string, counterName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [staffMembers, setStaffMembers] = useState<Staff[]>(INITIAL_STAFF);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState('citizen');
  const [mockOtps, setMockOtps] = useState<Record<string, string>>({});
  
  // By default, all services are displayed. Let's initialize with all service IDs.
  const [displayedServices, setDisplayedServices] = useState<string[]>(
    INITIAL_DEPARTMENTS.flatMap(d => d.services.map(s => s.id))
  );

  const updateDisplayedServices = (serviceIds: string[]) => {
    setDisplayedServices(serviceIds);
  };

  const requestOTP = (payrollNumber: string) => {
    const staff = staffMembers.find(s => s.payrollNumber.toUpperCase() === payrollNumber.toUpperCase());
    if (staff) {
      const otp = '1234'; // Fixed OTP for testing purposes
      setMockOtps(prev => ({ ...prev, [payrollNumber.toUpperCase()]: otp }));
      // Simulate sending SMS
      console.log(`[SMS MOCK] Sent OTP ${otp} to ${staff.phoneNumber} for ${staff.name}`);
      alert(`[SMS MOCK] For testing purposes, the OTP is always: ${otp}`);
      return true;
    }
    return false;
  };

  const verifyOTP = (payrollNumber: string, otp: string) => {
    const upperPayroll = payrollNumber.toUpperCase();
    if (mockOtps[upperPayroll] === otp || otp === '1234') {
      const staff = staffMembers.find(s => s.payrollNumber.toUpperCase() === upperPayroll);
      if (staff) {
        setCurrentStaff(staff);
        setMockOtps(prev => {
          const newOtps = { ...prev };
          delete newOtps[upperPayroll];
          return newOtps;
        });
        return true;
      }
    }
    return false;
  };

  const logoutStaff = () => setCurrentStaff(null);

  const updateStaffServices = (staffId: string, serviceIds: string[]) => {
    setStaffMembers(prev => prev.map(s => s.id === staffId ? { ...s, assignedServices: serviceIds } : s));
    if (currentStaff?.id === staffId) {
      setCurrentStaff(prev => prev ? { ...prev, assignedServices: serviceIds } : prev);
    }
  };

  const updateStaffCounters = (staffId: string, counterIds: string[]) => {
    setStaffMembers(prev => prev.map(s => s.id === staffId ? { ...s, assignedCounters: counterIds } : s));
    if (currentStaff?.id === staffId) {
      setCurrentStaff(prev => prev ? { ...prev, assignedCounters: counterIds } : prev);
    }
  };

  const createTicket = (departmentId: string, serviceId: string, citizenName: string, citizenPhone: string) => {
    const departmentTickets = tickets.filter(t => t.departmentId === departmentId);
    // Number for the day
    const number = generateTicketNumber(departmentId, departmentTickets.length);
    
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      number,
      departmentId,
      serviceId,
      citizenName,
      citizenPhone,
      status: 'waiting',
      createdAt: Date.now(),
    };
    
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  };

  const serveTicket = (ticketId: string, staffName: string, counterNumber: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updatedTicket = { ...t, status: 'serving' as TicketStatus, servedAt: Date.now(), staffName, counterNumber };
        // Play announcement asynchronously
        setTimeout(() => playAudioAnnouncement(updatedTicket.number, counterNumber), 100);
        return updatedTicket;
      }
      return t;
    }));
  };

  const completeTicket = (ticketId: string, notes?: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'completed' as TicketStatus, completedAt: Date.now(), notes: notes || t.notes } : t
    ));
  };

  const holdTicket = (ticketId: string, notes?: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'hold' as TicketStatus, notes: notes || t.notes } : t
    ));
  };

  const cancelTicket = (ticketId: string, notes?: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'cancelled' as TicketStatus, completedAt: Date.now(), notes: notes || t.notes } : t
    ));
  };

  const escalateTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, isEscalated: true } : t
    ));
  };

  const submitFeedback = (ticketId: string, rating: number, comment: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, feedbackRating: rating, feedbackComment: comment } : t
    ));
  };

  const getDepartmentById = (id: string) => departments.find(d => d.id === id);
  
  const getServiceById = (deptId: string, serviceId: string) => {
    const dept = getDepartmentById(deptId);
    return dept?.services.find(s => s.id === serviceId);
  };

  const addStaff = (staff: Omit<Staff, 'id'>) => {
    const newStaff: Staff = { ...staff, id: crypto.randomUUID() };
    setStaffMembers(prev => [...prev, newStaff]);
  };

  const addCounter = (departmentId: string, counterName: string) => {
    setDepartments(prev => prev.map(d => {
      if (d.id === departmentId) {
        const counters = d.counters || [];
        return { ...d, counters: [...counters, { id: crypto.randomUUID(), name: counterName }] };
      }
      return d;
    }));
  };

  return (
    <AppContext.Provider value={{
      tickets,
      departments,
      staffMembers,
      currentStaff,
      createTicket,
      serveTicket,
      completeTicket,
      holdTicket,
      cancelTicket,
      escalateTicket,
      submitFeedback,
      getDepartmentById,
      getServiceById,
      activeTab,
      setActiveTab,
      requestOTP,
      verifyOTP,
      logoutStaff,
      updateStaffServices,
      updateStaffCounters,
      displayedServices,
      updateDisplayedServices,
      addStaff,
      addCounter
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
