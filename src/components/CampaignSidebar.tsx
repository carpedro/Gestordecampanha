import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Building2,
  Tag,
  AlertCircle,
  Copy,
  Archive,
  Trash2,
  Share2,
} from 'lucide-react';
import { Campaign } from '../types/campaign';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';

interface CampaignSidebarProps {
  campaign: Campaign;
  isMinimized: boolean;
  onToggleMinimized: () => void;
  onUpdate: (field: string, value: any) => Promise<void>;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

const INSTITUTIONS = [
  'PUCRS',
  'PUCRS Grad',
  'FAAP',
  'FIA Online',
  'UNESC',
  'Santa Casa SP',
  'Impacta',
  'FSL Digital',
];

export function CampaignSidebar({
  campaign,
  isMinimized,
  onToggleMinimized,
  onUpdate,
  onDuplicate,
  onToggleStatus,
  onDelete,
}: CampaignSidebarProps) {
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingExcludedTags, setEditingExcludedTags] = useState(false);
  const [newExcludedTag, setNewExcludedTag] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return '🟢 Publicado';
      case 'draft':
        return '🟡 Rascunho';
      case 'archived':
        return '⚫ Arquivado';
      default:
        return status;
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const updatedTags = [...campaign.tagsRelated, newTag.trim()];
      onUpdate('tagsRelated', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = campaign.tagsRelated.filter((t) => t !== tag);
    onUpdate('tagsRelated', updatedTags);
  };

  const handleAddExcludedTag = () => {
    if (newExcludedTag.trim()) {
      const updatedTags = [...campaign.tagsExcluded, newExcludedTag.trim()];
      onUpdate('tagsExcluded', updatedTags);
      setNewExcludedTag('');
    }
  };

  const handleRemoveExcludedTag = (tag: string) => {
    const updatedTags = campaign.tagsExcluded.filter((t) => t !== tag);
    onUpdate('tagsExcluded', updatedTags);
  };

  const calculateDuration = () => {
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isMinimized) {
    return (
      <div className="w-16 bg-white border-r flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMinimized}
          className="w-10 h-10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        
        <Separator className="w-10" />
        
        <div className="flex flex-col gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-80 bg-white border-r flex flex-col h-full">
      {/* Header - hide toggle on mobile */}
      <div className="p-3 sm:p-4 border-b flex items-center justify-between">
        <h3 className="text-sm">Detalhes da Campanha</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleMinimized} 
          className="h-8 w-8 hidden sm:flex"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          {/* Status */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Status</label>
            <Select
              value={campaign.status}
              onValueChange={(value) => onUpdate('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">🟡 Rascunho</SelectItem>
                <SelectItem value="published">🟢 Publicado</SelectItem>
                <SelectItem value="archived">⚫ Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Institution */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Instituição</label>
            <Select
              value={campaign.institution}
              onValueChange={(value) => onUpdate('institution', value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {INSTITUTIONS.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Creator */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Criador</label>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{getInitials(campaign.createdByName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{campaign.createdByName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Data de início
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(new Date(campaign.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(campaign.startDate)}
                    onSelect={(date) => date && onUpdate('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Data de término
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(new Date(campaign.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(campaign.endDate)}
                    onSelect={(date) => date && onUpdate('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Duração: {calculateDuration()} dias</span>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              O que se aproxima
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {campaign.tagsRelated.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-secondary/80"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              {editingTags ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      } else if (e.key === 'Escape') {
                        setEditingTags(false);
                        setNewTag('');
                      }
                    }}
                    placeholder="Nova tag..."
                    className="flex-1 text-sm px-2 py-1 border rounded"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    +
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setEditingTags(true)}
                >
                  + Adicionar tag
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Excluded Tags */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              O que NÃO pode confundir
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {campaign.tagsExcluded.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="gap-1 border-red-200 text-red-700 cursor-pointer hover:bg-red-50"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveExcludedTag(tag)}
                      className="ml-1 hover:text-red-900"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              {editingExcludedTags ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newExcludedTag}
                    onChange={(e) => setNewExcludedTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExcludedTag();
                      } else if (e.key === 'Escape') {
                        setEditingExcludedTags(false);
                        setNewExcludedTag('');
                      }
                    }}
                    placeholder="Nova tag..."
                    className="flex-1 text-sm px-2 py-1 border rounded"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddExcludedTag}>
                    +
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setEditingExcludedTags(true)}
                >
                  + Adicionar
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Ações</label>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={onDuplicate}
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // toast would be triggered in parent
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={onToggleStatus}
              >
                <Archive className="w-4 h-4 mr-2" />
                {campaign.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
