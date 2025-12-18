import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props 
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white hover:shadow-lg hover:shadow-violet-600/25',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white hover:shadow-lg hover:shadow-rose-600/25',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
    outline: 'border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-violet-400',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
