import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Settings, MessageSquare, History } from 'lucide-react';
import { Campaign } from '../types/campaign';
import { Comment } from '../types/comment';
import { EditHistoryEntry } from '../types/editHistory';
import { Attachment } from '../types/attachment';
import { Button } from './ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CampaignSidebar } from './CampaignSidebar';
import { CommentsThread } from './CommentsThread';
import { InlineEditableField } from './InlineEditableField';
import { AttachmentUploader } from './AttachmentUploader';
import { AttachmentGallery } from './AttachmentGallery';
import { HistorySection } from './HistorySection';
import { campaignService } from '../utils/campaignService';
import { attachmentService } from '../utils/attachmentService';
import { commentService } from '../utils/commentService';
import { historyService } from '../utils/historyService';
import { router } from '../utils/router';
import { toast } from 'sonner@2.0.3';
import { useIsMobile } from './ui/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface CampaignDetailPageProps {
  slug: string;
  initialMode?: 'view' | 'edit';
  onBack: () => void;
  onUpdate: () => void;
}

export function CampaignDetailPage({ slug, initialMode = 'view', onBack, onUpdate }: CampaignDetailPageProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<EditHistoryEntry[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadCampaign();
  }, [slug]);

  useEffect(() => {
    if (campaign) {
      loadAttachments();
      loadComments();
      loadHistory();
    }
  }, [campaign]);

  const loadCampaign = async () => {
    try {
      setIsLoading(true);
      const data = await campaignService.getBySlug(slug);
      if (data) {
        setCampaign(data);
      } else {
        toast.error('Campanha não encontrada');
        router.navigate({ path: 'home' });
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Erro ao carregar campanha');
      router.navigate({ path: 'home' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttachments = async () => {
    if (!campaign) return;
    
    try {
      setIsLoadingAttachments(true);
      const data = await attachmentService.getAll(campaign.id);
      setAttachments(data);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  const loadComments = async () => {
    if (!campaign) return;
    
    try {
      setIsLoadingComments(true);
      const data = await commentService.getAll(campaign.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadHistory = async () => {
    if (!campaign) return;
    
    try {
      setIsLoadingHistory(true);
      const data = await historyService.getAll(campaign.id);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!campaign) return;

    try {
      const updateData: any = { [field]: value };
      
      // Construct full update with all required fields
      const fullData = {
        name: campaign.name,
        description: campaign.description,
        institution: campaign.institution,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        tagsRelated: campaign.tagsRelated,
        tagsExcluded: campaign.tagsExcluded,
        status: campaign.status,
        ...updateData,
      };

      await campaignService.update(campaign.id, fullData);
      toast.success('Campo atualizado com sucesso!');
      await loadCampaign();
      await loadHistory();
      onUpdate();
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Erro ao atualizar campo');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;

    try {
      setIsDeleting(true);
      await campaignService.delete(campaign.id);
      toast.success('Campanha excluída com sucesso!');
      router.navigate({ path: 'home' });
      onUpdate();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erro ao excluir campanha');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = async () => {
    if (!campaign) return;

    try {
      const duplicated = await campaignService.duplicate(campaign.id);
      toast.success('Campanha duplicada com sucesso!');
      router.navigate({ path: 'campaign', slug: duplicated.slug });
      onUpdate();
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Erro ao duplicar campanha');
    }
  };

  const handleToggleStatus = async () => {
    if (!campaign) return;

    try {
      const newStatus = campaign.status === 'archived' ? 'published' : 'archived';
      await campaignService.updateStatus(campaign.id, newStatus);
      toast.success(`Campanha ${newStatus === 'archived' ? 'arquivada' : 'desarquivada'} com sucesso!`);
      await loadCampaign();
      await loadHistory();
      onUpdate();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleUploadAttachments = async (files: File[]) => {
    if (!campaign) return;

    try {
      const uploadPromises = files.map(file =>
        attachmentService.upload(campaign.id, file)
      );

      const uploaded = await Promise.all(uploadPromises);
      setAttachments([...uploaded, ...attachments]);
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      await loadHistory();
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Erro ao enviar arquivos');
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await attachmentService.delete(id);
      setAttachments(attachments.filter(a => a.id !== id));
      toast.success('Anexo excluído');
      await loadHistory();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Erro ao excluir anexo');
    }
  };

  const handleRenameAttachment = async (id: string, newName: string) => {
    try {
      const updated = await attachmentService.rename(id, newName);
      setAttachments(attachments.map(a => a.id === id ? updated : a));
      toast.success('Anexo renomeado');
    } catch (error) {
      console.error('Error renaming attachment:', error);
      toast.error('Erro ao renomear anexo');
    }
  };

  const handleDownloadAttachment = async (id: string) => {
    try {
      const url = await attachmentService.getDownloadUrl(id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Erro ao baixar anexo');
    }
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!campaign) return;

    try {
      const newComment = await commentService.create(
        campaign.id,
        content,
        parentId
      );
      setComments([newComment, ...comments]);
      toast.success('Comentário adicionado');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await commentService.delete(id);
      setComments(comments.filter(c => c.id !== id));
      toast.success('Comentário excluído');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erro ao excluir comentário');
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Campanha não encontrada</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Desktop layout: 3 columns (sidebar + content + comments)
  // Mobile layout: tabs (content + settings + comments + history)

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Mobile Top Bar */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-base truncate flex-1">{campaign.name}</h1>
          </div>
        </div>

        {/* Mobile Tabs */}
        <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full rounded-none border-b grid grid-cols-4">
            <TabsTrigger value="content" className="text-xs">
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex-1 overflow-y-auto mt-0 p-4 space-y-6">
            {/* Campaign Title */}
            <div>
              <InlineEditableField
                value={campaign.name}
                onSave={(value) => handleUpdateField('name', value)}
                className="text-2xl"
                displayClassName="text-2xl"
                placeholder="Nome da campanha"
              />
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-3 text-sm text-muted-foreground">📝 Descrição</h3>
              <InlineEditableField
                value={campaign.description}
                onSave={(value) => handleUpdateField('description', value)}
                multiline
                placeholder="Clique para adicionar uma descrição..."
                className="text-sm"
              />
            </div>

            {/* Attachments */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                📎 Arquivos Anexados
                {attachments.length > 0 && (
                  <span className="text-sm text-muted-foreground">({attachments.length})</span>
                )}
              </h3>
              <div className="space-y-4">
                <AttachmentUploader
                  campaignId={campaign.id}
                  currentFileCount={attachments.length}
                  currentTotalSize={attachments.reduce((sum, a) => sum + a.fileSize, 0)}
                  onUploadComplete={handleUploadAttachments}
                />

                {isLoadingAttachments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <AttachmentGallery
                    attachments={attachments}
                    onDelete={handleDeleteAttachment}
                    onRename={handleRenameAttachment}
                    onDownload={handleDownloadAttachment}
                    canEdit={session.user.role !== 'viewer'}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto mt-0">
            <CampaignSidebar
              campaign={campaign}
              isMinimized={false}
              onToggleMinimized={() => {}}
              onUpdate={handleUpdateField}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
              onDelete={() => setShowDeleteDialog(true)}
            />
          </TabsContent>

          <TabsContent value="comments" className="flex-1 overflow-hidden mt-0">
            {!isLoadingComments ? (
              <CommentsThread
                comments={comments}
                currentUser={session.user}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto mt-0 p-4">
            <h3 className="mb-4">📜 Histórico de Edições</h3>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <HistorySection history={history} />
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Campanha</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir "{campaign.name}"? Esta ação não pode ser
                desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar with Breadcrumbs */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => router.navigate({ path: 'home' })}
                    className="cursor-pointer"
                  >
                    Campanhas EdTech
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content + Comments */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <CampaignSidebar
          campaign={campaign}
          isMinimized={isSidebarMinimized}
          onToggleMinimized={() => setIsSidebarMinimized(!isSidebarMinimized)}
          onUpdate={handleUpdateField}
          onDuplicate={handleDuplicate}
          onToggleStatus={handleToggleStatus}
          onDelete={() => setShowDeleteDialog(true)}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 space-y-8">
            {/* Campaign Title - Inline Editable */}
            <div>
              <InlineEditableField
                value={campaign.name}
                onSave={(value) => handleUpdateField('name', value)}
                className="text-3xl"
                displayClassName="text-3xl"
                placeholder="Nome da campanha"
              />
            </div>

            {/* Description - Inline Editable */}
            <div>
              <h3 className="mb-3 text-sm text-muted-foreground">📝 Descrição</h3>
              <InlineEditableField
                value={campaign.description}
                onSave={(value) => handleUpdateField('description', value)}
                multiline
                placeholder="Clique para adicionar uma descrição..."
                className="text-sm"
              />
            </div>

            {/* Attachments Section */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                📎 Arquivos Anexados
                {attachments.length > 0 && (
                  <span className="text-sm text-muted-foreground">({attachments.length})</span>
                )}
              </h3>
              <div className="space-y-4">
                <AttachmentUploader
                  campaignId={campaign.id}
                  currentFileCount={attachments.length}
                  currentTotalSize={attachments.reduce((sum, a) => sum + a.fileSize, 0)}
                  onUploadComplete={handleUploadAttachments}
                />

                {isLoadingAttachments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <AttachmentGallery
                    attachments={attachments}
                    onDelete={handleDeleteAttachment}
                    onRename={handleRenameAttachment}
                    onDownload={handleDownloadAttachment}
                    canEdit={session.user.role !== 'viewer'}
                  />
                )}
              </div>
            </div>

            {/* History Section */}
            <div>
              <h3 className="mb-4">📜 Histórico de Edições</h3>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <HistorySection history={history} />
              )}
            </div>
          </div>
        </div>

        {/* Right Comments Thread */}
        {!isLoadingComments ? (
          <CommentsThread
            comments={comments}
            currentUser={session.user}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        ) : (
          <div className="w-96 bg-white border-l flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Campanha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{campaign.name}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
