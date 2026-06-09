import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Atur Ulang Kata Sandi" description="Masukkan kata sandi baru Anda di bawah ini untuk memperbarui akun.">
            <Head title="Atur Ulang Kata Sandi" />

            <form onSubmit={submit}>
                <div className="grid gap-5">
                    {/* Email field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-bold text-neutral-400 ml-3">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            readOnly
                            className="rounded-full h-11 bg-black/20 border border-white/10 text-neutral-400 cursor-not-allowed px-5 text-sm"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password" className="text-xs font-bold text-neutral-400 ml-3">Kata Sandi Baru</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="rounded-full h-11 bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 px-5 text-sm"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Password confirmation field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-bold text-neutral-400 ml-3">Konfirmasi Kata Sandi Baru</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className="rounded-full h-11 bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 px-5 text-sm"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full h-11.5 font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2" 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        <span>Atur Ulang Kata Sandi</span>
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
