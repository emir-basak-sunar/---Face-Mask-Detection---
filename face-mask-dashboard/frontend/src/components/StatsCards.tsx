import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DetectionStats } from '@/types/detection';
import { formatPercentage } from '@/lib/utils';
import { Users, ShieldCheck, ShieldX, ShieldAlert, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
    stats: DetectionStats | null;
    isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
    const defaultStats: DetectionStats = {
        total: 0,
        masked: 0,
        unmasked: 0,
        incorrect: 0,
        maskRate: 0,
    };

    const data = stats || defaultStats;

    const cards = [
        {
            title: 'Toplam Tespit',
            value: data.total,
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
        },
        {
            title: 'Maskeli',
            value: data.masked,
            icon: ShieldCheck,
            color: 'text-success',
            bgColor: 'bg-success/10',
            borderColor: 'border-success/20',
        },
        {
            title: 'Maskesiz',
            value: data.unmasked,
            icon: ShieldX,
            color: 'text-danger',
            bgColor: 'bg-danger/10',
            borderColor: 'border-danger/20',
        },
        {
            title: 'Hatalı Maske',
            value: data.incorrect,
            icon: ShieldAlert,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
            borderColor: 'border-warning/20',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={index}
                            className={`stat-card border ${card.borderColor} ${isLoading ? 'opacity-50' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                                        <p className={`text-3xl font-bold ${card.color}`}>
                                            {isLoading ? '-' : card.value}
                                        </p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                        <Icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Mask rate progress */}
            <Card className="glass-card border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Maske Takma Oranı</p>
                                <p className="text-sm text-muted-foreground">
                                    Tespit edilen kişilerin maske durumu
                                </p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {isLoading ? '-' : formatPercentage(data.maskRate)}
                        </span>
                    </div>
                    <Progress
                        value={data.maskRate}
                        indicatorColor={
                            data.maskRate >= 80
                                ? '#22C55E'
                                : data.maskRate >= 50
                                    ? '#F59E0B'
                                    : '#EF4444'
                        }
                        className="h-3"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
