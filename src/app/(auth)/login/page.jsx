"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/common/Card";
import { Lock, ArrowLeft, AlertCircle, LogIn, Loader2 } from "lucide-react";

function OtpStep({ otp, onVerified }) {
  const [code, setCode] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const verify = (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError("");
    api
      .post("/api/auth/otp/verify/", { otp_session: otp.otp_session, code })
      .then(onVerified)
      .catch((err) => setError(err.message))
      .finally(() => setIsBusy(false));
  };

  const resend = () => {
    setError("");
    api
      .post("/api/auth/otp/resend/", { otp_session: otp.otp_session })
      .then(() => setNotice("A new code was sent."))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Enter Your Code</CardTitle>
          <CardDescription>We sent a 6-digit code to the mobile number ending {otp.phone_hint}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verify} className="space-y-4">
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {notice && <p className="text-sm text-emerald-600">{notice}</p>}
            <Input
              id="otp-code"
              label="Code"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" className="w-full" isLoading={isBusy}>
              Verify & Sign In
            </Button>
            <Button variant="ghost" className="w-full" onClick={resend}>
              Send a new code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized, initializeAuth, login } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(null);

  const fromParam = searchParams.get("from");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // If already logged in, redirect to dashboard or intended page
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(fromParam || "/dashboard");
    }
  }, [isInitialized, isAuthenticated, fromParam, router]);

  const finishLogin = (response) => {
    login(response.user, response.tokens);
    router.replace(fromParam || "/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login/", {
        username: identifier.trim(),
        password: password,
      });

      if (response?.otp_required) {
        setOtp(response);
      } else if (response?.user && response?.tokens) {
        finishLogin(response);
      } else {
        throw new Error("Invalid response received from authentication server.");
      }
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  if (otp) return <OtpStep otp={otp} onVerified={finishLogin} />;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-zinc-800">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to NetRise BOB</CardTitle>
          <CardDescription>
            Sign in to access your Enterprise MLM Dashboard & Wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fromParam && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
              Please sign in to access <strong>{fromParam}</strong>.
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              placeholder="e.g. leader or leader@netrise.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              isLoading={isLoading}
            >
              <LogIn className="h-4 w-4 mr-1.5" /> Sign In to Dashboard
            </Button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-400">
            <span className="font-bold text-gray-800 dark:text-zinc-200 block mb-1">
              Demo Test Account:
            </span>
            <div className="flex justify-between font-mono">
              <span>Username: <strong>leader</strong></span>
              <span>Pass: <strong>Password123!</strong></span>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Create an account
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/80 pt-4">
          <Link href="/" className="flex items-center gap-1 hover:text-emerald-600">
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
