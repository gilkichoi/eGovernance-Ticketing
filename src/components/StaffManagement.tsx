import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Staff, Department, Directorate } from '../types';
import { Settings, Plus, UserPlus, Monitor } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { currentStaff, departments, staffMembers, addStaff, addCounter, updateStaffServices, updateStaffCounters, updateDisplayedServices, displayedServices } = useAppContext();
  
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPayroll, setNewStaffPayroll] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'director' | 'admin'>('staff');
  const [newStaffDeptId, setNewStaffDeptId] = useState(departments[0]?.id || '');
  const [newStaffDirId, setNewStaffDirId] = useState(departments[0]?.directorates[0]?.id || '');

  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterDeptId, setNewCounterDeptId] = useState(currentStaff?.departmentId || departments[0]?.id || '');

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    addStaff({
      name: newStaffName,
      payrollNumber: newStaffPayroll,
      phoneNumber: newStaffPhone,
      role: newStaffRole,
      departmentId: newStaffDeptId,
      directorateId: newStaffDirId,
      assignedServices: [],
      assignedCounters: []
    });
    setNewStaffName('');
    setNewStaffPayroll('');
    setNewStaffPhone('');
  };

  const handleCreateCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCounterName.trim()) {
      addCounter(newCounterDeptId, newCounterName);
      setNewCounterName('');
    }
  };

  const managedStaff = currentStaff?.role === 'admin' 
    ? staffMembers 
    : staffMembers.filter(s => s.departmentId === currentStaff?.departmentId);

  return (
    <div className="space-y-6">
      
      {/* Create User & Counters row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create Staff */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="text-emerald-600" size={20} /> Create User
          </h3>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payroll Number</label>
                <input required type="text" value={newStaffPayroll} onChange={e => setNewStaffPayroll(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="P999" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="text" value={newStaffPhone} onChange={e => setNewStaffPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="staff">Staff</option>
                  {currentStaff?.role === 'admin' && <option value="director">Director</option>}
                  {currentStaff?.role === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>
            </div>

            {(currentStaff?.role === 'admin' || currentStaff?.role === 'director') && newStaffRole !== 'admin' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <select 
                    value={newStaffDeptId} 
                    onChange={e => {
                      setNewStaffDeptId(e.target.value);
                      const d = departments.find(dep => dep.id === e.target.value);
                      setNewStaffDirId(d?.directorates[0]?.id || '');
                    }} 
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    disabled={currentStaff.role === 'director'}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Directorate</label>
                  <select value={newStaffDirId} onChange={e => setNewStaffDirId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {departments.find(d => d.id === newStaffDeptId)?.directorates.map(dir => (
                      <option key={dir.id} value={dir.id}>{dir.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
              Create Staff
            </button>
          </form>
        </div>

        {/* Create Counter */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="text-emerald-600" size={20} /> Create Service Counter
          </h3>
          <p className="text-xs text-gray-500 mb-4">Add a new physical counter for staff assignments.</p>
          <form onSubmit={handleCreateCounter} className="space-y-4">
            {currentStaff?.role === 'admin' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select value={newCounterDeptId} onChange={e => setNewCounterDeptId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Counter Name / Number</label>
              <input required type="text" value={newCounterName} onChange={e => setNewCounterName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Counter 5" />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors mt-auto w-full">
              Add Counter
            </button>
          </form>
        </div>

      </div>

      {/* Staff Allocations */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="text-emerald-600" size={20} /> Allocations & Assignments
        </h3>
        <p className="text-xs text-gray-500 mb-4">Assign services and service counters to your staff members.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 font-semibold text-xs text-gray-600">Staff</th>
                <th className="py-2 px-4 font-semibold text-xs text-gray-600 w-1/2">Assigned Services</th>
                <th className="py-2 px-4 font-semibold text-xs text-gray-600 w-1/3">Assigned Counters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {managedStaff.map(staff => {
                const dept = departments.find(d => d.id === staff.departmentId);
                if (!dept) return null;
                return (
                  <tr key={staff.id} className="align-top hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-sm text-gray-900">{staff.name}</div>
                      <div className="text-xs text-gray-500">{staff.payrollNumber} • <span className="capitalize">{staff.role}</span></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {dept.services.map(service => {
                          const isAssigned = staff.assignedServices?.includes(service.id);
                          return (
                            <label key={service.id} className="flex items-center gap-2 text-xs cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={isAssigned}
                                onChange={(e) => {
                                  const newServices = e.target.checked 
                                    ? [...(staff.assignedServices || []), service.id]
                                    : (staff.assignedServices || []).filter(id => id !== service.id);
                                  updateStaffServices(staff.id, newServices);
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                              />
                              <span className={isAssigned ? 'text-gray-900' : 'text-gray-500'}>{service.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {(!dept.counters || dept.counters.length === 0) ? (
                          <div className="text-xs text-gray-400 italic">No counters created yet.</div>
                        ) : (
                          dept.counters.map(counter => {
                            const isAssigned = staff.assignedCounters?.includes(counter.id);
                            return (
                              <label key={counter.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={(e) => {
                                    const newCounters = e.target.checked 
                                      ? [...(staff.assignedCounters || []), counter.id]
                                      : (staff.assignedCounters || []).filter(id => id !== counter.id);
                                    updateStaffCounters(staff.id, newCounters);
                                  }}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                                />
                                <span className={isAssigned ? 'text-gray-900' : 'text-gray-500'}>{counter.name}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin View: Manage POS */}
      {currentStaff?.role === 'admin' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="text-emerald-600" size={20} /> Point of Service
          </h3>
          <p className="text-xs text-gray-500 mb-4">Select which services are available to citizens at the kiosk/terminal.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map(dept => (
              <div key={dept.id}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{dept.name}</h4>
                <div className="space-y-2 ml-2">
                  {dept.services.map(service => {
                    const isDisplayed = displayedServices.includes(service.id);
                    return (
                      <label key={service.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={isDisplayed}
                          onChange={(e) => {
                            const newDisplayed = e.target.checked 
                              ? [...displayedServices, service.id]
                              : displayedServices.filter(id => id !== service.id);
                            updateDisplayedServices(newDisplayed);
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className={isDisplayed ? 'text-gray-900' : 'text-gray-500'}>{service.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
