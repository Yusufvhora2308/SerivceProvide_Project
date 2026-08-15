// PATH: src/Pages/Admin/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 1247,
    classes: 48,
    teachers: 36,
    students: 2850,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user, redirect to login
      navigate("/admin/login");
    }
    fetchStats();
    setLoading(false);
  }, [navigate]);

  const fetchStats = async () => {
    try {
      // Uncomment when API endpoints are ready
      // const response = await api.get("/admin/stats");
      // if (response.data.success) {
      //   setStats(response.data.data);
      // }
      
      // For demo, keeping static data
      console.log("📊 Stats loaded successfully");
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
      localStorage.removeItem("loginMessage");
      localStorage.removeItem("loginIsError");
      localStorage.removeItem("loginSuccess");
      
      // Redirect to admin login
      navigate("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
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
          <Link to="/admin/login" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition">
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
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/30">
                A
              </div>
              <span className="ml-3 text-xl font-bold text-slate-900">Admin Panel</span>
              <span className="ml-3 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || "Admin"}</p>
                  <p className="text-xs text-slate-500">{user?.email || "admin@school.com"}</p>
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
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.name || "Admin"}! 👋
            </h1>
            <p className="text-indigo-100 mt-2">Manage your school management system efficiently</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium">
                🏫 School Management System
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
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.users}</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 12% this month</p>
              </div>
              <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Classes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.classes}</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 5 new this week</p>
              </div>
              <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Teachers</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.teachers}</p>
                <p className="text-xs text-slate-500 mt-1">Active faculty</p>
              </div>
              <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.students}</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 8% from last year</p>
              </div>
              <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/users" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">Manage Users</h3>
                <p className="text-sm text-slate-500 mt-1">View and manage all users</p>
                <span className="mt-2 inline-block text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  View Users →
                </span>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/classes" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition">Manage Classes</h3>
                <p className="text-sm text-slate-500 mt-1">Create and manage classes</p>
                <span className="mt-2 inline-block text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  View Classes →
                </span>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/reports" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition">Reports</h3>
                <p className="text-sm text-slate-500 mt-1">View system reports</p>
                <span className="mt-2 inline-block text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  View Reports →
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
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">U</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">New user registered</p>
                <p className="text-xs text-slate-500">John Doe created an account</p>
              </div>
              <span className="text-xs text-slate-400">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">C</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">New class created</p>
                <p className="text-xs text-slate-500">Class 10-A has been added</p>
              </div>
              <span className="text-xs text-slate-400">5 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">T</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Teacher assigned</p>
                <p className="text-xs text-slate-500">Mrs. Smith assigned to Class 8-B</p>
              </div>
              <span className="text-xs text-slate-400">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;