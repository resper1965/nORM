import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Messages will be loaded from database
const messages: Array<{
  id: number;
  from: string;
  email: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}> = [];

export default function MailPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mail</h1>
          <p className="text-muted-foreground">
            Gerencie suas mensagens e conversas
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
            <CardDescription>
              {messages.length === 0 ? "Nenhuma mensagem" : `${messages.length} mensagens não lidas`}
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input placeholder="Buscar mensagens..." className="mb-4" />
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma mensagem encontrada.</p>
                        <p className="text-sm mt-2">Esta funcionalidade será implementada em breve.</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border hover:bg-accent cursor-pointer ${
                          message.unread ? "bg-accent/50" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {message.from.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{message.from}</p>
                            <span className="text-xs text-muted-foreground">{message.time}</span>
                          </div>
                          <p className="text-sm font-medium">{message.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {message.preview}
                          </p>
                        </div>
                        {message.unread && (
                          <Badge variant="default" className="ml-auto">
                            Novo
                          </Badge>
                        )}
                      </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Selecione uma mensagem para ver a conversa.</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Input placeholder="Digite sua mensagem..." className="flex-1" />
                  <Button>Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

