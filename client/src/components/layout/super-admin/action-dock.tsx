import { Save, Trash2, X, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionDockProps {
  onSave?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  showDelete?: boolean;
  showReset?: boolean;
  disabled?: boolean;
  isDirty?: boolean;
}

export function ActionDock({
  onSave,
  onDelete,
  onCancel,
  onReset,
  isSaving = false,
  isDeleting = false,
  showDelete = true,
  showReset = false,
  disabled = false,
  isDirty = false,
}: ActionDockProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 p-2 rounded-md bg-card border shadow-lg">
      {showReset && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={disabled || !isDirty}
          data-testid="button-reset"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}

      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={disabled}
          data-testid="button-cancel"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      )}

      {showDelete && onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={disabled || isDeleting}
          data-testid="button-delete"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </Button>
      )}

      {onSave && (
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={disabled || isSaving}
          data-testid="button-save"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Update
        </Button>
      )}
    </div>
  );
}
