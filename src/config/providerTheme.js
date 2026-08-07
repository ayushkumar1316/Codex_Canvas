import { getProviderTheme as _getProviderTheme, getProviderIds } from "@/ai/providerRegistry";

export const PROVIDER_LIST = getProviderIds();

export function getProviderTheme(id) {
  return _getProviderTheme(id);
}

export function getProviderColor(id) {
  const theme = _getProviderTheme(id);
  return theme.color || "#6B7280";
}

export function getProviderIcon(id) {
  const theme = _getProviderTheme(id);
  return theme.icon || "auto";
}
