import React, { forwardRef, useRef } from 'react';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { cn } from '@/lib/utils';
import { FileText, CheckCircle2, Users, UploadCloud, ShieldCheck, BookOpen } from 'lucide-react';

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
    ({ className, children }, ref) => (
        <div
            ref={ref}
            className={cn(
                'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white dark:bg-neutral-900 shadow-md',
                className,
            )}
        >
            {children}
        </div>
    ),
);
Circle.displayName = 'Circle';

export function TrainingFlowBeam({ className }: { className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stafPDRef = useRef<HTMLDivElement>(null);
    const dokumenRef = useRef<HTMLDivElement>(null);
    const timTrainingRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<HTMLDivElement>(null);
    const reviewRef = useRef<HTMLDivElement>(null);
    const approvalRef = useRef<HTMLDivElement>(null);
    const publikasiRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className={cn('relative flex h-[360px] w-full items-center justify-center overflow-hidden', className)}
        >
            <div className="flex w-full max-w-sm items-center justify-between px-4">
                {/* Left: Input nodes */}
                <div className="flex flex-col items-center gap-7">
                    <div className="flex flex-col items-center gap-1.5">
                        <Circle ref={stafPDRef} className="border-blue-200 dark:border-blue-800">
                            <Users className="size-5 text-blue-600" />
                        </Circle>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">Staf PD</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Circle ref={dokumenRef} className="border-orange-200 dark:border-orange-800">
                            <FileText className="size-5 text-orange-500" />
                        </Circle>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">Dokumen</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Circle ref={timTrainingRef} className="border-purple-200 dark:border-purple-800">
                            <BookOpen className="size-5 text-purple-500" />
                        </Circle>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">Tim Training</span>
                    </div>
                </div>

                {/* Center: Hub */}
                <div className="flex flex-col items-center gap-1.5">
                    <Circle
                        ref={centerRef}
                        className="size-16 border-blue-500 bg-blue-600 dark:bg-blue-600 shadow-lg shadow-blue-500/30"
                    >
                        <span className="text-2xl font-extrabold text-white">T</span>
                    </Circle>
                    <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">TrainingPD</span>
                </div>

                {/* Right: Output nodes */}
                <div className="flex flex-col items-center gap-7">
                    <div className="flex flex-col items-center gap-1.5">
                        <Circle ref={reviewRef} className="border-amber-200 dark:border-amber-800">
                            <ShieldCheck className="size-5 text-amber-500" />
                        </Circle>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">Review PD</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Circle ref={approvalRef} className="border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="size-5 text-emerald-500" />
                        </Circle>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">Approval</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Circle ref={publikasiRef} className="border-indigo-200 dark:border-indigo-800">
                            <UploadCloud className="size-5 text-indigo-500" />
                        </Circle>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">Publikasi</span>
                    </div>
                </div>
            </div>

            {/* Beams: left → center */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={stafPDRef}
                toRef={centerRef}
                curvature={-40}
                gradientStartColor="#3b82f6"
                gradientStopColor="#6366f1"
                duration={4}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={dokumenRef}
                toRef={centerRef}
                gradientStartColor="#f97316"
                gradientStopColor="#3b82f6"
                duration={5}
                delay={1}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={timTrainingRef}
                toRef={centerRef}
                curvature={40}
                gradientStartColor="#8b5cf6"
                gradientStopColor="#3b82f6"
                duration={4.5}
                delay={0.5}
            />

            {/* Beams: center → right */}
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={reviewRef}
                curvature={-40}
                gradientStartColor="#3b82f6"
                gradientStopColor="#f59e0b"
                duration={4}
                delay={0.3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={approvalRef}
                gradientStartColor="#3b82f6"
                gradientStopColor="#10b981"
                duration={5}
                delay={1.3}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={centerRef}
                toRef={publikasiRef}
                curvature={40}
                gradientStartColor="#3b82f6"
                gradientStopColor="#6366f1"
                duration={4.5}
                delay={0.8}
            />
        </div>
    );
}
