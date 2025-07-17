
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, RefreshCw } from 'lucide-react';
import { orderAPI } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';
import { Service, PricingPlan } from '@/types/service';

interface ServiceOrderFormProps {
  service: Service;
  onOrderPlaced: (order: any) => void;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ service, onOrderPlaced }) => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOrderSubmit = async () => {
    if (!requirements.trim()) {
      toast({
        title: "Requirements needed",
        description: "Please provide your project requirements",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        serviceId: service._id,
        selectedPlan,
        requirements: requirements.trim()
      };

      const response = await orderAPI.createOrder(orderData);
      
      if (response.success) {
        toast({
          title: "Order placed successfully!",
          description: "The freelancer will review your order and get back to you soon.",
        });
        onOrderPlaced(response.data);
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePlans: [string, PricingPlan][] = Object.entries(service.pricingPlans).filter(
    ([_, plan]) => plan && plan.price
  ) as [string, PricingPlan][];

  const currentPlan = service.pricingPlans[selectedPlan as keyof typeof service.pricingPlans];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Place Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Selection */}
        <div>
          <h3 className="font-semibold mb-4">Select a Package</h3>
          <div className="grid gap-4">
            {availablePlans.map(([planName, plan]) => (
              <div 
                key={planName}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPlan === planName 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(planName)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold capitalize text-lg">{planName}</h4>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{plan.price}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{plan.deliveryTime} days delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    <span>{plan.revisions} revisions</span>
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="font-semibold mb-2">Project Requirements</h3>
          <Textarea
            placeholder="Please describe your project requirements in detail. Include any specific instructions, preferences, or files you'd like to share..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={5}
            className="w-full"
          />
        </div>

        {/* Order Summary */}
        {currentPlan && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="capitalize font-medium">{selectedPlan}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">₹{currentPlan.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{currentPlan.deliveryTime} days</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>₹{currentPlan.price}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleOrderSubmit}
          disabled={isSubmitting || !requirements.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderForm;
