"use client"

import { useState } from 'react'
import { useContentGeneration } from '@/lib/hooks/use-ai-stream'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

/**
 * Content Generator with Streaming
 *
 * Componente que gera conteúdo SEO em tempo real usando streaming
 */
export function ContentGeneratorStream() {
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical'>('professional')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')

  const { content, generate, isLoading, error } = useContentGeneration()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      return
    }

    const keywordsList = keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    await generate({
      topic,
      keywords: keywordsList,
      tone,
      length,
    })
  }

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>
            Configure os parâmetros para geração de conteúdo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Tópico</Label>
            <Input
              id="topic"
              placeholder="Ex: Como melhorar SEO do seu site"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
            <Input
              id="keywords"
              placeholder="SEO, otimização, Google"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tom</Label>
              <Select
                value={tone}
                onValueChange={(value: any) => setTone(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Tamanho</Label>
              <Select
                value={length}
                onValueChange={(value: any) => setLength(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Curto (400-600)</SelectItem>
                  <SelectItem value="medium">Médio (800-1200)</SelectItem>
                  <SelectItem value="long">Longo (1500-2000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Gerando...</span>
              </>
            ) : (
              'Gerar Conteúdo'
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preview</CardTitle>
            {content && (
              <Badge variant="secondary">
                {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}
              </Badge>
            )}
          </div>
          <CardDescription>
            O conteúdo aparecerá aqui em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !content && (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {content ? (
            <div className="prose prose-sm max-w-none">
              <Textarea
                value={content}
                readOnly
                className="min-h-[500px] font-mono text-sm"
              />
            </div>
          ) : (
            !isLoading && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Configure os parâmetros e clique em "Gerar Conteúdo" para começar
              </div>
            )
          )}

          {content && !isLoading && (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Copiar
              </Button>
              <Button variant="outline" size="sm">
                Baixar
              </Button>
              <Button size="sm">
                Salvar Artigo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
