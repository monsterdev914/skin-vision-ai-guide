import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Bell, Loader2, X, Check, Crown, Camera, History, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { userService, authService, UserProfile, notificationsService, Notification } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Ripple from "@/components/ui/ripple";

const DashboardNavbar = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Load profile data and notifications on component mount
  useEffect(() => {
    loadProfile();
    loadNotifications();
    loadUnreadCount();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  const loadNotifications = async () => {
    try {
      setIsNotificationsLoading(true);
      const response = await notificationsService.getNotifications(10); // Get last 10 notifications

      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsService.getUnreadCount();

      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error: any) {
      console.error('Failed to load unread count:', error);
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

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      toast({
        title: "All notifications marked as read",
        description: "All your notifications have been marked as read.",
      });
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotification(id);
      const deletedNotification = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 relative z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative flex flex-row gap-3 items-center justify-between">
                <Logo className="w-[50px] h-[50px] text-white" />
                <motion.span
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  SkinnyAI
                </motion.span>
              </div>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            className="hidden md:flex items-center space-x-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Ripple
                color={location.pathname === '/analysis' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.2)'}
                className="rounded-lg"
              >
                <Button
                  variant={location.pathname === '/analysis' ? 'default' : 'ghost'}
                  asChild
                  className="flex items-center space-x-2 w-full"
                >
                  <Link to="/analysis">
                    <motion.div
                      animate={location.pathname === '/analysis' ? { y: [0, -3, 0] } : {}}
                      transition={{ duration: 1, repeat: location.pathname === '/analysis' ? Infinity : 0, repeatDelay: 1 }}
                    >
                      <Camera className="w-4 h-4" />
                    </motion.div>
                    <span>Analysis</span>
                  </Link>
                </Button>
              </Ripple>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Ripple
                color={location.pathname === '/history' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.2)'}
                className="rounded-lg"
              >
                <Button
                  variant={location.pathname === '/history' ? 'default' : 'ghost'}
                  asChild
                  className="flex items-center space-x-2 w-full"
                >
                  <Link to="/history">
                    <motion.div
                      animate={location.pathname === '/history' ? { rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 2, repeat: location.pathname === '/history' ? Infinity : 0, repeatDelay: 1 }}
                    >
                      <History className="w-4 h-4" />
                    </motion.div>
                    <span>History</span>
                  </Link>
                </Button>
              </Ripple>
            </motion.div>
          </motion.div>

          {/* Mobile menu button */}
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </motion.div>
              </Button>
            </Ripple>
          </motion.div>

          {/* Right side */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Subscription Badge - Hidden on small screens */}
            {!isLoading && profileData && (
              <Badge className={`hidden sm:inline-flex ${getSubscriptionBadgeColor(profileData.subscription?.status)} text-white font-medium`}>
                {formatSubscriptionStatus(profileData.subscription?.status)}
              </Badge>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 sm:w-96" align="end">
                <div className="flex items-center justify-between p-2">
                  <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="h-8 text-xs"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {isNotificationsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div key={notification._id}>
                        <DropdownMenuItem
                          className={`flex flex-col items-start p-3 h-auto cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between w-full mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} truncate`}>
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 break-words line-clamp-2 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant={getBadgeVariant(notification.type)}
                                  className="text-xs"
                                >
                                  {notification.type}
                                </Badge>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {notification.timeAgo}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification._id);
                              }}
                              className="ml-2 h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </DropdownMenuItem>
                        {index < notifications.length - 1 && <DropdownMenuSeparator />}
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-blue-50 transition-colors">
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
                  <Link to="/pricing">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
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

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? "auto" : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden bg-white border-b border-gray-200 overflow-hidden relative z-50"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: isMobileMenuOpen ? 0 : -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="px-4 py-4 space-y-3"
        >
          {/* Mobile Navigation Links */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: isMobileMenuOpen ? 1 : 0,
              x: isMobileMenuOpen ? 0 : -20
            }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Ripple
              color={location.pathname === '/analysis' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}
              className="rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link
                to="/analysis"
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/analysis'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <motion.div
                  animate={location.pathname === '/analysis' ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 1, repeat: location.pathname === '/analysis' ? Infinity : 0, repeatDelay: 1 }}
                >
                  <Camera className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">Analysis</span>
              </Link>
            </Ripple>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: isMobileMenuOpen ? 1 : 0,
              x: isMobileMenuOpen ? 0 : -20
            }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Ripple
              color={location.pathname === '/history' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}
              className="rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link
                to="/history"
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${location.pathname === '/history'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <motion.div
                  animate={location.pathname === '/history' ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 2, repeat: location.pathname === '/history' ? Infinity : 0, repeatDelay: 1 }}
                >
                  <History className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">History</span>
              </Link>
            </Ripple>
          </motion.div>

          {/* Mobile Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isMobileMenuOpen ? 1 : 0,
              y: isMobileMenuOpen ? 0 : 20
            }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="pt-3 border-t border-gray-100"
          >
            <div className="space-y-2">
              <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
              </Ripple>
              <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                <Link
                  to="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </Ripple>
              <Ripple
                color="rgba(239, 68, 68, 0.2)"
                className="rounded-lg"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <button className="flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log out</span>
                </button>
              </Ripple>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default DashboardNavbar;
