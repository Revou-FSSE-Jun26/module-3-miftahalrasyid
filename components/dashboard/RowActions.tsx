"use client";

import { Delete, DeleteForever, Edit } from "@mui/icons-material";

/**
 * Icon-only row actions, evenly spaced. Text labels intentionally omitted.
 * - Edit (pencil) → navigates to the edit page
 * - Soft delete (trash)
 * - Hard delete (trash-forever) → only shown when `canHardDelete` (superadmin)
 */
export function RowActions({
  editHref,
  onSoftDelete,
  onHardDelete,
  canHardDelete,
  disabled,
}: {
  editHref: string;
  onSoftDelete: () => void;
  onHardDelete?: () => void;
  canHardDelete?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <a
        href={editHref}
        aria-label="Edit"
        title="Edit"
        className="p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Edit fontSize="small" />
      </a>
      <button
        type="button"
        aria-label="Delete"
        title="Soft delete"
        disabled={disabled}
        onClick={onSoftDelete}
        className="p-2 rounded-md text-gray-500 hover:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
      >
        <Delete fontSize="small" />
      </button>
      {canHardDelete && onHardDelete && (
        <button
          type="button"
          aria-label="Hard delete"
          title="Hard delete (permanent)"
          disabled={disabled}
          onClick={onHardDelete}
          className="p-2 rounded-md text-gray-500 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          <DeleteForever fontSize="small" />
        </button>
      )}
    </div>
  );
}
