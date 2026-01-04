"use client";

import { useState } from "react";
import { X, BookOpen, Users, Hash, Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="glass-panel rounded-xl p-6 border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">
              Bem-vindo ao nORM! 🎉
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Comece configurando seu primeiro cliente e palavras-chave para começar a monitorar sua reputação online.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link
            href="/clients/new"
            className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          >
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">1. Criar Cliente</p>
              <p className="text-xs text-slate-400">Adicione seu primeiro cliente</p>
            </div>
          </Link>

          <Link
            href="/clients"
            className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          >
            <div className="size-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Hash className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">2. Configurar Palavras-chave</p>
              <p className="text-xs text-slate-400">Adicione palavras-chave para monitorar</p>
            </div>
          </Link>

          <Link
            href="/content"
            className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          >
            <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">3. Gerar Conteúdo</p>
              <p className="text-xs text-slate-400">Use IA para criar conteúdo</p>
            </div>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <BookOpen className="w-4 h-4" />
            <span>Precisa de ajuda?</span>
          </div>
          <a
            href="https://github.com/resper1965/nORM/blob/main/docs/MANUAL-DO-USUARIO.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Ver Manual do Usuário →
          </a>
        </div>
      </div>
    </div>
  );
}
