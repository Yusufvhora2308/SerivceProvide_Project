// PATH: src/Pages/Provider/ProviderDocumentEdit.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";

const ProviderDocumentEdit = () => {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [document, setDocument] = useState(null);
  const [documentType, setDocumentType] = useState("service_license");
  const [documentNumber, setDocumentNumber] = useState("");
  const [existingDocument, setExistingDocument] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasDocument, setHasDocument] = useState(false);

  // =========================================================
  // LOAD EXISTING DOCUMENT
  // =========================================================

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError("");

      // First, get provider profile with documents
      const response = await api.get("/provider/profile");
      console.log("Full API Response:", response.data);

      // Extract provider data
      let providerData = null;
      
      if (response.data?.data?.provider) {
        providerData = response.data.data.provider;
      } else if (response.data?.provider) {
        providerData = response.data.provider;
      } else if (response.data?.data) {
        providerData = response.data.data;
      } else {
        providerData = response.data;
      }

      console.log("Provider Data:", providerData);

      if (!providerData) {
        setError("Provider profile not found.");
        setLoading(false);
        return;
      }

      setProvider(providerData);

      // Get rejection reason from provider
      if (providerData.rejection_reason) {
        console.log("Rejection reason:", providerData.rejection_reason);
      }

      // Extract documents
      let documents = [];
      
      if (providerData.documents) {
        if (Array.isArray(providerData.documents)) {
          documents = providerData.documents;
        } else if (typeof providerData.documents === 'object') {
          documents = Object.values(providerData.documents);
        }
      }

      console.log("Documents array:", documents);

      // Check if documents exist
      if (Array.isArray(documents) && documents.length > 0) {
        // Get the most recent document
        const documentData = documents[documents.length - 1];
        console.log("Found document:", documentData);
        
        setExistingDocument(documentData);
        setDocumentType(documentData.document_type || "service_license");
        setDocumentNumber(documentData.document_number || "");
        setHasDocument(true);
      } else {
        // No documents found - user needs to upload first
        console.log("No documents found. User needs to upload.");
        setHasDocument(false);
        setExistingDocument(null);
        
        // Show info message
        Swal.fire({
          icon: 'info',
          title: 'No Document Found',
          text: 'You need to upload a verification document first.',
          confirmButtonColor: '#3b82f6',
        });
      }

    } catch (error) {
      console.error("Provider document fetch error:", error);
      
      const errorMsg = error.response?.data?.message || "Unable to load your verification document.";
      setError(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMsg,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPLOAD NEW DOCUMENT (First time)
  // =========================================================

  const handleUploadNewDocument = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!document) {
      setError("Please select a document file to upload.");
      return;
    }

    setSaving(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("document_type", documentType);
      formData.append("document_number", documentNumber || "");
      formData.append("file", document);

      console.log("Uploading new document...");
      console.log("User ID:", user.id);
      console.log("Document type:", documentType);
      console.log("Document number:", documentNumber);
      console.log("File:", document.name);

      const response = await api.post("/provider/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Document uploaded successfully:", response.data);

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Document uploaded successfully. Your verification is pending.',
        timer: 3000,
        showConfirmButton: false,
      });

      navigate("/provider/verification");

    } catch (error) {
      console.error("Document upload error:", error);

      let errorMsg = "Document upload failed. Please try again.";
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        if (firstError) {
          errorMsg = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      setError(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMsg,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UPDATE EXISTING DOCUMENT
  // =========================================================

  const handleUpdateDocument = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!existingDocument?.id) {
      setError("Document ID not found. Please try again.");
      return;
    }

    if (!document) {
      setError("Please select a new document file to upload.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("document_id", String(existingDocument.id));
      formData.append("document_type", documentType);
      formData.append("document_number", documentNumber || "");
      formData.append("file", document);

      console.log("Updating document...");
      console.log("Document ID:", existingDocument.id);
      console.log("Document type:", documentType);
      console.log("Document number:", documentNumber);
      console.log("File:", document.name);

      const response = await api.post("/provider/documents/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Document updated successfully:", response.data);

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Document updated successfully. Your verification is pending again.',
        timer: 3000,
        showConfirmButton: false,
      });

      navigate("/provider/verification");

    } catch (error) {
      console.error("Document update error:", error);

      let errorMsg = "Document update failed. Please try again.";
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        if (firstError) {
          errorMsg = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      setError(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMsg,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setSuccess("");

    // 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG or PDF files are allowed.");
      e.target.value = "";
      return;
    }

    setDocument(selectedFile);
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    navigate("/provider/verification");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Loading your verification document...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE - NO DOCUMENT (First time upload)
  // =========================================================

  if (!hasDocument) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          {/* HEADER */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Verification
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Plus className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Upload Verification Document
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                You need to upload a verification document to complete your provider registration.
              </p>
            </div>
          </div>

          {/* REJECTION INFO */}
          {provider?.rejection_reason && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Previous Verification Rejected</p>
                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {provider.rejection_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM - Upload New Document */}
          <form onSubmit={handleUploadNewDocument} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">Verification Document</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload your verification document for administrator review.
            </p>

            {/* DOCUMENT TYPE */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="service_license">Service License</option>
                <option value="certificate">Professional Certificate</option>
                <option value="government_id">Government ID</option>
                <option value="business_registration">Business Registration</option>
              </select>
            </div>

            {/* DOCUMENT NUMBER */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Document Number
                <span className="ml-1 text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Enter document number"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* FILE UPLOAD */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Document <span className="text-red-500">*</span>
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">
                  {document ? document.name : "Choose your document"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG or PDF • Max 5MB
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
              {!document && (
                <p className="mt-2 text-xs text-red-500">Please select a document to upload</p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={saving || !document}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading Document...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload & Submit for Verification
                </>
              )}
            </button>

            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <p className="text-center text-xs leading-5 text-gray-500">
                After submitting, your verification status will change to{" "}
                <span className="font-semibold text-amber-600">Pending</span>.
                An administrator will review your document.
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE - HAS DOCUMENT (Update existing)
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Verification
          </button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Update Verification Document
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Your previous verification request was rejected. Update your document and
              submit it again for administrator review.
            </p>
          </div>
        </div>

        {/* REJECTION INFO */}
        {provider?.rejection_reason && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-800">Verification Rejected</p>
                <p className="mt-1 text-sm leading-6 text-red-700">
                  {provider.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        {/* FORM - Update Document */}
        <form onSubmit={handleUpdateDocument} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">Update Verification Document</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update the document information and upload a new verification file.
          </p>

          {/* DOCUMENT TYPE */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="service_license">Service License</option>
              <option value="certificate">Professional Certificate</option>
              <option value="government_id">Government ID</option>
              <option value="business_registration">Business Registration</option>
            </select>
          </div>

          {/* DOCUMENT NUMBER */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Document Number
              <span className="ml-1 text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter document number"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* CURRENT DOCUMENT */}
          {existingDocument && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                    Current Document
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-gray-800">
                    {existingDocument.document_file
                      ? existingDocument.document_file.split("/").pop()
                      : "Previously uploaded document"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Document ID: {existingDocument.id}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Status: <span className="font-semibold capitalize">{existingDocument.status || 'pending'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NEW FILE - MANDATORY */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload New Document <span className="text-red-500">*</span>
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">
                {document ? document.name : "Choose your document"}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG or PDF • Max 5MB
              </p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </label>
            {!document && (
              <p className="mt-2 text-xs text-red-500">Please select a document to upload</p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={saving || !document}
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating Document...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Update & Submit for Verification
              </>
            )}
          </button>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <p className="text-center text-xs leading-5 text-gray-500">
              After submitting, your verification status will change back to{" "}
              <span className="font-semibold text-amber-600">Pending</span>.
              An administrator will review your updated document.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderDocumentEdit;