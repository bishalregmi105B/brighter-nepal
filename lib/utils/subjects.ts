export const DEFAULT_SUBJECTS = [
  'Biology',
  'Chemistry',
  'English',
  'General',
  'GK',
  'Mathematics',
  'Physics',
  'Accountancy',
  'Economics',
]

export function mergeSubjectOptions(...groups: Array<Array<string | null | undefined> | undefined>): string[] {
  const mapped = new Map<string, string>()

  groups.forEach((group) => {
    group?.forEach((value) => {
      const subject = String(value || '').trim()
      if (!subject) return
      const key = subject.toLowerCase()
      if (!mapped.has(key)) {
        mapped.set(key, subject)
      }
    })
  })

  return Array.from(mapped.values()).sort((a, b) => a.localeCompare(b))
}

export function getDefaultSubject(...groups: Array<Array<string | null | undefined> | undefined>): string {
  const subjects = mergeSubjectOptions(...groups)
  return subjects.find((subject) => subject.trim().toLowerCase() !== 'general') ?? subjects[0] ?? ''
}
