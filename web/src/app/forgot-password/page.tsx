"use client";

import { ApiError } from "@ripple/api-client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { rippleClient } from "@/lib/apiClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await rippleClient.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold">Reset your password</h1>
      {sent ? (
        <p className="mt-4 text-sm text-zinc-500">
          If that email has an account, we&apos;ve sent a link to reset your
          password.
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-zinc-500">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-zinc-900 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}
      <p className="mt-4 text-sm text-zinc-500">
        <Link href="/login" className="underline">
          Back to log in
        </Link>
      </p>
    </main>
  );
}
