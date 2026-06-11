import { useEffect, useState } from 'react';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

interface MotionThemeToggleProps {
    className?: string;
    variant?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'rectangle' | 'star';
    fromCenter?: boolean;
}

export function MotionThemeToggle({
    className,
    variant = 'diamond',
    fromCenter = false,
}: MotionThemeToggleProps) {
    const { appearance, updateAppearance } = useAppearance();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDark = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handleToggle = (theme: 'light' | 'dark') => {
        updateAppearance(theme);
    };

    return (
        <AnimatedThemeToggler
            className={cn(
                'flex size-9 items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors',
                className,
            )}
            variant={variant}
            fromCenter={fromCenter}
            theme={isDark ? 'dark' : 'light'}
            onThemeChange={handleToggle}
        />
    );
}