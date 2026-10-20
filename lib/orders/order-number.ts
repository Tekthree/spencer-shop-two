export function formatOrderNumber(orderNumber: number | string | null | undefined, createdAt?: string) {
  if (orderNumber === null || orderNumber === undefined) return null;

  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `SG-${year}-${String(orderNumber).padStart(6, '0')}`;
}
