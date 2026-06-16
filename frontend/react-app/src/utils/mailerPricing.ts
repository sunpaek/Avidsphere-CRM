export const MAILER_PRICES = {
  '3x4': 340,
  '3x8': 655,
  '3x12': 995,
  '4x6': 655,
  '4x9': 995,
} as const

export const DESIGN_REQUIRED_FEE = 30
export const DESIGN_CHANGE_FEE = 15

export type MailerSizeOption = keyof typeof MAILER_PRICES

export interface MailerPricingInput {
  mailerSize: MailerSizeOption
  designRequired?: boolean
  designChangeRequired?: boolean
  discountType?: 'None' | 'Dollar Amount' | 'Percentage'
  discountValue?: number
}

export interface MailerPricingResult {
  mailerSize: MailerSizeOption
  basePrice: number
  discountType: 'None' | 'Dollar Amount' | 'Percentage'
  discountValue: number
  discountAmount: number
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
  const discountType = input.discountType || 'None'
  const discountValue = Number(input.discountValue || 0)
  let discountAmount = 0

  if (discountType === 'Dollar Amount') {
    discountAmount = Math.min(Math.max(discountValue, 0), basePrice)
  } else if (discountType === 'Percentage') {
    discountAmount = Math.min(Math.max(basePrice * (discountValue / 100), 0), basePrice)
  }

  const designRequiredFee = input.designRequired ? DESIGN_REQUIRED_FEE : 0
  const designChangeFee = input.designChangeRequired ? DESIGN_CHANGE_FEE : 0

  return {
    mailerSize: input.mailerSize,
    basePrice,
    discountType,
    discountValue,
    discountAmount,
    designRequiredFee,
    designChangeFee,
    total: basePrice - discountAmount + designRequiredFee + designChangeFee,
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
