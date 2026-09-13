import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"; export const toast = sonnerToast; export function Toaster() { return <SonnerToaster position="bottom-right" />; }
