import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MultiSelect } from './ui/multi-select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from './ui/use-mobile';

export interface CampaignFiltersState {
  institutions?: string[];
  statuses?: string[];
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  creators?: string[];
  areas?: string[];
  positions?: string[];
}

interface CampaignFiltersProps {
  filters: CampaignFiltersState;
  onChange: (filters: CampaignFiltersState) => void;
  availableInstitutions?: string[];
  availableTags?: string[];
  availableCreators?: string[];
  availableAreas?: string[];
  availablePositions?: string[];
}

const DEFAULT_INSTITUTIONS = [
  'PUCRS',
  'PUCRS Grad',
  'FAAP',
  'FIA Online',
  'UNESC',
  'Santa Casa SP',
  'Impacta',
  'FSL Digital',
];

const DEFAULT_TAGS = [
  'promoção',
  'desconto',
  'vestibular',
  'graduação',
  'pós-graduação',
  'EAD',
  'presencial',
  'híbrido',
];

const DEFAULT_AREAS = [
  'Negócios',
  'Produto',
  'Tecnologia',
  'Marketing',
  'Relacionamento',
  'Retenção',
  'Financeiro',
];

const DEFAULT_POSITIONS = [
  'Estagiário',
  'Assistente',
  'Analista',
  'Especialista',
  'Coordenador',
  'Gerente',
  'Diretor',
  'C-Level',
];

const STATUS_OPTIONS = [
  { value: 'draft', label: '🟡 Rascunho' },
  { value: 'published', label: '🟢 Publicado' },
  { value: 'archived', label: '⚫ Arquivado' },
];

export function CampaignFilters({
  filters,
  onChange,
  availableInstitutions = DEFAULT_INSTITUTIONS,
  availableTags = DEFAULT_TAGS,
  availableCreators = [],
  availableAreas = DEFAULT_AREAS,
  availablePositions = DEFAULT_POSITIONS,
}: CampaignFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof CampaignFiltersState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({});
  };

  const removeFilter = (key: keyof CampaignFiltersState) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const removeArrayItem = (key: keyof CampaignFiltersState, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    updateFilter(key, currentArray.filter((v) => v !== value));
  };

  const activeFilterCount = Object.values(filters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined
  ).length;

  const totalSelectedCount = Object.entries(filters).reduce((sum, [key, value]) => {
    if (Array.isArray(value)) {
      return sum + value.length;
    }
    return value !== undefined ? sum + 1 : sum;
  }, 0);

  const isMobile = useIsMobile();

  const filtersContent = (
    <div className="space-y-4 max-h-[600px] overflow-y-auto p-4">
      <div className="flex items-center justify-between sticky top-0 bg-white pb-2 border-b -mx-4 px-4">
        <h4 className="text-sm">Filtros</h4>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            Limpar tudo
          </Button>
        )}
      </div>

              {/* Institution Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Instituição de Ensino
                </label>
                <MultiSelect
                  options={availableInstitutions.map((inst) => ({
                    value: inst,
                    label: inst,
                  }))}
                  selected={filters.institutions || []}
                  onChange={(selected) => updateFilter('institutions', selected.length > 0 ? selected : undefined)}
                  placeholder="Todas as instituições"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Status
                </label>
                <MultiSelect
                  options={STATUS_OPTIONS}
                  selected={filters.statuses || []}
                  onChange={(selected) => updateFilter('statuses', selected.length > 0 ? selected : undefined)}
                  placeholder="Todos os status"
                />
              </div>

              {/* Tags Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Tags
                </label>
                <MultiSelect
                  options={availableTags.map((tag) => ({
                    value: tag,
                    label: tag,
                  }))}
                  selected={filters.tags || []}
                  onChange={(selected) => updateFilter('tags', selected.length > 0 ? selected : undefined)}
                  placeholder="Todas as tags"
                  searchable
                />
              </div>

              {/* Creators Filter */}
              {availableCreators.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Criador/Responsável
                  </label>
                  <MultiSelect
                    options={availableCreators.map((creator) => ({
                      value: creator,
                      label: `👤 ${creator}`,
                    }))}
                    selected={filters.creators || []}
                    onChange={(selected) => updateFilter('creators', selected.length > 0 ? selected : undefined)}
                    placeholder="Todos os criadores"
                    searchable
                  />
                </div>
              )}

              {/* Areas Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Área
                </label>
                <MultiSelect
                  options={availableAreas.map((area) => ({
                    value: area,
                    label: area,
                  }))}
                  selected={filters.areas || []}
                  onChange={(selected) => updateFilter('areas', selected.length > 0 ? selected : undefined)}
                  placeholder="Todas as áreas"
                />
              </div>

              {/* Positions Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Posição
                </label>
                <MultiSelect
                  options={availablePositions.map((pos) => ({
                    value: pos,
                    label: pos,
                  }))}
                  selected={filters.positions || []}
                  onChange={(selected) => updateFilter('positions', selected.length > 0 ? selected : undefined)}
                  placeholder="Todas as posições"
                />
              </div>

      {/* Date Range Filter */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Período de Vigência
        </label>
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left text-sm">
                {filters.startDate
                  ? format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data inicial'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => updateFilter('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left text-sm">
                {filters.endDate
                  ? format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data final'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => updateFilter('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mobile: Sheet (bottom drawer), Desktop: Popover */}
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <Button 
              variant="outline" 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setIsOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros de Campanha</SheetTitle>
                <SheetDescription>
                  Filtre campanhas por instituição, status, tags e período
                </SheetDescription>
              </SheetHeader>
              {filtersContent}
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
              {filtersContent}
            </PopoverContent>
          </Popover>
        )}

        {/* Clear All Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Limpar todos os filtros
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {totalSelectedCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.institutions?.map((inst) => (
            <Badge key={inst} variant="secondary" className="gap-1">
              🏫 {inst}
              <button
                onClick={() => removeArrayItem('institutions', inst)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.statuses?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {STATUS_OPTIONS.find((s) => s.value === status)?.label || status}
              <button
                onClick={() => removeArrayItem('statuses', status)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => removeArrayItem('tags', tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.creators?.map((creator) => (
            <Badge key={creator} variant="secondary" className="gap-1">
              👤 {creator}
              <button
                onClick={() => removeArrayItem('creators', creator)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.areas?.map((area) => (
            <Badge key={area} variant="secondary" className="gap-1">
              {area}
              <button
                onClick={() => removeArrayItem('areas', area)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.positions?.map((pos) => (
            <Badge key={pos} variant="secondary" className="gap-1">
              {pos}
              <button
                onClick={() => removeArrayItem('positions', pos)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1">
              Início: {format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })}
              <button
                onClick={() => removeFilter('startDate')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="gap-1">
              Fim: {format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}
              <button
                onClick={() => removeFilter('endDate')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
