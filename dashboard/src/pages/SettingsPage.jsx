import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui';
import { ThemeSelector } from '../components/ThemeSelector';
import { Palette } from 'lucide-react';

export function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-0.5">
                <h2 className="text-2xl font-black text-[#222026] tracking-tight m-0">Settings</h2>
                <p className="text-sm text-slate-500 font-semibold m-0">Manage your preferences</p>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[#A7E46A]" aria-hidden="true" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeSelector />
                </CardContent>
            </Card>
        </div>
    );
}
