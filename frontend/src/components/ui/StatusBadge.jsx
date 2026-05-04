const STATUS_MAP = {
  // Reservations
  pending:   { label: 'En attente',  className: 'badge-warning' },
  confirmed: { label: 'Confirmée',   className: 'badge-success' },
  completed: { label: 'Terminée',    className: 'badge-olive' },
  cancelled: { label: 'Annulée',     className: 'badge-danger' },
  // Orders
  paid:      { label: 'Payée',       className: 'badge-success' },
  shipped:   { label: 'Expédiée',    className: 'badge-olive' },
  delivered: { label: 'Livrée',      className: 'badge-success' },
  // Deposit
  refunded:  { label: 'Remboursée',  className: 'badge-warning' },
  // Reviews
  approved:  { label: 'Approuvé',    className: 'badge-success' },
  rejected:  { label: 'Rejeté',      className: 'badge-danger' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, className: 'badge-cream' };
  return <span className={config.className}>{config.label}</span>;
}
