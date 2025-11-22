/**
 * Calculate the effective priority based on elapsed time since creation.
 * - At 50% elapsed: promote priority by one level
 * - At 90% elapsed: promote priority by another level
 * (Low -> Medium -> High -> Urgent -> Urgent)
 * 
 * Priority levels: Low (1), Medium (2), High (3), Urgent (4)
 */
export default function calculateUrgency(task) {
  // If no due date, return original priority
  if (!task.dueDate) {
    const priorityMap = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
    return priorityMap[task.priority] || 2;
  }

  const createdAt = new Date(task.createdAt);
  const dueDate = new Date(task.dueDate);
  const now = new Date();

  // Total time from creation to due date (in ms)
  const totalTime = dueDate.getTime() - createdAt.getTime();

  // Time elapsed since creation (in ms)
  const elapsedTime = now.getTime() - createdAt.getTime();

  // If due date has passed, keep original priority (could also max it out to Urgent)
  if (elapsedTime > totalTime) {
    const priorityMap = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
    return priorityMap[task.priority] || 2;
  }

  // Calculate percentage of time elapsed
  const percentElapsed = elapsedTime / totalTime;

  // Get the stored priority level (1, 2, 3, or 4)
  const priorityMap = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
  let priorityLevel = priorityMap[task.priority] || 2;

  // If 90% or more of time has elapsed, promote by two levels
  if (percentElapsed >= 0.9) {
    priorityLevel = Math.min(priorityLevel + 2, 4); // Cap at Urgent (4)
  }
  // If 50% or more of time has elapsed, promote by one level
  else if (percentElapsed >= 0.5) {
    priorityLevel = Math.min(priorityLevel + 1, 4); // Cap at Urgent (4)
  }

  return priorityLevel;
}

/**
 * Convert priority level (1, 2, 3, 4) back to string
 */
export function priorityLevelToString(level) {
  const levelMap = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' };
  return levelMap[level] || 'Medium';
}
