"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const payments = [
  {
    id: 1,
    status: "success",
    email: "ken99@example.com",
    amount: "$316.00",
  },
  {
    id: 2,
    status: "success",
    email: "Abe45@example.com",
    amount: "$242.00",
  },
  {
    id: 3,
    status: "processing",
    email: "Monserrat44@example.com",
    amount: "$837.00",
  },
  {
    id: 4,
    status: "failed",
    email: "carmella@example.com",
    amount: "$721.00",
  },
  {
    id: 5,
    status: "pending",
    email: "jason78@example.com",
    amount: "$450.00",
  },
  {
    id: 6,
    status: "success",
    email: "sarah23@example.com",
    amount: "$1,280.00",
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    success: "default",
    processing: "secondary",
    failed: "destructive",
    pending: "outline",
  };
  return variants[status] || "outline";
};

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage your payments.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>
              A list of recent payments and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Badge variant={getStatusBadge(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{payment.email}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell className="text-right">
                      <button className="text-muted-foreground hover:text-foreground">
                        Open menu
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-sm text-muted-foreground">
              0 of 6 row(s) selected.
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

