import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { paymentService } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);

    try {
      // Create setup intent
      const setupIntentResponse = await paymentService.createSetupIntent();
      
      if (!setupIntentResponse.success) {
        throw new Error(setupIntentResponse.message);
      }

      // Confirm setup intent with card
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        setupIntentResponse.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // You can collect more billing details here if needed
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (setupIntent?.status === 'succeeded') {
        // Confirm the setup intent on the backend
        const confirmResponse = await paymentService.confirmSetupIntent(
          setupIntent.id,
          setAsDefault
        );

        if (confirmResponse.success) {
          toast({
            title: "Success",
            description: "Payment method added successfully"
          });
          onSuccess();
        } else {
          throw new Error(confirmResponse.message);
        }
      }
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      setError(error.message || 'Failed to add payment method');
      toast({
        title: "Error",
        description: error.message || 'Failed to add payment method',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <label className="text-sm font-medium mb-2 block">
          Card Information
        </label>
        <div className="p-3 border rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="setAsDefault"
          checked={setAsDefault}
          onCheckedChange={(checked) => setSetAsDefault(checked === true)}
        />
        <label 
          htmlFor="setAsDefault" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Set as default payment method
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || loading}
        >
          {loading ? 'Adding...' : 'Add Payment Method'}
        </Button>
      </div>
    </form>
  );
};

export default AddPaymentMethodForm; 