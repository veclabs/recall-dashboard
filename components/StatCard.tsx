interface Props { label: string; value: string | number; sub?: string; }

export default function StatCard({ label, value, sub }: Props) {
  return (
    <div style={{
      border: '1px solid #e5e5e5', borderRadius: 6, padding: '20px 24px',
      background: '#fff', minWidth: 180,
    }}>
      <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 600, color: '#111', margin: 0 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}
