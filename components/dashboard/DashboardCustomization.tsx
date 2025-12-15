'use client';

import { useState } from 'react';
import { GripVertical, Eye, EyeOff, RotateCcw, Settings } from 'lucide-react';
import { useDashboardCustomization } from '@/lib/hooks/useDashboardCustomization';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  name: string;
  visible: boolean;
  onToggle: () => void;
}

function SortableItem({ id, name, visible, onToggle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-bg-base border border-border-subtle rounded-lg',
        isDragging && 'shadow-lg'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {name}
        </div>
        <div className="text-xs text-text-tertiary">
          {id}
        </div>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
          visible
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
        )}
        aria-label={visible ? 'Hide component' : 'Show component'}
      >
        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function DashboardCustomization() {
  const { t, locale } = useTranslations();
  const {
    components,
    isLoading,
    isDragging,
    setIsDragging,
    toggleVisibility,
    reorderComponents,
    resetToDefault,
  } = useDashboardCustomization();

  const [isOpen, setIsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex(c => c.id === active.id);
      const newIndex = components.findIndex(c => c.id === over.id);
      reorderComponents(oldIndex, newIndex);
    }

    setIsDragging(false);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* Settings Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 sm:h-10 px-2 sm:px-3"
        aria-label={locale === 'it' ? 'Personalizza dashboard' : 'Customize dashboard'}
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline ml-2">
          {locale === 'it' ? 'Personalizza' : 'Customize'}
        </span>
      </Button>

      {/* Customization Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div
            className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {locale === 'it' ? 'Personalizza Dashboard' : 'Customize Dashboard'}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {locale === 'it'
                    ? 'Trascina per riordinare, clicca per mostrare/nascondere'
                    : 'Drag to reorder, click to show/hide'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {locale === 'it' ? 'Reset' : 'Reset'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  {locale === 'it' ? 'Chiudi' : 'Close'}
                </Button>
              </div>
            </div>

            {/* Components List */}
            <div className="flex-1 overflow-y-auto p-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={components.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {components.map((component) => (
                      <SortableItem
                        key={component.id}
                        id={component.id}
                        name={component.name}
                        visible={component.visible}
                        onToggle={() => toggleVisibility(component.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border-subtle bg-bg-soft/50">
              <p className="text-xs text-text-tertiary text-center">
                {locale === 'it'
                  ? 'Le modifiche vengono salvate automaticamente'
                  : 'Changes are saved automatically'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
