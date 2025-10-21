import { useRef, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { AttachmentUploadProgress, MAX_FILE_SIZE, MAX_FILES_PER_CAMPAIGN, getFileType, formatFileSize, ALLOWED_FILE_TYPES } from '../types/attachment';
import { toast } from 'sonner@2.0.3';

interface AttachmentUploaderProps {
  campaignId?: string;
  currentFileCount: number;
  currentTotalSize: number;
  onUploadComplete: (files: File[]) => void;
  disabled?: boolean;
}

export function AttachmentUploader({
  campaignId,
  currentFileCount,
  currentTotalSize,
  onUploadComplete,
  disabled,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Map<string, AttachmentUploadProgress>>(new Map());

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileType = getFileType(file.name, file.type);
    if (!fileType) {
      return `Tipo de arquivo não suportado: ${file.name}`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande: ${file.name} (máx: ${formatFileSize(MAX_FILE_SIZE)})`;
    }

    // Check total files limit
    if (currentFileCount + selectedFiles.length >= MAX_FILES_PER_CAMPAIGN) {
      return `Limite de ${MAX_FILES_PER_CAMPAIGN} arquivos atingido`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    onUploadComplete(selectedFiles);
    setSelectedFiles([]);
  };

  const getAllowedExtensions = () => {
    const extensions = new Set<string>();
    Object.values(ALLOWED_FILE_TYPES).forEach(type => {
      type.extensions.forEach(ext => extensions.add(ext));
    });
    return Array.from(extensions).join(',');
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="mb-2">
          Arraste arquivos aqui ou <span className="text-primary">clique para selecionar</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Máx: {formatFileSize(MAX_FILE_SIZE)} por arquivo | {MAX_FILES_PER_CAMPAIGN} arquivos por campanha
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Formatos: Imagens, Vídeos, Áudio, Documentos (Word, Excel, PPT), PSD, TXT
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAllowedExtensions()}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm">
              Arquivos selecionados ({selectedFiles.length})
            </h4>
            <Button size="sm" onClick={handleUpload}>
              Adicionar {selectedFiles.length} arquivo(s)
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">
                    {getFileType(file.name, file.type) && 
                      ALLOWED_FILE_TYPES[getFileType(file.name, file.type)!]?.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limits info */}
      {currentFileCount > 0 && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {currentFileCount} de {MAX_FILES_PER_CAMPAIGN} arquivos |{' '}
            {formatFileSize(currentTotalSize)} usados
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
