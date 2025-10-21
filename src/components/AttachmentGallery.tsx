import { useState } from 'react';
import { Download, Trash2, Edit2, Eye, X, Loader2 } from 'lucide-react';
import { Attachment, getFileIcon, formatFileSize } from '../types/attachment';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import { toast } from 'sonner@2.0.3';

interface AttachmentGalleryProps {
  attachments: Attachment[];
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDownload: (id: string) => void;
  canEdit?: boolean;
}

type ViewMode = 'grid' | 'list';

export function AttachmentGallery({
  attachments,
  onDelete,
  onRename,
  onDownload,
  canEdit = true,
}: AttachmentGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRenameClick = (attachment: Attachment) => {
    setRenamingId(attachment.id);
    setNewName(attachment.displayName);
  };

  const handleRenameSubmit = () => {
    if (renamingId && newName.trim()) {
      onRename(renamingId, newName.trim());
      setRenamingId(null);
      setNewName('');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  const renderPreview = (attachment: Attachment) => {
    switch (attachment.fileType) {
      case 'image':
        return (
          <img
            src={attachment.url}
            alt={attachment.displayName}
            className="max-w-full max-h-[70vh] object-contain"
          />
        );
      
      case 'video':
        return (
          <video
            src={attachment.url}
            controls
            className="max-w-full max-h-[70vh]"
          >
            Seu navegador não suporta vídeo.
          </video>
        );
      
      case 'audio':
        return (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">{getFileIcon(attachment.fileType)}</div>
            <audio src={attachment.url} controls className="w-full max-w-md mx-auto">
              Seu navegador não suporta áudio.
            </audio>
          </div>
        );
      
      default:
        return (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">{getFileIcon(attachment.fileType)}</div>
            <p className="text-muted-foreground mb-4">
              Preview não disponível para este tipo de arquivo
            </p>
            <Button onClick={() => onDownload(attachment.id)}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Arquivo
            </Button>
          </div>
        );
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum anexo adicionado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm">
          📎 Arquivos Anexados ({attachments.length})
        </h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grade
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
            >
              {/* Thumbnail */}
              <div 
                className="aspect-square bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                onClick={() => setPreviewAttachment(attachment)}
              >
                {attachment.fileType === 'image' ? (
                  <img
                    src={attachment.thumbnailUrl || attachment.url}
                    alt={attachment.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-5xl">{getFileIcon(attachment.fileType)}</div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="text-sm truncate" title={attachment.displayName}>
                  {attachment.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </p>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewAttachment(attachment)}
                    title="Visualizar"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDownload(attachment.id)}
                    title="Baixar"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  {canEdit && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRenameClick(attachment)}
                        title="Renomear"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDeleteClick(attachment.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-3xl">{getFileIcon(attachment.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{attachment.displayName}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>
                      Por {attachment.uploadedByName} em{' '}
                      {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewAttachment(attachment)}
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownload(attachment.id)}
                  title="Baixar"
                >
                  <Download className="w-4 h-4" />
                </Button>
                {canEdit && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRenameClick(attachment)}
                      title="Renomear"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDeleteClick(attachment.id)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewAttachment?.displayName}</DialogTitle>
            <DialogDescription>
              {previewAttachment && formatFileSize(previewAttachment.fileSize)} •{' '}
              Enviado por {previewAttachment?.uploadedByName}
            </DialogDescription>
          </DialogHeader>
          {previewAttachment && renderPreview(previewAttachment)}
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renamingId} onOpenChange={() => setRenamingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Arquivo</DialogTitle>
            <DialogDescription>Digite o novo nome para o arquivo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Nome do arquivo</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenamingId(null)}>
                Cancelar
              </Button>
              <Button onClick={handleRenameSubmit}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Anexo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
