import { forwardRef, type InputHTMLAttributes } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`min-h-[2.5rem] rounded-xl border border-blue-700/80 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-blue-500 ${className}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export { Input };
