import { Calendar, Edit, Trash2, Copy, Archive, CheckCircle2, Clock, AlertCircle, Paperclip } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onDuplicate: (campaign: Campaign) => void;
  onToggleStatus: (id: string) => void;
  onView?: (campaign: Campaign) => void;
}

export function CampaignCard({
  campaign,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onView,
}: CampaignCardProps) {
  const getStatusConfig = (status: Campaign['status']) => {
    switch (status) {
      case 'published':
        return {
          label: 'Ativo',
          variant: 'default' as const,
          icon: CheckCircle2,
          color: 'text-green-600',
        };
      case 'draft':
        return {
          label: 'Rascunho',
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-yellow-600',
        };
      case 'archived':
        return {
          label: 'Arquivado',
          variant: 'outline' as const,
          icon: Archive,
          color: 'text-gray-600',
        };
    }
  };

  const isEndingSoon = () => {
    const daysUntilEnd = Math.ceil(
      (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  };

  const statusConfig = getStatusConfig(campaign.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div 
        className="cursor-pointer" 
        onClick={() => onView?.(campaign)}
      >
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusConfig.variant} className="gap-1">
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
                {isEndingSoon() && campaign.status === 'published' && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Encerrando em breve
                  </Badge>
                )}
              </div>
              <CardTitle className="mb-1">{campaign.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{campaign.institution}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(campaign);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(campaign);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(campaign.id);
                  }}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {campaign.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(campaign.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm line-clamp-3">{campaign.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(campaign.startDate).toLocaleDateString('pt-BR')} -{' '}
                {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {campaign.attachmentCount && campaign.attachmentCount > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-4 h-4" />
                <span>{campaign.attachmentCount}</span>
              </div>
            )}
          </div>

          {campaign.tagsRelated.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm">O que se aproxima:</p>
              <div className="flex flex-wrap gap-1">
                {campaign.tagsRelated.slice(0, 5).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {campaign.tagsRelated.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{campaign.tagsRelated.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {campaign.tagsExcluded.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm">Não confundir com:</p>
              <div className="flex flex-wrap gap-1">
                {campaign.tagsExcluded.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {campaign.tagsExcluded.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{campaign.tagsExcluded.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
