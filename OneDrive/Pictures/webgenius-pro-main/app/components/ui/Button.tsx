'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    icon?: React.ReactNode;
    loading?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    icon,
    loading = false,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-button font-medium transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:scale-105 hover:shadow-lg hover:shadow-primary/30 active:scale-95',
        secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95',
        outline: 'bg-transparent text-primary border border-primary/30 hover:border-primary hover:bg-primary/5'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
