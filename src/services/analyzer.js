// src/services/analyzer.js
import crypto from 'crypto';

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function charFrequency(value) {
  const map = {};
  for (const ch of value) {
    map[ch] = (map[ch] || 0) + 1;
  }
  return map;
}

function isPalindrome(value) {
  // case-insensitive, compare letters exactly (includes punctuation and spaces)
  const normalized = value.toLowerCase();
  const reversed = Array.from(normalized).reverse().join('');
  return normalized === reversed;
}

function wordCount(value) {
  if (!value) return 0;
  // split by any whitespace and filter empty
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1 && parts[0] === '') return 0;
  return parts.length;
}

function uniqueCharacters(value) {
  return new Set(Array.from(value)).size;
}

function analyze(value) {
  if (typeof value !== 'string') throw new TypeError('value must be a string');
  const sha = sha256(value);
  const freq = charFrequency(value);
  const props = {
    length: Array.from(value).length,
    is_palindrome: isPalindrome(value),
    unique_characters: uniqueCharacters(value),
    word_count: wordCount(value),
    sha256_hash: sha,
    character_frequency_map: freq,
  };
  return {
    id: sha,
    value,
    properties: props,
    created_at: new Date().toISOString(),
  };
}

export default { 
    analyze, 
    sha256 };
