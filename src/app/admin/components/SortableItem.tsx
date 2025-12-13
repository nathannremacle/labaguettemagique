"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuItem } from "@/components/MenuSection";
import { EditableMenuItem } from "@/components/admin/EditableMenuItem";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  item: MenuItem;
  categoryId: string;
  handleSaveItem: (categoryId: string, itemId: number, item: MenuItem) => void;
  handleDeleteItem: (categoryId: string, itemId: number) => void;
}

export function SortableItem({
  item,
  categoryId,
  handleSaveItem,
  handleDeleteItem,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (item.id === undefined) return null;

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <EditableMenuItem
            item={item}
            categoryId={categoryId}
            itemId={item.id}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
          />
        </div>
      </div>
    </div>
  );
}


