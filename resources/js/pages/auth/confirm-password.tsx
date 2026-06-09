// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Konfirmasi Kata Sandi"
            description="Ini adalah area aman aplikasi. Silakan konfirmasi kata sandi Anda sebelum melanjutkan."
        >
            <Head title="Konfirmasi Kata Sandi" />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-1.5">
                        <Label htmlFor="password" className="text-xs font-bold text-neutral-400 ml-3">Kata Sandi</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            className="rounded-full h-11 bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 px-5 text-sm"
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full h-11.5 font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2" 
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            <span>Konfirmasi Kata Sandi</span>
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
