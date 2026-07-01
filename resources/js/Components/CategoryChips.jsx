export default function CategoryChips({ categories = [], active = null, onChange }) {
    const all = [{ label: 'Semua', value: null }, ...categories.map(c => ({ label: c, value: c }))];

    return (
        <div className="flex gap-2 flex-wrap">
            {all.map(chip => (
                <button
                    key={chip.label}
                    onClick={() => onChange(chip.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                        active === chip.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface-low text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
                    }`}
                >
                    {chip.label}
                </button>
            ))}
        </div>
    );
}
