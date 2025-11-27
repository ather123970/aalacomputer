import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatCurrency(amount: number, currency: 'USD' | 'PKR' = 'USD'): string {
    if (currency === 'PKR') {
        return `PKR ${amount.toLocaleString('en-PK')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
}

export function detectScroll(callback: (isScrolled: boolean) => void) {
    let ticking = false;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                callback(window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
}
