// Mock Data: mockExam — realistic IOE mock exam data matching Stitch HTML
import type { Exam } from '@/lib/types/exam'

export const mockExam: Exam = {
  id:         'exam-ioe-model-04',
  title:      'IOE Mock Entrance — Set #04',
  type:       'model-set',
  subjects:   ['Physics', 'Chemistry', 'Mathematics', 'English'],
  duration:   3 * 60 * 60,
  totalMarks: 400,
  isActive:   true,
  questions: Array.from({ length: 100 }, (_, i) => {
    const subjectList = ['Physics', 'Chemistry', 'Mathematics', 'English']
    const subject = subjectList[Math.floor(i / 25)]
    return {
      id:        `q-${String(i + 1).padStart(3, '0')}`,
      number:    i + 1,
      subject,
      text:      i === 0
        ? 'A projectile is fired at an angle of 45° with the horizontal. If the air resistance is negligible, the horizontal range is maximum. What happens to the range if the firing angle is increased to 60°?'
        : i === 1
        ? 'Which of the following elements has the highest electronegativity according to the Pauling scale?'
        : `Question ${i + 1}: ${subject} problem regarding exam preparation for IOE entrance examination Nepal.`,
      options: [
        { id: 'A', label: 'A', text: i === 0 ? 'The range increases' : i === 1 ? 'Fluorine' : 'Option A — most likely correct based on formula derivation' },
        { id: 'B', label: 'B', text: i === 0 ? 'The range decreases' : i === 1 ? 'Chlorine' : 'Option B — requires further evaluation' },
        { id: 'C', label: 'C', text: i === 0 ? 'The range remains same' : i === 1 ? 'Oxygen' : 'Option C — partially correct' },
        { id: 'D', label: 'D', text: i === 0 ? 'Range becomes zero' : i === 1 ? 'Nitrogen' : 'Option D — incorrect analysis' },
      ],
      correctId:   i === 0 ? 'B' : i === 1 ? 'A' : 'A',
      marks:       4,
      explanation: i === 0
        ? 'The horizontal range R = (u² sin 2θ) / g is maximum at 45°. At 60°, R = (u² sin 120°) / g which is less than maximum.'
        : i === 1
        ? 'Fluorine is the most electronegative element (Pauling value ≈ 3.98). Electronegativity increases across periods.'
        : undefined,
    }
  }),
}
