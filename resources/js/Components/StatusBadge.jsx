
export default function StatusBadge({ status }) {
    const getBadgeStyle = (statusVal) => {
        const cleanedStatus = statusVal?.toLowerCase();

        switch (cleanedStatus) {
            case 'success':
            case 'paid':
            case 'settlement':
            case 'capture':
                return {
                    label: 'Berhasil',
                    classes: 'bg-secondary-container text-primary'
                };
            case 'pending':
                return {
                    label: 'Pending',
                    classes: 'bg-yellow-100 text-yellow-700'
                };
            case 'failed':
            case 'expire':
            case 'expired':
            case 'deny':
                return {
                    label: 'Gagal',
                    classes: 'bg-tertiary-container text-white'
                };
            case 'cancelled':
            case 'cancel':
                return {
                    label: 'Dibatalkan',
                    classes: 'bg-surface-high text-on-surface-variant'
                };
            default:
                return {
                    label: statusVal || 'Unknown',
                    classes: 'bg-surface-high text-on-surface-variant'
                };
        }
    };

    const badge = getBadgeStyle(status);

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge.classes}`}>
            {badge.label}
        </span>
    );
}
