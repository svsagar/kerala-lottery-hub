import { TICKET_NUMBER_LENGTH, LAST_FOUR_DIGITS_LENGTH } from '@kerala-lottery/shared';
import { RawDrawData, RawPrizeTier, IngestionError, IngestionWarning } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: IngestionError[];
  warnings: IngestionWarning[];
}

export const validateDraw = (draw: RawDrawData): ValidationResult => {
  const errors: IngestionError[] = [];
  const warnings: IngestionWarning[] = [];

  // Validate draw number
  if (!draw.drawNumber || draw.drawNumber.trim() === '') {
    errors.push({
      code: 'MISSING_DRAW_NUMBER',
      message: 'Draw number is required',
      severity: 'critical',
    });
  }

  // Validate draw date
  if (!draw.drawDate || isNaN(draw.drawDate.getTime())) {
    errors.push({
      code: 'INVALID_DRAW_DATE',
      message: 'Draw date is missing or invalid',
      severity: 'critical',
    });
  }

  // Validate prize tiers
  if (!draw.prizeTiers || draw.prizeTiers.length === 0) {
    errors.push({
      code: 'MISSING_PRIZE_TIERS',
      message: 'At least one prize tier is required',
      severity: 'critical',
    });
  } else {
    draw.prizeTiers.forEach((tier, index) => {
      const tierErrors = validatePrizeTier(tier);
      errors.push(...tierErrors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validatePrizeTier = (tier: RawPrizeTier): IngestionError[] => {
  const errors: IngestionError[] = [];

  if (!tier.tierName || tier.tierName.trim() === '') {
    errors.push({
      code: 'MISSING_TIER_NAME',
      message: 'Tier name is required',
      severity: 'medium',
    });
  }

  if (!tier.ticketNumbers || tier.ticketNumbers.length === 0) {
    errors.push({
      code: 'MISSING_TICKET_NUMBERS',
      message: `No ticket numbers for tier ${tier.tierName}`,
      severity: 'high',
    });
  } else {
    tier.ticketNumbers.forEach((ticket) => {
      if (!validateTicketNumber(ticket)) {
        errors.push({
          code: 'INVALID_TICKET_FORMAT',
          message: `Invalid ticket number format: ${ticket}`,
          severity: 'high',
        });
      }
    });
  }

  return errors;
};

export const validateTicketNumber = (ticket: string): boolean => {
  // Ticket should be 6 digits
  if (!ticket || ticket.trim().length !== TICKET_NUMBER_LENGTH) {
    return false;
  }

  // All characters should be digits
  return /^\d{6}$/.test(ticket.trim());
};

export const extractLastFourDigits = (ticket: string): string => {
  const cleaned = ticket.trim();
  if (cleaned.length < LAST_FOUR_DIGITS_LENGTH) {
    return cleaned.padStart(LAST_FOUR_DIGITS_LENGTH, '0');
  }
  return cleaned.slice(-LAST_FOUR_DIGITS_LENGTH);
};

export const detectDuplicates = (draws: RawDrawData[]): string[] => {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  draws.forEach((draw) => {
    const key = `${draw.lotteryCode}-${draw.drawNumber}`;
    if (seen.has(key)) {
      duplicates.push(key);
    }
    seen.add(key);
  });

  return duplicates;
};
