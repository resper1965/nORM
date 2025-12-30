"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateDefaultKeywords } from "@/lib/clients/keyword-suggestions";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Building,
  Globe,
  Search,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ClientFormProps {
  clientId?: string;
  initialData?: {
    name: string;
    industry?: string;
    website?: string;
    keywords?: string[]; // Add this to type def in case it's passed
  };
}

export function ClientForm({ clientId, initialData }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(initialData?.name || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateKeywords = () => {
    if (name.trim()) {
      const suggested = generateDefaultKeywords(name);
      setKeywords(suggested);
      toast({
        title: "Keywords generated",
        description: `Generated ${suggested.length} suggestion based on client name.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a client name to generate keywords.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        clientId ? `/api/clients/${clientId}` : "/api/clients",
        {
          method: clientId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            industry: industry || null,
            website: website || null,
            keywords:
              keywords.length > 0 ? keywords : generateDefaultKeywords(name),
          }),
        }
      );

      // Robust response handling
      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error("Server returned an invalid response format.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Error: ${response.status} ${response.statusText}`
        );
      }

      toast({
        title: clientId ? "Client updated" : "Client created",
        description: `${name} has been successfully saved.`,
      });

      // Navigate to new client or list
      router.push(`/clients/${data.client?.id || data.id}`);
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error saving client",
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 backdrop-blur-md shadow-2xl transition-all hover:border-white/20">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

      <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {clientId ? "Edit Client" : "New Client"}
          </h2>
          <p className="text-muted-foreground text-sm">
            Configure the brand monitoring settings for this client.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Core Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Building className="w-4 h-4 text-primary" />
                Client Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="industry"
                className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Industry
              </label>
              <input
                id="industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all focus:bg-background"
                placeholder="e.g. Technology"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="website"
                className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all focus:bg-background"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Right Column: Keywords */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="keywords"
                className="text-sm font-medium leading-none flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Monitoring Keywords
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateKeywords}
                className="h-8 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Auto-Generate
              </Button>
            </div>

            <div className="relative">
              <textarea
                id="keywords"
                value={keywords.join("\n")}
                onChange={(e) =>
                  setKeywords(e.target.value.split("\n").filter(Boolean))
                }
                rows={8}
                className="flex min-h-[160px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background font-mono leading-relaxed"
                placeholder={`Brand Name\nCEO Name\nProduct X\n...`}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-full border border-border">
                {keywords.length} keywords
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              These terms will be tracked across SERP, News, and Social Media.
              One per line.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {clientId ? "Update Client" : "Create Client"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
