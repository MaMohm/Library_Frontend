import React from 'react';
import styles from './Card.module.scss';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    className,
    ...props
}) => {
    return (
        <div
            className={clsx(styles.card, styles[variant], className)}
            {...props}
        >
            {children}
        </div>
    );
};
