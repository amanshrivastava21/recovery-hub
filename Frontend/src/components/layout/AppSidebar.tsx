// import {
//   LayoutDashboard, Users, UserCog, Stethoscope, Pill, FileText,
//   ClipboardList, LogOut, Heart, Shield, BarChart3, CheckCircle, Pill as PillIcon, Calendar, Settings,
// } from 'lucide-react';
// import { NavLink } from '@/components/NavLink';
// import { useAuth } from '@/contexts/AuthContext';
// import {
//   Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
//   SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
//   SidebarFooter, useSidebar,
// } from '@/components/ui/sidebar';

// const allNavItems = [
//   { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'worker', 'staff'] },
//   { title: 'My Dashboard', url: '/patient-dashboard', icon: Heart, roles: ['patient'] },
//   { title: 'Patients', url: '/patients', icon: Users, roles: ['admin', 'staff', 'worker'] },
//   { title: 'Workers', url: '/workers', icon: UserCog, roles: ['admin'] },
//   { title: 'Staff', url: '/staff', icon: Stethoscope, roles: ['admin'] },
//   { title: 'Medicines', url: '/medicines', icon: Pill, roles: ['admin', 'staff'] },
//   { title: 'Visits', url: '/visits', icon: ClipboardList, roles: ['admin', 'worker'] },
//   { title: 'Discharge Records', url: '/discharge', icon: CheckCircle, roles: ['admin', 'staff'] },
//   { title: 'Treatment Plans', url: '/treatment-plans', icon: PillIcon, roles: ['admin', 'staff'] },
//   { title: 'Attendance', url: '/attendance', icon: Calendar, roles: ['admin'] },
//   { title: 'System Settings', url: '/system-settings', icon: Settings, roles: ['admin'] },
//   { title: 'Reports', url: '/reports', icon: FileText, roles: ['admin'] },
//   { title: 'Users', url: '/users', icon: Shield, roles: ['admin'] },
// ];

// export function AppSidebar() {
//   const { user, logout } = useAuth();
//   const { state } = useSidebar();
//   const collapsed = state === 'collapsed';

//   const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

//   return (
//     <Sidebar collapsible="icon" className="border-r-0">
//       <SidebarContent className="bg-sidebar">
//         <SidebarGroup>
//           <SidebarGroupLabel className="px-4 py-6">
//             <div className="flex items-center gap-2">
//               <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shrink-0">
//                 <Heart className="h-4 w-4 text-primary-foreground" />
//               </div>
//               {!collapsed && (
//                 <span className="font-display text-base font-bold text-sidebar-foreground">
//                   RCMS
//                 </span>
//               )}
//             </div>
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu className="space-y-1 px-2">
//               {navItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <NavLink
//                       to={item.url}
//                       end={item.url === '/dashboard'}
//                       className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//                       activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
//                     >
//                       <item.icon className="h-4 w-4 shrink-0" />
//                       {!collapsed && <span>{item.title}</span>}
//                     </NavLink>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//       <SidebarFooter className="bg-sidebar p-2">
//         {!collapsed && user && (
//           <div className="mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
//             <p className="text-xs font-medium text-sidebar-accent-foreground">{user.name}</p>
//             <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
//           </div>
//         )}
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               onClick={logout}
//               className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
//             >
//               <LogOut className="h-4 w-4 shrink-0" />
//               {!collapsed && <span>Logout</span>}
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }



import {
  LayoutDashboard, Users, UserCog, Stethoscope, Pill, FileText,
  ClipboardList, LogOut, Heart, Shield, CheckCircle,
  Pill as PillIcon, Calendar, Settings, Megaphone, FilePenLine
} from 'lucide-react';

import { NavLink } from "../NavLink";
import { useAuth } from '@/contexts/AuthContext';

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';


const allNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard,
    roles: ['admin', 'worker', 'staff'],
    staffRoles: ['doctor', 'nurse', 'counselor', 'therapist', 'receptionist', 'compounder'] },

  { title: 'My Dashboard', url: '/patient-dashboard', icon: Heart,
    roles: ['patient'], staffRoles: [] },

  { title: 'Patients', url: '/patients', icon: Users,
    roles: ['admin', 'worker', 'staff'],
    staffRoles: [] },

  { title: 'Treatment Plans', url: '/treatment-plans', icon: PillIcon,
    roles: ['admin', 'staff', 'doctor', 'nurse', 'counselor', 'therapist'],
    staffRoles: ['doctor', 'nurse', 'counselor', 'therapist'] },

  { title: 'Progress Notes', url: '/progress-notes', icon: FilePenLine,
    roles: ['admin', 'worker', 'staff', 'doctor', 'nurse', 'counselor', 'therapist'],
    staffRoles: ['doctor', 'nurse', 'counselor', 'therapist'] },

  { title: 'Treatment Plan', url: '/patient-treatment-plan', icon: PillIcon,
    roles: ['patient'], staffRoles: [] },

  { title: 'Progress Notes', url: '/patient-progress-notes', icon: ClipboardList,
    roles: ['patient'], staffRoles: [] },

  { title: 'Workers', url: '/workers', icon: UserCog,
    roles: ['admin'], staffRoles: [] },

  { title: 'Staff', url: '/staff', icon: Stethoscope,
    roles: ['admin'], staffRoles: [] },

  { title: 'Medicines', url: '/medicines', icon: Pill,
    roles: ['admin'],
    staffRoles: ['doctor', 'nurse', 'compounder'] },

  { title: 'Visits', url: '/visits', icon: ClipboardList,
    roles: ['admin', 'worker'],
    staffRoles: ['doctor', 'nurse', 'counselor', 'therapist', 'receptionist'] },

  { title: 'Campaigns', url: '/campaigns', icon: Megaphone,
    roles: ['admin', 'worker'],
    staffRoles: [] },

  { title: 'Discharge Records', url: '/discharge', icon: CheckCircle,
    roles: ['admin'],
    staffRoles: ['doctor', 'nurse', 'receptionist'] },

  { title: 'Attendance', url: '/attendance', icon: Calendar,
    roles: ['admin'], staffRoles: [] },

  { title: 'System Settings', url: '/system-settings', icon: Settings,
    roles: ['admin'], staffRoles: [] },

  { title: 'Reports', url: '/reports', icon: FileText,
    roles: ['admin'],
    staffRoles: ['doctor', 'counselor', 'therapist'] },

  { title: 'Users', url: '/users', icon: Shield,
    roles: ['admin'], staffRoles: [] },

  { title: 'My Profile', url: '/profile', icon: UserCog,
    roles: ['admin', 'staff', 'worker', 'patient'], staffRoles: [] },
];


export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navItems = allNavItems.filter((item) => {
    if (!user) return false;
    if (!item.roles.includes(user.role)) return false;

    // Staff ke liye staffRole bhi check karo
    if (user.role === 'staff' && item.staffRoles.length > 0) {
      return item.staffRoles.includes((user as any).staffRole?.toLowerCase() || '');
    }

    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r-0">

      <SidebarContent className="bg-sidebar">
        <SidebarGroup>

          {/* LOGO */}
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

          {/* MENU */}
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

      {/* FOOTER */}
      <SidebarFooter className="bg-sidebar p-2">
        {!collapsed && user && (
          <div className="mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="text-xs font-medium text-sidebar-accent-foreground">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user.role}
            </p>
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
