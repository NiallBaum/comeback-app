interface ChangedSinceYouLeftProps {
  summary: string;
}

// Displays the synthesized "what's changed" briefing as a readable page,
// not a raw changelog dump (spec section 3, step 6).
export function ChangedSinceYouLeft({ summary }: ChangedSinceYouLeftProps) {
  return <section>{summary}</section>;
}
