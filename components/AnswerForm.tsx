"use client";

import React, { useState } from "react";
import MentionEditor from "../components/MentionEditor";
import { Button } from "@/components/ui/button";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, X, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Mention {
  userId: string;
  userName: string;
}

export function AskQuestionForm() {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [] as string[],
    mentions: [] as Mention[]
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  // Form handlers
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tag handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" || e.key === ",") &&
      tagInput.trim() &&
      !formData.tags.includes(tagInput.trim().toLowerCase()) &&
      formData.tags.length < 5
    ) {
      e.preventDefault();
      updateFormData('tags', [...formData.tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag));
  };

  // Form validation
  const validateForm = (): string | null => {
    if (!user) return "Você precisa estar logado para perguntar.";
    if (!formData.title.trim()) return "O título é obrigatório.";
    if (!formData.body.trim()) return "A descrição é obrigatória.";
    if (formData.tags.length === 0) return "Adicione pelo menos uma tag.";
    return null;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/qa/${user!.uid}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title.trim(),
            content: formData.body.trim(),
            tags: formData.tags,
            mentions: formData.mentions
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar pergunta.");
      }

      setSuccess("Pergunta criada com sucesso!");
      setTimeout(() => {
        router.push(`/questions/${data.id}`);
      }, 1200);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar pergunta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 py-8">
      <Card className="w-full max-w-3xl shadow-lg border-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <HelpCircle className="w-6 h-6" />
            Faça uma Pergunta
          </CardTitle>
          <CardDescription>
            Compartilhe sua dúvida com a comunidade e receba respostas!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título da pergunta *</Label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-2 focus:ring-emerald-200 transition"
                placeholder="Seja claro e objetivo"
                disabled={loading}
                maxLength={150}
                required
              />
              <div className="text-xs text-slate-500">
                {formData.title.length}/150 caracteres
              </div>
            </div>

            {/* Body with mentions */}
            <div className="space-y-2">
              <Label>Detalhes da pergunta *</Label>
              <MentionEditor
                value={formData.body}
                userId={user?.uid}
                onChange={(text) => updateFormData('body', text)}
                onMentionsChange={(mentions) => updateFormData('mentions', mentions)}
                placeholder="Descreva sua dúvida detalhadamente. Inclua o que já tentou, exemplos de código, mensagens de erro, etc."
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags * (máx. 5)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                <AnimatePresence>
                  {formData.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <Badge className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs flex items-center">
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-emerald-700 hover:text-red-500"
                          onClick={() => handleRemoveTag(tag)}
                          aria-label={`Remover tag ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Adicione uma tag e pressione Enter"
                disabled={loading || formData.tags.length >= 5}
                maxLength={20}
              />
              <div className="text-xs text-slate-500">
                Use palavras-chave como: python, sql, machine-learning, react...
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex gap-4 pt-2">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 transition"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Perguntar
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/questions")}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}