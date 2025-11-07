import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserClients } from '@/lib/auth/rbac';
import Link from 'next/link';
import { ExternalLink, FileText, Calendar } from 'lucide-react';

export default async function ContentPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's clients
  const userClientIds = await getUserClients(user.id);

  if (userClientIds.length === 0) {
    return (
      <div className="container mx-auto py-8 text-foreground">
        <h1 className="text-3xl font-semibold mb-4">Generated Content</h1>
        <p className="text-muted-foreground mb-6">
          No clients found. Please add a client first.
        </p>
        <Link
          href="/clients/new"
          className="inline-block px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/85 transition-colors"
        >
          Add Client
        </Link>
      </div>
    );
  }

  // Get generated content for user's clients
  const { data: content, error } = await supabase
    .from('generated_content')
    .select(`
      *,
      clients!inner (
        id,
        name
      )
    `)
    .in('client_id', userClientIds)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching content:', error);
  }

  const articles = content || [];

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-[0.01em]">Generated Content</h1>
        <Link
          href="/content/generate"
          className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/85 transition-colors"
        >
          Generate New Content
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-card text-card-foreground rounded-xl border border-border">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/70 mb-5" />
          <h3 className="text-lg font-semibold mb-2">No content generated yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by generating your first article to improve your online reputation.
          </p>
          <Link
            href="/content/generate"
            className="inline-block px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/85 transition-colors"
          >
            Generate Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {articles.map((article: any) => (
            <div
              key={article.id}
              className="bg-card text-card-foreground rounded-xl border border-border p-6 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-30px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold tracking-[0.01em]">{article.title}</h3>
                    <span className="px-2.5 py-1 text-xs rounded-full bg-[hsl(var(--primary-soft))] text-primary">
                      {(article.clients as any)?.name}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.content_preview}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {article.seo_score && (
                    <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                      SEO: {article.seo_score}/100
                    </span>
                  )}
                  {article.sentiment_score && (
                    <span className={`px-2 py-1 rounded ${
                      article.sentiment_score > 0 ? 'bg-primary/15 text-primary' :
                      article.sentiment_score < 0 ? 'bg-destructive/15 text-destructive' :
                      'bg-muted/40 text-muted-foreground'
                    }`}>
                      Sentiment: {article.sentiment_score > 0 ? '+' : ''}{article.sentiment_score.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {article.wordpress_post_id && (
                    <a
                      href={article.wordpress_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on WordPress
                    </a>
                  )}
                  <Link
                    href={`/content/${article.id}`}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

