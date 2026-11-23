const STATUS = {
  PENDING: { label: 'Awaiting payment', cls: 'bg-warning-soft text-warning' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-success-soft text-success' },
  SHIPPED: { label: 'Shipped', cls: 'bg-accent-soft text-accent' },
  DELIVERED: { label: 'Delivered', cls: 'bg-surface-2 text-ink' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-danger-soft text-danger' },
}

export default function StatusBadge({ status, className = '' }) {
  const s = STATUS[status] || { label: status, cls: 'bg-surface text-ink-2' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {s.label}
    </span>
  )
}
