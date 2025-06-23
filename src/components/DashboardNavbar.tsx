import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Bell, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { userService, authService, UserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const DashboardNavbar = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getProfile();
      
      if (response.success && response.data) {
        setProfileData(response.data);
        console.log('Profile data:', response.data);
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // Don't show toast for navbar errors, just log them
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  const getInitials = () => {
    if (!profileData?.user) return 'U';
    const firstName = profileData.user.firstName || '';
    const lastName = profileData.user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!profileData?.user) return 'User';
    const firstName = profileData.user.firstName || '';
    const lastName = profileData.user.lastName || '';
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName || lastName || 'User';
  };

  const formatSubscriptionStatus = (status?: string) => {
    if (!status || status === 'canceled' || status === 'incomplete') return 'Free';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getSubscriptionBadgeColor = (status?: string) => {
    if (!status || status === 'canceled' || status === 'incomplete') {
      return 'bg-gray-500';
    }
    if (status === 'active') {
      return 'bg-gradient-to-r from-blue-600 to-blue-700';
    }
    if (status === 'trialing') {
      return 'bg-gradient-to-r from-green-600 to-green-700';
    }
    return 'bg-gradient-to-r from-yellow-600 to-yellow-700';
  };

  const alertHistory = [{
    id: 1,
    title: "Analysis Complete",
    message: "Your skin analysis for uploaded image has been completed.",
    time: "2 hours ago",
    type: "success"
  }, {
    id: 2,
    title: "Treatment Reminder",
    message: "Don't forget to apply your recommended moisturizer.",
    time: "1 day ago",
    type: "info"
  }, {
    id: 3,
    title: "Subscription Expiring",
    message: "Your Premium subscription expires in 3 days.",
    time: "2 days ago",
    type: "warning"
  }, {
    id: 4,
    title: "New Feature Available",
    message: "Try our new AR skin preview feature!",
    time: "3 days ago",
    type: "info"
  }];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative flex flex-row gap-3 items-center justify-between">
              <Logo className="w-[50px] h-[50px] text-white" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                SkinnyAI
              </span>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Subscription Badge */}
            {!isLoading && profileData && (
              <Badge className={`${getSubscriptionBadgeColor(profileData.subscription?.status)} text-white font-medium`}>
                {formatSubscriptionStatus(profileData.subscription?.status)}
              </Badge>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Alert History</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {alertHistory.map((alert, index) => (
                    <div key={alert.id}>
                      <DropdownMenuItem className="flex flex-col items-start p-4 h-auto">
                        <div className="flex items-center justify-between w-full mb-1">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <Badge 
                          variant={alert.type === 'success' ? 'default' : alert.type === 'warning' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {alert.type}
                        </Badge>
                      </DropdownMenuItem>
                      {index < alertHistory.length - 1 && <DropdownMenuSeparator />}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {isLoading ? (
                      <AvatarFallback>
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage 
                          src={profileData?.user?.avatarUrl} 
                          alt="User Avatar" 
                        />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {isLoading ? (
                        <span className="flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Loading...
                        </span>
                      ) : (
                        getDisplayName()
                      )}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isLoading ? '...' : profileData?.user?.email || 'No email'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
