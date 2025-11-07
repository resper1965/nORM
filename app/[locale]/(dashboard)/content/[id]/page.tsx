import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getUserClients } from '@/lib/auth/rbac';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ContentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const contentId = params.id;

  // Get content
  const { data: content, error } = await supabase
    .from('generated_content')
    .select(`
      *,
      clients!inner (
        id,
        name
      )
    `)
    .eq('id', contentId)
    .single();

  if (error || !content) {
    notFound();
  }

  // Verify access
  const userClientIds = await getUserClients(user.id);
  if (!userClientIds.includes((content.clients as any).id)) {
    notFound();
  }

  const client = content.clients as any;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-foreground">
      <div>
        <Link href="/content" className="text-primary hover:text-primary/80 transition-colors mb-4 inline-block">
          ← Back to Content
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[0.01em]">{content.title}</h1>
            <p className="text-muted-foreground mt-1">
              Client: {client.name} • Created: {new Date(content.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {content.wordpress_post_id && (
            <Button asChild>
              <a
                href={content.wordpress_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on WordPress
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6 pb-4 border-b border-border/60">
          {content.seo_score && (
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">SEO Score</span>
              <div className="text-2xl font-semibold text-primary mt-2">{content.seo_score}/100</div>
            </div>
          )}
          {content.sentiment_score !== null && (
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Sentiment</span>
              <div className={`text-2xl font-bold ${
                content.sentiment_score > 0 ? 'text-primary' :
                content.sentiment_score < 0 ? 'text-destructive' :
                'text-muted-foreground'
              } mt-2`}>
                {content.sentiment_score > 0 ? '+' : ''}{content.sentiment_score.toFixed(2)}
              </div>
            </div>
          )}
          {content.word_count && (
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Word Count</span>
              <div className="text-2xl font-semibold text-foreground mt-2">{content.word_count}</div>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {content.content}
          </div>
        </div>

        {content.keywords && (
          <div className="mt-6 pt-6 border-t border-border/60">
            <h3 className="text-sm font-medium text-foreground/80 mb-3 tracking-[0.02em]">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {content.keywords.split(',').map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-xs rounded-full bg-primary/15 text-primary"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

