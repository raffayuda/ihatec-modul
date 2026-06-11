import { useRef, type RefObject } from 'react';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { cn } from '@/lib/utils';
import {
    Send,
    FileEdit,
    UserCheck,
    ShieldCheck,
    Users,
    ArrowRight,
    type LucideIcon,
} from 'lucide-react';

interface FlowNode {
    icon: LucideIcon;
    label: string;
    desc: string;
    active?: boolean;
}

const flowNodes: FlowNode[] = [
    {
        icon: Send,
        label: 'Pengajuan',
        desc: 'Staf mengajukan modul baru atau revisi',
    },
    {
        icon: FileEdit,
        label: 'Drafting',
        desc: 'Tim PD menyusun & melengkapi materi',
    },
    {
        icon: UserCheck,
        label: 'Review',
        desc: 'Manager PD meninjau & memberi masukan',
    },
    {
        icon: ShieldCheck,
        label: 'Approval',
        desc: 'Finalisasi & modul siap digunakan',
        active: true,
    },
    {
        icon: Users,
        label: 'Tim Training',
        desc: 'Modul tersedia di matriks pelatihan',
    },
];

function FlowNodeCard({
    node,
    index,
    nodeRefs,
}: {
    node: FlowNode;
    index: number;
    nodeRefs: RefObject<(HTMLDivElement | null)[]>;
}) {
    const Icon = node.icon;

    return (
        <div
            ref={(el) => {
                if (nodeRefs.current) {
                    nodeRefs.current[index] = el;
                }
            }}
            className={cn(
                'relative z-10 flex flex-col items-center gap-3 rounded-2xl border bg-white p-6 text-center shadow-sm transition-all',
                'dark:bg-neutral-950',
                node.active
                    ? 'border-emerald-300 bg-emerald-50/60 shadow-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-neutral-200 hover:border-blue-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-blue-800',
            )}
        >
            <div
                className={cn(
                    'flex size-12 items-center justify-center rounded-full',
                    node.active
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
                )}
            >
                <Icon className="size-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {node.label}
                </h4>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {node.desc}
                </p>
            </div>
        </div>
    );
}

export function AnimatedFlowSection({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative grid grid-cols-1 gap-6 sm:grid-cols-5',
                className,
            )}
        >
            {flowNodes.map((node, i) => (
                <FlowNodeCard
                    key={i}
                    node={node}
                    index={i}
                    nodeRefs={nodeRefs}
                />
            ))}

            {/* Animated Beams connecting nodes */}
            {flowNodes.slice(0, -1).map((_, i) => {
                const fromRef: RefObject<HTMLElement | null> = {
                    current: nodeRefs.current[i] ?? null,
                };
                const toRef: RefObject<HTMLElement | null> = {
                    current: nodeRefs.current[i + 1] ?? null,
                };

                if (!fromRef.current || !toRef.current) return null;

                return (
                    <AnimatedBeam
                        key={`beam-${i}`}
                        containerRef={
                            containerRef as RefObject<HTMLElement | null>
                        }
                        fromRef={fromRef}
                        toRef={toRef}
                        curvature={0}
                        pathColor="#3b82f6"
                        pathWidth={2}
                        pathOpacity={0.2}
                        gradientStartColor="#3b82f6"
                        gradientStopColor="#10b981"
                        duration={3 + i}
                        delay={i * 0.5}
                    />
                );
            })}
        </div>
    );
}
