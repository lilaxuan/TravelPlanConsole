// Derive a friendly display name from an email. We only collect email at
// sign-up, so this is the best we have until a `name` attribute is added.
//   "lijx.10089@gmail.com" → "Lijx"
//   "ada-lovelace@x.com"   → "Ada"
//   "bob"                  → "Bob"
export function displayNameFor(email: string | undefined | null): string {
  if (!email) return 'traveler';
  const local = email.split('@')[0] ?? '';
  const first = local.split(/[.\-_]/)[0] ?? local;
  if (!first) return 'traveler';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
