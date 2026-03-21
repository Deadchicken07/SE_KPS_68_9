"use client";

import React from "react";
import styles from "./Badge.module.css";

type BadgeProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

export default function Badge({ children, className = "", style }: BadgeProps) {
    return (
        <div className={`${styles.badge} ${className}`.trim()} style={style}>
            {children}
        </div>
    );
}
