// PATH: src/components/Admin/AdminSidebar.jsx

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Wrench,
  ClipboardList,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  X,
  ChevronRight,
  Shield,
  MessageSquare,
  Star,
  Bell,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminSidebar = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );
        setUser(storedUser);
      } catch (error) {
        console.error("User Load Error:", error);
        setUser({});
      }
    };

    loadUser();
    window.addEventListener("userUpdated", loadUser);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("refresh_token");
      navigate("/admin/login");
    }
  };

  // Main Menu
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Customers",
      path: "/admin/users",
      icon: Users,
    },
    {
    name: "Service Providers",
    path: "/admin/providers",
    icon: UserCog,
    },
    {
      name: "Services",
      path: "/admin/services",
      icon: Wrench,
    },
    {
      name: "Service Requests",
      path: "/admin/requests",
      icon: ClipboardList,
    },
    {
      name: "Bookings",
      path: "/admin/bookings",
      icon: CalendarCheck,
    },
  ];

  // Management Menu
  const managementItems = [
    {
      name: "Payments",
      path: "/admin/payments",
      icon: CreditCard,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: BarChart3,
    },
    {
      name: "Audit Log",
      path: "/admin/audit-log",
      icon: Shield,
    },
    {
      name: "Feedback",
      path: "/admin/feedback",
      icon: Star,
    },
  ];

  // Communication Menu
  const communicationItems = [
    {
      name: "Messages",
      path: "/admin/messages",
      icon: MessageSquare,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
    },
  ];

  // Account Menu
  const accountItems = [
    {
      name: "My Profile",
      path: "/admin/profile",
      icon: Settings,
    },
    {
      name: "Help & Support",
      path: "/admin/help",
      icon: HelpCircle,
    },
  ];

  const renderMenu = (items) => {
    return items.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.name}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            `group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 dark:bg-blue-700 dark:shadow-blue-700/30"
                : "text-gray-600 hover:bg-blue-50/70 hover:text-blue-600 active:scale-[0.99] dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  strokeWidth={2}
                  className={`shrink-0 transition-transform duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
                />
                <span className="tracking-tight">{item.name}</span>
              </div>
              <ChevronRight
                size={15}
                className={`transition-all duration-200 ${
                  isActive
                    ? "translate-x-0 text-white/80 opacity-100"
                    : "-translate-x-1 text-blue-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              />
            </>
          )}
        </NavLink>
      );
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in lg:hidden dark:bg-black/60"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-gray-200/80 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:translate-x-0 dark:border-gray-700/80 dark:bg-gray-900/95 ${
          isOpen
            ? "translate-x-0 shadow-2xl shadow-gray-900/10"
            : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5 sm:h-20 sm:px-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-sm font-bold text-white shadow-sm shadow-blue-500/20">
              S
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-gray-900 sm:text-lg dark:text-white">
                Service
                <span className="text-blue-600">Hub</span>
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 active:scale-95 lg:hidden dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={19} />
          </button>
        </div>

        {/* User Card */}
        {/* <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50/80 p-2.5 ring-1 ring-gray-100 dark:bg-gray-800/80 dark:ring-gray-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-sm font-semibold text-blue-600 ring-1 ring-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400 dark:ring-blue-400/20">
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={user?.name || "Admin"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "A"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xs font-semibold leading-snug text-gray-900 sm:text-sm dark:text-white">
                {user?.name || "Admin"}
              </h2>
              <p className="truncate text-[11px] font-medium text-gray-400 dark:text-gray-500">
                {user?.email || "admin@servicehub.com"}
              </p>
            </div>
          </div>
        </div> */}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 dark:hover:scrollbar-thumb-gray-600">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Main Menu
          </p>
          <div className="space-y-1">{renderMenu(menuItems)}</div>

          <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Management
          </p>
          <div className="space-y-1">{renderMenu(managementItems)}</div>

          <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Communication
          </p>
          <div className="space-y-1">{renderMenu(communicationItems)}</div>

          <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Account
          </p>
          <div className="space-y-1">{renderMenu(accountItems)}</div>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onLogout || handleLogout}
            className="group flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50 active:scale-[0.99] dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <div className="flex items-center gap-3">
              <LogOut
                size={18}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;