import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Star, Crown, Zap } from "lucide-react";
import { planService, subscriptionService } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

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

const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadPlans();
    if (isAuthenticated) {
      loadCurrentSubscription();
    }
  }, [isAuthenticated]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await planService.getPlans();
      
      if (response.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const response = await subscriptionService.getCurrent();
      if (response.success && response.data.subscription) {
        setCurrentSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Error loading current subscription:', error);
      // Ignore error - user might not have a subscription
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      // Redirect to login/register
      window.location.href = '/register';
      return;
    }

    if (plan.price === 0) {
      // Free plan - no subscription needed
      toast({
        title: "Free Plan",
        description: "You're already on the free plan. Upgrade anytime!",
      });
      return;
    }

    setSelectedPlan(plan);
    setShowSubscriptionDialog(true);
  };

  const handleCreateSubscription = async () => {
    if (!selectedPlan) return;

    try {
      setActionLoading(selectedPlan._id);
      
      let response;
      if (currentSubscription) {
        // User has existing subscription - upgrade/downgrade
        response = await subscriptionService.update(currentSubscription._id, {
          planId: selectedPlan._id
        });
      } else {
        // New subscription
        response = await subscriptionService.create({
          planId: selectedPlan._id
        });
      }

      if (response.success) {
        let successMessage = "Subscription created successfully!";
        
        if (currentSubscription && selectedPlan) {
          const currentPlanPrice = typeof currentSubscription.planId === 'object' 
            ? currentSubscription.planId.price 
            : plans.find(p => p._id === currentSubscription.planId)?.price || 0;
          
          if (selectedPlan.price > currentPlanPrice) {
            successMessage = `Successfully upgraded to ${selectedPlan.name}!`;
          } else if (selectedPlan.price < currentPlanPrice) {
            successMessage = `Successfully downgraded to ${selectedPlan.name}!`;
          } else {
            successMessage = "Subscription updated successfully!";
          }
        }
        
        toast({
          title: "Success",
          description: successMessage
        });
        setShowSubscriptionDialog(false);
        // Refresh current subscription
        await loadCurrentSubscription();
        // Redirect to subscription management or success page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'pro':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'premium':
        return <Star className="w-5 h-5 text-blue-500" />;
      case 'free':
        return <Zap className="w-5 h-5 text-green-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPrice = (plan: Plan) => {
    if (plan.price === 0) {
      return "Free";
    }
    
    const price = plan.price;
    return `$${(price / 100).toFixed(2)}`;
  };

  const getCurrentPlanPrice = () => {
    if (!currentSubscription?.planId) return 0;
    
    return typeof currentSubscription.planId === 'object' 
      ? currentSubscription.planId.price 
      : plans.find(p => p._id === currentSubscription.planId)?.price || 0;
  };

  const getButtonText = (plan: Plan) => {
    const isCurrentPlan = currentSubscription?.planId?._id === plan._id || currentSubscription?.planId === plan._id;
    
    if (isCurrentPlan) {
      return "Current Plan";
    }
    
    if (plan.price === 0) {
      return "Get Started";
    }
    
    if (!isAuthenticated) {
      return "Subscribe Now";
    }
    
    // Compare with current plan price
    if (currentSubscription?.planId) {
      const currentPlanPrice = getCurrentPlanPrice();
      
      if (plan.price > currentPlanPrice) {
        return "Upgrade";
      } else if (plan.price < currentPlanPrice) {
        return "Downgrade";
      }
    }
    
    return "Upgrade to " + plan.name;
  };

  const getButtonStyle = (plan: Plan) => {
    const isPopular = plan._id === getPopularPlan();
    
    if (!isAuthenticated) {
      return isPopular 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90'
        : '';
    }
    
    if (currentSubscription?.planId) {
      const currentPlanPrice = getCurrentPlanPrice();
      
      if (plan.price > currentPlanPrice) {
        // Upgrade - Blue/Purple gradient
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700';
      } else if (plan.price < currentPlanPrice) {
        // Downgrade - Orange/Red gradient
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600';
      }
    }
    
    return isPopular 
      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90'
      : '';
  };

  const getButtonVariant = (plan: Plan) => {
    const isPopular = plan._id === getPopularPlan();
    
    if (!isAuthenticated) {
      return isPopular ? "default" : "outline";
    }
    
    if (currentSubscription?.planId) {
      const currentPlanPrice = getCurrentPlanPrice();
      
      if (plan.price > currentPlanPrice || plan.price < currentPlanPrice) {
        // Both upgrade and downgrade use default variant with custom styling
        return "default";
      }
    }
    
    return isPopular ? "default" : "outline";
  };

  const getDialogTitle = () => {
    if (!currentSubscription || !selectedPlan) {
      return 'Subscribe to';
    }
    
    const currentPlanPrice = getCurrentPlanPrice();
    
    if (selectedPlan.price > currentPlanPrice) {
      return 'Upgrade to';
    } else if (selectedPlan.price < currentPlanPrice) {
      return 'Downgrade to';
    }
    
    return 'Switch to';
  };

  const getDialogDescription = () => {
    if (!currentSubscription || !selectedPlan) {
      return `Complete your subscription to get started with ${selectedPlan?.name} features.`;
    }
    
    const currentPlanPrice = getCurrentPlanPrice();
    
    if (selectedPlan.price > currentPlanPrice) {
      return `Upgrade to ${selectedPlan.name} for enhanced features and higher limits.`;
    } else if (selectedPlan.price < currentPlanPrice) {
      return `Downgrade to ${selectedPlan.name}. Your current plan benefits will be adjusted accordingly.`;
    }
    
    return `Switch to ${selectedPlan.name} plan.`;
  };



  const getPopularPlan = () => {
    // Find the Premium plan or the middle-priced plan
    const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'));
    if (premiumPlan) return premiumPlan._id;
    
    // Otherwise, find the middle-priced plan
    const sortedPlans = plans.filter(p => p.price > 0).sort((a, b) => a.price - b.price);
    return sortedPlans[Math.floor(sortedPlans.length / 2)]?._id;
  };



  if (loading) {
    return (
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            Simple Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start with our free tier and upgrade as your skin care needs grow
          </p>
          {isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-sm text-blue-800">
                💡 Already have a subscription? Manage it in your{' '}
                <a href="/settings" className="font-medium underline hover:text-blue-900">
                  Settings
                </a>{' '}
                page.
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isPopular = plan._id === getPopularPlan();
            const isCurrentPlan = currentSubscription?.planId?._id === plan._id || currentSubscription?.planId === plan._id;
            
            return (
              <Card 
                key={plan._id} 
                className={`relative bg-white border-2 hover:shadow-xl transition-all duration-300 ${
                  isCurrentPlan 
                    ? 'border-green-500 scale-105 bg-green-50' 
                    : isPopular 
                      ? 'border-blue-500 scale-105' 
                      : 'border-gray-200'
                }`}
              >
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                )}
                {!isCurrentPlan && isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {getPrice(plan)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">
                          /month
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">
                          {feature.name}
                          {feature.limit && feature.limit > 0 && (
                            <span className="text-gray-500"> (up to {feature.limit})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(plan)}
                    disabled={actionLoading === plan._id || isCurrentPlan}
                    className={`w-full py-6 ${
                      isCurrentPlan
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white cursor-not-allowed opacity-75'
                        : getButtonStyle(plan)
                    }`}
                    variant={isCurrentPlan ? "default" : getButtonVariant(plan)}
                  >
                    {actionLoading === plan._id ? 'Processing...' : getButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
                            <DialogTitle>
                  {getDialogTitle()} {selectedPlan?.name}
                </DialogTitle>
            <DialogDescription>
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Plan Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing:</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">{selectedPlan && getPrice(selectedPlan)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSubscriptionDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSubscription}
                disabled={actionLoading === selectedPlan?._id}
                className={(() => {
                  if (!currentSubscription || !selectedPlan) {
                    return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
                  }
                  const currentPlanPrice = getCurrentPlanPrice();
                  if (selectedPlan.price > currentPlanPrice) {
                    return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700';
                  } else if (selectedPlan.price < currentPlanPrice) {
                    return 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600';
                  }
                  return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
                })()}
              >
                {actionLoading === selectedPlan?._id 
                  ? (() => {
                      if (!currentSubscription) return 'Creating...';
                      if (!selectedPlan) return 'Updating...';
                      const currentPlanPrice = getCurrentPlanPrice();
                      if (selectedPlan.price > currentPlanPrice) return 'Upgrading...';
                      if (selectedPlan.price < currentPlanPrice) return 'Downgrading...';
                      return 'Updating...';
                    })()
                  : (() => {
                      if (!currentSubscription) return 'Create Subscription';
                      if (!selectedPlan) return 'Update Subscription';
                      const currentPlanPrice = getCurrentPlanPrice();
                      if (selectedPlan.price > currentPlanPrice) return 'Confirm Upgrade';
                      if (selectedPlan.price < currentPlanPrice) return 'Confirm Downgrade';
                      return 'Update Subscription';
                    })()
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PricingSection;
