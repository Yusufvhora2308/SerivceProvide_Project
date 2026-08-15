import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import CustomerSidebar from "./CustomerSidebar";
import CustomerNavbar from "./CustomerNavbar";

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}

      <CustomerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}

      <div className="lg:ml-72">
        {/* Navbar */}

        <CustomerNavbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}

        <main className="min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
