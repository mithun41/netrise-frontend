"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/common/Card";
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle2, Users, Loader2 } from "lucide-react";

const EMPTY_SPONSOR = { loading: false, valid: false, info: null, error: "" };

async function lookupSponsor(code) {
  try {
    const res = await api.post("/api/auth/validate-sponsor/", { sponsor_code: code.trim() });
    if (res?.valid && res?.sponsor) {
      return { loading: false, valid: true, info: res.sponsor, error: "" };
    }
  } catch {
    // Reported below as a code that was not found
  }
  return {
    ...EMPTY_SPONSOR,
    error: "Sponsor code not found. You can leave it empty or check spelling.",
  };
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = (searchParams.get("ref") || "").trim();
  const { isAuthenticated, isInitialized, initializeAuth, login } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isInitialized, isAuthenticated, router]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    sponsor_code: refCode,
  });

  const [sponsorState, setSponsorState] = useState({
    ...EMPTY_SPONSOR,
    loading: Boolean(refCode),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check URL query param for sponsor code (?ref=NRBXXXXXX)
  useEffect(() => {
    if (refCode) {
      lookupSponsor(refCode).then(setSponsorState);
    }
  }, [refCode]);

  const verifySponsor = async (code) => {
    setSponsorState((prev) => ({ ...prev, loading: true, error: "" }));
    setSponsorState(await lookupSponsor(code));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "sponsor_code") {
      if (value.trim().length >= 4) {
        verifySponsor(value.trim());
      } else {
        setSponsorState(EMPTY_SPONSOR);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.sponsor_code.trim()) {
        delete payload.sponsor_code;
      }

      const response = await api.post("/api/auth/register/", payload);
      if (response?.user && response?.tokens) {
        login(response.user, response.tokens);
        router.push("/dashboard");
      } else {
        throw new Error("Registration succeeded but failed to obtain session.");
      }
    } catch (err) {
      setError(err.message || "Failed to register. Please review the form.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl border-gray-200 dark:border-zinc-800">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-2">
          <UserPlus className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Join NetRise BOB</CardTitle>
        <CardDescription>
          Create your account and start your business journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sponsor Code Section */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Sponsor / Referral Code (Optional)
              </label>
              {sponsorState.loading && (
                <span className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                </span>
              )}
            </div>
            <Input
              name="sponsor_code"
              placeholder="e.g. NRB123456"
              value={formData.sponsor_code}
              onChange={handleChange}
              className="bg-white dark:bg-zinc-900 text-sm"
            />
            {sponsorState.valid && sponsorState.info && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Sponsor Verified: <strong>{sponsorState.info.name}</strong> (@{sponsorState.info.username}) &bull; Rank: {sponsorState.info.rank}
                </span>
              </div>
            )}
            {sponsorState.error && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {sponsorState.error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Username"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="first_name"
              placeholder="John"
              value={formData.first_name}
              onChange={handleChange}
            />
            <Input
              label="Last Name"
              name="last_name"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Phone Number"
            name="phone_number"
            placeholder="+880 1700 000000"
            value={formData.phone_number}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm Password"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800/80 pt-4">
        <Link href="/" className="flex items-center gap-1 hover:text-blue-600">
          <ArrowLeft className="h-3 w-3" /> Back to Home
        </Link>
        <Link href="/login" className="text-blue-600 hover:underline">
          Go to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center p-8 text-gray-500">Loading registration form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

