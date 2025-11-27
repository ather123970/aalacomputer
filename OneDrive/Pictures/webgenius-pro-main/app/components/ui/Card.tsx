'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import { hoverLift } from '@/app/lib/animations';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    glass?: boolean;
}

export default function Card({
    children,
    className,
    hover = true,
    gradient = false,
    glass = false
}: CardProps) {
    const cardClasses = cn(
        'rounded-2xl p-6',
        {
            'bg-white shadow-lg': !gradient && !glass,
            'bg-gradient-blue text-white': gradient,
            'glass-white': glass,
        },
        className
    );

    if (hover) {
        return (
            <motion.div
                className={cn(cardClasses, 'card-hover cursor-pointer')}
                {...hoverLift}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={cardClasses}>
            {children}
        </div>
    );
}
