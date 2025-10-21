import { useState } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';
import { Input } from './input';
import { Checkbox } from './checkbox';
import { ScrollArea } from './scroll-area';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxHeight?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Selecionar...',
  searchable = false,
  maxHeight = '300px',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : `${selected.length} selecionado${selected.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          {/* Header with actions */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="h-7 text-xs"
            >
              {selected.length === options.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </Button>
            {selected.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 text-xs"
              >
                Limpar
              </Button>
            )}
          </div>

          {/* Search */}
          {searchable && (
            <div className="px-3 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <ScrollArea style={{ maxHeight }}>
            <div className="p-2">
              {filteredOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma opção encontrada
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => toggleOption(option.value)}
                  >
                    <Checkbox
                      checked={selected.includes(option.value)}
                      onCheckedChange={() => toggleOption(option.value)}
                    />
                    <label className="text-sm cursor-pointer flex-1">
                      {option.label}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer with apply button */}
          {selected.length > 0 && (
            <div className="border-t px-3 py-2">
              <Button
                size="sm"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Aplicar ({selected.length})
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
