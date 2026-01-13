export const TEMPLATE_FIELD_CATEGORIES = {
  "Dest/Orig": [
    { value: "zone", label: "Zone" },
    { value: "zone_area", label: "Zone (Area)" },
    { value: "code", label: "Code" },
    { value: "code_area", label: "Code (Area)" },
    { value: "origin_set", label: "Origin Set" },
    { value: "origin_set_area", label: "Origin Set (Area)" },
    { value: "origin_code", label: "Origin Code" },
    { value: "location", label: "Location" },
  ],
  "Effective": [
    { value: "effective_date_time", label: "Effective Date/Time" },
    { value: "effective_time", label: "Effective Time" },
    { value: "end_date_time", label: "End Date/Time" },
    { value: "end_time_only", label: "End Time Only" },
    { value: "origin_code_effective_date", label: "Origin Code Effective Date" },
    { value: "origin_code_end_date", label: "Origin Code End Date" },
  ],
  "Rates": [
    { value: "recurring_charge", label: "Recurring Charge" },
    { value: "recurring_period", label: "Recurring Period" },
    { value: "initial_charge", label: "Initial Charge" },
    { value: "initial_period", label: "Initial Period" },
    { value: "connection_charge", label: "Connection Charge" },
  ],
  "Other": [
    { value: "time_class", label: "Time Class" },
    { value: "delete_status", label: "Delete Status" },
    { value: "blocked_status", label: "Blocked Status" },
    { value: "rate_matching", label: "Rate Matching" },
    { value: "missing_invalid", label: "Missing/Invalid" },
    { value: "omit_rates", label: "Omit Rates" },
  ],
} as const;

export const SHEET_TYPES = [
  { value: "rates1", label: "Rates 1" },
  { value: "rates2", label: "Rates 2" },
  { value: "codes", label: "Codes" },
  { value: "origin_codes", label: "Origin Codes" },
] as const;

export const TIME_CLASSES = [
  { value: "AnyDay", label: "Any Day" },
  { value: "Weekday", label: "Weekday" },
  { value: "Weekend", label: "Weekend" },
  { value: "Peak", label: "Peak" },
  { value: "OffPeak", label: "Off-Peak" },
] as const;

export const DECIMAL_SEPARATORS = [
  { value: ".", label: "Period (.)" },
  { value: ",", label: "Comma (,)" },
] as const;

export const CODE_SHEET_TARGETS = [
  { value: "Rates 1 Sheet", label: "Rates 1 Sheet" },
  { value: "Rates 2 Sheet", label: "Rates 2 Sheet" },
  { value: "Both Sheets", label: "Both Sheets" },
] as const;

export const COLUMN_LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM",
] as const;

export const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Central European Time" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
] as const;

export type TemplateFieldType = typeof TEMPLATE_FIELD_CATEGORIES[keyof typeof TEMPLATE_FIELD_CATEGORIES][number]["value"];
export type SheetType = typeof SHEET_TYPES[number]["value"];
