/**
 * `getValueFromEvent` para `Form.Item` + antd `ColorPicker`.
 * Devuelve un string hex; no usa el formato legado `r;g;b`.
 */
export const valorColorHex = (value: unknown): string | undefined => {
  if (value == null || value === "") return undefined;
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : undefined;
  }
  if (typeof value === "object" && value !== null && "toHexString" in value) {
    const hex = (value as { toHexString: () => string }).toHexString();
    return hex || undefined;
  }
  return undefined;
};
