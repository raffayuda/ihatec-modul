// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verifikasi Email Anda" description="Silakan verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan melalui email.">
            <Head title="Verifikasi Email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-xs font-bold text-green-600 dark:text-green-400">
                    Tautan verifikasi baru telah dikirim ke alamat email yang Anda berikan saat pendaftaran.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button 
                    type="submit"
                    disabled={processing} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full h-11.5 font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    <span>Kirim Ulang Email Verifikasi</span>
                </Button>

                <TextLink 
                    href={route('logout')} 
                    method="post" 
                    className="mx-auto block text-xs font-bold text-neutral-400 hover:text-blue-300 transition-colors"
                >
                    Keluar Akun
                </TextLink>
            </form>
        </AuthLayout>
    );
}
