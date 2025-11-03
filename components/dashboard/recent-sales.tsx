import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentSales = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    initials: "OM",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$1,199.00",
    initials: "JL",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$1,299.00",
    initials: "IN",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+$999.00",
    initials: "WK",
  },
];

export function RecentSales() {
  return (
    <div className="space-y-4">
      {recentSales.map((sale) => (
        <div key={sale.email} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{sale.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{sale.name}</p>
              <p className="text-sm text-muted-foreground">{sale.email}</p>
            </div>
          </div>
          <div className="font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  );
}

