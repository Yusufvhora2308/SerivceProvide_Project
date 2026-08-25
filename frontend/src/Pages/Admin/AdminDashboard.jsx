// PATH: src/Pages/Admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import {
  Users,
  UserCog,
  Wrench,
  ClipboardList,
  CalendarCheck,
  CreditCard,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock3,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [user, setUser] = useState({});
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [servicesResponse, requestsResponse] = await Promise.allSettled([
        api.get("/services"),
        api.get("/service-requests"),
      ]);

      if (servicesResponse.status === "fulfilled" && servicesResponse.value?.data?.data) {
        setServices(servicesResponse.value.data.data);
      }

      if (requestsResponse.status === "fulfilled" && requestsResponse.value?.data?.data) {
        setRequests(requestsResponse.value.data.data);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Customers",
      value: "1,247",
      change: "+12.5%",
      icon: Users,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      link: "/admin/users",
    },
    {
      title: "Service Providers",
      value: "186",
      change: "+8.2%",
      icon: UserCog,
      bg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      link: "/admin/providers",
    },
    {
      title: "Total Revenue",
      value: "$24,850",
      change: "+18.4%",
      icon: DollarSign,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      link: "/admin/payments",
    },
    {
      title: "Service Requests",
      value: requests.length || "328",
      change: "+4.6%",
      icon: ClipboardList,
      bg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      link: "/admin/requests",
    },
  ];

  const quickActions = [
    {
      title: "Manage Customers",
      description: "View and manage registered customers",
      icon: Users,
      link: "/admin/users",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Manage Providers",
      description: "Verify and manage service providers",
      icon: UserCog,
      link: "/admin/providers",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Manage Services",
      description: "Add, edit and manage services",
      icon: Wrench,
      link: "/admin/services",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Service Requests",
      description: "Monitor customer service requests",
      icon: ClipboardList,
      link: "/admin/requests",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Bookings",
      description: "Manage confirmed bookings",
      icon: CalendarCheck,
      link: "/admin/bookings",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Reports",
      description: "View business reports and analytics",
      icon: CreditCard,
      link: "/admin/reports",
      bg: "bg-pink-50 dark:bg-pink-900/20",
      color: "text-pink-600 dark:text-pink-400",
    },
  ];

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 dark:bg-gray-900/70">
      <div className="mx-auto max-w-7xl">
        {/* Welcome */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg sm:p-8 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-700">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-white/10" />
            <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-white/5" />

            <div className="relative z-10">
              <p className="mb-1 text-sm font-medium text-blue-100">
                ServiceHub Administration
              </p>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Good Afternoon, {user?.name || "Admin"} 👋
              </h1>
              <p className="mt-2 max-w-xl text-sm text-blue-100">
                Manage customers, service providers, services and service requests from one place.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  Service Management
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  Provider Management
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  Customer Management
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.title}
                to={stat.link}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 sm:text-sm dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                      {loading ? "..." : stat.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ↑ {stat.change} this month
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                    <Icon size={22} className={stat.iconColor} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400">
                  View details
                  <ArrowUpRight size={14} />
                </div>
              </Link>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section className="mb-7">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Quick Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Manage the main areas of your service portal
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  to={item.link}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                      <Icon size={21} className={item.color} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-gray-400">
                        {item.description}
                      </p>
                      <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${item.color}`}>
                        Manage
                        <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom Grid */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Recent Requests */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Service Requests
                </h2>
                <p className="text-xs text-slate-400 dark:text-gray-500">
                  Latest customer requests
                </p>
              </div>
              <Link
                to="/admin/requests"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentRequests.length > 0 ? (
              <div className="space-y-3">
                {recentRequests.map((request, index) => (
                  <div
                    key={request.id || index}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-gray-700/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <ClipboardList size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                        {request.service?.name || request.service_name || "Service Request"}
                      </p>
                      <p className="truncate text-xs text-slate-400 dark:text-gray-400">
                        {request.status || "Pending"} request
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      {request.status || "pending"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 py-10 text-center dark:bg-gray-700/50">
                <ClipboardList size={30} className="mx-auto text-slate-300 dark:text-gray-600" />
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-gray-400">
                  No recent requests
                </p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              System Overview
            </h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
              Current portal status
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Services</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">System operational</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <Clock3 size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Requests</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Monitoring active</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
                  <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Providers</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Verification required</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/30">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                Admin Tip
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-600 dark:text-blue-300">
                Verify service providers before allowing them to accept customer requests.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;