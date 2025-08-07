"use client";

import React, { useEffect, useState } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";
import Link from "next/link";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export const AdminAuthCheck: React.FC<AdminAuthCheckProps> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.uid) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/check/${user.uid}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-md mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="p-8">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Login Required
              </h2>
              <p className="text-slate-600 mb-6">
                Please log in to access the admin dashboard.
              </p>
              <Button asChild>
                <Link href="/auth">Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <div className="max-w-md mx-auto px-4 py-12">
          <Card className="text-center border-red-200">
            <CardContent className="p-8">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Access Denied
              </h2>
              <p className="text-slate-600 mb-6">
                You don't have administrator privileges to access this area.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};