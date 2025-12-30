import { useCallback, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    onImageSelect: (base64: string, preview: string) => void;
    isLoading?: boolean;
}

export function ImageUpload({ onImageSelect, isLoading }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setPreview(result);
                // Extract base64 without data URL prefix
                const base64 = result.split(',')[1];
                onImageSelect(base64, result);
            };
            reader.readAsDataURL(file);
        },
        [onImageSelect]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile]
    );

    const clearPreview = useCallback(() => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    return (
        <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                />

                {preview ? (
                    <div className="relative animate-fade-in">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto rounded-lg max-h-[400px] object-contain bg-black/20"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={clearPreview}
                            disabled={isLoading}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-sm font-medium">Analiz ediliyor...</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <label
                        htmlFor="image-upload"
                        className={cn('upload-zone block', isDragging && 'dragging')}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="p-4 rounded-full bg-primary/10">
                                {isDragging ? (
                                    <Image className="w-10 h-10 text-primary" />
                                ) : (
                                    <Upload className="w-10 h-10 text-primary" />
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium mb-1">
                                    {isDragging
                                        ? 'Görüntüyü bırakın'
                                        : 'Görüntü yüklemek için tıklayın'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    veya sürükleyip bırakın
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, WEBP • Maks 10MB
                            </p>
                        </div>
                    </label>
                )}
            </CardContent>
        </Card>
    );
}
