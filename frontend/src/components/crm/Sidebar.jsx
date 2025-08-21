import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react'; // FIX: Import all icons at the top level
import api from '../../utils/api';

// --- SAFER ICON HANDLING ---
const IconMap = { ...LucideIcons };
const FallbackIcon = LucideIcons.Menu;

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = IconMap[name];
  return IconComponent ? <IconComponent {...props} /> : <FallbackIcon {...props} />;
};


const SidebarLink = ({ to, icon: Icon, children, exact = false, collapsed }) => {
  const location = useLocation();
  const isActive = exact 
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      title={children}
      className={`flex items-center w-full py-2.5 rounded-lg transition-all duration-200 ${collapsed ? 'px-2 justify-center' : 'px-4'} ${
        isActive
          ? 'bg-[#34495e] text-white shadow-md'
          : 'text-[#bdc3c7] hover:bg-[#34495e] hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#bdc3c7]'}`} />
      {!collapsed && (
        <span className="ml-3 text-sm font-medium">{children}</span>
      )}
    </NavLink>
  );
};

const CollapsibleMenu = ({ icon: Icon, title, children, defaultOpen = false, collapsed }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();
  const hasActiveChild = React.Children.toArray(children).some(child => 
    child.props.to && location.pathname.startsWith(child.props.to)
  );

  useEffect(() => {
    if (hasActiveChild && !collapsed) setIsOpen(true);
    if (collapsed) setIsOpen(false);
  }, [hasActiveChild, collapsed]);

  if (collapsed) {
    return (
      <div title={title} className={`flex items-center justify-center w-full p-3 rounded-lg transition-colors ${
          hasActiveChild ? 'bg-[#34495e]' : 'hover:bg-[#34495e]'
        }`}>
        <Icon className="w-5 h-5 text-[#bdc3c7]" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left rounded-lg transition-all duration-200 ${
          hasActiveChild 
            ? 'bg-[#34495e] text-white'
            : 'text-[#bdc3c7] hover:bg-[#34495e] hover:text-white'
        }`}
      >
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-3 ${hasActiveChild ? 'text-white' : 'text-[#bdc3c7]'}`} />
          <span>{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <LucideIcons.ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.3 }}}}
            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.2 }}}}
            className="mt-1 ml-4 pl-4 border-l-2 border-[#34495e] space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Sidebar({ user, isMobileOpen, toggleMobileMenu }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  const [menuStructure, setMenuStructure] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    
    const fetchMenu = async () => {
        setLoadingMenu(true);
        try {
            const { data } = await api.get('/menu');
            setMenuStructure(data);
        } catch (error) {
            console.error("Could not fetch menu structure", error);
        } finally {
            setLoadingMenu(false);
        }
    };

    if (user?.role === 'admin' || user?.role === 'user') {
        fetchMenu();
    } else {
        setLoadingMenu(false);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const dynamicMenu = () => {
    if (loadingMenu) return <div className="p-4 text-center text-sm text-gray-400">Loading Menu...</div>;

    const userPermissions = user?.permissions || [];
    
    const parentItems = menuStructure
      .filter(item => !item.parent && userPermissions.includes(item.permission))
      .sort((a, b) => a.order - b.order);

    return (
      <div className="space-y-1">
        {parentItems.map(item => {
          const childItems = menuStructure
            .filter(child => child.parent === item._id && userPermissions.includes(child.permission))
            .sort((a, b) => a.order - b.order);
          
          const IconComponent = (props) => <DynamicIcon name={item.icon} {...props} />;

          if (childItems.length > 0) {
            return (
              <CollapsibleMenu key={item._id} title={item.title} icon={IconComponent} collapsed={collapsed}>
                {childItems.map(child => {
                  const ChildIconComponent = (props) => <DynamicIcon name={child.icon} {...props} />;
                  return (
                    <SidebarLink key={child._id} to={child.path} icon={ChildIconComponent} collapsed={collapsed}>
                      {child.title}
                    </SidebarLink>
                  )
                })}
              </CollapsibleMenu>
            );
          } else if (item.path) {
            return (
              <SidebarLink key={item._id} to={item.path} icon={IconComponent} collapsed={collapsed}>
                {item.title}
              </SidebarLink>
            );
          }
          return null;
        })}
      </div>
    );
  };
  
  const superAdminMenu = (
    <>
      <div className="space-y-1">
        {!collapsed && <p className="px-4 text-xs font-semibold text-[#7f8c8d] uppercase tracking-wider mb-2">Overview</p>}
        <SidebarLink to="/dashboard" icon={LucideIcons.Home} exact collapsed={collapsed}>Overview</SidebarLink>
        <SidebarLink to="/analytics" icon={LucideIcons.BarChart2} collapsed={collapsed}>Analytics & Revenue</SidebarLink>
      </div>
      
      <div className="space-y-1">
        {!collapsed && <p className="px-4 text-xs font-semibold text-[#7f8c8d] uppercase tracking-wider mb-2 mt-4">Management</p>}
        <CollapsibleMenu icon={LucideIcons.Shield} title="Admin & User" collapsed={collapsed} defaultOpen>
          <SidebarLink to="/superadmin/manage-users" icon={LucideIcons.UserPlus} collapsed={collapsed}>Manage Admins/Users</SidebarLink>
          <SidebarLink to="/superadmin/roles" icon={LucideIcons.Shield} collapsed={collapsed}>Role Management</SidebarLink>
          <SidebarLink to="/superadmin/activity-logs" icon={LucideIcons.Activity} collapsed={collapsed}>Activity Logs</SidebarLink>
        </CollapsibleMenu>
        <CollapsibleMenu icon={LucideIcons.CreditCard} title="Subscription & Plans" collapsed={collapsed}>
          <SidebarLink to="/superadmin/plans" icon={LucideIcons.ListOrdered} collapsed={collapsed}>Plans Management</SidebarLink>
          <SidebarLink to="/superadmin/subscriptions" icon={LucideIcons.Users} collapsed={collapsed}>Client Subscriptions</SidebarLink>
        </CollapsibleMenu>
        <CollapsibleMenu icon={LucideIcons.MessageSquare} title="Communication" collapsed={collapsed}>
          <SidebarLink to="/superadmin/email" icon={LucideIcons.Mail} collapsed={collapsed}>Email Management</SidebarLink>
          <SidebarLink to="/superadmin/broadcasts" icon={LucideIcons.Mail} collapsed={collapsed}>Email Campaigns</SidebarLink>
          <SidebarLink to="/superadmin/notifications" icon={LucideIcons.Bell} collapsed={collapsed}>Notifications</SidebarLink>
        </CollapsibleMenu>
        <CollapsibleMenu icon={LucideIcons.FileText} title="Invoice" collapsed={collapsed}>
           <SidebarLink to="/superadmin/invoices" icon={LucideIcons.FileText} collapsed={collapsed}>Invoices Management</SidebarLink>
           <SidebarLink to="/superadmin/payments" icon={LucideIcons.DollarSign} collapsed={collapsed}>Payments Status</SidebarLink>
        </CollapsibleMenu>
      </div>
      
      <div className="space-y-1">
        {!collapsed && <p className="px-4 text-xs font-semibold text-[#7f8c8d] uppercase tracking-wider mb-2 mt-4">Configuration</p>}
        <CollapsibleMenu icon={LucideIcons.Menu} title="Menu & Features" collapsed={collapsed}>
          <SidebarLink to="/superadmin/menu-config" icon={LucideIcons.Menu} collapsed={collapsed}>Menu Configurations</SidebarLink>
          <SidebarLink to="/superadmin/feature-toggle" icon={LucideIcons.SlidersHorizontal} collapsed={collapsed}>Plan-Based Menu Toggle</SidebarLink>
        </CollapsibleMenu>
        <CollapsibleMenu icon={LucideIcons.Briefcase} title="Business Management" collapsed={collapsed}>
          <SidebarLink to="/superadmin/industry-templates" icon={LucideIcons.FileCog} collapsed={collapsed}>Industry Templates</SidebarLink>
          <SidebarLink to="/superadmin/multi-business" icon={LucideIcons.Building} collapsed={collapsed}>Multi-Business Support</SidebarLink>
        </CollapsibleMenu>
        <SidebarLink to="/superadmin/system-configure" icon={LucideIcons.Settings} collapsed={collapsed}>System Configuration</SidebarLink>
        <SidebarLink to="/superadmin/api-webhooks" icon={LucideIcons.FileJson} collapsed={collapsed}>API & Webhooks</SidebarLink>
      </div>

       <div className="space-y-1">
        {!collapsed && <p className="px-4 text-xs font-semibold text-[#7f8c8d] uppercase tracking-wider mb-2 mt-4">System Health</p>}
        <CollapsibleMenu icon={LucideIcons.FileClock} title="Audit & System Logs" collapsed={collapsed}>
            <SidebarLink to="/superadmin/login-logs" icon={LucideIcons.Clock} collapsed={collapsed}>Login Attempts</SidebarLink>
            <SidebarLink to="/superadmin/api-logs" icon={LucideIcons.FileJson} collapsed={collapsed}>API Usage</SidebarLink>
            <SidebarLink to="/superadmin/error-logs" icon={LucideIcons.AlertTriangle} collapsed={collapsed}>Error Tracking</SidebarLink>
        </CollapsibleMenu>
         <CollapsibleMenu icon={LucideIcons.HardDrive} title="Backup & Restore" collapsed={collapsed}>
            <SidebarLink to="/superadmin/backup" icon={LucideIcons.RefreshCw} collapsed={collapsed}>Manual Backup</SidebarLink>
            <SidebarLink to="/superadmin/restore" icon={LucideIcons.Database} collapsed={collapsed}>Restore Data</SidebarLink>
        </CollapsibleMenu>
        <SidebarLink to="/superadmin/monitoring" icon={LucideIcons.Server} collapsed={collapsed}>Error & Performance</SidebarLink>
      </div>
    </>
  );

  const renderMenu = () => {
    switch (user?.role) {
      case 'superadmin': return superAdminMenu;
      case 'admin': return dynamicMenu();
      case 'user': return dynamicMenu();
      default: return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: collapsed && isDesktop ? '5rem' : '18rem',
          x: isDesktop ? 0 : (isMobileOpen ? 0 : '-100%'),
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed lg:relative z-30 flex-shrink-0 bg-[#2c3e50] text-white flex flex-col p-4 h-full overflow-y-auto hide-scrollbar`}
      >
        <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#34495e] flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-md font-bold truncate">{user?.name}</h1>
                <p className="text-xs text-[#bdc3c7] capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => isDesktop ? setCollapsed(!collapsed) : toggleMobileMenu()}
            className="p-1 rounded-md hover:bg-[#34495e] hidden lg:block"
          >
            {collapsed ? <LucideIcons.ChevronRight className="w-5 h-5" /> : <LucideIcons.ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-grow space-y-2 overflow-y-auto hide-scrollbar">
          {renderMenu()}
        </nav>

        <div className="mt-auto pt-4 border-t border-[#34495e] space-y-2">
          <CollapsibleMenu icon={LucideIcons.HelpCircle} title="Support" collapsed={collapsed}>
             <SidebarLink to="/help" icon={LucideIcons.HelpCircle} collapsed={collapsed}>Help Center</SidebarLink>
            {user?.role !== 'superadmin' && (
              <SidebarLink to="/tickets" icon={LucideIcons.MessageSquare} collapsed={collapsed}>Raise a Ticket</SidebarLink>
            )}
          </CollapsibleMenu>
          <SidebarLink to="/settings" icon={LucideIcons.Settings} collapsed={collapsed}>Settings</SidebarLink>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-medium rounded-lg text-[#bdc3c7] hover:bg-[#34495e] hover:text-white transition-colors duration-200`}
          >
            <LucideIcons.LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </motion.aside>
      <style jsx global>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </>
  );
}
