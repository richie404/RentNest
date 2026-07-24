export function parseParamString(param: string | string[] | undefined): string {
  if (!param) return "";
  return Array.isArray(param) ? param[0] : param;
}

export function parseParamInt(param: string | string[] | undefined, radix: number = 10): number {
  const str = parseParamString(param);
  return parseInt(str, radix);
}
