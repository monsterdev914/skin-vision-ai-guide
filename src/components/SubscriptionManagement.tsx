import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subscriptionService, planService } from '@/lib/api';
import { CheckCircle, XCircle, Calendar, CreditCard, AlertTriangle, Star, Crown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import PaymentMethodManager from './PaymentMethodManager';

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  features: Array<{
    name: string;
    included: boolean;
    limit?: number;
  }>;
  isActive: boolean;
  formattedPrice: string;
}

interface Subscription {
  _id: string;
  planId: Plan;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  startedAt: string;
  trialStart?: string;
  trialEnd?: string;
  billingCycle: 'monthly' | 'yearly';
}

const SubscriptionManagement: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [preview, setPreview] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionResponse, plansResponse] = await Promise.all([
        subscriptionService.getCurrent(),
        planService.getPlans()
      ]);

      if (subscriptionResponse.success) {
        setSubscription(subscriptionResponse.data.subscription);
      }

      if (plansResponse.success) {
        setPlans(plansResponse.data.plans);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async () => {
    if (!subscription || !selectedPlan) return;

    try {
      setActionLoading(true);
      
      const response = await subscriptionService.update(subscription._id, {
        planId: selectedPlan,
        billingCycle: selectedCycle
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Subscription updated successfully"
        });
        setShowPlanChange(false);
        loadData();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (immediate: boolean = false) => {
    if (!subscription) return;

    try {
      setActionLoading(true);
      
      const response = await subscriptionService.cancel(subscription._id, !immediate);

      if (response.success) {
        toast({
          title: "Success",
          description: immediate ? "Subscription cancelled immediately" : "Subscription will be cancelled at the end of the current period"
        });
        loadData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {  
    if (!subscription) return;

    try {
      setActionLoading(true);
      
      const response = await subscriptionService.reactivate(subscription._id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Subscription reactivated successfully"
        });
        loadData();
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate subscription",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getPreview = async () => {
    if (!subscription || !selectedPlan) return;

    try {
      const response = await subscriptionService.getPreview(
        subscription._id,
        selectedPlan,
        selectedCycle
      );

      if (response.success) {
        setPreview(response.data.preview);
      }
    } catch (error) {
      console.error('Error getting preview:', error);
    }
  };

  useEffect(() => {
    if (selectedPlan && selectedCycle) {
      getPreview();
    }
  }, [selectedPlan, selectedCycle]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trialing': return 'bg-blue-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trialing': return <Star className="w-4 h-4" />;
      case 'past_due': return <AlertTriangle className="w-4 h-4" />;
      case 'canceled': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiration = () => {
    if (!subscription?.currentPeriodEnd) return null;
    const now = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'pro': return <Crown className="w-5 h-5" />;
      case 'premium': return <Star className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your current subscription plan and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlanIcon(subscription.planId.name)}
                  <div>
                    <h3 className="font-semibold text-lg">{subscription.planId.name}</h3>
                    <p className="text-sm text-gray-600">{subscription.planId.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                    {getStatusIcon(subscription.status)}
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">
                    {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Period</span>
                    <span className="text-sm font-medium">
                      {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next Billing</span>
                    <span className="text-sm font-medium">
                      {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                  {getDaysUntilExpiration() !== null && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Remaining</span>
                      <span className="text-sm font-medium">
                        {getDaysUntilExpiration()} days
                      </span>
                    </div>
                  )}
                </div>

                {getDaysUntilExpiration() !== null && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Billing Cycle Progress</span>
                      <span className="text-sm font-medium">
                        {Math.max(0, Math.round((1 - (getDaysUntilExpiration()! / 30)) * 100))}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.round((1 - (getDaysUntilExpiration()! / 30)) * 100))} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>

              {subscription.cancelAtPeriodEnd && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will be cancelled on {formatDate(subscription.currentPeriodEnd)}.
                    You can reactivate it before then to continue your service.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                {!subscription.cancelAtPeriodEnd ? (
                  <>
                    <Dialog open={showPlanChange} onOpenChange={setShowPlanChange}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Change Plan</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Change Your Plan</DialogTitle>
                          <DialogDescription>
                            Select a new plan and billing cycle. Changes will be prorated.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Plan</label>
                              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                  {plans.filter(p => p._id !== subscription.planId._id).map(plan => (
                                    <SelectItem key={plan._id} value={plan._id}>
                                      {plan.name} - {plan.formattedPrice}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Billing Cycle</label>
                              <Select value={selectedCycle} onValueChange={(value: 'monthly' | 'yearly') => setSelectedCycle(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {preview && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Preview</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Amount Due Now:</span>
                                  <span className="font-medium">${(preview.amountDue / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Proration:</span>
                                  <span className="font-medium">${(preview.prorationAmount / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Next Billing Date:</span>
                                  <span className="font-medium">{formatDate(preview.periodEnd)}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowPlanChange(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handlePlanChange} 
                              disabled={!selectedPlan || actionLoading}
                            >
                              {actionLoading ? 'Updating...' : 'Update Plan'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="destructive" 
                      onClick={() => handleCancelSubscription(false)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Reactivating...' : 'Reactivate Subscription'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
              <Button onClick={() => window.location.href = '/pricing'}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <PaymentMethodManager />
    </div>
  );
};

export default SubscriptionManagement; 