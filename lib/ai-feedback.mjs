/** Format public API feedback without exposing configuration or retrying requests. */
export function aiErrorMessage(
  data,
  fallback = "AI is unavailable right now.",
) {
  const message = typeof data?.error === "string" ? data.error : fallback;
  const reset =
    typeof data?.resetAt === "string" ? new Date(data.resetAt) : null;
  return data?.limitType === "daily" &&
    reset &&
    Number.isFinite(reset.getTime())
    ? `${message} Resets ${reset.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}.`
    : message;
}
