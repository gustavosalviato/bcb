export function getMonthlyPeriod(now: Date) {
  const offset = 3 * 60 * 60 * 1000;
  const brasilia = new Date(now.getTime() - offset);

  const year = brasilia.getUTCFullYear();
  const month = brasilia.getUTCMonth();

  return {
    start: new Date(Date.UTC(year, month, 1, 3)),
    end: new Date(Date.UTC(year, month + 1, 1, 3)),
  };
}