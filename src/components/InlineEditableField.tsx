import { useState, useRef, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface InlineEditableFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  editClassName?: string;
  displayClassName?: string;
}

export function InlineEditableField({
  value,
  onSave,
  multiline = false,
  placeholder = 'Clique para editar',
  className = '',
  editClassName = '',
  displayClassName = '',
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
      // Reset to original value on error
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`cursor-pointer hover:bg-gray-50 rounded p-2 -m-2 transition-colors ${className} ${displayClassName}`}
        title="Clique para editar"
      >
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {multiline ? (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`min-h-[450px] max-h-[600px] overflow-y-auto ${editClassName}`}
          disabled={isSaving}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${editClassName}`}
          disabled={isSaving}
        />
      )}
      
      <div className="flex items-center gap-2 mt-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !editValue.trim()}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="w-3 h-3 mr-1" />
              Salvar
            </>
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
          <X className="w-3 h-3 mr-1" />
          Cancelar
        </Button>
        <span className="text-xs text-muted-foreground ml-2">
          Pressione Esc para cancelar • {multiline ? 'Ctrl+S' : 'Enter'} para salvar
        </span>
      </div>
    </div>
  );
}
