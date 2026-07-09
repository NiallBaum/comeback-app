// The generated briefing page: "Changed Since You Left" + build picker
// (spec section 3, steps 5-6).
export default async function BriefingPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  return <main>Briefing for {game}</main>;
}
