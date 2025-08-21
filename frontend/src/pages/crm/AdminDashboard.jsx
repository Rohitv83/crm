import { ArrowUpRight, DollarSign, Users, Briefcase, CheckCircle, Activity, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const teamMembers = [
  { name: 'Alex Johnson', role: 'Project Manager', tasks: 12, completed: 10 },
  { name: 'Sarah Williams', role: 'UI Designer', tasks: 8, completed: 7 },
  { name: 'Michael Chen', role: 'Developer', tasks: 15, completed: 14 },
  { name: 'Emily Davis', role: 'Marketing', tasks: 5, completed: 5 },
];

// Reusable Stat Card Component with animations
const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <motion.div 
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}1A` }}>
        <Icon className="w-5 h-5" style={{ color: color }} />
      </div>
    </div>
    <div className="flex items-center mt-4">
      {parseFloat(change) >= 0 ? (
        <>
          <ArrowUpRight className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-500 font-medium ml-1">{change}</p>
        </>
      ) : (
        <>
          <ArrowUpRight className="w-4 h-4 text-red-500 transform rotate-180" />
          <p className="text-sm text-red-500 font-medium ml-1">{change}</p>
        </>
      )}
      <p className="text-sm text-gray-500 ml-2">vs last month</p>
    </div>
  </motion.div>
);

const TeamMemberCard = ({ name, role, tasks, completed }) => (
  <motion.div 
    className="bg-white p-4 rounded-lg shadow-sm flex items-center"
    whileHover={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
      <span className="text-indigo-600 font-medium">{name.charAt(0)}</span>
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900">{name}</h4>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium">
        <span className="text-indigo-600">{completed}</span>
        <span className="text-gray-400">/{tasks}</span>
      </p>
      <p className="text-xs text-gray-400">tasks</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Here is your company's performance overview</p>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Company Revenue" 
            value="$50,868" 
            change="+12%" 
            icon={DollarSign} 
            color="#4f46e5" 
          />
          <StatCard 
            title="New Customers" 
            value="486" 
            change="+8.5%" 
            icon={Users} 
            color="#10b981" 
          />
          <StatCard 
            title="Active Projects" 
            value="16" 
            change="-2.1%" 
            icon={Briefcase} 
            color="#f59e0b" 
          />
          <StatCard 
            title="Team Tasks Done" 
            value="124" 
            change="+15%" 
            icon={CheckCircle} 
            color="#ef4444" 
          />
        </div>

        {/* Charts and Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Revenue Overview</h2>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-500">Last 6 months</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Team Performance */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Team Performance</h2>
              <div className="text-sm text-indigo-600 font-medium">View All</div>
            </div>
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={index} {...member} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="flex items-center text-sm text-indigo-600 font-medium">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="p-2 bg-indigo-50 rounded-lg mr-4">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">New project kickoff</h4>
                  <p className="text-sm text-gray-500">Project "Redesign Dashboard" started by Sarah Williams</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}