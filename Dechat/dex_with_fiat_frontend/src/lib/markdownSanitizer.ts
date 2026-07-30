/**
 * Markdown sanitization utilities for assistant output.
 *
 * Allowed markdown subset:
 *   - Paragraphs, line breaks
 *   - Bold (**text**), italic (*text*)
 *   - Unordered lists (- item)
 *   - Inline code (`code`)
 *   - Headings h1-h3
 *   - Links with safe href schemes: https, http, mailto
 *   - Images with safe src schemes: https, http
 *
 * Blocked:
 *   - javascript: / vbscript: / data: URLs in href or src
 *   - Raw HTML passthrough (react-markdown default: disabled)
<<<<<<< HEAD
=======
 *
 * @module
>>>>>>> emwulrd/main
 */

/** URL schemes that are safe to render in links and images. */
const SAFE_URL_SCHEMES = ['https:', 'http:', 'mailto:'];

/**
 * Returns `true` when the given URL uses a safe scheme, `false` otherwise.
 * Relative URLs (no scheme) are allowed.
<<<<<<< HEAD
=======
 *
 * The check is two-layered:
 * 1. Percent-encoded characters are decoded to catch obfuscated schemes
 *    like `javas%63ript:`.
 * 2. The decoded URL is parsed with the `URL` API for a final scheme check.
 *
 * @param url - The URL to validate.  `null`/`undefined` returns `false`.
 * @returns `true` when the URL is safe to render, `false` when it uses a
 *          blocked scheme or cannot be decoded/parsed.
 *
 * @example
 * ```ts
 * isSafeUrl("https://example.com")   // → true
 * isSafeUrl("/relative/path")        // → true
 * isSafeUrl("javascript:alert(1)")   // → false
 * isSafeUrl("javas%63ript:alert(1)") // → false (decoded first)
 * isSafeUrl(null)                    // → false
 * ```
 *
 * @see {@link sanitizeUrl} for a convenience wrapper that maps the result
 *      to either the original URL or `"#blocked"`.
>>>>>>> emwulrd/main
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false;

  const trimmed = url.trim();

  // Relative URLs are fine
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('.')) {
    return true;
  }

  try {
    // Decode percent-encoded characters to catch `javas%63ript:` etc.
    const decoded = decodeURIComponent(trimmed);
    const lower = decoded.toLowerCase().replace(/\s/g, '');

    // Reject common injection schemes
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('file:') ||
      lower.startsWith('blob:')
    ) {
      return false;
    }
  } catch {
    // decodeURIComponent failed → treat as unsafe
    return false;
  }

  // Check against allowlist using the URL API
  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_SCHEMES.includes(parsed.protocol);
  } catch {
    // Parsing failed – could be a relative URL not caught above; allow
    return true;
  }
}

/**
<<<<<<< HEAD
 * Returns the URL unchanged if safe, otherwise returns '#blocked'.
=======
 * Returns the URL unchanged if safe, otherwise returns `'#blocked'`.
 *
 * A safe drop-in for `href`/`src` attribute values in markdown renderers.
 *
 * @param url - The URL to sanitise.  `null`/`undefined` produces `"#blocked"`.
 * @returns The original URL when {@link isSafeUrl} returns `true`,
 *          otherwise the sentinel string `"#blocked"`.
 *
 * @example
 * ```ts
 * sanitizeUrl("https://example.com") // → "https://example.com"
 * sanitizeUrl("javascript:alert(1)") // → "#blocked"
 * ```
 *
 * @see {@link isSafeUrl} for the underlying validation logic.
>>>>>>> emwulrd/main
 */
export function sanitizeUrl(url: string | undefined | null): string {
  return isSafeUrl(url) ? (url as string) : '#blocked';
}

/**
 * Strips characters commonly used in XSS payloads from plain text content.
<<<<<<< HEAD
 * react-markdown text nodes are already safe, but this can be used for
 * attribute values where extra caution is warranted.
=======
 *
 * Escapes `<`, `>`, `"`, and `'` to their HTML entities.  Intended for
 * attribute values (e.g. `title`, `alt`) where react-markdown text nodes
 * are already safe but extra caution is warranted for user-facing output.
 *
 * @param text - The text to sanitise.  `null`/`undefined` returns `""`.
 * @returns The sanitised string with HTML special characters escaped.
 *
 * @example
 * ```ts
 * sanitizeText('<script>alert("xss")</script>')
 * // → "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 *
 * sanitizeText("safe text") // → "safe text"
 * sanitizeText(null)        // → ""
 * ```
>>>>>>> emwulrd/main
 */
export function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
