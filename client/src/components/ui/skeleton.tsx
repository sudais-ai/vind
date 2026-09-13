import type { HTMLAttributes } from "react";
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />; }
