// src/pages/employees/EmployeesPage.jsx
import { useState } from "react";
import { useEmployees } from "../../hooks/useEmployees";
import useAuthStore from "../../store/authStore";
import EmployeeTable from "../../components/employees/EmployeeTable";
import EmployeeForm from "../../components/employees/EmployeeForm";
import EmployeeViewModal from "../../components/employees/EmployeeViewModal";
import EmployeeBulkUploadModal from "../../components/employees/EmployeeBulkUploadModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import AlertModal from "../../components/common/AlertModal";
import {
  downloadEmployeeTemplateApi,
  bulkUploadEmployeesApi,
} from "../../api/employeeApi";
import { toast } from "react-toastify";

export default function EmployeesPage() {
  const { hasPermission } = useAuthStore();
  const canAdd = hasPermission("employees", "can_add");
  const canEdit = hasPermission("employees", "can_edit");
  const canAdmin = hasPermission("employees", "can_delete");
  const canManager = canAdd || canEdit;

  const {
    employees,
    loading,
    total,
    page,
    totalPages,
    setPage,
    locations,
    departments,
    allDepartments,
    loadingDepts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    departmentFilter,
    setDepartmentFilter,
    sortBy,
    setSortBy,
    formOpen,
    editingEmployee,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddForm,
    openEditForm,
    closeForm,
    handleChange,
    handleSubmit,
    viewingEmployee,
    setViewingEmployee,
    deletingEmployee,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingEmployee,
    handleToggleStatus,
    fetchEmployees,
  } = useEmployees();

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  const [alert, setAlert] = useState(null);
  const closeAlert = () => setAlert(null);

  // ── Bulk upload ────────────────────────────────────────────────────────────
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  async function handleBulkUpload(file) {
    setBulkUploading(true);
    const res = await bulkUploadEmployeesApi(file);
    if (res.success) {
      setBulkResult(res.data);
      toast.success(res.message ?? "Bulk upload complete");
      fetchEmployees();
    } else {
      toast.error(res.message ?? "Bulk upload failed");
    }
    setBulkUploading(false);
  }

  const [pendingSubmit, setPendingSubmit] = useState(false);

  function requestSubmit(e) {
    e.preventDefault();
    setPendingSubmit(true);
  }
  function executeSubmit() {
    setPendingSubmit(false);
    handleSubmit({ preventDefault: () => {} });
  }

  function confirmToggleStatus(emp) {
    const active = emp.is_active === true || emp.is_active === 1;
    setConfirm({
      title: active ? "Deactivate Employee?" : "Activate Employee?",
      message: active
        ? "This employee will be marked inactive."
        : "This employee will be marked active.",
      subText: emp.full_name,
      confirmLabel: active ? "Deactivate" : "Activate",
      confirmColor: active ? "orange" : "green",
      onConfirm: async () => {
        closeConfirm();
        const res = await handleToggleStatus(emp);
        if (!res.success) {
          setAlert({
            title: "Cannot Deactivate Employee",
            message: res.message ?? "Failed to update status",
          });
        }
      },
    });
  }

  function confirmDelete(emp) {
    // ✅ Fix: removed openDeleteModal(emp) — was causing stale closure
    // Pass emp.id directly so closure always has the correct id
    setConfirm({
      title: "Delete Employee?",
      message: "Employee will be soft deleted. Assigned assets remain intact.",
      subText: emp.full_name,
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete(emp.id); // ✅ id captured directly, never stale
      },
    });
  }

  return (
    <>
      <EmployeeTable
        employees={employees}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canAdmin={canAdmin}
        canManager={canManager}
        canEdit={canEdit}
        locations={locations}
        allDepartments={allDepartments}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAdd={canAdd ? openAddForm : undefined}
        onBulkUpload={canAdd ? () => setBulkOpen(true) : undefined}
        onView={(emp) => setViewingEmployee(emp)}
        onEdit={openEditForm}
        onToggleStatus={confirmToggleStatus}
        onDelete={confirmDelete}
      />

      <EmployeeBulkUploadModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onDownloadTemplate={downloadEmployeeTemplateApi}
        onUpload={handleBulkUpload}
        uploading={bulkUploading}
        result={bulkResult}
        onReset={() => setBulkResult(null)}
      />

      <EmployeeForm
        open={formOpen}
        onClose={closeForm}
        editingEmployee={editingEmployee}
        form={form}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onChange={handleChange}
        onSubmit={requestSubmit}
        submitting={submitting}
        locations={locations}
        departments={departments}
        loadingDepts={loadingDepts}
      />

      <ConfirmModal
        open={pendingSubmit}
        title={editingEmployee ? "Update Employee?" : "Create Employee?"}
        message={
          editingEmployee
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to create this employee?"
        }
        subText={form.full_name}
        confirmLabel={editingEmployee ? "Update" : "Create"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={submitting}
      />

      <EmployeeViewModal
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        locations={locations}
        departments={departments}
      />

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
          setDeletingEmployee(null);
        }}
        loading={deleting}
      />

      <AlertModal
        open={!!alert}
        title={alert?.title}
        message={alert?.message}
        onClose={closeAlert}
      />
    </>
  );
}
