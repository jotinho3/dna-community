"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Loader2,
  Save,
  User,
  MapPin,
  Globe,
  Type,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<{
    name: string;
    title: string;
    bio: string;
    location: string;
    website: string;
    experience: string;
    skills: string[];
    tools: string[];
    languages: string[];
    interests: string[];
  }>({
    name: "",
    title: "",
    bio: "",
    location: "",
    website: "",
    experience: "",
    skills: [],
    tools: [],
    languages: [],
    interests: [],
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        title: user.profile?.title || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        website: user.profile?.website || "",
        experience: user.profile?.experience || "",
        skills: user.profile?.skills || [],
        tools: user.profile?.tools || [],
        languages: user.profile?.languages || [],
        interests: user.profile?.interests || [],
      });
    }
  }, [user]);

  const updateProfile = async (data: typeof formData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => router.push(`/profile/${user?.uid}`), 1500);
    } catch {
      setError("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!formData.name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    await updateProfile(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p>Faça login para editar seu perfil.</p>
            <Button className="mt-4" asChild>
              <Link href="/signin">Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={`/profile/${user.uid}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o perfil
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>Atualize suas informações</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {success && (
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <AlertDescription className="text-emerald-700">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-bold">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-slate-600">Foto de perfil</p>
                    <Button variant="outline" size="sm" className="mt-1">
                      Alterar Avatar
                    </Button>
                  </div>
                </div>

                {[
                  {
                    id: "name",
                    label: "Nome completo",
                    icon: <User className="w-4 h-4 mr-2 text-slate-500" />,
                    value: formData.name,
                    onChange: (v: string) =>
                      setFormData({ ...formData, name: v }),
                  },
                  {
                    id: "title",
                    label: "Cargo / Título profissional",
                    icon: <Type className="w-4 h-4 mr-2 text-slate-500" />,
                    value: formData.title,
                    onChange: (v: string) =>
                      setFormData({ ...formData, title: v }),
                  },
                  {
                    id: "location",
                    label: "Localização",
                    icon: <MapPin className="w-4 h-4 mr-2 text-slate-500" />,
                    value: formData.location,
                    onChange: (v: string) =>
                      setFormData({ ...formData, location: v }),
                  },
                  {
                    id: "website",
                    label: "Website",
                    icon: <Globe className="w-4 h-4 mr-2 text-slate-500" />,
                    value: formData.website,
                    onChange: (v: string) =>
                      setFormData({ ...formData, website: v }),
                  },
                ].map((field) => (
                  <div key={field.id} className="space-y-1">
                    <Label htmlFor={field.id} className="flex items-center">
                      {field.icon}
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience" className="capitalize">
                      Experiência
                    </Label>
                    <Input
                      id="experience"
                      placeholder="Descreva sua experiência"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {["skills", "tools", "languages", "interests"].map(
                    (field) => (
                      <div key={field}>
                        <Label htmlFor={field} className="capitalize">
                          {field}
                        </Label>
                        <Input
                          id={field}
                          placeholder="Separe por vírgula"
                          value={(formData as any)[field]?.join(", ") ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field]: e.target.value
                                .split(",")
                                .map((v) => v.trim()),
                            })
                          }
                          disabled={isLoading}
                        />
                      </div>
                    )
                  )}
                </div>

                <div className="flex space-x-4 pt-2">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/profile/${user.uid}`}>Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
