export function generateReadableId(): string {
  return (
    "T" +
    Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, "0")
  );
}
