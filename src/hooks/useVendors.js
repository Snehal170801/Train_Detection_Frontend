// client/src/hooks/useVendors.js
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getVendorsApi,
  createVendorApi,
  updateVendorApi,
  updateVendorStatusApi,
  deleteVendorApi,
} from "../api/vendorApi";

const EMPTY_FORM = {
  vendor_name: "",
  phone: "",
  email: "",
  address: "",
};

function validateForm(form) {
  const errors = {};
  const name = form.vendor_name?.trim();
  if (!name) errors.vendor_name = "Vendor name is required";
  else if (name.length < 2) errors.vendor_name = "Name too short";
  else if (name.length > 150) errors.vendor_name = "Name too long (max 150)";

  const phone = form.phone?.trim();
  if (!phone) errors.phone = "Contact number is required";
  else if (!/^[6-9]\d{9}$/.test(phone))
    errors.phone = "Enter a valid 10-digit Indian mobile number";

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  return errors;
}

export function useVendors() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);

  // ── Form ────────────────────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Debounce search ─────────────────────────────────────────────────────────
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // ── Fetch vendors ───────────────────────────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.isActive = statusFilter === "active";
    if (sortBy) params.sortBy = sortBy;

    const res = await getVendorsApi(params);
    if (res.success) {
      setVendors(res.data?.vendors ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } else {
      toast.error(res.message ?? "Failed to load vendors");
    }
    setLoading(false);
  }, [page, limit, debouncedSearch, statusFilter, sortBy]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // ── Open Add ────────────────────────────────────────────────────────────────
  function openAddForm() {
    setEditingVendor(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Open Edit ───────────────────────────────────────────────────────────────
  function openEditForm(vendor) {
    setEditingVendor(vendor);
    setForm({
      vendor_name: vendor.vendor_name ?? "",
      phone: vendor.phone ?? "",
      email: vendor.email ?? "",
      address: vendor.address ?? "",
    });
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Close form ──────────────────────────────────────────────────────────────
  function closeForm() {
    setFormOpen(false);
    setEditingVendor(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  // ── onChange ────────────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    const payload = {
      vendorName: form.vendor_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
    };

    if (editingVendor) {
      const res = await updateVendorApi(editingVendor.id, payload);
      if (res.success) {
        toast.success("Vendor updated successfully");
        closeForm();
        fetchVendors();
      } else {
        toast.error(res.message ?? "Failed to update vendor");
      }
    } else {
      const res = await createVendorApi(payload);
      if (res.success) {
        toast.success("Vendor created successfully");
        closeForm();
        fetchVendors();
      } else {
        toast.error(res.message ?? "Failed to create vendor");
      }
    }
    setSubmitting(false);
  }

  // ── Toggle status ───────────────────────────────────────────────────────────
  async function handleToggleStatus(vendor) {
    const res = await updateVendorStatusApi(vendor.id, !vendor.is_active);
    if (res.success) {
      toast.success(`Vendor ${vendor.is_active ? "deactivated" : "activated"}`);
      fetchVendors();
    } else {
      toast.error(res.message ?? "Failed to update status");
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function openDeleteModal(vendor) {
    setDeletingVendor(vendor);
  }

  async function handleDelete(vendorId) {
    const id = vendorId ?? deletingVendor?.id;
    if (!id) return;
    setDeleting(true);
    const res = await deleteVendorApi(id);
    if (res.success) {
      toast.success("Vendor deleted");
      setDeletingVendor(null);
      fetchVendors();
    } else {
      toast.error(res.message ?? "Failed to delete vendor");
    }
    setDeleting(false);
  }

  // ── Clear filters ───────────────────────────────────────────────────────────
  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setSortBy("");
    setPage(1);
  }

  function changeSortBy(value) {
    setSortBy(value);
    setPage(1);
  }

  return {
    // list
    vendors,
    loading,
    total,
    page,
    totalPages,
    setPage,
    // filters
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy: changeSortBy,
    clearFilters,
    // form
    formOpen,
    editingVendor,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddForm,
    openEditForm,
    closeForm,
    handleChange,
    handleSubmit,
    // view
    viewingVendor,
    setViewingVendor,
    // delete
    deletingVendor,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingVendor,
    // toggle
    handleToggleStatus,
  };
}
