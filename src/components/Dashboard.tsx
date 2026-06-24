import React, { useMemo } from 'react';
import { useAppContext } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Clock, CheckCircle, Star } from 'lucide-react';

const COLORS = ['#059669', '#d97706', '#2563eb', '#dc2626', '#7c3aed'];

export const Dashboard: React.FC = () => {
  const { tickets, departments } = useAppContext();

  const stats = useMemo(() => {
    const total = tickets.length;
    const completed = tickets.filter(t => t.status === 'completed').length;
    const waiting = tickets.filter(t => t.status === 'waiting').length;
    const serving = tickets.filter(t => t.status === 'serving').length;

    // Calculate average wait time (only for served/completed tickets)
    const servedTickets = tickets.filter(t => t.servedAt);
    let avgWaitTime = 0;
    if (servedTickets.length > 0) {
      const totalWait = servedTickets.reduce((acc, t) => acc + (t.servedAt! - t.createdAt), 0);
      avgWaitTime = Math.floor((totalWait / servedTickets.length) / 60000); // in minutes
    }

    // Calculate average feedback rating
    const ticketsWithFeedback = tickets.filter(t => t.feedbackRating);
    let avgRating = 0;
    if (ticketsWithFeedback.length > 0) {
      const totalRating = ticketsWithFeedback.reduce((acc, t) => acc + (t.feedbackRating!), 0);
      avgRating = Number((totalRating / ticketsWithFeedback.length).toFixed(1));
    }

    return { total, completed, waiting, serving, avgWaitTime, avgRating, totalFeedback: ticketsWithFeedback.length };
  }, [tickets]);

  const departmentData = useMemo(() => {
    return departments.map(dept => {
      const deptTickets = tickets.filter(t => t.departmentId === dept.id);
      return {
        name: dept.name.split(' ')[0], // Short name
        fullName: dept.name,
        total: deptTickets.length,
        completed: deptTickets.filter(t => t.status === 'completed').length,
        waiting: deptTickets.filter(t => t.status === 'waiting').length
      };
    });
  }, [tickets, departments]);

  const statusPieData = [
    { name: 'Waiting', value: stats.waiting },
    { name: 'Serving', value: stats.serving },
    { name: 'Completed', value: stats.completed },
  ].filter(d => d.value > 0);

  const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tickets</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Currently Waiting</p>
            <p className="text-2xl font-bold text-gray-900">{stats.waiting}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Wait Time</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgWaitTime} <span className="text-sm font-normal text-gray-500">mins</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl">
            <Star size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating || '-'}</p>
              <p className="text-xs font-normal text-gray-500">/ 5.0 ({stats.totalFeedback})</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Tickets by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" name="Total Tickets" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Overall Status</h3>
          <div className="flex-1 min-h-[200px]">
            {tickets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No tickets yet
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-4">
            {statusPieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }} />
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
