import { useState } from 'react';
import { Edit, Plus, Trash, Archive, FileText, Paperclip, Tag, CheckCircle, Clock } from 'lucide-react';
import { EditHistoryEntry } from '../types/editHistory';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface HistorySectionProps {
  history: EditHistoryEntry[];
}

export function HistorySection({ history }: HistorySectionProps) {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'updated':
      case 'edited':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'status_changed':
        return <Archive className="w-4 h-4 text-purple-600" />;
      case 'attachment_added':
        return <Paperclip className="w-4 h-4 text-orange-600" />;
      case 'attachment_removed':
        return <Trash className="w-4 h-4 text-red-600" />;
      case 'tags_updated':
        return <Tag className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Criou a campanha';
      case 'updated':
      case 'edited':
        return 'Editou';
      case 'status_changed':
        return 'Alterou o status';
      case 'attachment_added':
        return 'Adicionou arquivo';
      case 'attachment_removed':
        return 'Removeu arquivo';
      case 'tags_updated':
        return 'Atualizou tags';
      default:
        return 'Realizou ação';
    }
  };

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value instanceof Date) {
        return new Date(value).toLocaleDateString('pt-BR');
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(history.map(h => h.userName)));

  // Filter history
  const filteredHistory = history.filter(entry => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (filterUser !== 'all' && entry.userName !== filterUser) return false;
    return true;
  });

  if (history.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhuma edição registrada ainda
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="created">Criação</SelectItem>
            <SelectItem value="updated">Edição</SelectItem>
            <SelectItem value="status_changed">Mudança de status</SelectItem>
            <SelectItem value="attachment_added">Arquivo adicionado</SelectItem>
            <SelectItem value="attachment_removed">Arquivo removido</SelectItem>
            <SelectItem value="tags_updated">Tags atualizadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            {uniqueUsers.map(user => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Nenhuma entrada encontrada com os filtros selecionados
          </p>
        ) : (
          filteredHistory.map((entry, index) => (
            <div key={entry.id}>
              <div className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActionIcon(entry.action)}
                  </div>
                  {index < filteredHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(entry.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">
                          <strong>{entry.userName}</strong> {getActionLabel(entry.action)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Field changes */}
                  {entry.fieldChanged && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <p className="text-sm mb-2">
                        <strong>Campo:</strong> {entry.fieldChanged}
                      </p>

                      {(entry.oldValue !== undefined || entry.newValue !== undefined) && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Valor anterior:</p>
                            <div className="bg-red-50 border border-red-200 rounded p-2">
                              <p className="text-red-700 line-through">
                                {formatValue(entry.oldValue)}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Novo valor:</p>
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <p className="text-green-700">
                                {formatValue(entry.newValue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attachment info */}
                  {(entry.action === 'attachment_added' || entry.action === 'attachment_removed') && entry.newValue && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <p className="text-sm">
                        <Paperclip className="w-3 h-3 inline mr-1" />
                        <strong>Arquivo:</strong> {entry.newValue}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
