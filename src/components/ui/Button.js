export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-body font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent hover:bg-accent-light text-cream',
    gold: 'bg-gold hover:bg-gold-light text-dark-text',
    ghost: 'border border-gold text-gold hover:bg-gold/10',
    'ghost-cream': 'border border-cream/30 text-cream hover:bg-cream/10',
    danger: 'bg-red-700 hover:bg-red-600 text-white',
    success: 'bg-green-700 hover:bg-green-600 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
