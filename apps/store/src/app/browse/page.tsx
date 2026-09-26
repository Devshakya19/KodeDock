import { redirect } from "next/navigation";

export default async function BrowseRedirect({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const query = new URLSearchParams(resolved).toString();
  redirect(query ? `/?${query}` : "/");
}
