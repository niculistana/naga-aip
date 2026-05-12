export const ImplementationStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  COMPLETE: "COMPLETE",
  UNKNOWN: "UNKNOWN",
} as const;

export type ImplementationStatus =
  (typeof ImplementationStatus)[keyof typeof ImplementationStatus];

export function getImplementationStatus(
  start?: string,
  end?: string,
): ImplementationStatus {
  const now = new Date();

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) {
      return ImplementationStatus.PENDING;
    }

    if (now >= startDate && now <= endDate) {
      return ImplementationStatus.ACTIVE;
    }

    return ImplementationStatus.COMPLETE;
  }

  return ImplementationStatus.UNKNOWN;
}
