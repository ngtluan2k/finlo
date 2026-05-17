const MAX_USERNAME_LENGTH = 50

export function slugifyNamePart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function splitNameParts(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map(slugifyNamePart)
    .filter(Boolean)
}


export function buildUsernameBase(firstName: string, lastName: string) {
  const ten = splitNameParts(firstName)
  const ho = splitNameParts(lastName)

  const givenSlug = ten[0] ?? ''
  const demInitial = ho.length >= 2 ? ho[ho.length - 1][0] : ''

  const base = `${givenSlug}${demInitial}` || 'user'
  return base.slice(0, MAX_USERNAME_LENGTH - 4)
}

export function buildUsernameCandidates(base: string) {
  const normalized = base.toLowerCase()
  const candidates = [normalized]
  for (let n = 1; n <= 9999; n += 1) {
    candidates.push(`${normalized}${n}`)
  }
  return candidates
}
