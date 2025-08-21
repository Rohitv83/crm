import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Aapke alag-alag dashboard components
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Jab tak user data load ho raha hai, loading dikhayein
  if (!user) {
    return <div>Loading...</div>;
  }

  // Role ke hisab se sahi dashboard render karein
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'superadmin':
      return <SuperAdminDashboard />;
    default:
      // Agar koi aur role hai (jaise 'user'), to use ek default page par bhej dein
      return <div>Welcome! You do not have a specific dashboard.</div>;
  }
}