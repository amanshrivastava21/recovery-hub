import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="text-muted-foreground" />

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search patients, staff..."
                  className="w-full rounded-lg border bg-muted/50 py-1.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                    <span className="text-sm font-medium">New patient admitted</span>
                    <span className="text-xs text-muted-foreground">Omar Farooq — 2 hours ago</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                    <span className="text-sm font-medium">Low stock alert</span>
                    <span className="text-xs text-muted-foreground">Acamprosate — 45 units remaining</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                    <span className="text-sm font-medium">Visit logged</span>
                    <span className="text-xs text-muted-foreground">Ahmed Khan by John Worker — Today</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
