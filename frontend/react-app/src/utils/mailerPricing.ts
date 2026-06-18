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
  runTime?: number
  designRequired?: boolean
  designChangeRequired?: boolean
  discountType?: 'None' | 'Dollar Amount' | 'Percentage'
  discountValue?: number
}

export interface MailerPricingResult {
  mailerSize: MailerSizeOption
  basePrice: number
  runTime: number
  subtotal: number
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
  const runTime = Math.max(Number(input.runTime || 0), 0)
  const subtotal = basePrice * runTime
  const discountType = input.discountType || 'None'
  const discountValue = Number(input.discountValue || 0)
  let discountAmount = 0

  if (discountType === 'Dollar Amount') {
    discountAmount = Math.min(Math.max(discountValue, 0), subtotal)
  } else if (discountType === 'Percentage') {
    discountAmount = Math.min(Math.max(subtotal * (discountValue / 100), 0), subtotal)
  }

  const designRequiredFee = input.designRequired ? DESIGN_REQUIRED_FEE : 0
  const designChangeFee = input.designChangeRequired ? DESIGN_CHANGE_FEE : 0

  return {
    mailerSize: input.mailerSize,
    basePrice,
    runTime,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    designRequiredFee,
    designChangeFee,
    total: Math.max(subtotal - discountAmount + designRequiredFee + designChangeFee, 0),
  }
}

/**
 * Example usage:
 *
 * const result = calculateMailerTotal({
 *   mailerSize: '3x8',
 *   runTime: 1,
 *   designRequired: true,
 *   designChangeRequired: false,
 * })
 *
 * console.log(result.total) // 685
 */
