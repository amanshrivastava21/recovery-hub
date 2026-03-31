import {
  LayoutDashboard, Users, UserCog, Stethoscope, Pill, FileText,
  ClipboardList, LogOut, Heart, Shield,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const allNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'worker', 'staff'] },
  { title: 'My Dashboard', url: '/patient-dashboard', icon: Heart, roles: ['patient'] },
  { title: 'Patients', url: '/patients', icon: Users, roles: ['admin', 'staff', 'worker'] },
  { title: 'Workers', url: '/workers', icon: UserCog, roles: ['admin'] },
  { title: 'Staff', url: '/staff', icon: Stethoscope, roles: ['admin'] },
  { title: 'Medicines', url: '/medicines', icon: Pill, roles: ['admin', 'staff'] },
  { title: 'Visits', url: '/visits', icon: ClipboardList, roles: ['admin', 'worker'] },
  { title: 'Reports', url: '/reports', icon: FileText, roles: ['admin'] },
  { title: 'Users', url: '/users', icon: Shield, roles: ['admin'] },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shrink-0">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="font-display text-base font-bold text-sidebar-foreground">
                  RCMS
                </span>
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar p-2">
        {!collapsed && user && (
          <div className="mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="text-xs font-medium text-sidebar-accent-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
