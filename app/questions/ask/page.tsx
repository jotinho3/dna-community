"use client";

import { AskQuestionForm } from "@/components/AskQuestionForm";

export default function AskQuestionPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        Fazer uma Pergunta
      </h1>
      <AskQuestionForm />
    </div>
  );
}
