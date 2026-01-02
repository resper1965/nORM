"use client";

import { useFormState, useFormStatus } from "react-dom";
import { X, Save, Building, Globe, Briefcase } from "lucide-react";
import { useEffect, useRef } from "react";
import { createClient, updateClient } from "@/lib/actions/clients";
import type { ClientWithScore } from "@/lib/data/clients";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientWithScore | null; // If present, Update mode
}

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : (
        <Save className="w-4 h-4" />
      )}
      {isEditing ? "Save Changes" : "Create Client"}
    </button>
  );
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
}: ClientDialogProps) {
  const isEditing = !!client;
  const updateClientWithId = updateClient.bind(null, client?.id || "");
  const [state, dispatch] = useFormState(
    isEditing ? updateClientWithId : createClient,
    initialState
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Close on success (simplified check)
  useEffect(() => {
    if (state.message?.includes("success")) {
      onOpenChange(false);
      // Optional: Reset form if adding
      if (!isEditing) {
        formRef.current?.reset();
      }
    }
  }, [state, onOpenChange, isEditing]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0b1015]/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#131b24]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEditing ? "Edit Client" : "Add New Client"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isEditing
                ? "Manage client details, keywords, and configuration."
                : "Enter the required information to start monitoring a new entity."}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <form action={dispatch} ref={formRef} className="space-y-6">
            {/* General Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#90b8cb] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building className="w-4 h-4" />
                General Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-300"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={client?.name}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    required
                  />
                  {state.errors?.name && (
                    <p className="text-red-400 text-xs">
                      {state.errors.name.join(", ")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="industry"
                    className="text-sm font-medium text-slate-300"
                  >
                    Industry
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      defaultValue={client?.industry}
                      placeholder="e.g. Fintech"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="website"
                    className="text-sm font-medium text-slate-300"
                  >
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      id="website"
                      name="website"
                      type="url"
                      defaultValue={client?.website}
                      placeholder="https://"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  {state.errors?.website && (
                    <p className="text-red-400 text-xs">
                      {state.errors.website.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {state.message && (
              <div
                className={`p-4 rounded-lg text-sm border ${
                  state.message.includes("success")
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {state.message}
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <SubmitButton isEditing={isEditing} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
