"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();

  const [state, setState] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("Confirming your email address...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setMessage("Verification token is missing.");
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    verifyEmail(token)
      .then(() => {
        setState("success");
        setMessage("Email verified. Taking you to your dashboard...");

        timer = setTimeout(() => {
          router.replace("/dashboard");
        }, 900);
      })
      .catch((err: any) => {
        setState("error");
        setMessage(err?.message || "Invalid or expired verification link.");
      });

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [router, searchParams, verifyEmail]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f4f6f9",
        color: "#0f1e36",
        fontFamily: "'Poppins','Inter',system-ui,sans-serif",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          border: "1px solid #e2e6ed",
          padding: 36,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
          {state === "success"
            ? "Verified"
            : state === "error"
              ? "Verification failed"
              : "Verifying email"}
        </h1>

        <p style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.7 }}>
          {message}
        </p>

        {state === "error" && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            style={{
              marginTop: 24,
              width: "100%",
              background: "#1A56DB",
              color: "#fff",
              border: 0,
              padding: "13px 24px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
