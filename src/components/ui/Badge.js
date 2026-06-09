const variants = {
  gold: 'bg-gold/10 text-gold border border-gold/30',
  accent: 'bg-accent/20 text-accent-light border border-accent/30',
  green: 'bg-green-900/30 text-green-400 border border-green-700/30',
  yellow: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30',
  blue: 'bg-blue-900/30 text-blue-400 border border-blue-700/30',
  purple: 'bg-purple-900/30 text-purple-400 border border-purple-700/30',
  orange: 'bg-orange-900/30 text-orange-400 border border-orange-700/30',
  red: 'bg-red-900/30 text-red-400 border border-red-700/30',
  muted: 'bg-muted/20 text-muted border border-muted/20',
};

export function Badge({ children, variant = 'gold', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
