import type { HTMLAttributes } from "react";
export function Separator({ orientation = "horizontal", className, ...props }: HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) { return <div {...props} className={`${orientation === "vertical" ? "h-full w-px" : "h-px w-full"} bg-border ${className ?? ""}`} />; }
