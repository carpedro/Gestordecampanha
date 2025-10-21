import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from './ui/use-mobile';

interface CalendarViewProps {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView({ campaigns, onCampaignClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const isMobile = useIsMobile();
  
  // Touch gesture handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setViewMode('month');
      } else if (e.key === 'w' || e.key === 'W') {
        setViewMode('week');
      } else if (e.key === 'd' || e.key === 'D') {
        setViewMode('day');
      } else if (e.key === 't' || e.key === 'T') {
        goToToday();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentDate, viewMode]);

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    if (viewMode === 'day') {
      setSelectedDay(new Date());
    }
  };

  // Touch gesture handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsSwiping(false);
    
    const swipeThreshold = 50; // minimum distance to trigger swipe
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - go to next
        goToNext();
      } else {
        // Swipe right - go to previous
        goToPrevious();
      }
    }
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    while (days.length < 35) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = viewMode === 'week' ? getWeekDays() : getMonthDays();

  const getCampaignsForDay = (date: Date) => {
    return campaigns.filter((campaign) => {
      const start = new Date(campaign.startDate);
      const end = new Date(campaign.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const formatHeader = () => {
    if (viewMode === 'day') {
      return format(selectedDay || currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays();
      return `Semana de ${format(weekDays[0], 'dd', { locale: ptBR })}-${format(weekDays[6], 'dd MMM yyyy', { locale: ptBR })}`;
    } else {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-gray-400';
    }
  };

  // Day View Rendering
  if (viewMode === 'day') {
    const dayToShow = selectedDay || currentDate;
    const dayCampaigns = getCampaignsForDay(dayToShow);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="ml-4 capitalize">{formatHeader()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value) => {
              setViewMode(value as ViewMode);
              if (value === 'day') setSelectedDay(currentDate);
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="day">Dia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg mb-4">📌 Campanhas Ativas Hoje ({dayCampaigns.length})</h3>
              
              {dayCampaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma campanha ativa para este dia
                </div>
              ) : (
                <div className="space-y-3">
                  {dayCampaigns.map((campaign) => (
                    <Card
                      key={campaign.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onCampaignClick(campaign)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏫</span>
                            <div>
                              <div>{campaign.institution} - {campaign.name}</div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              campaign.status === 'published'
                                ? 'default'
                                : campaign.status === 'draft'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {campaign.status === 'published' && '🟢 Publicado'}
                            {campaign.status === 'draft' && '🟡 Rascunho'}
                            {campaign.status === 'archived' && '⚫ Arquivado'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Responsável: 👤 {campaign.createdBy}</span>
                          <span>
                            Vigência: {format(new Date(campaign.startDate), 'dd/MM/yyyy')} - {format(new Date(campaign.endDate), 'dd/MM/yyyy')}
                          </span>
                        </div>

                        {campaign.tagsRelated.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {campaign.tagsRelated.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {campaign.description}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                          <span>📎 Anexos: 0</span>
                          <span>💬 Comentários: 0</span>
                          <Button size="sm" variant="outline" className="ml-auto">
                            Ver detalhes
                          </Button>
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div>
              <h3 className="text-lg mb-4">📅 Atividades do Dia</h3>
              <div className="space-y-2 text-sm">
                {dayCampaigns.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>• {dayCampaigns.length} campanha(s) ativa(s)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>• Criadas hoje: 0</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>• Última atividade: Há 2 horas</span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">Nenhuma atividade registrada para hoje</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Atalhos: M = Mês | W = Semana | D = Dia | T = Hoje | ← → = Navegar</span>
        </div>
      </div>
    );
  }

  // Month and Week View Rendering
  return (
    <div className="space-y-4">
      {/* Header controls - mobile optimized */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "icon"}
            onClick={goToPrevious}
            className={isMobile ? "flex-1" : ""}
          >
            <ChevronLeft className="w-4 h-4" />
            {isMobile && <span className="ml-1">Anterior</span>}
          </Button>
          <Button 
            variant="outline" 
            onClick={goToToday}
            className={isMobile ? "flex-1" : ""}
          >
            Hoje
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "icon"}
            onClick={goToNext}
            className={isMobile ? "flex-1" : ""}
          >
            {isMobile && <span className="mr-1">Próximo</span>}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base capitalize flex-1 sm:flex-none text-center sm:text-left">
            {formatHeader()}
          </span>
          <Select value={viewMode} onValueChange={(value) => {
            setViewMode(value as ViewMode);
            if (value === 'day') setSelectedDay(currentDate);
          }}>
            <SelectTrigger className="w-[120px] sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="day">Dia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar grid with touch gestures */}
      <Card 
        className="p-2 sm:p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {(isMobile ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']).map((day, i) => (
            <div key={day + i} className="text-center text-xs sm:text-sm text-muted-foreground p-1 sm:p-2">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const dayCampaigns = getCampaignsForDay(day);
            const isCurrentDay = isToday(day);
            const inCurrentMonth = isCurrentMonth(day);

            // Height based on view mode and device
            const dayHeight = isMobile 
              ? (viewMode === 'month' ? 'min-h-[60px]' : 'min-h-[180px]')
              : (viewMode === 'month' ? 'min-h-[80px]' : 'min-h-[240px]');

            return (
              <div
                key={index}
                onClick={() => {
                  if (viewMode === 'week') {
                    setViewMode('day');
                    setSelectedDay(day);
                  }
                }}
                className={`${dayHeight} p-1 sm:p-2 border rounded-lg transition-all duration-300 ${
                  isCurrentDay ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white'
                } ${!inCurrentMonth && viewMode === 'month' ? 'opacity-40' : ''} ${
                  viewMode === 'week' ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''
                }`}
              >
                <div className="text-xs sm:text-sm mb-1">{day.getDate()}</div>
                <div className={`space-y-1 ${viewMode === 'week' ? 'overflow-y-auto max-h-[150px] sm:max-h-[200px]' : ''}`}>
                  {viewMode === 'month' ? (
                    // Month view: show icon + count
                    dayCampaigns.length > 0 && (
                      <div className="text-center">
                        <div className={isMobile ? "text-lg" : "text-2xl"}>📌</div>
                        <div className="text-xs text-muted-foreground">{dayCampaigns.length}</div>
                      </div>
                    )
                  ) : (
                    // Week view: show mini cards
                    dayCampaigns.map((campaign) => (
                      <Card
                        key={campaign.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCampaignClick(campaign);
                        }}
                        className={`p-1.5 sm:p-2 cursor-pointer hover:shadow-md transition-shadow active:scale-95`}
                        style={{ backgroundColor: `${getStatusColor(campaign.status)}20` }}
                      >
                        <div
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mb-1 ${getStatusColor(campaign.status)}`}
                        />
                        <div className="text-[10px] sm:text-xs truncate">{campaign.institution}</div>
                        <div className="text-[10px] sm:text-xs truncate line-clamp-2">{campaign.name}</div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
            <span>Publicado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
            <span>Rascunho</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-400" />
            <span>Arquivado</span>
          </div>
        </div>
        {!isMobile && (
          <div className="text-xs sm:text-sm text-muted-foreground">
            Atalhos: M = Mês | W = Semana | D = Dia | T = Hoje | ← → = Navegar
          </div>
        )}
        {isMobile && (
          <div className="text-xs text-muted-foreground">
            💡 Dica: Deslize para navegar entre períodos
          </div>
        )}
      </div>
    </div>
  );
}
