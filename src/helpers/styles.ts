export function getSelectErrorStyles(error: boolean) {
  if (error) {
    return { borderColor: "red", borderWidth: "2px" };
  }

  return {};
}
