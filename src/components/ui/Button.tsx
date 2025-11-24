// src/components/ui/Button.tsx
import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary';
  children: React.ReactNode;
}

const Button = ({ variant = 'primary', children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={classNames('btn', {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-outline-primary': variant === 'outline-primary',
        'btn-outline-secondary': variant === 'outline-secondary',
      }, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
