import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Calendar } from "../components/ui/calendar";
import { Check, ChevronLeft, CreditCard, Home } from "lucide-react";
import { Progress } from "../components/ui/progress";

export function BookingPage() {
  const [step, setStep] = useState(1);
  const [moveInDate, setMoveInDate] = useState<Date>();

  return (
    <div className="min-h-screen bg-[var(--warm-gray)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/browse">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </Link>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-[var(--slate-gray)] mb-8">Just a few more steps to secure your new home</p>

            <Progress value={(step / 3) * 100} className="mb-8" />

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Select Move-in Date</h2>
                <Calendar
                  mode="single"
                  selected={moveInDate}
                  onSelect={setMoveInDate}
                  className="rounded-xl border mx-auto"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Guest Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input className="h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" className="h-12 rounded-xl" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Payment Information</h2>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" className="h-12 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" className="h-12 rounded-xl" />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monthly Rent</span>
                    <span className="font-semibold">$3,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span className="font-semibold">$350</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit</span>
                    <span className="font-semibold">$3,500</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-[var(--royal-blue)]">$7,350</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 h-12 bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] rounded-xl"
                >
                  Continue
                </Button>
              ) : (
                <Link to="/renter-dashboard" className="flex-1">
                  <Button className="w-full h-12 bg-gradient-to-r from-[var(--emerald-accent)] to-[var(--emerald-accent)] rounded-xl">
                    <Check className="w-5 h-5 mr-2" />
                    Confirm Booking
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
