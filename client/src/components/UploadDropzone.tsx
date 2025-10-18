import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
}

export function UploadDropzone({
  onFilesSelected,
  accept = "image/*,.pdf,.docx",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  className
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  }, []);

  const processFiles = (files: File[]) => {
    const validFiles = files
      .filter(file => file.size <= maxSize)
      .slice(0, maxFiles);
    
    setSelectedFiles(prev => {
      const newFiles = [...prev, ...validFiles].slice(0, maxFiles);
      onFilesSelected(newFiles);
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      onFilesSelected(newFiles);
      return newFiles;
    });
  };

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-institutional-yellow bg-institutional-yellow/10"
            : "border-border hover:border-institutional-blue",
          "focus-within:ring-2 focus-within:ring-institutional-yellow focus-within:ring-offset-2"
        )}
        data-testid="upload-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Área de upload de arquivos - clique ou arraste arquivos aqui"
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          data-testid="input-file"
          aria-label="Selecionar arquivos"
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <Upload className={cn(
            "h-12 w-12 transition-colors",
            isDragging ? "text-institutional-yellow" : "text-muted-foreground"
          )} />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: Imagens, PDF, DOCX (máx. {maxSize / 1024 / 1024}MB)
            </p>
          </div>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Arquivos selecionados:</p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-card border rounded-lg"
              data-testid={`file-item-${index}`}
            >
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                data-testid={`button-remove-file-${index}`}
                aria-label={`Remover arquivo ${file.name}`}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
