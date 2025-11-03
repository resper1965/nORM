import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Mail } from "lucide-react";

export default function PricingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground">
            Gerencie seu plano e assinatura
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade your subscription</CardTitle>
            <CardDescription>
              You are currently on the free plan. Upgrade to the pro plan to get access to all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="name">Name</Label>
                </div>
                <Input id="name" placeholder="Enter your name" className="w-[300px]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email">Email</Label>
                </div>
                <Input id="email" type="email" placeholder="Enter your email" className="w-[300px]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="card">Card Number</Label>
                </div>
                <div className="relative w-[300px]">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="card" placeholder="1234 1234 1234 1234" className="pl-10" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Plan</Label>
              <p className="text-sm text-muted-foreground">
                Select the plan that best fits your needs.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Starter Plan</CardTitle>
                    <CardDescription>Perfect for small businesses.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$29/month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Pro Plan</CardTitle>
                    <CardDescription>More features and storage.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$99/month</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the terms and conditions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="emails" />
                <Label htmlFor="emails" className="text-sm">
                  Allow us to send you emails
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

