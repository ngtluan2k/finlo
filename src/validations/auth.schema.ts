import { z } from 'zod'

export type RegisterValidationMessages = {
  emailInvalid: string
  passwordMin: string
  passwordMax: string
  firstNameRequired: string
  firstNameMax: string
  lastNameRequired: string
  lastNameMax: string
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
  return z.object({
    email: z.email(messages.emailInvalid),
    password: z
      .string()
      .min(8, messages.passwordMin)
      .max(128, messages.passwordMax),
    firstName: nameField(messages.firstNameRequired, messages.firstNameMax),
    lastName: nameField(messages.lastNameRequired, messages.lastNameMax),
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
})

export const loginSchema = createLoginSchema({
  identifierRequired: 'Identifier required',
  passwordRequired: 'Password required',
})
