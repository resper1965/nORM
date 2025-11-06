import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getUserClients } from '@/lib/auth/rbac';
import Link from 'next/link';
import { ExternalLink, Copy, Check } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/content" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Content
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{content.title}</h1>
            <p className="text-gray-600 mt-1">
              Client: {client.name} • Created: {new Date(content.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {content.wordpress_post_id && (
            <a
              href={content.wordpress_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              View on WordPress
            </a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
          {content.seo_score && (
            <div>
              <span className="text-sm text-gray-600">SEO Score</span>
              <div className="text-2xl font-bold text-green-600">{content.seo_score}/100</div>
            </div>
          )}
          {content.sentiment_score !== null && (
            <div>
              <span className="text-sm text-gray-600">Sentiment</span>
              <div className={`text-2xl font-bold ${
                content.sentiment_score > 0 ? 'text-green-600' :
                content.sentiment_score < 0 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {content.sentiment_score > 0 ? '+' : ''}{content.sentiment_score.toFixed(2)}
              </div>
            </div>
          )}
          {content.word_count && (
            <div>
              <span className="text-sm text-gray-600">Word Count</span>
              <div className="text-2xl font-bold text-gray-900">{content.word_count}</div>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {content.content}
          </div>
        </div>

        {content.keywords && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {content.keywords.split(',').map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800"
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

