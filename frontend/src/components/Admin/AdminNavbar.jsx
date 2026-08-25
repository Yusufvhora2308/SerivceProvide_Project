// PATH: src/components/Admin/AdminNavbar.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminNavbar = ({ onMenuClick, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New provider registration pending", time: "5 min ago", read: false },
    { id: 2, message: "Payment #1234 completed", time: "1 hour ago", read: false },
    { id: 3, message: "Service request #567 assigned", time: "3 hours ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Load user
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

  // Close dropdowns outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "A";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-gray-700/80 dark:bg-gray-900/95 sm:h-20">
      <div className="relative mx-auto flex h-full items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left - Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95 sm:h-10 sm:w-10 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Brand - Always visible on desktop, hidden on mobile */}
        
        </div>

        {/* Center Brand - Mobile only (hidden on desktop) */}
        <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 select-none items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-xs font-bold text-white shadow-sm shadow-blue-500/20 sm:h-9 sm:w-9 sm:text-sm">
            S
          </div>
          <span className="whitespace-nowrap text-sm font-bold tracking-tight text-gray-900 dark:text-white sm:text-base">
            Service
            <span className="text-blue-600">Hub</span>
          </span>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          {/* Search - Desktop */}
          <div className="hidden md:flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-1.5 border border-gray-200/50 dark:bg-gray-800 dark:border-gray-700">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none dark:text-gray-300 dark:placeholder-gray-500 w-32 lg:w-48"
            />
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 active:scale-95 sm:h-10 sm:w-10 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          {/* Notification */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 active:scale-95 sm:h-10 sm:w-10 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Bell className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-900/5 ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </span>
                  <button
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.read ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <Bell className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                        No notifications
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 px-3 py-2 dark:border-gray-700">
                  <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden h-6 w-px bg-gray-200 sm:block dark:bg-gray-700" />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-gray-100 active:scale-95 sm:p-1.5 dark:hover:bg-gray-800"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-xs font-semibold text-blue-600 ring-1 ring-blue-600/10 sm:h-9 sm:w-9 lg:h-10 lg:w-10 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400 dark:ring-blue-400/20">
                {user?.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={user?.name || "Admin"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getUserInitial()}</span>
                )}
              </div>

              <div className="hidden text-left md:block">
                <p className="max-w-28 truncate text-xs font-semibold leading-tight text-gray-800 lg:max-w-40 sm:text-sm dark:text-gray-200">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[11px] font-medium capitalize text-gray-400 dark:text-gray-500">
                  {user?.role || "Administrator"}
                </p>
              </div>

              <ChevronDown
                className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 sm:block dark:text-gray-500 ${
                  isDropdownOpen ? "rotate-180 text-gray-600 dark:text-gray-300" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-900/5 ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
                {/* Mobile User Info */}
                <div className="mb-1 flex items-center gap-3 border-b border-gray-100 px-3 py-3 md:hidden dark:border-gray-700">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {user?.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={user?.name || "Admin"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getUserInitial()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                      {user?.name || "Admin"}
                    </p>
                    <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                      {user?.email || "admin@servicehub.com"}
                    </p>
                  </div>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/admin/profile");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  My Profile
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/admin/settings");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <Settings className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  Settings
                </button>

                {/* Admin Section */}
                <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/admin/audit-log");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  Audit Log
                </button>

                <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout ? onLogout() : handleLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <LogOut className="h-4 w-4 text-red-500 dark:text-red-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;