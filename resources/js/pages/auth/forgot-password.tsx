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
                        <Label htmlFor="email" className="text-xs font-bold text-neutral-400 ml-3">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@company.com"
                            className="rounded-full h-11 bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 px-5 text-sm"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="my-5 flex items-center justify-start">
                        <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full h-11.5 font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2" 
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            <span>Kirim Tautan Pemulihan</span>
                        </Button>
                    </div>
                </form>

                {/* Redirect back to Login */}
                <div className="text-center text-xs font-semibold text-neutral-400 pt-3 border-t border-white/5">
                    <span>Atau kembali ke halaman </span>
                    <TextLink href={route('login')} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">Masuk</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
