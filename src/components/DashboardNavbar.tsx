import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";

const DashboardNavbar = () => {
  const alertHistory = [
    {
      id: 1,
      title: "Analysis Complete",
      message: "Your skin analysis for uploaded image has been completed.",
      time: "2 hours ago",
      type: "success"
    },
    {
      id: 2,
      title: "Treatment Reminder",
      message: "Don't forget to apply your recommended moisturizer.",
      time: "1 day ago",
      type: "info"
    },
    {
      id: 3,
      title: "Subscription Expiring",
      message: "Your Premium subscription expires in 3 days.",
      time: "2 days ago",
      type: "warning"
    },
    {
      id: 4,
      title: "New Feature Available",
      message: "Try our new AR skin preview feature!",
      time: "3 days ago",
      type: "info"
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <Logo className="w-10 h-10 text-red-600" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              SkinnyAI
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Subscription Badge */}
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white font-medium">
              Premium
            </Badge>

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
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john@example.com
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
                <DropdownMenuItem>
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
