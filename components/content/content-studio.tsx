"use client";

import {
  Settings,
  X,
  Sparkles,
  Save,
  Upload,
  Copy,
  Calendar,
  Timer,
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { generateArticleAction } from "@/lib/actions/content";

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      disabled={pending}
      type="submit"
      className="relative w-full h-14 rounded-xl group overflow-hidden shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#3b82f6] to-primary bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] group-hover:bg-[length:150%_auto] transition-all"></div>
      <div className="absolute inset-[1px] bg-transparent rounded-xl flex items-center justify-center gap-3 z-10">
        {pending ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
            <Sparkles className="text-white animate-pulse w-5 h-5" />
        )}
        <span className="text-white font-bold tracking-wide text-lg">
          {pending ? "GENERATING..." : "GENERATE ARTICLE"}
        </span>
      </div>
    </button>
  );
}

const initialState = {
    success: false,
    message: "",
    data: null
};

export function ContentStudio() {
  const [state, dispatch] = useFormState(generateArticleAction, initialState);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentKeyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(currentKeyword.trim())) {
        setKeywords([...keywords, currentKeyword.trim()]);
      }
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };
  
  // Update local state when server action returns data
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  useEffect(() => {
    if (state.success && state.data) {
        setGeneratedContent(state.data);
    }
  }, [state]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden rounded-xl border border-white/5 bg-[#101d23]/50">
      {/* Configuration Panel */}
      <div className="w-full lg:w-[40%] h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-[#101d23]/50 relative z-10 overflow-y-auto custom-scrollbar">
        <form action={dispatch} className="flex flex-col h-full">
            <input type="hidden" name="keywords" value={keywords.join(",")} />
            
            <div className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
                <Settings className="text-primary w-5 h-5" />
                <h2 className="text-white text-lg font-bold tracking-tight">
                AI Configuration
                </h2>
            </div>
            <p className="text-[#90b8cb] text-sm">
                Define parameters for your next reputation piece.
            </p>
            </div>
            <div className="flex-1 p-6 pt-2 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#90b8cb]">
                Main Topic
                </label>
                <div className="relative group">
                <input
                    name="topic"
                    className="w-full bg-surface-dark/50 border border-border-dark rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g. Crisis Management Strategies for Fintech"
                    type="text"
                    required
                />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#90b8cb]">
                Keywords & Tags
                </label>
                <div className="w-full bg-surface-dark/50 border border-border-dark rounded-xl p-2 min-h-[56px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex flex-wrap gap-2">
                {keywords.map((k) => (
                    <div key={k} className="flex items-center gap-1 bg-primary/20 border border-primary/30 rounded-lg px-2 py-1">
                        <span className="text-xs font-medium text-white">{k}</span>
                        <button 
                            type="button"
                            onClick={() => removeKeyword(k)}
                            className="hover:text-white text-white/50 flex items-center"
                        >
                        <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <input
                    className="bg-transparent border-none text-white placeholder-white/20 focus:ring-0 text-sm flex-1 min-w-[120px] p-1 focus:outline-none"
                    placeholder="Type keys and press enter..."
                    type="text"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                />
                </div>
            </div>

            {state.message && !state.success && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.message}
                </div>
            )}

            <div className="flex-1"></div>
            <SubmitButton />
            <p className="text-center text-xs text-[#90b8cb]/60 mt-3">
                Uses nORM GPT-4 Enterprise Model. 25 Credits will be deducted.
            </p>
            </div>
        </form>
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-[60%] h-full bg-[#0b1216] relative flex flex-col">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#101d23]/80 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${generatedContent ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-sm font-medium text-white">Live Preview</span>
            {generatedContent && (
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[#90b8cb] border border-white/5">
                Draft
                </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 text-[#90b8cb] hover:text-white transition-colors"
              title="Copy to Clipboard"
              onClick={() => {
                if (generatedContent?.content) {
                    navigator.clipboard.writeText(generatedContent.content);
                }
              }}
            >
              <Copy className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-medium text-white transition-colors">
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-sm font-bold text-white transition-colors shadow-lg shadow-primary/20">
              <Upload className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative custom-scrollbar">
          <div
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"
            data-alt="Subtle dark texture pattern"
          ></div>
          
          <div className="max-w-3xl mx-auto min-h-[800px] glass-panel rounded-lg p-10 lg:p-12 shadow-2xl relative">
            {generatedContent ? (
                <div className="prose prose-invert prose-lg max-w-none">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight leading-tight">
                    {generatedContent.title}
                </h1>
                <div className="flex items-center gap-4 mb-8 text-sm text-[#90b8cb]">
                    <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    <span>5 min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>By AI Assistant</span>
                    </div>
                    {generatedContent.seoScore && (
                        <div className="flex items-center gap-1 ml-auto bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs font-mono">
                            SEO: {generatedContent.seoScore}
                        </div>
                    )}
                </div>
                
                {/* Render Content - Handling newlines basic */}
                <div className="text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
                    {generatedContent.content}
                </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-slate-500">
                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg">Ready to generate content.</p>
                    <p className="text-sm opacity-60">Configure your topic and keywords on the left.</p>
                </div>
            )}
          </div>
          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
}
