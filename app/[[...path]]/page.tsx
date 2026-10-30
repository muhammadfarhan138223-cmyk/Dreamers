import { notFound } from "next/navigation";
import DreamersApp from "@/components/dreamers-app";
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  if (path?.[0] === "api") notFound();
  return <DreamersApp />;
}
