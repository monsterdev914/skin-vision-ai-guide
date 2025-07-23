import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { paymentService } from '@/lib/api';
import { CreditCard, Plus, Star, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import AddPaymentMethodForm from './AddPaymentMethodForm';

interface PaymentMethod {
  _id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
  };
  isDefault: boolean;
  createdAt: string;
}

const PaymentMethodManager: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentMethods();
      
      if (response.success) {
        setPaymentMethods(response.data.paymentMethods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setActionLoading(paymentMethodId);
      
      const response = await paymentService.setDefault(paymentMethodId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Default payment method updated"
        });
        loadPaymentMethods();
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setActionLoading(paymentMethodId);
      
      const response = await paymentService.delete(paymentMethodId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Payment method deleted"
        });
        loadPaymentMethods();
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>;
      case 'mastercard':
        return <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>;
      case 'amex':
        return <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const onPaymentMethodAdded = () => {
    setShowAddMethod(false);
    loadPaymentMethods();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Loading payment methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Manage your payment methods for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No payment methods found. Add a payment method to manage your subscriptions.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getCardBrandIcon(method.card?.brand || '')}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          •••• •••• •••• {method.card?.last4}
                        </span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expires {method.card?.expMonth}/{method.card?.expYear}
                        {method.billingDetails?.name && (
                          <span className="ml-2">• {method.billingDetails.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method._id)}
                        disabled={actionLoading === method._id}
                      >
                        {actionLoading === method._id ? 'Setting...' : 'Set Default'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method._id)}
                      disabled={actionLoading === method._id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method for your subscription billing
                  </DialogDescription>
                </DialogHeader>
                <Elements stripe={stripePromise}>
                  <AddPaymentMethodForm
                    onSuccess={onPaymentMethodAdded}
                    onCancel={() => setShowAddMethod(false)}
                  />
                </Elements>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodManager; 