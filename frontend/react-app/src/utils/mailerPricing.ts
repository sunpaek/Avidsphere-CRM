export const MAILER_PRICES = {
  '3x4': 250,
  '3x8': 425,
  '3x12': 600,
} as const

export const DESIGN_REQUIRED_FEE = 125
export const DESIGN_CHANGE_FEE = 75

export type MailerSizeOption = keyof typeof MAILER_PRICES

export interface MailerPricingInput {
  mailerSize: MailerSizeOption
  designRequired?: boolean
  designChangeRequired?: boolean
}

export interface MailerPricingResult {
  mailerSize: MailerSizeOption
  basePrice: number
  designRequiredFee: number
  designChangeFee: number
  total: number
}

/**
 * Get the base price for a mailer size.
 *
 * @param mailerSize - one of the supported mailer sizes
 */
export function getMailerBasePrice(mailerSize: MailerSizeOption): number {
  return MAILER_PRICES[mailerSize]
}

/**
 * Calculate the total for a mailer order using pricing constants.
 *
 * The function returns detailed pricing breakdown for easy reconciliation.
 */
export function calculateMailerTotal(
  input: MailerPricingInput,
): MailerPricingResult {
  const basePrice = getMailerBasePrice(input.mailerSize)
  const designRequiredFee = input.designRequired ? DESIGN_REQUIRED_FEE : 0
  const designChangeFee = input.designChangeRequired ? DESIGN_CHANGE_FEE : 0

  return {
    mailerSize: input.mailerSize,
    basePrice,
    designRequiredFee,
    designChangeFee,
    total: basePrice + designRequiredFee + designChangeFee,
  }
}

/**
 * Example usage:
 *
 * const result = calculateMailerTotal({
 *   mailerSize: '3x8',
 *   designRequired: true,
 *   designChangeRequired: false,
 * })
 *
 * console.log(result.total) // 550
 */
