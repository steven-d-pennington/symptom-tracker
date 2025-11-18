"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Check, Mail, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export default function ThankYouPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get the email from localStorage to display
    const email = localStorage.getItem("beta_signup_email");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    // Get the stored verification code from localStorage
    const storedCode = localStorage.getItem("beta_verification_code");

    if (!storedCode) {
      setError("We couldn't find your verification code. Please request a new one below.");
      setIsVerifying(false);
      return;
    }

    // Validate the entered code against the stored code
    if (verificationCode.toUpperCase() === storedCode.toUpperCase()) {
      // Clear the verification code from localStorage
      localStorage.removeItem("beta_verification_code");
      localStorage.removeItem("beta_signup_email");

      // Redirect to onboarding
      router.push("/onboarding");
    } else {
      setError("That code doesn't match. Please check your email and try again, or request a new code below.");
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      const response = await fetch("/api/beta-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      // Update verification code in localStorage
      if (data.verificationCode) {
        localStorage.setItem("beta_verification_code", data.verificationCode);
      }

      setResendSuccess(true);
      setVerificationCode("");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Resend error:", err);
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col">
      {/* Header/Nav */}
      <header className="border-b border-border/40 backdrop-blur-md bg-background/90 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-foreground">Pocket Symptom Tracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-2xl w-full text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/50 mb-8 animate-in zoom-in duration-500">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" strokeWidth={3} />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-in slide-in-from-bottom duration-500">
            Check Your Email! 📧
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-500 delay-100">
            We've sent a verification code to {userEmail ? <strong>{userEmail}</strong> : "your email"}
          </p>

          {/* Verification Form */}
          <div className="bg-card border-2 border-border rounded-2xl p-8 mb-10 shadow-xl animate-in slide-in-from-bottom duration-500 delay-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-foreground mb-2">Enter Your Verification Code</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Check your inbox for an email with your verification code. It should arrive within a few minutes.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g., ABC12345)"
                  required
                  disabled={isVerifying}
                  maxLength={8}
                  className="w-full px-5 py-4 rounded-xl border-2 border-border bg-background text-foreground text-center text-lg font-mono uppercase placeholder:text-muted-foreground placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-950/50 border-2 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-left">{error}</span>
                </div>
              )}

              {resendSuccess && (
                <div className="px-4 py-3 bg-green-50 dark:bg-green-950/50 border-2 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>New verification code sent! Check your email.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || !verificationCode}
                className="w-full px-8 py-4 bg-gradient-to-r from-primary to-pink-500 text-white text-lg font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={isResending || !userEmail}
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? "Sending..." : "Send me a new code"}
              </button>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <Link href="/" className="text-primary hover:underline font-semibold">
                  return to home page
                </Link>
              </p>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-border rounded-2xl p-8 mb-10 shadow-lg animate-in slide-in-from-bottom duration-500 delay-300">
            <h3 className="text-2xl font-bold text-foreground mb-6">What Happens Next?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-pink-500 text-white font-bold flex items-center justify-center mb-3 text-lg">
                  1
                </div>
                <h4 className="font-semibold text-foreground mb-2">Check Your Email</h4>
                <p className="text-sm text-muted-foreground">
                  Look for your verification code in the welcome email we just sent
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-pink-500 text-white font-bold flex items-center justify-center mb-3 text-lg">
                  2
                </div>
                <h4 className="font-semibold text-foreground mb-2">Enter the Code</h4>
                <p className="text-sm text-muted-foreground">
                  Copy and paste the code from your email into the field above
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-pink-500 text-white font-bold flex items-center justify-center mb-3 text-lg">
                  3
                </div>
                <h4 className="font-semibold text-foreground mb-2">Start Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Get personalized onboarding and begin your health journey
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a
              href="mailto:steve.d.pennington@gmail.com"
              className="text-primary hover:underline font-semibold"
            >
              steve.d.pennington@gmail.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-foreground">Pocket Symptom Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Pocket Symptom Tracker. Built with ❤️ for people managing chronic conditions.
          </p>
        </div>
      </footer>
    </div>
  );
}
