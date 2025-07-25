"use client";

import React, { useState } from "react";
import MentionEditor from "../components/MentionEditor"; // Certifique-se de ajustar o caminho do import
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

export function AskQuestionForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mentions, setMentions] = useState<
    Array<{
      userId: string;
      userName: string;
      startIndex: number;
      endIndex: number;
    }>
  >([]);

  const { user } = useAuth();
  const router = useRouter();

  // Tags
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" || e.key === ",") &&
      tagInput.trim() &&
      !tags.includes(tagInput.trim().toLowerCase())
    ) {
      e.preventDefault();
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError("Você precisa estar logado para perguntar.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setError("Preencha o título e a descrição da pergunta.");
      return;
    }
    if (tags.length === 0) {
      setError("Adicione pelo menos uma tag.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/qa/${user.uid}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content: body, tags, mentions }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar pergunta.");
      } else {
        setSuccess("Pergunta criada com sucesso!");
        setTimeout(() => {
          router.push(`/questions/${data.id}`);
        }, 1200);
      }
    } catch (err) {
      setError("Erro ao criar pergunta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 py-8">
      <Card className="w-full max-w-2xl shadow-lg border-emerald-100">
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
                  <Alert variant="default">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título da pergunta *</Label>
              <input
                id="title"
                className="w-full border rounded px-3 py-2 text-lg focus:ring-2 focus:ring-emerald-200 transition"
                placeholder="Seja claro e objetivo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={150}
                required
              />
              <div className="text-xs text-slate-500">
                {title.length}/150 caracteres
              </div>
            </div>

            {/* Editor de menções */}
            <div className="space-y-2">
              <Label htmlFor="body">Detalhes da pergunta *</Label>
              <MentionEditor
                value={body}
                userId={user?.uid} // Add this prop to enable following users fetch
                onChange={(text, mentionsList) => {
                  setBody(text);
                }}
                onMentionsChange={(mentionsList) => {
                  setMentions(mentionsList);
                }}
                placeholder="Descreva sua dúvida, o que já tentou, exemplos, etc. Use @ para mencionar alguém."
                minHeight="150px"
              />

              {mentions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {mentions.map((mention) => (
                    <Badge
                      key={mention.userId}
                      className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs flex items-center"
                    >
                      @{mention.userName}
                      <button
                        type="button"
                        className="ml-1 text-emerald-700 hover:text-red-500"
                        onClick={() => {
                          setMentions((prev) =>
                            prev.filter((m) => m.userId !== mention.userId)
                          );
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags * (máx. 5)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                <AnimatePresence>
                  {tags.map((tag) => (
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
                          tabIndex={-1}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Adicione uma tag e pressione Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                disabled={loading || tags.length >= 5}
                maxLength={20}
              />
              <div className="text-xs text-slate-500 mt-1">
                Use palavras-chave separadas, como: python, sql, machine
                learning...
              </div>
            </div>

            {/* Botão de envio */}
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
