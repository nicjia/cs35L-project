// server/utils/searchUtils.js
// Basic search scoring utility

/**
 * Calculate a relevance score for a user based on query match quality.
 * Higher score = better match.
 * 
 * Scoring:
 *   - Exact match: 100 points
 *   - Starts with query (prefix): 75 points  
 *   - Contains query: 50 points
 *   - No match: 0 points
 * 
 * Fields searched (with weights):
 *   - username: 3x weight
 *   - firstName: 2x weight
 *   - lastName: 2x weight
 */
function scoreUser(user, query) {
  const q = query.toLowerCase().trim();
  let totalScore = 0;
  const matchedFields = [];

  const fields = [
    { name: 'username', value: user.username, weight: 3 },
    { name: 'firstName', value: user.firstName, weight: 2 },
    { name: 'lastName', value: user.lastName, weight: 2 },
  ];

  for (const field of fields) {
    const score = scoreField(field.value, q, field.weight);
    if (score > 0) {
      totalScore += score;
      matchedFields.push(field.name);
    }
  }

  return { score: totalScore, matchedFields };
}

/**
 * Score a single field against the query.
 */
function scoreField(value, query, weight) {
  if (!value) return 0;
  
  const v = value.toLowerCase();
  
  if (v === query) {
    return 100 * weight; // Exact match
  }
  if (v.startsWith(query)) {
    return 75 * weight;  // Prefix match
  }
  if (v.includes(query)) {
    return 50 * weight;  // Contains
  }
  
  return 0;
}

module.exports = { scoreUser };
