// Amounts arrive as decimal strings; format them the way the ERP grids do.
export const formatMoney = (value?: string | number | null) =>
  value === undefined || value === null || value === ""
    ? "0.00"
    : Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

export const formatQuantity = (value?: string | number | null) =>
  value === undefined || value === null || value === ""
    ? "0.000"
    : Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });

// Mirrors the server: quantity carries three decimals, money two.
export const lineAmount = (quantity?: string, price?: string) =>
  Math.round(Number(quantity || 0) * Number(price || 0) * 100) / 100;

export const today = () => new Date().toISOString().slice(0, 10);

// Drops blank values so they are not sent as empty filters; arrays become CSV.
export const toQueryString = (filters: Record<string, unknown> = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
      return;
    }
    if (typeof value === "boolean") {
      if (value) params.set(key, "true");
      return;
    }
    params.set(key, String(value));
  });
  return params.toString();
};
