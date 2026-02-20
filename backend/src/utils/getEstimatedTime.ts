export function getEstimatedTime(deliveryTime: Date): string {
  if (!deliveryTime) return '';
  const now = new Date();

  const diffMs = deliveryTime.getTime() - now.getTime();

  if (diffMs <= 0) return '';

  const totalMinutes = Math.floor(diffMs / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;

  return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} mins`;
}
