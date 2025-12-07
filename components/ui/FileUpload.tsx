'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FileUploadProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  onUpload?: (files: File[]) => Promise<void>;
  onRemove?: (file: File) => void;
  preview?: boolean;
  className?: string;
  id?: string;
}

/**
 * File Upload Component
 * Upload con progress, preview, drag & drop
 * Riferimento: W3C File API, WCAG 2.1 AAA
 */
export function FileUpload({
  label,
  error,
  helperText,
  required,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  multiple = false,
  onUpload,
  onRemove,
  preview = true,
  className,
  id,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadId = id || `file-upload-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${uploadId}-error` : undefined;
  const helperId = helperText ? `${uploadId}-helper` : undefined;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (file.type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File troppo grande. Massimo ${formatFileSize(maxSize)}`;
    }
    if (accept && !accept.split(',').some((type) => {
      const pattern = type.trim().replace('*', '.*');
      return new RegExp(pattern).test(file.type) || file.name.match(new RegExp(pattern));
    })) {
      return `Tipo file non supportato. Accettati: ${accept}`;
    }
    return null;
  };

  const handleFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
      // TODO: Show toast with errors
    }

    if (validFiles.length === 0) return;

    const finalFiles = multiple
      ? [...files, ...validFiles].slice(0, maxFiles)
      : [validFiles[0]];

    setFiles(finalFiles);

    if (onUpload) {
      setUploading(true);
      try {
        await onUpload(finalFiles);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = (file: File) => {
    setFiles(files.filter((f) => f !== file));
    onRemove?.(file);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={uploadId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive
            ? 'border-accent bg-accent/10'
            : error
            ? 'border-red-400'
            : 'border-premium shadow-premium hover:border-border-strong shadow-premium-hover interaction-smooth',
          className
        )}
      >
        <input
          ref={fileInputRef}
          id={uploadId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
          aria-required={required}
        />
        <div className="text-center">
          <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-primary mb-1">
            Trascina file qui o{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-accent hover:text-accent-hover underline"
            >
              seleziona
            </button>
          </p>
          <p className="text-xs text-text-tertiary">
            {accept && `Tipi supportati: ${accept}`}
            {maxSize && ` • Massimo ${formatFileSize(maxSize)}`}
            {multiple && maxFiles > 1 && ` • Massimo ${maxFiles} file`}
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-bg-soft border-premium shadow-premium rounded-lg card-mobile"
            >
              {preview && getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-xs text-text-tertiary">{formatFileSize(file.size)}</p>
                {uploading && uploadProgress[file.name] !== undefined && (
                  <div className="mt-1 w-full h-1 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                  </div>
                )}
              </div>
              {uploading ? (
                <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />
              ) : (
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  className="text-text-tertiary hover:text-red-400 transition-colors"
                  aria-label={`Rimuovi ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-400 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-text-tertiary">
          {helperText}
        </p>
      )}
    </div>
  );
}

