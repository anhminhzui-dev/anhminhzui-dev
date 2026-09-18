/** Little's Law: steady-state average requests in the system, not hardware sizing. */
export function calculateConcurrency(rateText: string, timeText: string) {
  const rate = Number(rateText), milliseconds = Number(timeText);
  const rateValid = rateText.trim() !== '' && Number.isFinite(rate) && rate >= 0 && rate <= 100000;
  const timeValid = timeText.trim() !== '' && Number.isFinite(milliseconds) && milliseconds >= 0 && milliseconds <= 600000;
  if (!rateValid || !timeValid) return { ok: false as const, rateValid, timeValid,
    error: !rateValid ? 'Enter throughput from 0 to 100,000 requests per second.' : 'Enter response time from 0 to 600,000 milliseconds.' };
  return { ok: true as const, rate, seconds: milliseconds / 1000, average: rate * milliseconds / 1000 };
}
