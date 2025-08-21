import { 
  LayoutDashboard, BookUser, Users, TrendingUp, FileUp, Briefcase, 
  CheckSquare, UserPlus, Shield, Activity, MessageSquare, Mail, Bell, 
  DollarSign, FileSignature, ListOrdered, Repeat, CreditCard, FileText, 
  FileCog, Archive, BarChart2, FileJson
} from 'lucide-react';

// This is the master list of all possible admin menu items.
export const ADMIN_MENU_CONFIG = [
  {
    type: 'link',
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    permission: 'view_dashboard'
  },
  {
    type: 'collapsible',
    title: 'Contacts & Leads',
    icon: BookUser,
    permission: 'manage_contacts', // A parent permission to show the main category
    subItems: [
      { title: 'Manage Contacts', path: '/admin/contacts', icon: Users, permission: 'manage_contacts' },
      { title: 'Leads Management', path: '/admin/leads', icon: TrendingUp, permission: 'manage_leads' },
      { title: 'Import/Export', path: '/admin/import-export', icon: FileUp, permission: 'import_export_contacts' },
    ]
  },
  {
    type: 'collapsible',
    title: 'Projects / Services',
    icon: Briefcase,
    permission: 'manage_projects',
    subItems: [
      { title: 'Projects Management', path: '/admin/projects', icon: Briefcase, permission: 'manage_projects' },
      { title: 'Tasks & Milestones', path: '/admin/tasks', icon: CheckSquare, permission: 'manage_tasks' },
    ]
  },
  {
    type: 'collapsible',
    title: 'User & Team',
    icon: UserPlus,
    permission: 'manage_team',
    subItems: [
      { title: 'Manage Users', path: '/admin/manage-users', icon: UserPlus, permission: 'manage_team_users' },
      { title: 'Roles & Permissions', path: '/admin/roles', icon: Shield, permission: 'manage_team_roles' },
      { title: 'Activity Logs', path: '/admin/team-activity', icon: Activity, permission: 'view_team_activity' },
    ]
  },
  {
    type: 'collapsible',
    title: 'Communication',
    icon: MessageSquare,
    permission: 'manage_communication',
    subItems: [
      { title: 'Email Management', path: '/admin/email', icon: Mail, permission: 'manage_email' },
      { title: 'Notifications', path: '/admin/notifications', icon: Bell, permission: 'manage_notifications' },
    ]
  },
  {
    type: 'collapsible',
    title: 'Sales & Orders',
    icon: DollarSign,
    permission: 'manage_sales',
    subItems: [
      { title: 'Quotations/Estimates', path: '/admin/quotations', icon: FileSignature, permission: 'manage_quotations' },
      { title: 'Order Management', path: '/admin/orders', icon: ListOrdered, permission: 'manage_orders' },
      { title: 'Renewals', path: '/admin/subscriptions', icon: Repeat, permission: 'manage_subscriptions' },
    ]
  },
  {
    type: 'collapsible',
    title: 'Finance',
    icon: CreditCard,
    permission: 'manage_finance',
    subItems: [
      { title: 'Invoices', path: '/admin/invoices', icon: FileText, permission: 'manage_invoices' },
      { title: 'Payments Tracking', path: '/admin/payments', icon: DollarSign, permission: 'track_payments' },
      { title: 'Expense Tracking', path: '/admin/expenses', icon: CreditCard, permission: 'track_expenses' },
    ]
  },
  {
    type: 'collapsible',
    title: 'Business Tools',
    icon: Briefcase,
    permission: 'access_business_tools',
    subItems: [
      { title: 'Templates Library', path: '/admin/templates', icon: FileCog, permission: 'manage_templates' },
      { title: 'Document Management', path: '/admin/documents', icon: Archive, permission: 'manage_documents' },
    ]
  },
  {
    type: 'link',
    title: 'Reports & Analytics',
    icon: BarChart2,
    path: '/admin/reports',
    permission: 'view_reports'
  },
  {
    type: 'link',
    title: 'API & Integrations',
    icon: FileJson,
    path: '/admin/integrations',
    permission: 'manage_integrations'
  },
];

// This creates a simple list of all possible permission strings
// to be used on the Role Management page.
export const ALL_PERMISSIONS = ADMIN_MENU_CONFIG.flatMap(item => 
  item.type === 'link' 
    ? [item.permission] 
    : [item.permission, ...item.subItems.map(sub => sub.permission)]
).filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
