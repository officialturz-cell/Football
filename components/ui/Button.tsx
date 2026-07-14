import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const base = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2'
  const variants: Record<string, string> = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    ghost: 'bg-transparent text-gray-100 border border-gray-700 hover:bg-white/2',
    danger: 'bg-red-600 text-white hover:bg-red-500'
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
