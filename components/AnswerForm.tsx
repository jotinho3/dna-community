"use client";

import React, { useState } from "react";
import MentionEditor from "./MentionEditor";
import { Button } from "@/components/ui/button";
import { useAuth } from "../app/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnswerFormProps {
  questionId: string;
  onSuccess: () => void;
}

interface Mention {
  userId: string;
  userName: string;
}

export function AnswerForm({ questionId, onSuccess }: AnswerFormProps) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError("Você precisa estar logado para responder.");
      return;
    }

    if (!content.trim()) {
      setError("A resposta não pode estar vazia.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/qa/${user.uid}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId,
            content: content.trim(),
            mentions: mentions
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar resposta.");
      }

      setSuccess("Resposta enviada com sucesso!");
      setContent("");
      setMentions([]);
      
      setTimeout(() => {
        setSuccess(null);
        onSuccess(); // Refresh the question data
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar resposta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Answer content with mentions */}
      <MentionEditor
        value={content}
        userId={user?.uid}
        onChange={(text) => setContent(text)}
        onMentionsChange={(mentionsList) => setMentions(mentionsList)}
        placeholder="Escreva sua resposta detalhadamente. Seja claro e helpful!"
        className="min-h-[200px]"
      />

      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 transition"
          disabled={loading || !content.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Responder
            </>
          )}
        </Button>
      </div>
    </form>
  );
}