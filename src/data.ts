import { Department, Staff } from './types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'health',
    name: 'Health Services',
    directorates: [
      { id: 'clinical', name: 'Clinical Services' },
      { id: 'public_health', name: 'Public Health' },
    ],
    services: [
      { id: 'h1', name: 'General Consultation', estimatedWaitMinutes: 15 },
      { id: 'h2', name: 'Pharmacy Dispensing', estimatedWaitMinutes: 5 },
      { id: 'h3', name: 'NHIF Registration', estimatedWaitMinutes: 20 },
    ],
  },
  {
    id: 'revenue',
    name: 'Revenue & Finance',
    directorates: [
      { id: 'licensing', name: 'Licensing' },
      { id: 'rates', name: 'Land Rates' },
    ],
    services: [
      { id: 'r1', name: 'Business Permit Payment', estimatedWaitMinutes: 10 },
      { id: 'r2', name: 'Land Rates Payment', estimatedWaitMinutes: 15 },
      { id: 'r3', name: 'Market Cess', estimatedWaitMinutes: 5 },
    ],
  },
  {
    id: 'lands',
    name: 'Lands & Physical Planning',
    directorates: [
      { id: 'survey', name: 'Survey' },
      { id: 'planning', name: 'Physical Planning' },
    ],
    services: [
      { id: 'l1', name: 'Title Deed Search', estimatedWaitMinutes: 30 },
      { id: 'l2', name: 'Land Transfer', estimatedWaitMinutes: 45 },
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Livestock',
    directorates: [
      { id: 'veterinary', name: 'Veterinary Services' },
      { id: 'crop', name: 'Crop Production' },
    ],
    services: [
      { id: 'a1', name: 'Veterinary Services', estimatedWaitMinutes: 20 },
      { id: 'a2', name: 'Fertilizer Subsidy Registration', estimatedWaitMinutes: 15 },
    ],
  },
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 's0',
    payrollNumber: 'ADMIN',
    name: 'System Admin',
    phoneNumber: '0700000000',
    departmentId: 'health',
    directorateId: 'clinical',
    assignedServices: [],
    role: 'admin'
  },
  {
    id: 's1',
    payrollNumber: 'DIR001',
    name: 'Dr. Jane Smith (Director)',
    phoneNumber: '0700000001',
    departmentId: 'health',
    directorateId: 'clinical',
    assignedServices: ['h1'],
    role: 'director'
  },
  {
    id: 's2',
    payrollNumber: 'STAFF001',
    name: 'John Doe (Staff)',
    phoneNumber: '0700000002',
    departmentId: 'health',
    directorateId: 'clinical',
    assignedServices: ['h1', 'h2'],
    role: 'staff'
  },
  {
    id: 's3',
    payrollNumber: 'DIR002',
    name: 'Alice Revenue (Director)',
    phoneNumber: '0700000003',
    departmentId: 'revenue',
    directorateId: 'licensing',
    assignedServices: ['r1'],
    role: 'director'
  }
];
