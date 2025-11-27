'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-300',
                    'focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200',
                    'placeholder:text-gray-400',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <textarea
                className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-300',
                    'focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200 resize-y',
                    'placeholder:text-gray-400 min-h-[120px]',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <select
                className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-300',
                    'focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200 bg-white',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

interface FileUploadProps {
    label?: string;
    error?: string;
    onChange: (file: File | null) => void;
    accept?: string;
}

export function FileUpload({ label, error, onChange, accept }: FileUploadProps) {
    const [fileName, setFileName] = React.useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFileName(file?.name || '');
        onChange(file);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="file"
                    onChange={handleChange}
                    accept={accept}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className={cn(
                        'flex items-center justify-center w-full px-4 py-3',
                        'border-2 border-dashed border-gray-300 rounded-lg',
                        'cursor-pointer hover:border-primary transition-colors',
                        'text-gray-600 hover:text-primary',
                        error && 'border-red-500'
                    )}
                >
                    <span className="text-sm">
                        {fileName || 'Click to upload file'}
                    </span>
                </label>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
