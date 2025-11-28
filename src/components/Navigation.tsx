"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, Play, BookOpen, User } from 'lucide-react';
import { cn } from './ui';

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/upload', icon: Upload, label: 'Upload' },
        { href: '/player', icon: Play, label: 'Player' },
        { href: '/library', icon: BookOpen, label: 'Library' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-void-900/80 backdrop-blur-xl border-t border-white/5 pb-safe pt-2 px-6 z-50">
            <div className="flex justify-between items-center max-w-md mx-auto h-16">
                {links.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors duration-200",
                                isActive ? "text-neural-400" : "text-neural-500 hover:text-neural-300"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
