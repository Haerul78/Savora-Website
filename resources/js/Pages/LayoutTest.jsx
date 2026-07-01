import AppLayout from '@/Layouts/AppLayout';

export default function LayoutTest() {
    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-on-surface">Layout Preview</h1>
                <p className="text-on-surface-variant">Ini adalah konten halaman. Sidebar dan navbar sudah muncul.</p>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant h-32 flex items-center justify-center">
                            <span className="text-on-surface-variant text-sm">Card {i}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
