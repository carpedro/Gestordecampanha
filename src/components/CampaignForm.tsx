import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { X, Loader2 } from 'lucide-react';
import { Campaign, CampaignFormData, Institution } from '../types/campaign';
import { Attachment } from '../types/attachment';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AudioRecorder } from './AudioRecorder';
import { AttachmentUploader } from './AttachmentUploader';
import { AttachmentGallery } from './AttachmentGallery';
import { attachmentService } from '../utils/attachmentService';
import { toast } from 'sonner@2.0.3';

interface CampaignFormProps {
  campaign?: Campaign;
  open: boolean;
  onClose: () => void;
  onSave: (data: CampaignFormData) => void;
}

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

export function CampaignForm({ campaign, open, onClose, onSave }: CampaignFormProps) {
  const [tagsRelated, setTagsRelated] = useState<string[]>(campaign?.tagsRelated || []);
  const [tagsExcluded, setTagsExcluded] = useState<string[]>(campaign?.tagsExcluded || []);
  const [newTagRelated, setNewTagRelated] = useState('');
  const [newTagExcluded, setNewTagExcluded] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | undefined>(campaign?.audioUrl);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CampaignFormData>({
    defaultValues: campaign ? {
      name: campaign.name,
      institution: campaign.institution,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      tagsRelated: campaign.tagsRelated,
      tagsExcluded: campaign.tagsExcluded,
      audioUrl: campaign.audioUrl,
    } : {
      status: 'draft',
      tagsRelated: [],
      tagsExcluded: [],
    }
  });

  const description = watch('description');
  const institution = watch('institution');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Load attachments when editing a campaign
  useEffect(() => {
    if (campaign && campaign.id && open) {
      loadAttachments();
    }
  }, [campaign, open]);

  const loadAttachments = async () => {
    if (!campaign?.id) return;
    
    try {
      setIsLoadingAttachments(true);
      const data = await attachmentService.getAll(campaign.id);
      setAttachments(data);
    } catch (error) {
      console.error('Error loading attachments:', error);
      toast.error('Erro ao carregar anexos');
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  const handleUploadAttachments = async (files: File[]) => {
    if (!campaign?.id) {
      toast.error('Salve a campanha antes de adicionar anexos');
      return;
    }

    try {
      setIsUploadingAttachments(true);
      
      const uploadPromises = files.map(file =>
        attachmentService.upload(campaign.id, file, (progress) => {
          // You could track individual file progress here
        })
      );

      const uploaded = await Promise.all(uploadPromises);
      setAttachments([...uploaded, ...attachments]);
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Erro ao enviar arquivos');
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await attachmentService.delete(id);
      setAttachments(attachments.filter(a => a.id !== id));
      toast.success('Anexo excluído');
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

  const addTagRelated = () => {
    if (newTagRelated.trim() && !tagsRelated.includes(newTagRelated.trim())) {
      const updated = [...tagsRelated, newTagRelated.trim()];
      setTagsRelated(updated);
      setValue('tagsRelated', updated);
      setNewTagRelated('');
    }
  };

  const removeTagRelated = (tag: string) => {
    const updated = tagsRelated.filter(t => t !== tag);
    setTagsRelated(updated);
    setValue('tagsRelated', updated);
  };

  const addTagExcluded = () => {
    if (newTagExcluded.trim() && !tagsExcluded.includes(newTagExcluded.trim())) {
      const updated = [...tagsExcluded, newTagExcluded.trim()];
      setTagsExcluded(updated);
      setValue('tagsExcluded', updated);
      setNewTagExcluded('');
    }
  };

  const removeTagExcluded = (tag: string) => {
    const updated = tagsExcluded.filter(t => t !== tag);
    setTagsExcluded(updated);
    setValue('tagsExcluded', updated);
  };

  const handleAudioTranscription = (text: string, url: string) => {
    setValue('description', text);
    setAudioUrl(url);
  };

  const onSubmit = (data: CampaignFormData) => {
    // Validar descrição mínima
    if (data.description.length < 140) {
      toast.error('A descrição deve ter no mínimo 140 caracteres');
      return;
    }
    
    // Validar instituição selecionada
    if (!data.institution) {
      toast.error('Selecione uma instituição');
      return;
    }
    
    // Validar datas
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate < startDate) {
      toast.error('A data de término deve ser posterior à data de início');
      return;
    }

    onSave({
      ...data,
      tagsRelated,
      tagsExcluded,
      audioUrl,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Editar Iniciativa' : 'Nova Iniciativa'}
          </DialogTitle>
          <DialogDescription>
            {campaign ? 'Atualize as informações da iniciativa comercial.' : 'Cadastre uma nova iniciativa comercial para o time de vendas.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="attachments" disabled={!campaign}>
              Anexos {attachments.length > 0 && `(${attachments.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Iniciativa *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Campanha Black Friday 2025"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Instituição de Ensino *</Label>
            <Select
              value={institution}
              onValueChange={(value) => setValue('institution', value as Institution, { shouldValidate: true })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma instituição" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!institution && (
              <p className="text-sm text-red-600">Instituição é obrigatória</p>
            )}
            {errors.institution && (
              <p className="text-sm text-red-600">{errors.institution.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição * (mínimo 140 caracteres)</Label>
            <AudioRecorder onTranscriptionComplete={handleAudioTranscription} />
            <Textarea
              id="description"
              {...register('description', { 
                required: 'Descrição é obrigatória',
                minLength: { value: 140, message: 'Mínimo de 140 caracteres' }
              })}
              placeholder="Descreva a iniciativa comercial, seus objetivos, público-alvo e diferenciais..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between text-sm">
              <span className={description?.length < 140 ? 'text-red-600' : 'text-green-600'}>
                {description?.length || 0} / 140 caracteres
              </span>
            </div>
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>O que se aproxima (Tags)</Label>
            <div className="flex gap-2">
              <Input
                value={newTagRelated}
                onChange={(e) => setNewTagRelated(e.target.value)}
                placeholder="Ex: desconto, bolsa, pós-graduação..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTagRelated();
                  }
                }}
              />
              <Button type="button" onClick={addTagRelated} variant="outline">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagsRelated.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTagRelated(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>O que não pode ser confundido (Exclusões)</Label>
            <div className="flex gap-2">
              <Input
                value={newTagExcluded}
                onChange={(e) => setNewTagExcluded(e.target.value)}
                placeholder="Ex: outras campanhas, produtos não incluídos..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTagExcluded();
                  }
                }}
              />
              <Button type="button" onClick={addTagExcluded} variant="outline">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagsExcluded.map((tag) => (
                <Badge key={tag} variant="destructive" className="gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTagExcluded(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate', { required: 'Data de início é obrigatória' })}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate', { required: 'Data de término é obrigatória' })}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as 'draft' | 'published' | 'archived')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {campaign ? 'Salvar Alterações' : 'Criar Iniciativa'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            {!campaign ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Salve a campanha primeiro para adicionar anexos</p>
              </div>
            ) : (
              <>
                <AttachmentUploader
                  campaignId={campaign.id}
                  currentFileCount={attachments.length}
                  currentTotalSize={attachments.reduce((sum, a) => sum + a.fileSize, 0)}
                  onUploadComplete={handleUploadAttachments}
                  disabled={isUploadingAttachments}
                />

                {isUploadingAttachments && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Enviando arquivos...</span>
                  </div>
                )}

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
                    canEdit={true}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
