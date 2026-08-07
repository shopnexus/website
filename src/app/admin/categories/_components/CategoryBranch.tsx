"use client";

import IdentityKey from "@/components/admin-config/IdentityKey";
import type { CategoryNode } from "../_lib/category-tree";

/**
 * One row of the tree and its branch below it.
 *
 * The depth rail is drawn by the row rather than by a wrapper because the actions sit on
 * the same line — an indented block with buttons outside it makes it ambiguous which
 * category a "delete" belongs to, which on a tree is the expensive kind of ambiguity.
 */
export default function CategoryBranch({
  node,
  canEdit,
  onAddChild,
  onEdit,
  onDelete,
}: {
  node: CategoryNode;
  canEdit: boolean;
  onAddChild: (parentId: string) => void;
  onEdit: (node: CategoryNode) => void;
  onDelete: (node: CategoryNode) => void;
}) {
  return (
    <li>
      <div
        className="group flex items-start gap-3 px-5 py-3 hover:bg-surface-container-low/60 transition-colors"
        style={{ paddingLeft: `${1.25 + node.depth * 1.5}rem` }}
      >
        <span
          aria-hidden
          className="material-symbols-outlined text-[18px] text-outline mt-0.5 shrink-0"
        >
          {node.depth === 0 ? "folder" : "subdirectory_arrow_right"}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-label-md text-on-surface">{node.name}</span>
            <IdentityKey value={node.id} />
            {node.children.length > 0 && (
              <span className="font-label-sm text-on-surface-variant">
                {node.children.length} danh mục con
              </span>
            )}
          </div>
          {node.description && (
            <p className="font-body-sm text-on-surface-variant mt-0.5 line-clamp-2">
              {node.description}
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
            <RowAction icon="add" label="Thêm danh mục con" onClick={() => onAddChild(node.id)} />
            <RowAction icon="edit" label="Sửa danh mục" onClick={() => onEdit(node)} />
            <RowAction icon="delete" label="Xoá danh mục" danger onClick={() => onDelete(node)} />
          </div>
        )}
      </div>

      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <CategoryBranch
              key={child.id}
              node={child}
              canEdit={canEdit}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function RowAction({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer",
        danger
          ? "text-error hover:bg-error-container"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}
