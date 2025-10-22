// src/utils/nlParser.js
export function parseNaturalQuery(query) {
  if (!query || typeof query !== 'string') return null;

  const text = query.toLowerCase();
  const filters = {};

  // detect "palindrome" / "palindromic"
  if (text.includes('palindrome') || text.includes('palindromic')) {
    filters.is_palindrome = true;
  }

  // detect single / multiple word
  if (text.includes('single word')) {
    filters.word_count = 1;
  }

  // detect "longer than N" or "shorter than N"
  const minMatch = text.match(/longer than (\d+)/);
  if (minMatch) filters.min_length = parseInt(minMatch[1]);

  const maxMatch = text.match(/shorter than (\d+)/);
  if (maxMatch) filters.max_length = parseInt(maxMatch[1]);

  // detect "containing character X"
  const charMatch = text.match(/containing character ['"]?([a-zA-Z])['"]?/);
  if (charMatch) filters.contains_character = charMatch[1];

  return {
    original: query,
    parsed_filters: filters,
  };
}
