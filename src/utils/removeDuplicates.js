// src/utils/removeDuplicates.js
export const removeDuplicateQuestions = (questions) => {
  const seen = new Set();
  return questions.filter(q => {
    const key = q.question.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
