export type ShortCodePrefix = 'C' | 'I' | 'S' | 'P' | 'R';

export interface ShortCodeConfig {
  prefix: ShortCodePrefix;
  tableName: string;
}

export const SHORT_CODE_CONFIGS: Record<string, ShortCodeConfig> = {
  carriers: { prefix: 'C', tableName: 'carriers' },
  carrierInterconnects: { prefix: 'I', tableName: 'carrier_interconnects' },
  carrierServices: { prefix: 'S', tableName: 'carrier_services' },
  customerRatingPlans: { prefix: 'P', tableName: 'customer_rating_plans' },
  routingPlans: { prefix: 'R', tableName: 'routing_plans' },
};

export function generateShortCode(prefix: ShortCodePrefix, sequence: number): string {
  return `${prefix}${sequence}`;
}

export function parseShortCode(shortCode: string): { prefix: ShortCodePrefix; sequence: number } | null {
  const match = shortCode.match(/^([CISPR])(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1] as ShortCodePrefix,
    sequence: parseInt(match[2], 10),
  };
}

export function isValidShortCode(shortCode: string): boolean {
  return /^[CISPR]\d+$/.test(shortCode);
}

export function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function resolveIdentifier(identifier: string): { type: 'uuid' | 'shortCode' | 'code'; value: string } {
  if (isUUID(identifier)) {
    return { type: 'uuid', value: identifier };
  }
  if (isValidShortCode(identifier)) {
    return { type: 'shortCode', value: identifier };
  }
  return { type: 'code', value: identifier };
}
