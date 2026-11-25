// client/src/pages/vendors/VendorsPage.jsx
import { useState } from "react";
import { useVendors } from "../../hooks/useVendors";
import useAuthStore from "../../store/authStore";
import VendorTable from "../../components/vendors/VendorTable";
import VendorForm from "../../components/vendors/VendorForm";
import VendorViewModal from "../../components/vendors/VendorViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function VendorsPage() {
  const { hasPermission } = useAuthStore();
  const canAdd = hasPermission("vendors", "can_add");
  const canManager = canAdd || hasPermission("vendors", "can_edit");
  const canAdmin = hasPermission("vendors", "can_delete");

  const {
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
    setSortBy,
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
  } = useVendors();

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  const [pendingSubmit, setPendingSubmit] = useState(false);

  function requestSubmit(e) {
    e.preventDefault();
    setPendingSubmit(true);
  }
  function executeSubmit() {
    setPendingSubmit(false);
    handleSubmit({ preventDefault: () => {} });
  }

  function confirmToggleStatus(vendor) {
    const active = vendor.is_active === true || vendor.is_active === 1;
    setConfirm({
      title: active ? "Deactivate Vendor?" : "Activate Vendor?",
      message: active
        ? "This vendor will be marked inactive and hidden from dropdowns."
        : "This vendor will be marked active and available again.",
      subText: vendor.vendor_name,
      confirmLabel: active ? "Deactivate" : "Activate",
      confirmColor: active ? "orange" : "green",
      onConfirm: () => {
        closeConfirm();
        handleToggleStatus(vendor);
      },
    });
  }

  function confirmDelete(vendor) {
    setConfirm({
      title: "Delete Vendor?",
      message:
        "Vendor will be soft deleted. Linked assets and contracts remain intact.",
      subText: vendor.vendor_name,
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete(vendor.id);
      },
    });
  }

  return (
    <>
      {/* ── Main table ── */}
      <VendorTable
        vendors={vendors}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canAdmin={canAdmin}
        canManager={canManager}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAdd={canAdd ? openAddForm : undefined}
        onView={(v) => setViewingVendor(v)}
        onEdit={openEditForm}
        onToggleStatus={confirmToggleStatus}
        onDelete={confirmDelete}
      />

      {/* ── Add / Edit form ── */}
      <VendorForm
        open={formOpen}
        onClose={closeForm}
        editingVendor={editingVendor}
        form={form}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onChange={handleChange}
        onSubmit={requestSubmit}
        submitting={submitting}
      />

      {/* ── Confirm: create / update ── */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingVendor ? "Update Vendor?" : "Create Vendor?"}
        message={
          editingVendor
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to create this vendor?"
        }
        subText={form.vendor_name}
        confirmLabel={editingVendor ? "Update" : "Create"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={submitting}
      />

      {/* ── View modal ── */}
      <VendorViewModal
        vendor={viewingVendor}
        onClose={() => setViewingVendor(null)}
      />

      {/* ── Confirm: delete / toggle status ── */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        subText={confirm?.subText}
        confirmLabel={confirm?.confirmLabel}
        confirmColor={confirm?.confirmColor}
        onConfirm={confirm?.onConfirm}
        onCancel={() => {
          closeConfirm();
          setDeletingVendor(null);
        }}
        loading={deleting}
      />
    </>
  );
}
