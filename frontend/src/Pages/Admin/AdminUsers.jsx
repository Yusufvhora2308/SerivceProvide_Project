// PATH: src/Pages/Admin/AdminUsers.jsx

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showIdColumn, setShowIdColumn] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterStatus, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        page: currentPage,
        per_page: itemsPerPage,
        sort: sortConfig.key,
        direction: sortConfig.direction === 'ascending' ? 'asc' : 'desc',
      };

      // Remove undefined values
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      const response = await api.get('/admin/users', { params });
      
      // Handle response
      let usersData = [];
      let paginationData = {};
      
      if (response.data.success) {
        usersData = response.data.data || [];
        paginationData = response.data.pagination || {};
      } else {
        usersData = response.data.data || response.data || [];
      }

      // Format users data
      const formattedUsers = usersData.map(user => ({
        id: user.id,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        role: user.role || 'customer',
        status: user.status || 'active',
        joined: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A',
        bookings: user.bookings_count || user.bookings || 0,
        address: user.address || 'N/A',
        profile_photo: user.profile_photo || null,
        created_at: user.created_at,
      }));

      setUsers(formattedUsers);
      setTotalPages(paginationData.last_page || Math.ceil(formattedUsers.length / itemsPerPage));
      setTotalItems(paginationData.total || formattedUsers.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
      
      // Show error with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to load customers. Please try again.',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Filter users (client-side filtering with search)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.id && user.id.toString().includes(searchTerm));
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortConfig.key === 'id') {
      return sortConfig.direction === 'ascending' 
        ? a.id - b.id 
        : b.id - a.id;
    }
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === 'email') {
      return sortConfig.direction === 'ascending'
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    }
    if (sortConfig.key === 'joined') {
      return sortConfig.direction === 'ascending'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortConfig.key === 'bookings') {
      return sortConfig.direction === 'ascending'
        ? a.bookings - b.bookings
        : b.bookings - a.bookings;
    }
    return 0;
  });

  // Pagination
  const totalPagesLocal = Math.ceil(sortedUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPagesLocal) {
      setCurrentPage(pageNumber);
    }
  };

  // Status badge styles
  const getStatusBadge = (status) => {
    const styles = {
      active: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: <CheckCircle size={12} className="mr-1" />,
        label: "Active",
      },
      inactive: {
        bg: "bg-gray-100 dark:bg-gray-700",
        text: "text-gray-700 dark:text-gray-400",
        icon: <Clock size={12} className="mr-1" />,
        label: "Inactive",
      },
      suspended: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: <XCircle size={12} className="mr-1" />,
        label: "Suspended",
      },
    };
    return styles[status] || styles.inactive;
  };

  // Toggle user status with SweetAlert2
  const toggleUserStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const statusText = newStatus === "active" ? "activate" : "deactivate";
    
    const result = await Swal.fire({
      title: `${statusText === "activate" ? "Activate" : "Deactivate"} Customer?`,
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to <strong>${statusText}</strong> this customer?
          </p>
          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">${user.name}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">${user.email}</p>
            </div>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Current status: <span class="font-medium">${user.status}</span>
            → New status: <span class="font-medium text-blue-600 dark:text-blue-400">${newStatus}</span>
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus === "active" ? "#22c55e" : "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${statusText} customer`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // Update user status via API
        await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
        
        // Update local state
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        ));

        await Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Customer has been ${statusText}d successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error updating user status:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to update customer status. Please try again.',
          confirmButtonColor: '#3b82f6',
        });
      }
    }
  };

  // Delete user with SweetAlert2
  const deleteUser = async (user) => {
    const result = await Swal.fire({
      title: 'Delete Customer?',
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to permanently delete this customer?
          </p>
          <div class="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">${user.name}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">${user.email}</p>
            </div>
          </div>
          <p class="text-sm text-red-600 dark:text-red-400 mt-3 font-medium">
            ⚠️ This action cannot be undone!
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            All customer data including bookings and requests will be permanently deleted.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete customer",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // Delete user via API
        await api.delete(`/admin/users/${user.id}`);
        
        // Update local state
        setUsers(users.filter(u => u.id !== user.id));

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Customer has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete customer. Please try again.',
          confirmButtonColor: '#3b82f6',
        });
      }
    }
  };

  // View user details
  const viewUser = (user) => {
    Swal.fire({
      title: 'Customer Details',
      html: `
        <div class="text-left">
          <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-2xl font-semibold text-blue-600 dark:text-blue-400">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">${user.name}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">${user.email}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">${user.phone || 'N/A'}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400">ID</p>
              <p class="font-medium text-gray-900 dark:text-white">#${user.id}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p class="font-medium text-gray-900 dark:text-white capitalize">${user.status}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p class="font-medium text-gray-900 dark:text-white capitalize">${user.role}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400">Joined</p>
              <p class="font-medium text-gray-900 dark:text-white">${user.joined}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400">Bookings</p>
              <p class="font-medium text-gray-900 dark:text-white">${user.bookings}</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400">Address</p>
              <p class="font-medium text-gray-900 dark:text-white">${user.address || 'N/A'}</p>
            </div>
          </div>
        </div>
      `,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Close',
      width: '600px',
    });
  };

  // Close column menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && !event.target.closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnMenu]);

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={12} className="ml-1 text-slate-400" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={12} className="ml-1 text-blue-600" />
      : <ArrowDown size={12} className="ml-1 text-blue-600" />;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 dark:bg-gray-900/70">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Customers
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Manage all registered customers on the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Column Toggle Button */}
            <div className="relative column-menu-container">
      

           
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/25 dark:shadow-blue-600/40">
              <Plus size={18} />
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-slate-500 dark:text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-slate-500 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-slate-500 dark:text-gray-400">Inactive</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {users.filter(u => u.status === 'inactive').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-slate-500 dark:text-gray-400">Suspended</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {users.filter(u => u.status === 'suspended').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Search size={18} className="text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, phone or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400 dark:text-gray-300 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Filter size={18} className="text-slate-400 dark:text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm outline-none text-slate-700 dark:text-gray-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
              setCurrentPage(1);
            }}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-slate-500 dark:text-gray-400">Loading customers...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                      {showIdColumn && (
                        <th 
                          className="px-5 py-3 w-16 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center">
                            ID
                            {getSortIcon('id')}
                          </div>
                        </th>
                      )}
                      <th 
                        className="px-5 py-3 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Customer
                          {getSortIcon('name')}
                        </div>
                      </th>
                      <th 
                        className="px-5 py-3 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          {getSortIcon('email')}
                        </div>
                      </th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Status</th>
                      <th 
                        className="px-5 py-3 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleSort('joined')}
                      >
                        <div className="flex items-center">
                          Joined
                          {getSortIcon('joined')}
                        </div>
                      </th>
                      <th 
                        className="px-5 py-3 text-center cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleSort('bookings')}
                      >
                        <div className="flex items-center justify-center">
                          Bookings
                          {getSortIcon('bookings')}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => {
                        const statusStyle = getStatusBadge(user.status);
                        return (
                          <tr
                            key={user.id}
                            className="border-b border-slate-100 transition hover:bg-slate-50/50 last:border-0 dark:border-gray-700 dark:hover:bg-gray-700/50"
                          >
                            {showIdColumn && (
                              <td className="px-5 py-3.5 text-sm font-medium text-slate-500 dark:text-gray-400">
                                {user.id}
                              </td>
                            )}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                                    {user.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-gray-300">
                              {user.email}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-gray-300">
                              {user.phone}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                {statusStyle.icon}
                                {statusStyle.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-gray-400">
                              {user.joined}
                            </td>
                            <td className="px-5 py-3.5 text-center text-sm font-semibold text-slate-700 dark:text-gray-300">
                              {user.bookings}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => viewUser(user)}
                                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => toggleUserStatus(user)}
                                  className={`rounded-lg p-1.5 transition ${
                                    user.status === 'active'
                                      ? 'text-amber-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400'
                                      : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
                                  }`}
                                  title={user.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
                                >
                                  {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                                </button>
                                <button
                                  onClick={() => deleteUser(user)}
                                  className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                  title="Delete Customer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={showIdColumn ? 8 : 7} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Users size={40} className="text-slate-300 dark:text-gray-600" />
                            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">
                              No customers found
                            </p>
                            <p className="text-xs text-slate-400 dark:text-gray-500">
                              Try adjusting your search or filter settings
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {sortedUsers.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} customers
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-lg px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPagesLocal) }, (_, i) => {
                      let pageNum;
                      if (totalPagesLocal <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPagesLocal - 2) {
                        pageNum = totalPagesLocal - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`rounded-lg px-3 py-1 text-sm transition ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPagesLocal > 5 && currentPage < totalPagesLocal - 2 && (
                      <>
                        <span className="text-slate-400 dark:text-gray-500">...</span>
                        <button
                          onClick={() => paginate(totalPagesLocal)}
                          className="rounded-lg px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          {totalPagesLocal}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPagesLocal}
                      className="rounded-lg px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;