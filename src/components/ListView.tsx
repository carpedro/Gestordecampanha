import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Campaign, Institution } from '../types/campaign';
import { CampaignCard } from './CampaignCard';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface ListViewProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onDuplicate: (campaign: Campaign) => void;
  onToggleStatus: (id: string) => void;
  onView?: (campaign: Campaign) => void;
}

type SortOption = 'relevance' | 'createdAt' | 'startDate' | 'endDate';

const institutions: Institution[] = [
  'PUCRS',
  'PUCRS Grad',
  'FAAP',
  'FIA Online',
  'UNESC',
  'Santa Casa SP',
  'Impacta',
  'FSL Digital',
];

export function ListView({ campaigns, onEdit, onDelete, onDuplicate, onToggleStatus, onView }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [institutionFilter, setInstitutionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');

  const filteredAndSortedCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch = 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.tagsRelated.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        campaign.tagsExcluded.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      const matchesInstitution = institutionFilter === 'all' || campaign.institution === institutionFilter;

      return matchesSearch && matchesStatus && matchesInstitution;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return 0;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'startDate':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'endDate':
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        default:
          return 0;
      }
    });

  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) +
    (institutionFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="mb-3">Filtros Avançados</h4>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Ativo</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Instituição</label>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {institutions.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Ordenar por</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevância</SelectItem>
                    <SelectItem value="createdAt">Data de Criação</SelectItem>
                    <SelectItem value="startDate">Data de Início</SelectItem>
                    <SelectItem value="endDate">Data de Término</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStatusFilter('all');
                    setInstitutionFilter('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredAndSortedCampaigns.length} iniciativa(s) encontrada(s)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredAndSortedCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onToggleStatus={onToggleStatus}
            onView={onView}
          />
        ))}
      </div>

      {filteredAndSortedCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma iniciativa encontrada com os filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
}
