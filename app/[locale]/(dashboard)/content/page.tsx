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
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Generated Content</h1>
        <p className="text-gray-600 mb-4">
          No clients found. Please add a client first.
        </p>
        <Link
          href="/clients/new"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Generated Content</h1>
        <Link
          href="/content/generate"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Generate New Content
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content generated yet</h3>
          <p className="text-gray-600 mb-4">
            Start by generating your first article to improve your online reputation.
          </p>
          <Link
            href="/content/generate"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generate Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {articles.map((article: any) => (
            <div
              key={article.id}
              className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{article.title}</h3>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {(article.clients as any)?.name}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{article.content_preview}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {article.seo_score && (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                      SEO: {article.seo_score}/100
                    </span>
                  )}
                  {article.sentiment_score && (
                    <span className={`px-2 py-1 rounded ${
                      article.sentiment_score > 0 ? 'bg-green-100 text-green-800' :
                      article.sentiment_score < 0 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
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
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on WordPress
                    </a>
                  )}
                  <Link
                    href={`/content/${article.id}`}
                    className="text-blue-600 hover:text-blue-700"
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

