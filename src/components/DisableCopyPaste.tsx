'use client';
import { useEffect } from "react";

export default function DisableCopyPaste() {
  useEffect(() => {
    const preventAction = (e: Event) => e.preventDefault();

    document.addEventListener('copy', preventAction);
    document.addEventListener('cut', preventAction);
    document.addEventListener('paste', preventAction);
    document.addEventListener('dragstart', preventAction);
    document.addEventListener('drop', preventAction);

    return () => {
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('cut', preventAction);
      document.removeEventListener('paste', preventAction);
      document.removeEventListener('dragstart', preventAction);
      document.removeEventListener('drop', preventAction);
    };
  }, []);

  return null;
}
