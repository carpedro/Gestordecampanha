import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttViewProps {
  campaigns: Campaign[];
  onCampaignClick?: (campaign: Campaign) => void;
}

type ZoomLevel = 'week' | 'month' | 'quarter' | 'year';

const STATUS_COLORS = {
  published: 'bg-green-500',
  draft: 'bg-yellow-500',
  archived: 'bg-gray-400',
};

export function GanttView({ campaigns, onCampaignClick }: GanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month');

  const getDaysInView = (): Date[] => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    let days = 14;

    switch (zoomLevel) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'quarter':
        days = 90;
        break;
      case 'year':
        days = 365;
        break;
    }

    const end = addDays(start, days - 1);
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInView();
  const startDate = days[0];
  const endDate = days[days.length - 1];

  const visibleCampaigns = campaigns.filter((campaign) => {
    const campStart = new Date(campaign.startDate);
    const campEnd = new Date(campaign.endDate);
    return campEnd >= startDate && campStart <= endDate;
  });

  const getBarPosition = (campaign: Campaign) => {
    const campStart = new Date(campaign.startDate);
    const campEnd = new Date(campaign.endDate);

    const viewStart = startDate.getTime();
    const viewEnd = endDate.getTime();
    const viewDuration = viewEnd - viewStart;

    const barStart = Math.max(campStart.getTime(), viewStart);
    const barEnd = Math.min(campEnd.getTime(), viewEnd);

    const left = ((barStart - viewStart) / viewDuration) * 100;
    const width = ((barEnd - barStart) / viewDuration) * 100;

    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    switch (zoomLevel) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() - 3);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    switch (zoomLevel) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateHeader = () => {
    switch (zoomLevel) {
      case 'week':
        return format(currentDate, "'Semana de' dd MMM yyyy", { locale: ptBR });
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'quarter':
        return format(currentDate, "QQQ yyyy", { locale: ptBR });
      case 'year':
        return format(currentDate, "yyyy", { locale: ptBR });
    }
  };

  const gridColumns = useMemo(() => {
    if (zoomLevel === 'week') return days;
    if (zoomLevel === 'month') return days.filter((_, i) => i % 2 === 0);
    if (zoomLevel === 'quarter') return days.filter((_, i) => i % 7 === 0);
    return days.filter((_, i) => i % 30 === 0);
  }, [days, zoomLevel]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} className="flex-1 sm:flex-none">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="flex-1 sm:flex-none">
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext} className="flex-1 sm:flex-none">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <h3 className="capitalize text-sm sm:text-base">{formatDateHeader()}</h3>
          <Select
            value={zoomLevel}
            onValueChange={(value) => setZoomLevel(value as ZoomLevel)}
          >
            <SelectTrigger className="w-[110px] sm:w-[130px] text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gantt Chart - with horizontal scroll */}
      <div className="border rounded-lg overflow-x-auto bg-white">
        <div className="flex min-w-[800px]">
          {/* Campaign Names Column */}
          <div className="w-48 sm:w-64 border-r bg-gray-50 flex-shrink-0">
            <div className="h-10 sm:h-12 border-b px-2 sm:px-4 flex items-center">
              <span className="text-xs sm:text-sm">Campanha</span>
            </div>
            <div className="divide-y">
              {visibleCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="h-14 sm:h-16 px-2 sm:px-4 flex flex-col justify-center hover:bg-gray-100 cursor-pointer transition-colors active:bg-gray-200"
                  onClick={() => onCampaignClick?.(campaign)}
                >
                  <div className="text-xs sm:text-sm truncate">🏫 {campaign.institution}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {campaign.name}
                  </div>
                </div>
              ))}
              {visibleCampaigns.length === 0 && (
                <div className="h-32 flex items-center justify-center text-xs sm:text-sm text-muted-foreground px-4 text-center">
                  Nenhuma campanha no período
                </div>
              )}
            </div>
          </div>

          {/* Timeline Column */}
          <div className="flex-1">
            {/* Date Headers */}
            <div className="h-10 sm:h-12 border-b bg-gray-50 flex items-stretch relative">
              {gridColumns.map((day, i) => (
                <div
                  key={i}
                  className="flex-1 border-r px-1 sm:px-2 flex items-center justify-center text-[10px] sm:text-xs"
                >
                  <div className="text-center">
                    <div>{format(day, 'dd')}</div>
                    <div className="text-muted-foreground hidden sm:block">
                      {format(day, 'MMM', { locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gantt Bars */}
            <div className="relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {gridColumns.map((_, i) => (
                  <div key={i} className="flex-1 border-r" />
                ))}
              </div>

              {/* Campaign Bars */}
              <div className="divide-y">
                {visibleCampaigns.map((campaign) => {
                  const position = getBarPosition(campaign);
                  const isExpiringSoon =
                    new Date(campaign.endDate).getTime() - Date.now() <
                    3 * 24 * 60 * 60 * 1000;

                  return (
                    <div
                      key={campaign.id}
                      className="h-16 relative hover:bg-gray-50"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute h-8 top-4 rounded cursor-pointer transition-all hover:h-10 hover:top-3 ${
                                STATUS_COLORS[campaign.status as keyof typeof STATUS_COLORS]
                              } ${isExpiringSoon && campaign.status === 'published' ? 'bg-red-500' : ''}`}
                              style={position}
                              onClick={() => onCampaignClick?.(campaign)}
                            >
                              <div className="h-full flex items-center justify-center px-2 text-white text-xs overflow-hidden">
                                <span className="truncate">
                                  {campaign.name}
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <div>
                                <strong>{campaign.name}</strong>
                              </div>
                              <div className="text-xs">
                                {campaign.institution}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(campaign.startDate), 'dd/MM/yyyy')} -{' '}
                                {format(new Date(campaign.endDate), 'dd/MM/yyyy')}
                              </div>
                              <div className="text-xs">
                                Responsável: {campaign.createdBy}
                              </div>
                              <div className="text-xs">
                                Status:{' '}
                                {campaign.status === 'published'
                                  ? '🟢 Publicado'
                                  : campaign.status === 'draft'
                                  ? '🟡 Rascunho'
                                  : '⚫ Arquivado'}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
                {visibleCampaigns.length === 0 && (
                  <div className="h-32" />
                )}
              </div>

              {/* Today Marker */}
              {(() => {
                const today = new Date();
                if (today >= startDate && today <= endDate) {
                  const viewStart = startDate.getTime();
                  const viewEnd = endDate.getTime();
                  const viewDuration = viewEnd - viewStart;
                  const todayPosition =
                    ((today.getTime() - viewStart) / viewDuration) * 100;

                  return (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-500 pointer-events-none"
                      style={{ left: `${todayPosition}%` }}
                    >
                      <div className="absolute -top-2 -left-8 text-xs text-blue-500 whitespace-nowrap">
                        Hoje
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Publicado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span>Rascunho</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span>Vencendo em &lt; 3 dias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400" />
          <span>Arquivado</span>
        </div>
      </div>
    </div>
  );
}
