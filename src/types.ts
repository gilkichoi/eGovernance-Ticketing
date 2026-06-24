export type TicketStatus = 'waiting' | 'serving' | 'completed' | 'hold' | 'cancelled';

export interface Service {
  id: string;
  name: string;
  estimatedWaitMinutes: number;
}

export interface Directorate {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  directorates: Directorate[];
  services: Service[];
}

export interface Staff {
  id: string;
  payrollNumber: string;
  name: string;
  phoneNumber: string;
  departmentId: string;
  directorateId: string;
  assignedServices: string[];
  role: 'staff' | 'director' | 'admin';
}

export interface Ticket {
  id: string;
  number: string;
  departmentId: string;
  serviceId: string;
  citizenName: string;
  citizenPhone?: string;
  status: TicketStatus;
  createdAt: number;
  servedAt?: number;
  completedAt?: number;
  staffName?: string;
  counterNumber?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  notes?: string;
  isEscalated?: boolean;
}

export interface AppState {
  tickets: Ticket[];
  departments: Department[];
}
