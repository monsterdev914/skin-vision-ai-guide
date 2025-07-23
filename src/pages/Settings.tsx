import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Smartphone, 
  Globe,
  Trash2,
  Download,
  Loader2,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Crown,
  Zap
} from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useToast } from "@/hooks/use-toast";
import { settingsService, UserSettings, DataUsage } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import SubscriptionManagement from "@/components/SubscriptionManagement";
import { motion, AnimatePresence } from "framer-motion";
import Ripple from "@/components/ui/ripple";

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [dataUsage, setDataUsage] = useState<DataUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load settings and data usage on component mount
  useEffect(() => {
    loadSettings();
    loadDataUsage();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await settingsService.getSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      toast({
        title: "Error Loading Settings",
        description: error.message || "Failed to load settings data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataUsage = async () => {
    try {
      const response = await settingsService.getDataUsage();
      
      if (response.success && response.data) {
        setDataUsage(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load data usage:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const response = await settingsService.updateSettings(settings);
      
      if (response.success) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been successfully updated.",
        });
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      setIsResetting(true);
      const response = await settingsService.resetSettings();
      
      if (response.success) {
        setSettings(response.data);
        toast({
          title: "Settings Reset",
          description: "Your settings have been reset to defaults.",
        });
      }
    } catch (error: any) {
      console.error('Failed to reset settings:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset settings",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      const csvData = await settingsService.exportData();
      
      // Create blob from CSV data
      const blob = new Blob([csvData], { type: 'text/csv' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `skinny-ai-data-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data Exported",
        description: "Your data has been exported as CSV successfully.",
      });
    } catch (error: any) {
      console.error('Failed to export data:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Password Required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await settingsService.deleteAccount(deletePassword);
      
      if (response.success) {
        toast({
          title: "Account Deleted",
          description: "Your account and all associated data have been permanently deleted.",
        });
        
        // Clear local storage and redirect to home
        localStorage.clear();
        navigate('/');
      }
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast({
        title: "Account Deletion Failed",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletePassword("");
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          className="flex items-center space-x-3"
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
          <span className="text-lg text-gray-700 font-medium">Loading settings...</span>
        </motion.div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-600 mb-4 text-lg">Failed to load settings</p>
          <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
            <Button onClick={loadSettings} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Retry
            </Button>
          </Ripple>
        </motion.div>
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  <SettingsIcon className="w-10 h-10 text-yellow-300" />
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white">
                  Settings
                </h1>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </motion.div>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Manage your account preferences and customize your SkinnyAI experience
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Account Settings */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <SettingsIcon className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                    Account Settings
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Update your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => updateSetting('language', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish (Español)</SelectItem>
                        <SelectItem value="fr">French (Français)</SelectItem>
                        <SelectItem value="de">German (Deutsch)</SelectItem>
                        <SelectItem value="zh">Chinese (中文)</SelectItem>
                        <SelectItem value="ja">Japanese (日本語)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={settings.timezone} 
                      onValueChange={(value) => updateSetting('timezone', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value) => updateSetting('theme', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={settings.dateFormat} 
                      onValueChange={(value) => updateSetting('dateFormat', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  >
                    <Bell className="w-6 h-6 text-green-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                    Notifications
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analysis Complete</Label>
                    <p className="text-sm text-gray-500">Get notified when your skin analysis is ready</p>
                  </div>
                  <Switch
                    checked={settings.notifications.analysisComplete}
                    onCheckedChange={(checked) => 
                      updateSetting('notifications.analysisComplete', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Treatment Reminders</Label>
                    <p className="text-sm text-gray-500">Reminders for your skincare routine</p>
                  </div>
                  <Switch
                    checked={settings.notifications.treatmentReminders}
                    onCheckedChange={(checked) => 
                      updateSetting('notifications.treatmentReminders', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Weekly progress summaries</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      updateSetting('notifications.weeklyReports', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Tips, news, and product updates</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => 
                      updateSetting('notifications.marketingEmails', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Mobile and desktop push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      updateSetting('notifications.pushNotifications', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Shield className="w-6 h-6 text-purple-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                    Privacy & Security
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Control your privacy settings and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-gray-500">Control who can see your profile</p>
                  </div>
                  <Select 
                    value={settings.privacy.profileVisibility} 
                    onValueChange={(value) => updateSetting('privacy.profileVisibility', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-gray-500">Allow anonymous data sharing for research</p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => 
                      updateSetting('privacy.dataSharing', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-gray-500">Help us improve by sharing usage analytics</p>
                  </div>
                  <Switch
                    checked={settings.privacy.analyticsTracking}
                    onCheckedChange={(checked) => 
                      updateSetting('privacy.analyticsTracking', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                  </div>
                  <Switch
                    checked={settings.privacy.marketingCommunications}
                    onCheckedChange={(checked) => 
                      updateSetting('privacy.marketingCommunications', checked)
                    }
                  />
                </div>
                <Separator />
                <div>
                  <Label>Security Actions</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <Ripple color="rgba(147, 51, 234, 0.2)" className="rounded-lg">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/profile')}
                        className="w-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </Ripple>
                    <Button variant="outline" size="sm" disabled className="border-2 border-gray-200">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Two-Factor Auth
                      <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Preferences */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <Eye className="w-6 h-6 text-orange-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
                    Analysis Preferences
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Customize your skin analysis defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skinType">Default Skin Type</Label>
                    <Select 
                      value={settings.analysisDefaults.skinType || ""} 
                      onValueChange={(value) => updateSetting('analysisDefaults.skinType', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select skin type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oily">Oily</SelectItem>
                        <SelectItem value="dry">Dry</SelectItem>
                        <SelectItem value="combination">Combination</SelectItem>
                        <SelectItem value="sensitive">Sensitive</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Advanced Analysis</Label>
                    <p className="text-sm text-gray-500">Include detailed feature detection and coordinates</p>
                  </div>
                  <Switch
                    checked={settings.analysisDefaults.includeAdvancedAnalysis}
                    onCheckedChange={(checked) => 
                      updateSetting('analysisDefaults.includeAdvancedAnalysis', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Save Results</Label>
                    <p className="text-sm text-gray-500">Automatically save analysis results to history</p>
                  </div>
                  <Switch
                    checked={settings.analysisDefaults.autoSaveResults}
                    onCheckedChange={(checked) => 
                      updateSetting('analysisDefaults.autoSaveResults', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Management */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <SubscriptionManagement />
          </motion.div>

          {/* Data Management */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Download className="w-6 h-6 text-red-600" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent font-bold">
                    Data Management
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your data and account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataUsage && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Data Usage</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total analyses:</span>
                        <span className="font-medium ml-2">{dataUsage.totalAnalyses}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Storage used:</span>
                        <span className="font-medium ml-2">{formatBytes(dataUsage.estimatedTotalSize)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Export Data (CSV)
                    </Button>
                  </Ripple>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Ripple color="rgba(239, 68, 68, 0.2)" className="rounded-lg">
                        <Button variant="destructive" size="sm" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </Ripple>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="my-4">
                        <Label htmlFor="delete-password">Enter your password to confirm:</Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Your password"
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletePassword("")}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || !deletePassword}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <p className="text-sm text-gray-500">
                  Export your data as CSV file or permanently delete your account and all associated data.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Changes */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Ripple color="rgba(99, 102, 241, 0.2)" className="rounded-lg">
              <Button 
                variant="outline"
                onClick={handleResetSettings}
                disabled={isResetting}
                className="w-full sm:w-auto border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </>
                )}
              </Button>
            </Ripple>
            
            <Ripple color="rgba(255, 255, 255, 0.3)" className="rounded-lg">
              <Button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </Ripple>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings; 