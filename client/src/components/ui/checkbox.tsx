import { forwardRef, type InputHTMLAttributes } from "react";

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Checkbox(props, ref) {
  return <input ref={ref} type="checkbox" {...props} className={`size-4 rounded border-input accent-primary ${props.className ?? ""}`} />;
});
