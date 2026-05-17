import { z } from 'zod'
import { themes } from '@/lib/theme'

export const patchSettingsSchema = z.object({
  theme: z.enum(themes).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
})

export type PatchSettingsInput = z.infer<typeof patchSettingsSchema>
