import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";

const CustomerNavbar = ({ onMenuClick, onLogout }) => {
  const [user, setUser] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
    } catch {
      setUser({});
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-full items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Menu Button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95 lg:hidden"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Center: Brand Logo & Title (Mobile & Tablet Only, Hidden on Desktop) */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 select-none lg:hidden pointer-events-none">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-xs sm:text-sm font-bold text-white shadow-sm shadow-blue-500/20">
            S
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-gray-900 whitespace-nowrap">
            Service<span className="text-blue-600">Hub</span>
          </span>
        </div>

        {/* Right: Notification & Profile */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          
          {/* Notification Button */}
          <button
            type="button"
            aria-label="Notifications"
            className="group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-6" />
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </span>
          </button>

          <div className="hidden sm:block h-6 w-px bg-gray-200" />

          {/* Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className="flex items-center gap-2 rounded-xl p-1 sm:p-1.5 transition-colors hover:bg-gray-100 active:scale-98"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-xs sm:text-sm font-semibold text-blue-600 ring-1 ring-blue-600/10">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div className="hidden md:block text-left">
                <p className="max-w-28 lg:max-w-40 truncate text-xs sm:text-sm font-semibold leading-tight text-gray-800">
                  {user?.name || "Customer"}
                </p>
                <p className="text-[11px] font-medium text-gray-400">
                  {user?.role || "Customer"}
                </p>
              </div>

              <ChevronDown
                className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 sm:block ${
                  isDropdownOpen ? "rotate-180 text-gray-600" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-900/5 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                <div className="border-b border-gray-100 px-3 py-2 md:hidden mb-1">
                  <p className="truncate text-xs font-semibold text-gray-900">{user?.name || "Customer"}</p>
                  <p className="text-[11px] text-gray-400">{user?.email || "customer@servicehub.com"}</p>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  My Profile
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  Settings
                </button>
                <div className="my-1 h-px bg-gray-100" />
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
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

export default CustomerNavbar;