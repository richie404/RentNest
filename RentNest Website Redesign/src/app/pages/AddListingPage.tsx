import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Upload, Check, ChevronLeft } from "lucide-react";

export function AddListingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-[var(--warm-gray)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/owner-dashboard">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
            <p className="text-[var(--slate-gray)] mb-8">Share your space with quality renters</p>

            <Progress value={(step / totalSteps) * 100} className="mb-8" />

            {/* Step 1: Property Type */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Property Details</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="loft">Loft</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Property Title</Label>
                    <Input placeholder="e.g., Modern Luxury Apartment" className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Input type="number" placeholder="2" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Bathrooms</Label>
                      <Input type="number" placeholder="2" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Square Feet</Label>
                      <Input type="number" placeholder="1200" className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Location</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input placeholder="123 Main Street" className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input placeholder="New York" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input placeholder="NY" className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input placeholder="10001" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input placeholder="United States" className="h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photos & Description */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Photos & Description</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Photos</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-[var(--royal-blue)] transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--slate-gray)]" />
                      <p className="font-semibold mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-[var(--slate-gray)]">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Property Description</Label>
                    <Textarea
                      placeholder="Describe your property..."
                      className="min-h-32 rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["WiFi", "Parking", "Pool", "Gym", "Pet Friendly", "Laundry"].map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <Checkbox id={amenity} />
                          <Label htmlFor={amenity} className="cursor-pointer">{amenity}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Pricing & Availability</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Monthly Rent</Label>
                    <Input type="number" placeholder="3500" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Security Deposit</Label>
                    <Input type="number" placeholder="3500" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Available From</Label>
                    <Input type="date" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Lease Duration</Label>
                    <Select>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="24">24 Months</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
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
              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 h-12 bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] rounded-xl"
                >
                  Continue
                </Button>
              ) : (
                <Link to="/owner-dashboard" className="flex-1">
                  <Button className="w-full h-12 bg-gradient-to-r from-[var(--emerald-accent)] to-[var(--emerald-accent)] rounded-xl">
                    <Check className="w-5 h-5 mr-2" />
                    Publish Listing
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
