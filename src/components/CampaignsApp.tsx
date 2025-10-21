import { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar as CalendarIcon, List, Loader2, BarChart3, Table2 } from 'lucide-react';
import { Campaign, CampaignFormData } from '../types/campaign';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { TableView } from './TableView';
import { GanttView } from './GanttView';
import { CampaignForm } from './CampaignForm';
import { CampaignDetailPage } from './CampaignDetailPage';
import { CampaignFilters, CampaignFiltersState } from './CampaignFilters';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { campaignService } from '../utils/campaignService';
import { router, Route } from '../utils/router';

export function CampaignsApp() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<Route>(router.getCurrentRoute());
  const [filters, setFilters] = useState<CampaignFiltersState>({});

  useEffect(() => {
    loadCampaigns();
    
    // Subscribe to route changes
    const unsubscribe = router.onRouteChange((route) => {
      setCurrentRoute(route);
    });
    
    return unsubscribe;
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await campaignService.getAll();
      const parsedCampaigns = data.map((c: any) => ({
        ...c,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
      setCampaigns(parsedCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: CampaignFormData) => {
    try {
      if (editingCampaign) {
        // Update
        const updated = await campaignService.update(editingCampaign.id, data);
        setCampaigns(campaigns.map(c => 
          c.id === editingCampaign.id 
            ? {
                ...updated,
                startDate: new Date(updated.startDate),
                endDate: new Date(updated.endDate),
                createdAt: new Date(updated.createdAt),
                updatedAt: new Date(updated.updatedAt),
              }
            : c
        ));
        toast.success('Campanha atualizada com sucesso!');
      } else {
        // Create
        const newCampaign = await campaignService.create(data);
        setCampaigns([
          {
            ...newCampaign,
            startDate: new Date(newCampaign.startDate),
            endDate: new Date(newCampaign.endDate),
            createdAt: new Date(newCampaign.createdAt),
            updatedAt: new Date(newCampaign.updatedAt),
          },
          ...campaigns
        ]);
        toast.success('Campanha criada com sucesso!');
        
        // Navigate to the new campaign
        router.navigate({ path: 'campaign', slug: newCampaign.slug });
      }
      
      setIsFormOpen(false);
      setEditingCampaign(undefined);
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      toast.error(error.message || 'Erro ao salvar campanha');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    // Navigate to campaign detail page in edit mode
    router.navigate({ path: 'campaign', slug: campaign.slug, mode: 'edit' });
  };

  const handleView = (campaign: Campaign) => {
    // Navigate to campaign detail page in view mode
    router.navigate({ path: 'campaign', slug: campaign.slug });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await campaignService.delete(deletingId);
      setCampaigns(campaigns.filter(c => c.id !== deletingId));
      toast.success('Campanha excluída com sucesso!');
      setDeletingId(null);
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error(error.message || 'Erro ao excluir campanha');
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const duplicated = await campaignService.duplicate(campaign.id);
      setCampaigns([
        {
          ...duplicated,
          startDate: new Date(duplicated.startDate),
          endDate: new Date(duplicated.endDate),
          createdAt: new Date(duplicated.createdAt),
          updatedAt: new Date(duplicated.updatedAt),
        },
        ...campaigns
      ]);
      toast.success('Campanha duplicada com sucesso!');
      
      // Navigate to the duplicated campaign
      router.navigate({ path: 'campaign', slug: duplicated.slug });
    } catch (error: any) {
      console.error('Error duplicating campaign:', error);
      toast.error(error.message || 'Erro ao duplicar campanha');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    
    const newStatus = campaign.status === 'archived' ? 'published' : 'archived';
    
    try {
      const updated = await campaignService.updateStatus(id, newStatus);
      setCampaigns(campaigns.map(c => 
        c.id === id 
          ? {
              ...updated,
              startDate: new Date(updated.startDate),
              endDate: new Date(updated.endDate),
              createdAt: new Date(updated.createdAt),
              updatedAt: new Date(updated.updatedAt),
            }
          : c
      ));
      toast.success('Status atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error(error.message || 'Erro ao atualizar status');
    }
  };

  const handleNewCampaign = () => {
    setEditingCampaign(undefined);
    setIsFormOpen(true);
  };

  // Apply filters to campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      // Institutions filter (multi-select)
      if (filters.institutions && filters.institutions.length > 0) {
        if (!filters.institutions.includes(campaign.institution)) {
          return false;
        }
      }

      // Statuses filter (multi-select)
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(campaign.status)) {
          return false;
        }
      }

      // Tags filter (multi-select)
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          campaign.tagsRelated.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Creators filter (multi-select)
      if (filters.creators && filters.creators.length > 0) {
        if (!filters.creators.includes(campaign.createdBy)) {
          return false;
        }
      }

      // Areas filter (multi-select) - would need to add area field to campaign
      if (filters.areas && filters.areas.length > 0) {
        // TODO: Add area field to campaign model
      }

      // Positions filter (multi-select) - would need to add position field to campaign
      if (filters.positions && filters.positions.length > 0) {
        // TODO: Add position field to campaign model
      }

      // Date range filter
      if (filters.startDate) {
        const campaignStart = new Date(campaign.startDate);
        campaignStart.setHours(0, 0, 0, 0);
        const filterStart = new Date(filters.startDate);
        filterStart.setHours(0, 0, 0, 0);
        if (campaignStart < filterStart) {
          return false;
        }
      }

      if (filters.endDate) {
        const campaignEnd = new Date(campaign.endDate);
        campaignEnd.setHours(23, 59, 59, 999);
        const filterEnd = new Date(filters.endDate);
        filterEnd.setHours(23, 59, 59, 999);
        if (campaignEnd > filterEnd) {
          return false;
        }
      }

      return true;
    });
  }, [campaigns, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  // Show campaign detail page if on a campaign route
  if (currentRoute.path === 'campaign' && currentRoute.slug) {
    return (
      <CampaignDetailPage
        slug={currentRoute.slug}
        initialMode={currentRoute.mode}
        onBack={() => router.navigate({ path: 'home' })}
        onUpdate={loadCampaigns}
      />
    );
  }

  // Show main campaigns list
  return (
    <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl">Gerenciar Campanhas</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {filteredCampaigns.length} de {campaigns.length} campanha(s)
          </p>
        </div>
        <Button onClick={handleNewCampaign} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span className="sm:inline">Nova Campanha</span>
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="gantt" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Gantt</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <Table2 className="w-4 h-4" />
              <span className="hidden sm:inline">Tabela</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </TabsTrigger>
          </TabsList>

          <CampaignFilters 
            filters={filters} 
            onChange={setFilters}
            availableCreators={Array.from(new Set(campaigns.map(c => c.createdBy)))}
          />
        </div>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView
            campaigns={filteredCampaigns}
            onCampaignClick={handleView}
          />
        </TabsContent>

        <TabsContent value="gantt" className="space-y-4">
          <GanttView
            campaigns={filteredCampaigns}
            onCampaignClick={handleView}
          />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <TableView
            campaigns={filteredCampaigns}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleStatus={handleToggleStatus}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <ListView
            campaigns={filteredCampaigns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleStatus={handleToggleStatus}
            onView={handleView}
          />
        </TabsContent>
      </Tabs>

      <CampaignForm
        campaign={editingCampaign}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCampaign(undefined);
        }}
        onSave={handleSave}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
