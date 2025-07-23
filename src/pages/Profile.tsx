import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar as CalendarIcon, Camera, Settings, Shield, Loader2, Sparkles, Crown, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { userService, UserProfile } from "@/lib/api";
import { motion } from "framer-motion";
import Ripple from "@/components/ui/ripple";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    birth: null as Date | null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        const user = response.data.user;
        
        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          birth: user.birth ? new Date(user.birth) : null,
        });
        
        setProfileImage(user.avatarUrl || null);
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error Loading Profile",
        description: error.message || "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        birth: profile.birth?.toISOString(),
      };

      console.log('Sending update data:', updateData);
      const response = await userService.updateProfile(updateData);
      console.log('Update response:', response);
      
      if (response.success) {
        setIsEditing(false);
        setProfileData(response.data);
        
        // Update form state with the latest data from server
        const user = response.data.user;
        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          birth: user.birth ? new Date(user.birth) : null,
        });
        
        // Update avatar if it exists
        setProfileImage(user.avatarUrl || null);
        
        console.log('Profile data updated:', response.data);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        console.error('Update failed:', response);
        toast({
          title: "Update Failed",
          description: response.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setProfile(prev => ({ ...prev, birth: date || null }));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await userService.uploadAvatar(file);
      
      if (response.success && response.data) {
        setProfileImage(response.data.avatarUrl);
        toast({
          title: "Photo Updated",
          description: "Your profile photo has been updated successfully.",
        });
        // Reload profile to get updated data
        await loadProfile();
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAccountSettings = () => {
    navigate('/settings');
  };

  const handlePasswordChange = async () => {
    try {
      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Please fill in all password fields.",
          variant: "destructive",
        });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "New password and confirmation do not match.",
          variant: "destructive",
        });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast({
          title: "Password Too Short",
          description: "New password must be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }

      setIsChangingPassword(true);
      
      const response = await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (response.success) {
        // Reset password form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        toast({
          title: "Password Changed",
          description: "Your password has been successfully updated.",
        });
      }
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    const firstName = profile.firstName || '';
    const lastName = profile.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const formatSubscriptionStatus = (status?: string) => {
    if (!status) return 'Free';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatMemberSince = (date: string) => {
    return format(new Date(date), 'MMM yyyy');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="flex items-center justify-center h-64"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-blue-600" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 mb-4">Failed to load profile data</p>
            <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
              <Button onClick={loadProfile} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Try Again
              </Button>
            </Ripple>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardNavbar />
      
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  <User className="w-10 h-10 text-yellow-300" />
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white">
                  User Profile
                </h1>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Crown className="w-8 h-8 text-yellow-300" />
                </motion.div>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Manage your personal information and customize your skin analysis experience
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3 text-xl">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <User className="w-6 h-6 text-blue-600" />
                        </motion.div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                          Personal Information
                        </span>
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Update your personal details and contact information
                      </CardDescription>
                    </div>
                    <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                      <Button 
                        variant={isEditing ? "default" : "outline"}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        disabled={isSaving}
                        className={isEditing ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          isEditing ? "Save Changes" : "Edit Profile"
                        )}
                      </Button>
                    </Ripple>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !profile.birth && "text-muted-foreground"
                          )}
                          disabled={!isEditing}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profile.birth ? (
                            format(profile.birth, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={profile.birth || undefined}
                          onSelect={handleDateChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Change Password */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Shield className="w-6 h-6 text-purple-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                      Change Password
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Ripple color="rgba(147, 51, 234, 0.2)" className="rounded-lg">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </Ripple>
              </CardContent>
            </Card>
          </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Profile Picture */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                    >
                      <Camera className="w-6 h-6 text-indigo-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                      Profile Picture
                    </span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileImage || undefined} alt="Profile" />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Ripple color="rgba(99, 102, 241, 0.2)" className="rounded-lg">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={triggerFileInput}
                    className="border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                </Ripple>
                <p className="text-xs text-gray-500 text-center">
                  JPG, PNG or WebP. Max size 5MB.
                </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Status */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Star className="w-6 h-6 text-green-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                      Account Status
                    </span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subscription</span>
                  <Badge className={profileData.subscription?.status === 'active' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                    : 'bg-gray-500'
                  }>
                    {formatSubscriptionStatus(profileData.subscription?.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">
                    {formatMemberSince(profileData.usage.memberSince)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Analyses</span>
                  <span className="text-sm font-medium">
                    {profileData.usage.totalAnalyses}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium">
                    {profileData.usage.thisMonthAnalyses}
                  </span>
                </div>
                <Separator />
                <Ripple color="rgba(34, 197, 94, 0.2)" className="rounded-lg">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50" 
                    onClick={handleAccountSettings}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                </Ripple>
                </CardContent>
              </Card>
            </motion.div>


          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
