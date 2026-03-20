// Constants: examConfig — Exam timing and scoring configuration
export const EXAM_CONFIG = {
  // Duration in seconds for each exam type
  MODEL_SET_DURATION:   3 * 60 * 60,   // 3 hours
  WEEKLY_TEST_DURATION: 2 * 60 * 60,   // 2 hours

  // Warning threshold: timer turns red below this (seconds)
  WARNING_THRESHOLD: 10 * 60,          // 10 minutes

  // Auto-submit countdown (seconds)
  AUTO_SUBMIT_COUNTDOWN: 10,

  // Tab switch limit before auto submit
  TAB_SWITCH_LIMIT: 3,

  // Marking scheme
  MARKS_PER_CORRECT:   4,
  MARKS_PER_WRONG:    -1,
  MARKS_PER_SKIPPED:   0,

  // Total questions
  MODEL_SET_QUESTIONS:  100,
  WEEKLY_TEST_QUESTIONS: 50,

  // Pass percentage
  PASS_PERCENTAGE: 40,

  // Local storage key for exam persistence
  EXAM_STATE_KEY: 'brighter-nepal-exam-state',
} as const
