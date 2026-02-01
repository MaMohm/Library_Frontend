import React, { forwardRef } from 'react';
import styles from './Input.module.scss';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, className, ...props }, ref) => {
        return (
            <div className={styles.container}>
                {label && <label className={styles.label}>{label}</label>}
                <div className={styles.inputWrapper}>
                    {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}
                    <input
                        ref={ref}
                        className={clsx(
                            styles.input,
                            {
                                [styles.error]: !!error,
                                [styles.hasLeftIcon]: !!leftIcon
                            },
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
