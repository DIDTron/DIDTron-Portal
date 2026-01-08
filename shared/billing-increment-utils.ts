export const VALID_BILLING_INCREMENTS = [
  "1/1",
  "6/6",
  "30/30",
  "60/60",
  "30/6",
  "60/6",
  "60/1",
] as const;

export type BillingIncrement = typeof VALID_BILLING_INCREMENTS[number];

export interface NormalizationResult {
  normalizedValue: BillingIncrement | null;
  error: string | null;
}

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  normalizedData: Array<Record<string, unknown>>;
}

export function normalizeBillingIncrement(value: string | null | undefined): NormalizationResult {
  if (value === null || value === undefined || value === "") {
    return { normalizedValue: "60/60", error: null };
  }

  const trimmed = value.toString().trim().toLowerCase();
  
  if (trimmed === "") {
    return { normalizedValue: "60/60", error: null };
  }

  let normalized = trimmed
    .replace(/[-:]/g, "/")
    .replace(/\s+/g, "");

  const singleNumberMatch = normalized.match(/^(\d+)$/);
  if (singleNumberMatch) {
    const num = singleNumberMatch[1];
    normalized = `${num}/${num}`;
  }

  const fractionMatch = normalized.match(/^(\d+)\/(\d+)$/);
  if (!fractionMatch) {
    return {
      normalizedValue: null,
      error: `Invalid format "${value}". Expected format like "60/60", "60/1", "30/6", etc.`,
    };
  }

  const [, first, second] = fractionMatch;
  const candidate = `${first}/${second}`;

  if (VALID_BILLING_INCREMENTS.includes(candidate as BillingIncrement)) {
    return { normalizedValue: candidate as BillingIncrement, error: null };
  }

  return {
    normalizedValue: null,
    error: `Invalid billing increment "${value}". Valid values: ${VALID_BILLING_INCREMENTS.join(", ")}`,
  };
}

export function validateAndNormalizeAZData(
  data: Array<Record<string, unknown>>
): ValidationResult {
  const errors: ValidationError[] = [];
  const normalizedData: Array<Record<string, unknown>> = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2;
    const normalizedRow = { ...row };

    const billingValue = row.billingIncrement as string | undefined;
    const result = normalizeBillingIncrement(billingValue);

    if (result.error) {
      errors.push({
        row: rowNumber,
        column: "billingIncrement",
        value: billingValue || "",
        message: result.error,
      });
    } else {
      normalizedRow.billingIncrement = result.normalizedValue;
    }

    if (!row.code || (typeof row.code === "string" && row.code.trim() === "")) {
      errors.push({
        row: rowNumber,
        column: "code",
        value: "",
        message: "Code is required",
      });
    }

    if (!row.destination || (typeof row.destination === "string" && row.destination.trim() === "")) {
      errors.push({
        row: rowNumber,
        column: "destination",
        value: "",
        message: "Destination is required",
      });
    }

    normalizedData.push(normalizedRow);
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedData,
  };
}

export function formatValidationErrors(errors: ValidationError[], maxErrors = 10): string {
  if (errors.length === 0) return "";

  const displayErrors = errors.slice(0, maxErrors);
  const lines = displayErrors.map(
    (e) => `Row ${e.row}: ${e.column} - ${e.message}`
  );

  if (errors.length > maxErrors) {
    lines.push(`...and ${errors.length - maxErrors} more errors`);
  }

  return lines.join("\n");
}
