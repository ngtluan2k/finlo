import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { preferenceToTheme, themeToPreference } from '@/lib/settings-theme'
import type { Theme } from '@/lib/theme'
import type { PatchSettingsInput } from '@/validations/settings.schema'

export type UserSettingsView = {
  theme: Theme
  preferences: Record<string, unknown>
}

function toPreferencesRecord(value: Prisma.JsonValue): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function toView(settings: {
  theme: Parameters<typeof preferenceToTheme>[0]
  preferences: Prisma.JsonValue
}): UserSettingsView {
  return {
    theme: preferenceToTheme(settings.theme),
    preferences: toPreferencesRecord(settings.preferences),
  }
}

export async function getOrCreateUserSettings(
  userId: string,
): Promise<UserSettingsView> {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  })

  return toView(settings)
}

export async function updateUserSettings(
  userId: string,
  input: PatchSettingsInput,
): Promise<UserSettingsView> {
  const existing = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  })

  const currentPreferences = toPreferencesRecord(existing.preferences)
  const nextPreferences =
    input.preferences !== undefined
      ? { ...currentPreferences, ...input.preferences }
      : currentPreferences

  const updated = await prisma.userSettings.update({
    where: { userId },
    data: {
      ...(input.theme !== undefined
        ? { theme: themeToPreference(input.theme) }
        : {}),
      preferences: nextPreferences as Prisma.InputJsonValue,
    },
  })

  return toView(updated)
}

export async function createDefaultUserSettings(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  await tx.userSettings.create({
    data: { userId },
  })
}
