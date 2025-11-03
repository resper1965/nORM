import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileText, Share2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const documents = [
  {
    id: 1,
    name: "Documento de Arquitetura",
    type: "PDF",
    size: "2.4 MB",
    modified: "2 hours ago",
    shared: true,
  },
  {
    id: 2,
    name: "Especificação Técnica",
    type: "DOCX",
    size: "1.8 MB",
    modified: "1 day ago",
    shared: false,
  },
  {
    id: 3,
    name: "Apresentação Projeto",
    type: "PPTX",
    size: "5.2 MB",
    modified: "3 days ago",
    shared: true,
  },
];

const people = [
  {
    id: 1,
    name: "Olivia Martin",
    email: "m@example.com",
    initials: "OM",
    access: "Can view",
  },
  {
    id: 2,
    name: "Isabella Nguyen",
    email: "b@example.com",
    initials: "IN",
    access: "Can edit",
  },
  {
    id: 3,
    name: "Sofia Davis",
    email: "p@example.com",
    initials: "SD",
    access: "Can view",
  },
  {
    id: 4,
    name: "Ethan Thompson",
    email: "e@example.com",
    initials: "ET",
    access: "Can edit",
  },
];

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Gerencie seus documentos e compartilhamentos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meus Documentos</CardTitle>
                  <CardDescription>
                    {documents.length} documentos no total
                  </CardDescription>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Novo Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Input placeholder="Buscar documentos..." />
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.size} • {doc.modified}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.shared && (
                        <Badge variant="secondary">
                          <Share2 className="mr-1 h-3 w-3" />
                          Compartilhado
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Abrir</DropdownMenuItem>
                          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Share this document</CardTitle>
              <CardDescription>
                Anyone with the link can view this document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value="https://example.com/share/document"
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline">Copy Link</Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-3">People with access</p>
                  <div className="space-y-3">
                    {people.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{person.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{person.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {person.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{person.access}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

