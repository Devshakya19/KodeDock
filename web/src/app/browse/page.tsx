import { BrowsePage } from "@/features/browse";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  return <BrowsePage searchParams={params} />;
}
