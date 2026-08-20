import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  ShieldAlert,
  FileCheck,
  PhoneCall,
  Mail,
  RefreshCw,
  LogOut,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import api from "../../api/axios";

const ProviderVerificationPending = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
    } catch {
      setUser({});
    }
  }, []);

  const handleRefreshStatus = async () => {
    setChecking(true);
    try {
      const response = await api.get("/provider/profile");
      const providerData = response.data.data;

      // Check if approved
      if (providerData?.status === "approved" || providerData?.is_verified) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, status: "approved", is_verified: true }),
        );
        navigate("/provider/dashboard");
      }
    } catch (err) {
      console.error("Status check failed:", err);
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("remember");
    window.location.href = "/login";
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-slate-50/70 px-3.5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-2 select-none">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-sm font-bold text-white shadow-sm shadow-blue-500/20">
            S
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Service<span className="text-blue-600">Hub</span>
          </span>
        </div>

        {/* Main Card */}
        <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm">
          {/* Animated Status Icon */}
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/60 sm:h-20 sm:w-20">
            <Clock
              className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse"
              strokeWidth={2}
            />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-white shadow-xs">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
              Verification in Progress
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Hello,{" "}
              <span className="font-semibold text-slate-700">
                {user?.name || "Partner"}
              </span>
              ! Your provider account and submitted documents are currently
              under review.
            </p>
          </div>

          {/* Verification Timeline / Steps Card */}
          <div className="mt-6 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Review Pipeline
            </span>

            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FileCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  Documents Submitted
                </p>
                <p className="text-[11px] text-slate-400">
                  ID proof & service certificates received
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  Admin Verification
                </p>
                <p className="text-[11px] text-slate-400">
                  Usually takes 24 to 48 business hours
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  Account Activation
                </p>
                <p className="text-[11px] text-slate-400">
                  Start accepting customer service requests
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            {/* Refresh Status Button */}
            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={checking}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
              />
              <span>
                {checking ? "Checking Approval Status..." : "Check Status Now"}
              </span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99] sm:text-sm"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Support / Contact Section */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Need urgent assistance with your onboarding?
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
              <a
                href="mailto:support@servicehub.com"
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                Email Support
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="tel:+911800123456"
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-500" />
                Call Desk
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          ServiceHub Partner Onboarding • All rights reserved
        </p>
      </div>
    </main>
  );
};

export default ProviderVerificationPending;
