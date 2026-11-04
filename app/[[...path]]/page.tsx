import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DreamersApp from "@/components/dreamers-app";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  return path?.length
    ? { robots: { index: false, follow: true } }
    : { alternates: { canonical: "/" } };
}
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  if (path?.[0] === "api") notFound();
  return <DreamersApp />;
}
