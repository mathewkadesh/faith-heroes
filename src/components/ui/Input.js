export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-muted font-medium">{label}</label>}
      <input
        className={`w-full bg-bg border border-gold/20 text-cream rounded-lg px-4 py-2.5 text-sm
          placeholder:text-muted/50 focus:outline-none focus:border-gold/60 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-accent-light">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-muted font-medium">{label}</label>}
      <textarea
        className={`w-full bg-bg border border-gold/20 text-cream rounded-lg px-4 py-2.5 text-sm
          placeholder:text-muted/50 focus:outline-none focus:border-gold/60 transition-colors resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-accent-light">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-muted font-medium">{label}</label>}
      <select
        className={`w-full bg-bg border border-gold/20 text-cream rounded-lg px-4 py-2.5 text-sm
          focus:outline-none focus:border-gold/60 transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-accent-light">{error}</p>}
    </div>
  );
}
