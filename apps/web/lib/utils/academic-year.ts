export function getDefaultAcademicYear(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}
