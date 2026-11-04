import { LoaderCircle } from "lucide-react";

export default function LoadingState({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="dreamers-loading" role="status">
      <LoaderCircle aria-hidden size={19} />
      {children}
    </p>
  );
}
