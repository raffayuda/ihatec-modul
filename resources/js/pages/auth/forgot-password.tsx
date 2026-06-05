import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout title="Lupa Kata Sandi" description="Masukkan alamat email terdaftar Anda untuk menerima tautan pemulihan kata sandi.">
            <Head title="Pemulihan Kata Sandi" />

            {status && <div className="mb-4 text-center text-xs font-bold text-green-600 dark:text-green-400">{status}</div>}

            <div className="space-y-5">
                <form onSubmit={submit}>
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-bold text-neutral-500 dark:text-neutral-405">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@company.com"
                            className="rounded-xl h-10 focus-visible:ring-blue-500/20 border-neutral-200 dark:border-neutral-800"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="my-5 flex items-center justify-start">
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl h-10.5 font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2" 
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            <span>Kirim Tautan Pemulihan</span>
                        </Button>
                    </div>
                </form>

                {/* Redirect back to Login */}
                <div className="text-center text-xs font-semibold text-neutral-450 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                    <span>Atau kembali ke halaman </span>
                    <TextLink href={route('login')} className="text-blue-600 hover:text-blue-700 dark:text-blue-450 font-bold">Masuk</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
