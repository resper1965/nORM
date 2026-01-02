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

// Analytics data will be loaded from database
const payments: Array<{
  id: number;
  status: string;
  email: string;
  amount: string;
}> = [];

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
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Análise de dados e métricas de reputação.
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
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum dado de analytics disponível.</p>
                <p className="text-sm mt-2">Esta funcionalidade será implementada em breve.</p>
              </div>
            ) : (
              <>
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
                  0 of {payments.length} row(s) selected.
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

