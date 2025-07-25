"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, ThumbsUp, CheckCircle, Send, User, Calendar, Tag, ArrowLeft, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { AnswerForm } from "@/components/AnswerForm";
import { Reactions } from "@/components/Reactions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  authorAvatar?: string;
  tags: string[];
  answersCount: number;
  reactions: any[];
  createdAt: string;
  isResolved: boolean;
  mentions?: any[];
}

interface Answer {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  reactions: any[];
  isAccepted: boolean;
  mentions?: any[];
}

export default function QuestionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const questionId = params.id;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Atualiza perguntas e respostas
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [q, a] = await Promise.all([
        fetch(`http://localhost:8080/api/qa/questions/${questionId}`).then((res) => res.json()),
        fetch(`http://localhost:8080/api/qa/questions/${questionId}/answers`).then((res) =>
          res.json()
        ),
      ]);
      setQuestion(q);
      setAnswers(a.answers || []);
    } catch {
      setError("Erro ao carregar pergunta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!questionId) return;
    fetchData();
    // eslint-disable-next-line
  }, [questionId]);

  // Handler para reações em perguntas
  const handleQuestionReacted = (newReactions: any[]) => {
    setQuestion((prev) => (prev ? { ...prev, reactions: newReactions } : prev));
  };

  // Handler para reações em respostas
  const handleAnswerReacted = (answerId: string, newReactions: any[]) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.id === answerId ? { ...ans, reactions: newReactions } : ans
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {error || "Pergunta não encontrada."}
          </h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/questions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para perguntas
            </Link>
          </Button>
        </div>

        {/* Card da Pergunta */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="mb-8 shadow-lg border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <HelpCircle className="w-6 h-6" />
                {question.title}
                {question.isResolved && (
                  <CheckCircle className="w-5 h-5 text-emerald-500 ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {question.tags.map((tag) => (
                  <Badge key={tag} className="bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {tag}
                  </Badge>
                ))}
              </div>
              <div className="text-slate-700 mb-4 whitespace-pre-line text-lg">
                {question.content}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {question.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {new Date(question.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  {question.answersCount} respostas
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-emerald-400" />
                  {question.reactions?.length || 0} curtidas
                </span>
                <Reactions
                  targetId={question.id}
                  targetType="question"
                  reactions={question.reactions}
                  onReacted={handleQuestionReacted}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Respostas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <MessageCircle className="w-5 h-5" />
                Respostas ({answers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {answers.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  Nenhuma resposta ainda.
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {answers.map((ans) => (
                      <motion.div
                        key={ans.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className={`border rounded-lg p-4 bg-slate-50 ${
                          ans.isAccepted ? "border-emerald-400" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">
                            <User className="w-4 h-4 mr-1 inline" />
                            {ans.authorName}
                          </span>
                          {ans.isAccepted && (
                            <Badge className="bg-emerald-500 text-white">Aceita</Badge>
                          )}
                          <span className="text-xs text-slate-400">
                            <Calendar className="w-4 h-4 mr-1 inline" />
                            {new Date(ans.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Botão aceitar resposta */}
                        {user?.uid === question.authorId && !ans.isAccepted && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mb-2"
                            onClick={async () => {
                              await fetch(`http://localhost:8080/api/qa/${user.uid}/answers/accept`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  questionId: question.id,
                                  answerId: ans.id,
                                }),
                              });
                              // Atualize a lista de respostas após aceitar
                              const res = await fetch(
                                `http://localhost:8080/api/qa/questions/${question.id}/answers`
                              );
                              const data = await res.json();
                              setAnswers(data.answers || []);
                            }}
                          >
                            Aceitar resposta
                          </Button>
                        )}
                        <div className="text-slate-700 mb-2 whitespace-pre-line">
                          {ans.content}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <ThumbsUp className="w-4 h-4 text-emerald-400" />
                          <span>{ans.reactions?.length || 0}</span>
                          <Reactions
                            targetId={ans.id}
                            targetType="answer"
                            reactions={ans.reactions}
                            onReacted={(newReactions) =>
                              handleAnswerReacted(ans.id, newReactions)
                            }
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Formulário para responder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Send className="w-5 h-5" />
                Responder esta pergunta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnswerForm questionId={question.id} onSuccess={fetchData} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}