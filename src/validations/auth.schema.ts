import { z } from 'zod'

export type RegisterValidationMessages = {
  emailInvalid: string
  passwordMin: string
  passwordMax: string
  firstNameRequired: string
  firstNameMax: string
  lastNameRequired: string
  lastNameMax: string
  confirmPasswordRequired: string
  passwordMismatch: string
  phoneInvalid?: string
}

export type LoginValidationMessages = {
  identifierRequired: string
  passwordRequired: string
}

const nameField = (
  required: string,
  max: string,
) =>
  z
    .string()
    .trim()
    .min(1, required)
    .max(100, max)

export function createRegisterSchema(messages: RegisterValidationMessages) {
  return z
    .object({
      email: z.string().trim().email(messages.emailInvalid),
      password: z
        .string()
        .min(8, messages.passwordMin)
        .max(128, messages.passwordMax),
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired),
      firstName: nameField(messages.firstNameRequired, messages.firstNameMax),
      lastName: nameField(messages.lastNameRequired, messages.lastNameMax),
      phone: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine((val) => !val || /^\+?\d[\d\s-]{7,}$/.test(val), {
          message: messages.phoneInvalid || 'Invalid phone number',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.passwordMismatch,
      path: ['confirmPassword'],
    })
}

export function createLoginSchema(messages: LoginValidationMessages) {
  return z.object({
    identifier: z.string().trim().min(1, messages.identifierRequired),
    password: z.string().min(1, messages.passwordRequired),
  })
}

export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>

export const registerSchema = createRegisterSchema({
  emailInvalid: 'Invalid email',
  passwordMin: 'Password min 8',
  passwordMax: 'Password max 128',
  firstNameRequired: 'First name required',
  firstNameMax: 'First name max 100',
  lastNameRequired: 'Last name required',
  lastNameMax: 'Last name max 100',
  confirmPasswordRequired: 'Confirm password is required',
  passwordMismatch: 'Passwords do not match',
  phoneInvalid: 'Invalid phone number',
})

export const loginSchema = createLoginSchema({
  identifierRequired: 'Identifier required',
  passwordRequired: 'Password required',
})
