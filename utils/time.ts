export function formatTime12h(time: string): { hm: string; period: string } {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { hm: `${h12}:${mStr}`, period };
}

export function formatTodayLabel(date = new Date()): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  return `${weekday.toUpperCase()}, ${month.toUpperCase()} ${day}`;
}
