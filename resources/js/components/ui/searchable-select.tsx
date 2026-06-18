import * as React from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    value: string | number;
    label: string;
}

interface SearchableSelectProps {
    value?: string | number;
    onChange: (value: any) => void;
    options: (string | Option)[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    nullLabel?: string;
}

export function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'Pilih...',
    className,
    disabled = false,
    required = false,
    nullLabel,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Normalize options
    const normalizedOptions = React.useMemo(() => {
        const list: Option[] = [];
        if (nullLabel) {
            list.push({ value: '', label: nullLabel });
        }
        options.forEach((opt) => {
            if (typeof opt === 'string') {
                list.push({ value: opt, label: opt });
            } else if (opt && typeof opt === 'object') {
                list.push(opt);
            }
        });
        return list;
    }, [options, nullLabel]);

    // Find active label for display
    const selectedOption = normalizedOptions.find((opt) => opt.value === value || (opt.value === '' && !value));
    const displayVal = selectedOption ? selectedOption.label : '';

    // Filtered options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return normalizedOptions;
        return normalizedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [normalizedOptions, searchQuery]);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-9 w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 shadow-xs outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 disabled:opacity-75 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 text-left font-normal cursor-pointer",
                    className
                )}
            >
                <span className={cn("block truncate", !displayVal && "text-neutral-400 dark:text-neutral-500")}>
                    {displayVal || placeholder}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            </button>

            {/* Hidden Input for Form Validation (if required) */}
            {required && (
                <input
                    type="text"
                    tabIndex={-1}
                    value={value ?? ''}
                    required
                    onChange={() => {}}
                    className="absolute inset-0 size-0 opacity-0 pointer-events-none"
                />
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950 flex flex-col"
                    style={{ minWidth: '200px' }}
                >
                    {/* Search Input Box */}
                    <div className="relative p-2 border-b border-neutral-100 dark:border-neutral-800">
                        <Search className="absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-neutral-450 dark:text-neutral-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari..."
                            className="h-8 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-4 text-[11px] text-neutral-900 dark:text-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 outline-hidden focus:border-blue-500"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute top-1/2 right-4 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto max-h-48 py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400 italic">
                                Tidak ditemukan.
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = opt.value === value || (opt.value === '' && !value);
                                return (
                                    <button
                                        key={String(opt.value)}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={cn(
                                            "group relative w-full cursor-pointer select-none py-1.5 pl-8 pr-4 text-left text-xs outline-hidden flex items-center justify-between text-neutral-900 dark:text-neutral-100 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600",
                                            isSelected && "font-semibold bg-neutral-100 dark:bg-neutral-900"
                                        )}
                                    >
                                        <span className="block truncate">{opt.label}</span>
                                        {isSelected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-blue-600 dark:text-blue-400 group-hover:text-white">
                                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
