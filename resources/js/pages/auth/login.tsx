import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Selamat Datang Kembali" description="Silakan masukkan email dan kata sandi Anda untuk mengakses dashboard.">
            <Head title="Masuk ke Akun" />

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    {/* Email address field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@company.com"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password field */}
                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Kata Sandi</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold" tabIndex={5}>
                                    Lupa kata sandi?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember me checkbox */}
                    <div className="flex items-center space-x-2.5">
                        <Checkbox 
                            id="remember" 
                            name="remember" 
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            tabIndex={3} 
                            className="rounded border-neutral-200 dark:border-neutral-800 text-blue-600"
                        />
                        <Label htmlFor="remember" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 select-none cursor-pointer">Ingat saya di perangkat ini</Label>
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl h-10.5 font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        <span>Masuk Sekarang</span>
                    </Button>
                </div>

                {/* Redirect link */}
                <div className="text-center text-xs font-semibold text-neutral-450 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                    Belum memiliki akun?{' '}
                    <TextLink href={route('register')} className="text-blue-600 hover:text-blue-700 dark:text-blue-450 font-bold" tabIndex={5}>
                        Daftar Demo
                    </TextLink>
                </div>
            </form>

            {status && <div className="mt-4 text-center text-xs font-bold text-green-600 dark:text-green-400">{status}</div>}
        </AuthLayout>
    );
}
