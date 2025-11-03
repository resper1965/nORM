import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie seus eventos e compromissos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-7">
            <CardHeader>
              <CardTitle>June 2025</CardTitle>
              <CardDescription>Selecione uma data para ver os eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Move Goal</CardTitle>
            <CardDescription>Set your daily activity goal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Calories/day</p>
                <p className="text-2xl font-bold">350</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded hover:bg-accent">Decrease</button>
                <button className="px-3 py-1 border rounded hover:bg-accent">Increase</button>
              </div>
            </div>
            <button className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Set Goal
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercise Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your exercise minutes are ahead of where you normally are.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

