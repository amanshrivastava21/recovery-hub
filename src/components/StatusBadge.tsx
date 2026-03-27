const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    admitted: 'bg-info/10 text-info',
    'in-treatment': 'bg-warning/10 text-warning',
    recovering: 'bg-success/10 text-success',
    discharged: 'bg-muted text-muted-foreground',
    relapsed: 'bg-destructive/10 text-destructive',
    stable: 'bg-info/10 text-info',
    improving: 'bg-success/10 text-success',
    declining: 'bg-warning/10 text-warning',
    critical: 'bg-destructive/10 text-destructive',
    recovered: 'bg-success/10 text-success',
    present: 'bg-success/10 text-success',
    absent: 'bg-destructive/10 text-destructive',
    leave: 'bg-warning/10 text-warning',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] || 'bg-muted text-muted-foreground'}`}>
      {status.replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;
