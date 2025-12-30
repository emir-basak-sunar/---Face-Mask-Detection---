import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ImageUpload } from '@/components/ImageUpload';
import { DetectionCanvas } from '@/components/DetectionCanvas';
import { StatsCards } from '@/components/StatsCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDetection } from '@/hooks/useDetection';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { BarChart3, FileText, Clock, Shield } from 'lucide-react';

type TabType = 'live' | 'upload' | 'statistics' | 'logs';

// Mock logs for demo
const mockLogs = [
    { id: 1, time: '10:45:23', type: 'info', message: 'Sistem başlatıldı' },
    { id: 2, time: '10:45:30', type: 'success', message: '3 kişi tespit edildi - 2 maskeli' },
    { id: 3, time: '10:46:12', type: 'warning', message: '1 kişi hatalı maske kullanıyor' },
    { id: 4, time: '10:47:05', type: 'error', message: '1 kişi maske takmıyor' },
    { id: 5, time: '10:48:00', type: 'success', message: '5 kişi tespit edildi - 5 maskeli' },
];

export function Dashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('upload');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { detect, detections, stats, isLoading, error, clearResults } = useDetection();
    const { toast } = useToast();

    // Show error toast via useEffect to avoid render-phase state updates
    useEffect(() => {
        if (error) {
            toast({
                title: 'Tespit Hatası',
                description: error,
                variant: 'destructive',
            });
        }
    }, [error, toast]);

    const handleImageSelect = useCallback(
        async (base64: string, preview: string) => {
            setImagePreview(preview);
            clearResults();

            try {
                await detect(base64);
            } catch {
                toast({
                    title: 'Hata',
                    description: 'Görüntü analiz edilemedi',
                    variant: 'destructive',
                });
            }
        },
        [detect, clearResults, toast]
    );


    return (
        <div className="min-h-screen bg-background">
            <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabType)} />

            {/* Main Content */}
            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">
                            {activeTab === 'live' && 'Canlı Akış'}
                            {activeTab === 'upload' && 'Görsel Analizi'}
                            {activeTab === 'statistics' && 'İstatistikler'}
                            {activeTab === 'logs' && 'Sistem Kayıtları'}
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        {activeTab === 'live' && 'Gerçek zamanlı yüz maskesi tespiti'}
                        {activeTab === 'upload' && 'Görsel yükleyerek maske tespiti yapın'}
                        {activeTab === 'statistics' && 'Tespit istatistiklerini görüntüleyin'}
                        {activeTab === 'logs' && 'Sistem olaylarını takip edin'}
                    </p>
                </header>

                {/* Tab Content */}
                {activeTab === 'live' && <VideoPlayer />}

                {activeTab === 'upload' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <ImageUpload onImageSelect={handleImageSelect} isLoading={isLoading} />

                            {detections.length > 0 && (
                                <Card className="glass-card animate-fade-in">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Tespit Detayları</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {detections.map((det, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: det.color }}
                                                        />
                                                        <span className="font-medium">{det.label}</span>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {(det.confidence * 100).toFixed(1)}% güven
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-6">
                            {imagePreview && detections.length > 0 && (
                                <Card className="glass-card animate-fade-in overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Tespit Sonucu</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <DetectionCanvas
                                            imageUrl={imagePreview}
                                            detections={detections}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            <StatsCards stats={stats} isLoading={isLoading} />
                        </div>
                    </div>
                )}

                {activeTab === 'statistics' && (
                    <div className="space-y-6">
                        <StatsCards stats={stats} />

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Analitik Özeti
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-muted-foreground">
                                    <p>Görsel yükleyerek veya canlı akışı başlatarak istatistikleri görüntüleyin</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Son Olaylar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {mockLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-muted-foreground w-24">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">{log.time}</span>
                                        </div>
                                        <div
                                            className={`px-2 py-0.5 rounded text-xs font-medium ${log.type === 'success'
                                                ? 'bg-success/20 text-success'
                                                : log.type === 'warning'
                                                    ? 'bg-warning/20 text-warning'
                                                    : log.type === 'error'
                                                        ? 'bg-danger/20 text-danger'
                                                        : 'bg-primary/20 text-primary'
                                                }`}
                                        >
                                            {log.type.toUpperCase()}
                                        </div>
                                        <span className="flex-1">{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            <Toaster />
        </div>
    );
}
