import { Building2, Users, DollarSign, Activity, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const companyData = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
  { name: 'Apr', value: 180 },
  { name: 'May', value: 210 },
  { name: 'Jun', value: 250 },
];

const recentCompanies = [
  { name: 'Acme Corp', plan: 'Enterprise', users: 42, date: '2023-06-15', status: 'active' },
  { name: 'Globex Inc', plan: 'Professional', users: 18, date: '2023-06-14', status: 'active' },
  { name: 'Initech', plan: 'Starter', users: 5, date: '2023-06-12', status: 'pending' },
  { name: 'Umbrella Corp', plan: 'Enterprise', users: 87, date: '2023-06-10', status: 'active' },
  { name: 'Wayne Ent', plan: 'Professional', users: 23, date: '2023-06-08', status: 'suspended' },
];

const systemAlerts = [
  { id: 1, message: 'Database backup completed', time: '2 hours ago', status: 'success' },
  { id: 2, message: 'High server load detected', time: '5 hours ago', status: 'warning' },
  { id: 3, message: 'New version available (v2.3.1)', time: '1 day ago', status: 'info' },
];

const StatCard = ({ title, value, description, icon: Icon, color }) => (
  <motion.div 
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-full mr-4`} style={{ backgroundColor: `${color}1A` }}>
        <Icon className="w-6 h-6" style={{ color: color }} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-4">{description}</p>
  </motion.div>
);

const CompanyCard = ({ name, plan, users, date, status }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800'
  };

  return (
    <motion.div 
      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
      whileHover={{ x: 5 }}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-4">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{name}</h4>
          <div className="flex items-center mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
              {status}
            </span>
            <span className="text-xs text-gray-500 ml-2">{plan} Plan</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{users} users</p>
        <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</p>
      </div>
    </motion.div>
  );
};

const AlertCard = ({ message, time, status }) => {
  const statusIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Activity className="w-5 h-5 text-blue-500" />
  };

  return (
    <motion.div 
      className="flex items-start p-4 border-b border-gray-100 last:border-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mr-3 mt-0.5">
        {statusIcons[status]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {time}
        </p>
      </div>
    </motion.div>
  );
};

export default function SuperAdminDashboard() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">System-wide overview and analytics</p>
          </div>
          <button className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View full report <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Companies" 
            value="1,250" 
            description="Registered organizations" 
            icon={Building2} 
            color="#4f46e5" 
          />
          <StatCard 
            title="Total Users" 
            value="8,420" 
            description="Active across all tenants" 
            icon={Users} 
            color="#10b981" 
          />
          <StatCard 
            title="MRR" 
            value="$25,600" 
            description="Monthly recurring revenue" 
            icon={DollarSign} 
            color="#f59e0b" 
          />
          <StatCard 
            title="System Health" 
            value="100%" 
            description="All services operational" 
            icon={Activity} 
            color="#ef4444" 
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Company Growth Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Company Growth</h2>
              <div className="text-sm text-indigo-600 font-medium">Last 6 months</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData}>
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

          {/* System Alerts */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">System Alerts</h2>
              <div className="text-sm text-indigo-600 font-medium">View All</div>
            </div>
            <div className="space-y-2">
              {systemAlerts.map(alert => (
                <AlertCard key={alert.id} {...alert} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Companies */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Company Signups</h2>
            <div className="text-sm text-indigo-600 font-medium">View All</div>
          </div>
          <div className="space-y-2">
            {recentCompanies.map((company, index) => (
              <CompanyCard key={index} {...company} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}