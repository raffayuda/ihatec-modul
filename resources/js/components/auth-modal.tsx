import { useState, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

type AuthMode = 'login' | 'register';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: AuthMode;
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-4">
                {/* Email */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-email" className="text-xs font-bold text-neutral-400 ml-3">
                        Alamat Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
                        <Input
                            id="modal-email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@company.com"
                            className="rounded-xl h-11 bg-black/30 dark:bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 pl-10 pr-4 text-sm"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-password" className="text-xs font-bold text-neutral-400 ml-3">
                        Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
                        <Input
                            id="modal-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="rounded-xl h-11 bg-black/30 dark:bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 pl-10 pr-10 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="modal-remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            className="rounded border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-black/40"
                        />
                        <Label htmlFor="modal-remember" className="text-xs font-semibold text-neutral-400 select-none cursor-pointer">
                            Ingat saya
                        </Label>
                    </div>
                    <a
                        href={route('password.request')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                        Lupa kata sandi?
                    </a>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={processing}
                    className="mt-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-11 font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    <span>Masuk Sekarang</span>
                </Button>
            </div>

            <div className="text-center text-xs font-semibold text-neutral-400 pt-3 border-t border-white/5">
                Belum memiliki akun?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                >
                    Daftar Demo
                </button>
            </div>
        </form>
    );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-4">
                {/* Name */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-name" className="text-xs font-bold text-neutral-400 ml-3">
                        Nama Lengkap
                    </Label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
                        <Input
                            id="modal-name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Contoh: Budi Santoso"
                            className="rounded-xl h-11 bg-black/30 dark:bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 pl-10 pr-4 text-sm"
                        />
                    </div>
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-reg-email" className="text-xs font-bold text-neutral-400 ml-3">
                        Alamat Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
                        <Input
                            id="modal-reg-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="budi@company.com"
                            className="rounded-xl h-11 bg-black/30 dark:bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 pl-10 pr-4 text-sm"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-reg-password" className="text-xs font-bold text-neutral-400 ml-3">
                        Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
                        <Input
                            id="modal-reg-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="rounded-xl h-11 bg-black/30 dark:bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 pl-10 pr-10 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password */}
                <div className="grid gap-1.5">
                    <Label htmlFor="modal-reg-confirm" className="text-xs font-bold text-neutral-400 ml-3">
                        Konfirmasi Kata Sandi
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
                        <Input
                            id="modal-reg-confirm"
                            type={showConfirm ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="rounded-xl h-11 bg-black/30 dark:bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 pl-10 pr-10 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={processing}
                    className="mt-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-11 font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    <span>Daftar Akun</span>
                </Button>
            </div>

            <div className="text-center text-xs font-semibold text-neutral-400 pt-3 border-t border-white/5">
                Sudah memiliki akun?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                >
                    Masuk
                </button>
            </div>
        </form>
    );
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);

    const switchToLogin = () => setMode('login');
    const switchToRegister = () => setMode('register');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[420px] p-0 gap-0 bg-neutral-950/95 dark:bg-neutral-950 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl">
                {/* Decorative gradient top bar */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

                {/* Close button styling */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 size-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                    <X className="size-3.5" />
                </button>

                <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <DialogHeader className="px-6 pt-8 pb-2">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">
                                        T
                                    </div>
                                </div>
                                <DialogTitle className="text-lg font-extrabold text-white text-center tracking-tight">
                                    Selamat Datang Kembali
                                </DialogTitle>
                                <DialogDescription className="text-xs text-neutral-400 text-center font-medium mt-1">
                                    Silakan masuk untuk mengakses dashboard.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="px-6 pb-6 pt-4">
                                <LoginForm onSwitch={switchToRegister} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <DialogHeader className="px-6 pt-8 pb-2">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">
                                        T
                                    </div>
                                </div>
                                <DialogTitle className="text-lg font-extrabold text-white text-center tracking-tight">
                                    Buat Akun Demo Baru
                                </DialogTitle>
                                <DialogDescription className="text-xs text-neutral-400 text-center font-medium mt-1">
                                    Silakan isi detail data diri untuk mencoba demo platform.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="px-6 pb-6 pt-4">
                                <RegisterForm onSwitch={switchToLogin} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}