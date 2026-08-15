// PATH: src/Pages/Users/UserDashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios"; 

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    jobs: 156,
    applications: 23,
    interviews: 5,
    savedJobs: 12,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user, redirect to login
      navigate("/login");
    }
    fetchStats();
    setLoading(false);
  }, [navigate]);

  const fetchStats = async () => {
    try {
      // Uncomment when API endpoints are ready
      // const response = await api.get("/user/stats");
      // if (response.data.success) {
      //   setStats(response.data.data);
      // }
      
      console.log("📊 User stats loaded successfully");
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all localStorage data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("userLoginMessage");
      localStorage.removeItem("userLoginIsError");
      localStorage.removeItem("userLoginSuccess");
      
      // Redirect to login
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Session expired. Please login again.</p>
          <Link to="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30">
                U
              </div>
              <span className="ml-3 text-xl font-bold text-slate-900">User Dashboard</span>
              <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border border-red-200 hover:border-red-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.name || "User"}! 👋
            </h1>
            <p className="text-blue-100 mt-2">Find your dream job and build your career</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium">
                💼 Job Portal
              </span>
              <span className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium">
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Jobs</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.jobs}</p>
                <p className="text-xs text-emerald-600 mt-1">↑ Available positions</p>
              </div>
              <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Applications</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.applications}</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 3 new this week</p>
              </div>
              <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Interviews</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.interviews}</p>
                <p className="text-xs text-amber-600 mt-1">Scheduled interviews</p>
              </div>
              <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Saved Jobs</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.savedJobs}</p>
                <p className="text-xs text-purple-600 mt-1">Saved for later</p>
              </div>
              <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/jobs" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition">Browse Jobs</h3>
                <p className="text-sm text-slate-500 mt-1">Find your dream job</p>
                <span className="mt-2 inline-block text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  View Jobs →
                </span>
              </div>
            </div>
          </Link>
          
          <Link to="/applications" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition">My Applications</h3>
                <p className="text-sm text-slate-500 mt-1">Track your applications</p>
                <span className="mt-2 inline-block text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  View Applications →
                </span>
              </div>
            </div>
          </Link>
          
          <Link to="/profile" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition">My Profile</h3>
                <p className="text-sm text-slate-500 mt-1">Update your profile</p>
                <span className="mt-2 inline-block text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  View Profile →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <span className="text-sm text-slate-500">Last 7 days</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">J</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Applied for a job</p>
                <p className="text-xs text-slate-500">Applied to Senior Developer position</p>
              </div>
              <span className="text-xs text-slate-400">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">I</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Interview scheduled</p>
                <p className="text-xs text-slate-500">Interview with Google on Friday</p>
              </div>
              <span className="text-xs text-slate-400">1 day ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">S</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Saved a job</p>
                <p className="text-xs text-slate-500">Saved UX Designer position</p>
              </div>
              <span className="text-xs text-slate-400">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;