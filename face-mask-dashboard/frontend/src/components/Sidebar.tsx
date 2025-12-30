import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Video,
    BarChart3,
    FileText,
    Upload,
    Settings,
    Shield,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const navItems = [
    { id: 'live', label: 'Canlı Akış', icon: Video },
    { id: 'upload', label: 'Görsel Yükle', icon: Upload },
    { id: 'statistics', label: 'İstatistikler', icon: BarChart3 },
    { id: 'logs', label: 'Kayıtlar', icon: FileText },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
                'bg-card/50 backdrop-blur-xl border-r border-white/10',
                collapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    {!collapsed && (
                        <div className="animate-fade-in">
                            <h1 className="text-lg font-bold text-gradient">MaskGuard</h1>
                            <p className="text-xs text-muted-foreground">AI Detection</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                'nav-link',
                                isActive && 'active',
                                collapsed && 'justify-center px-2'
                            )}
                        >
                            <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
                            {!collapsed && (
                                <span className="animate-fade-in">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Settings */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <button
                    className={cn(
                        'nav-link w-full',
                        collapsed && 'justify-center px-2'
                    )}
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="animate-fade-in">Ayarlar</span>}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute right-0 top-20 translate-x-1/2 p-1.5 rounded-full bg-card border border-white/10 hover:bg-white/10 transition-colors"
            >
                {collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>
        </aside>
    );
}
