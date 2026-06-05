import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Buat Akun Demo Baru" description="Silakan isi detail data diri Anda di bawah ini untuk mencoba demo platform.">
            <Head title="Pendaftaran Akun Baru" />
            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    {/* Name field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="name" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Nama Lengkap</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Contoh: Budi Santoso"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="budi@company.com"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Kata Sandi</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Password confirmation field */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password_confirmation" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Konfirmasi Kata Sandi</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl h-10.5 font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2" 
                        tabIndex={5} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        <span>Daftar Akun</span>
                    </Button>
                </div>

                {/* Redirect link */}
                <div className="text-center text-xs font-semibold text-neutral-450 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                    Sudah memiliki akun?{' '}
                    <TextLink href={route('login')} className="text-blue-600 hover:text-blue-700 dark:text-blue-450 font-bold" tabIndex={6}>
                        Masuk
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
