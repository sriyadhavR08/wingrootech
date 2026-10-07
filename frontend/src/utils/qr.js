/**
 * QR Code verification parser utility for Wingroo Technologies
 */
export function parseVerificationQR(text, origin = window.location.origin) {
  if (!text) throw new Error("No QR code content detected.");
  const trimmed = text.trim();

  // If already a token (32 to 64 chars URL-safe)
  if (/^[A-Za-z0-9_-]{32,64}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    // Matches /verify/<token> or #verify/<token> or #verify=<token>
    const pathMatch = url.pathname.match(/\/verify\/([A-Za-z0-9_-]{32,64})/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }

    const hashMatch = url.hash.match(/verify[\/=]([A-Za-z0-9_-]{32,64})/i);
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1];
    }

    const queryToken = url.searchParams.get('token');
    if (queryToken && /^[A-Za-z0-9_-]{32,64}$/.test(queryToken)) {
      return queryToken;
    }
  } catch {
    // If not a full URL, attempt regex extraction
    const match = trimmed.match(/verify[\/=]([A-Za-z0-9_-]{32,64})/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error("This QR code does not contain a valid Wingroo certificate verification token.");
}
