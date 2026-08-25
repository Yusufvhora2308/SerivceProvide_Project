// PATH: src/Pages/Admin/Providers.jsx

import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCog,
  Mail,
  Phone,
  Wrench,
  FileText,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showIdColumn, setShowIdColumn] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  useEffect(() => {
    fetchProviders();
  }, [status, search, currentPage, sortConfig]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      const response = await api.get("/admin/providers", {
        params: {
          status: status !== "all" ? status : undefined,
          search: search || undefined,
          page: currentPage,
          per_page: perPage,
          sort: sortConfig.key,
          direction: sortConfig.direction === 'ascending' ? 'asc' : 'desc',
        },
      });

      console.log("Providers API Response:", response.data);

      let providersData = [];
      let paginationData = {};
      
      if (response.data?.success && response.data?.data) {
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          providersData = response.data.data.data;
          paginationData = {
            current_page: response.data.data.current_page || 1,
            last_page: response.data.data.last_page || 1,
            total: response.data.data.total || 0,
            per_page: response.data.data.per_page || 10,
          };
        } else if (Array.isArray(response.data.data)) {
          providersData = response.data.data;
        } else {
          providersData = [];
        }
      } else if (Array.isArray(response.data)) {
        providersData = response.data;
      } else {
        providersData = [];
      }

      console.log("Extracted providers:", providersData);
      
      setProviders(providersData);
      setTotalPages(paginationData.last_page || 1);
      setTotalItems(paginationData.total || providersData.length);
    } catch (error) {
      console.error("Providers error:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to load providers. Please try again.',
        confirmButtonColor: '#3b82f6',
      });
      
      setProviders([]);
    } finally {
      setLoading(false);
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

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={12} className="ml-1 text-slate-400" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={12} className="ml-1 text-blue-600" />
      : <ArrowDown size={12} className="ml-1 text-blue-600" />;
  };

  const approveProvider = async (provider) => {
    const result = await Swal.fire({
      title: 'Approve Provider?',
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to approve <strong>${provider.user?.name}</strong>?
          </p>
          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold dark:bg-emerald-900/30 dark:text-emerald-400">
              ${provider.user?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">${provider.user?.name}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">${provider.user?.email}</p>
            </div>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
            This will <span class="font-semibold text-emerald-600 dark:text-emerald-400">approve</span> the provider and they will be able to accept service requests.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(true);

      const response = await api.post(
        `/admin/providers/${provider.id}/approve`
      );

      await Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: response.data?.message || 'Provider approved successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      setSelectedProvider(null);
      await fetchProviders();
    } catch (error) {
      console.error(error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || "Unable to approve provider.",
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (provider) => {
    setSelectedProvider(provider);
    setRejectReason(provider.rejection_reason || "");
    setShowRejectModal(true);
  };

  const rejectProvider = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reason Required',
        text: 'Please enter a rejection reason.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.post(
        `/admin/providers/${selectedProvider.id}/reject`,
        {
          reason: rejectReason,
        }
      );

      await Swal.fire({
        icon: 'success',
        title: 'Rejected!',
        text: response.data?.message || 'Provider rejected successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      setShowRejectModal(false);
      setSelectedProvider(null);
      setRejectReason("");
      await fetchProviders();
    } catch (error) {
      console.error(error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || "Unable to reject provider.",
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle size={13} />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <XCircle size={13} />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
        <Clock size={13} />
        Pending
      </span>
    );
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProviders();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 p-4 sm:p-5 lg:p-6 dark:bg-gray-900/70">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              Service Providers
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              Review, verify and manage service providers.
            </p>
          </div>
          
      
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
              />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:bg-gray-700"
              />
            </div>

            {/* Status */}
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["pending", "Pending"],
                ["approved", "Approved"],
                ["rejected", "Rejected"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setStatus(value);
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    status === value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setCurrentPage(1);
                fetchProviders();
              }}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <span className="text-slate-600 dark:text-gray-400">
              Total: <strong className="text-slate-900 dark:text-white">{totalItems || providers.length}</strong>
            </span>
            <span className="text-slate-600 dark:text-gray-400">
              Pending: <strong className="text-amber-600 dark:text-amber-400">
                {providers.filter(p => p.verification_status === 'pending').length}
              </strong>
            </span>
            <span className="text-slate-600 dark:text-gray-400">
              Approved: <strong className="text-emerald-600 dark:text-emerald-400">
                {providers.filter(p => p.verification_status === 'approved').length}
              </strong>
            </span>
            <span className="text-slate-600 dark:text-gray-400">
              Rejected: <strong className="text-red-600 dark:text-red-400">
                {providers.filter(p => p.verification_status === 'rejected').length}
              </strong>
            </span>
          </div>
        )}

        {/* Provider Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-sm text-slate-500 dark:text-gray-400">Loading providers...</p>
              </div>
            </div>
          ) : providers.length === 0 ? (
            <div className="py-16 text-center">
              <UserCog size={38} className="mx-auto text-slate-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-gray-400">
                No providers found
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
                No providers match your current filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <tr>
                    {showIdColumn && (
                      <th 
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          ID
                          {getSortIcon('id')}
                        </div>
                      </th>
                    )}
                    <th 
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Provider
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                      Contact
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                      Services
                    </th>
                    <th 
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleSort('verification_status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('verification_status')}
                      </div>
                    </th>
                    <th 
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Joined
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {providers.map((provider) => (
                    <tr key={provider.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50">
                      {showIdColumn && (
                        <td className="px-5 py-4 text-sm font-medium text-slate-500 dark:text-gray-400">
                          {provider.id}
                        </td>
                      )}
                      {/* Provider */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            {provider.user?.name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              {provider.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-gray-500">
                              {provider.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-300">
                          <Phone size={13} />
                          {provider.user?.phone || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
                          Docs: {provider.documents?.length || 0}
                        </p>
                      </td>

                      {/* Services */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Wrench size={14} className="text-blue-500" />
                          <span className="text-xs font-medium text-slate-600 dark:text-gray-300">
                            {provider.services?.length || 0}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {statusBadge(provider.verification_status)}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-gray-400">
                        {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedProvider(provider)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          {provider.verification_status !== "approved" && (
                            <button
                              disabled={actionLoading}
                              onClick={() => approveProvider(provider)}
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                          )}

                          {provider.verification_status !== "rejected" && (
                            <button
                              disabled={actionLoading}
                              onClick={() => openRejectModal(provider)}
                              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && providers.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} providers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
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
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-slate-400 dark:text-gray-500">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="rounded-lg px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && !showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Provider Details
                </h2>
                <p className="text-xs text-slate-400 dark:text-gray-500">
                  Review provider information
                </p>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* User info */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {selectedProvider.user?.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {selectedProvider.user?.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {selectedProvider.user?.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {selectedProvider.user?.phone || "No phone"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Provider Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-gray-700/50">
                  <p className="text-xs text-slate-400 dark:text-gray-500">Provider ID</p>
                  <p className="font-medium text-slate-900 dark:text-white">#{selectedProvider.id}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-gray-700/50">
                  <p className="text-xs text-slate-400 dark:text-gray-500">Status</p>
                  <p className="font-medium text-slate-900 dark:text-white">{statusBadge(selectedProvider.verification_status)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-gray-700/50">
                  <p className="text-xs text-slate-400 dark:text-gray-500">Total Services</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedProvider.services?.length || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-gray-700/50">
                  <p className="text-xs text-slate-400 dark:text-gray-500">Total Documents</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedProvider.documents?.length || 0}</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Wrench size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Selected Services
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.services?.length > 0 ? (
                    selectedProvider.services.map((service) => (
                      <span
                        key={service.id}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {service.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-gray-500">No services selected</span>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Verification Documents
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedProvider.documents?.length > 0 ? (
                    selectedProvider.documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-gray-700"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {document.document_type?.replace('_', ' ') || 'Document'}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-gray-500">
                            {document.document_number || "No document number"}
                          </p>
                          {document.document_file && (
                            <a 
                              href={`http://127.0.0.1:8000/storage/${document.document_file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                            >
                              View File
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${
                            document.status === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            document.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {document.status || 'pending'}
                          </span>
                          {document.rejection_reason && (
                            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                              {document.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-gray-700">
                      <FileText size={24} className="mx-auto text-slate-300 dark:text-gray-600" />
                      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">No documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason */}
              {selectedProvider.rejection_reason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">
                    Rejection Reason
                  </p>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                    {selectedProvider.rejection_reason}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {selectedProvider.verification_status !== "approved" && (
              <div className="flex gap-3 border-t border-slate-100 p-5 dark:border-gray-700">
                <button
                  onClick={() => approveProvider(selectedProvider)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle size={17} />
                  Approve Provider
                </button>
                <button
                  onClick={() => openRejectModal(selectedProvider)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <XCircle size={17} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedProvider && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Reject Provider
                </h2>
                <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
                  {selectedProvider.user?.name}
                </p>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={5}
                placeholder="Explain why this provider verification was rejected..."
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
              <p className="mt-2 text-xs text-slate-400 dark:text-gray-500">
                This message will be shown to the provider.
              </p>
            </div>

            <div className="flex gap-3 border-t border-slate-100 p-5 dark:border-gray-700">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !rejectReason.trim()}
                onClick={rejectProvider}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Providers;