// client/src/pages/assets/AssetsPage.jsx

import { useState } from "react";
import { useAssets }     from "../../hooks/useAssets";
import { useBulkAssets } from "../../hooks/useBulkAssets";       // ★ missing
import AssetTable        from "../../components/assets/AssetTable";
import AssetForm         from "../../components/assets/AssetForm";
import AssetViewModal    from "../../components/assets/AssetViewModal";
import BulkAssetModal    from "../../components/assets/BulkAssetModal"; // ★ missing
import ConfirmModal      from "../../components/common/ConfirmModal";

export default function AssetsPage() {
  const {
    assets, totalCount, loading,
    page, pageSize, setPage,
    filters, handleSearchChange, handleFilterChange, handleClearFilters,
    filterDepartments,
    drawerOpen, viewModalOpen, deleteModalOpen,
    selectedAsset, editingAsset, isSubmitting,
    form, formErrors, handleFormChange, handleSubmit,
    locations, filteredDepartments,
    filteredEmployees,
    categories, vendors, dropdownsLoading,
    openAddDrawer, openEditDrawer, openViewModal, openDeleteModal,
    closeDrawer, closeViewModal, closeDeleteModal,
    handleDelete, refresh,                                        // ★ refresh needed
    categoryPath, handleCategoryChange,
    canAdmin, canManage,
  } = useAssets();

  // ★ Bulk hook — was completely missing
  const {
    open: bulkOpen, openModal: openBulkModal, closeModal: closeBulkModal,
    step, goToStep2, goToStep3, goBack,
    commonForm, commonErrors, handleCommonChange,
    categoryPath: bulkCategoryPath, handleCategoryChange: handleBulkCategoryChange,
    locations: bulkLocations, filteredDepartments: bulkDepts,
    categories: bulkCategories, dropdownsLoading: bulkDropdownsLoading,
    quantity, setQuantity,
    items, updateItem,
    quickFill, setQuickFill, applyQuickFill,
    isSubmitting: bulkSubmitting, handleSubmit: handleBulkSubmit, result: bulkResult,
  } = useBulkAssets();

  // Refresh asset list after bulk registration closes
  const handleBulkClose = () => {
    closeBulkModal();
    if (bulkResult) refresh();
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const hasFilters = !!(
    filters.search || filters.status || filters.categoryId ||
    filters.locationId || filters.departmentId || filters.condition ||
    filters.sortBy
  );

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  const [pendingSubmit, setPendingSubmit] = useState(false);
  function requestSubmit() { setPendingSubmit(true); }
  function executeSubmit() { setPendingSubmit(false); handleSubmit(); }

  function confirmDelete(asset) {
    openDeleteModal(asset);
    setConfirm({
      title: "Delete Asset?",
      message: "Asset will be soft deleted. QR code and history remain intact.",
      subText: `${asset.asset_code ?? ""} — ${asset.asset_name}`.replace(/^ — /, ""),
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => { closeConfirm(); handleDelete(asset); },
    });
  }

  return (
    <>
      <AssetTable
        assets={assets} loading={loading}
        totalCount={totalCount} page={page} pageSize={pageSize}
        totalPages={totalPages} onPageChange={setPage}
        hasFilters={hasFilters} onClearFilters={handleClearFilters}
        onEdit={openEditDrawer} onDelete={confirmDelete}
        canManage={canManage} canAdmin={canAdmin}
        onAdd={canManage ? openAddDrawer : undefined}
        onBulkAdd={canManage ? openBulkModal : undefined}         // ★ was missing
        filters={filters} onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        locations={locations} categories={categories}
        filterDepartments={filterDepartments}
      />

      <AssetForm
        open={drawerOpen} onClose={closeDrawer}
        isEditing={!!editingAsset} editingAsset={editingAsset}
        form={form} formErrors={formErrors}
        onFormChange={handleFormChange}
        onSubmit={requestSubmit}
        isSubmitting={isSubmitting}
        locations={locations} filteredDepartments={filteredDepartments}
        employees={filteredEmployees}
        categories={categories} vendors={vendors} dropdownsLoading={dropdownsLoading}
        categoryPath={categoryPath} onCategoryChange={handleCategoryChange}
      />

      {/* ★ Bulk Asset Modal — was completely missing */}
      <BulkAssetModal
        open={bulkOpen} onClose={handleBulkClose}
        step={step} goToStep2={goToStep2} goToStep3={goToStep3} goBack={goBack}
        commonForm={commonForm} commonErrors={commonErrors}
        onCommonChange={handleCommonChange}
        categoryPath={bulkCategoryPath} onCategoryChange={handleBulkCategoryChange}
        locations={bulkLocations} filteredDepartments={bulkDepts}
        categories={bulkCategories} dropdownsLoading={bulkDropdownsLoading}
        quantity={quantity} onQuantityChange={setQuantity}
        items={items} onUpdateItem={updateItem}
        quickFill={quickFill}
        onQuickFillChange={(key, val) => setQuickFill((p) => ({ ...p, [key]: val }))}
        onApplyQuickFill={applyQuickFill}
        onSubmit={handleBulkSubmit} isSubmitting={bulkSubmitting}
        result={bulkResult}
      />

      {/* Confirm: create / update */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingAsset ? "Update Asset?" : "Register Asset?"}
        message={editingAsset ? "Are you sure you want to save these changes?" : "Are you sure you want to register this asset?"}
        subText={form.asset_name}
        confirmLabel={editingAsset ? "Update" : "Register"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={isSubmitting}
      />

      <AssetViewModal
        isOpen={viewModalOpen} onClose={closeViewModal}
        asset={selectedAsset} canManage={canManage} onEdit={openEditDrawer}
      />

      {/* Confirm: delete */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title} message={confirm?.message}
        subText={confirm?.subText} confirmLabel={confirm?.confirmLabel}
        confirmColor={confirm?.confirmColor} onConfirm={confirm?.onConfirm}
        onCancel={() => { closeConfirm(); closeDeleteModal(); }}
        loading={isSubmitting}
      />
    </>
  );
}