// PATH: src/Pages/Landing.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, ArrowRight, Shield, Zap, Star } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-lg font-bold text-white shadow-lg shadow-blue-500/20">
              Q
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Quick<span className="text-blue-600">Service</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Welcome to <span className="text-blue-600">QuickService</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Your trusted platform for professional home services. 
            Choose how you want to continue.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          
          {/* Customer Card */}
          <button
            onClick={() => navigate("/login")}
            className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Decorative gradient */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100 opacity-50 transition-transform group-hover:scale-150" />
            
            <div className="relative">
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <User size={32} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                I Need a Service
              </h2>
              
              <p className="mt-3 text-slate-500 leading-relaxed">
                Book trusted professionals for your home needs. 
                Find nearby providers and get the job done.
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                    <Zap size={14} className="text-blue-600" />
                  </div>
                  Find nearby providers instantly
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                    <Star size={14} className="text-blue-600" />
                  </div>
                  Verified & rated professionals
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                    <Shield size={14} className="text-blue-600" />
                  </div>
                  Secure booking process
                </li>
              </ul>

              {/* CTA */}
              <div className="mt-8 flex items-center gap-2 font-semibold text-blue-600">
                Continue as Customer
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </button>

          {/* Provider Card */}
          <button
            onClick={() => navigate("/provider/login")}
            className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            {/* Decorative gradient */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-100 opacity-50 transition-transform group-hover:scale-150" />
            
            <div className="relative">
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Briefcase size={32} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                I Provide Services
              </h2>
              
              <p className="mt-3 text-slate-500 leading-relaxed">
                Grow your business by connecting with customers. 
                Manage bookings and earn more.
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <Zap size={14} className="text-emerald-600" />
                  </div>
                  Get new customers nearby
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <Star size={14} className="text-emerald-600" />
                  </div>
                  Manage your service requests
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <Shield size={14} className="text-emerald-600" />
                  </div>
                  Track earnings & grow
                </li>
              </ul>

              {/* CTA */}
              <div className="mt-8 flex items-center gap-2 font-semibold text-emerald-600">
                Continue as Provider
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </button>
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} QuickService. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;