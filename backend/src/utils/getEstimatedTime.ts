export function getEstimatedTime(deliveryTime: Date): string {
  if (!deliveryTime) return '';
  const d = deliveryTime instanceof Date ? deliveryTime : new Date(deliveryTime);
  if (isNaN(d.getTime())) return '';

  const totalMinutes = Math.floor(d.getTime() / (1000 * 60));

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  let parts = [];
  if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} mins`);

  return parts.join(' ');
}
