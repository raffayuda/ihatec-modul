import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
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
}

export default function Login({ status }: LoginProps) {
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
                        <Label htmlFor="email" className="text-xs font-bold text-neutral-400 ml-3">Alamat Email</Label>
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
                            className="rounded-full h-11 bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 px-5 text-sm"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password field */}
                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-bold text-neutral-400 ml-3">Kata Sandi</Label>
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
                            className="rounded-full h-11 bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 px-5 text-sm"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember me checkbox */}
                    <div className="flex items-center space-x-2.5 ml-3">
                        <Checkbox 
                            id="remember" 
                            name="remember" 
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            tabIndex={3} 
                            className="rounded border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-black/40"
                        />
                        <Label htmlFor="remember" className="text-xs font-semibold text-neutral-400 select-none cursor-pointer">Ingat saya di perangkat ini</Label>
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full h-11.5 font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        <span>Masuk Sekarang</span>
                    </Button>
                </div>

            </form>

            {status && <div className="mt-4 text-center text-xs font-bold text-green-600 dark:text-green-400">{status}</div>}
        </AuthLayout>
    );
}
