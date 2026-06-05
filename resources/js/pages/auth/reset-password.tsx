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
                        <Label htmlFor="email" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            readOnly
                            className="rounded-xl h-10 bg-neutral-100 dark:bg-neutral-900 focus-visible:ring-neutral-200 cursor-not-allowed border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Kata Sandi Baru</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Password confirmation field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Konfirmasi Kata Sandi Baru</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl h-10.5 font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2" 
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
