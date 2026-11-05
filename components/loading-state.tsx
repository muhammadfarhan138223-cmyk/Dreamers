import { LoaderCircle } from "lucide-react";

export default function LoadingState({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dreamers-loading" role="status" aria-live="polite">
      <LoaderCircle aria-hidden size={19} />
      <span>{children}</span>
      <span className="loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
