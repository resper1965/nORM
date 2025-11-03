import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-center mb-4">404</CardTitle>
          <CardDescription className="text-center text-lg">
            Página não encontrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ir para início
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

