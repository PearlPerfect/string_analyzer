import analyzer from '../services/analyzer.js';
import { parseNaturalQuery } from '../utils/nlParser.js';
import storage from '../services/storage.js';

const { analyze, sha256 } = analyzer;

function respondRecord(res, record) {
  return res.json({
    id: record.id,
    value: record.value,
    properties: record.properties,
    created_at: record.created_at,
  });
}

async function createString(req, res) {
  try {
    const { value } = req.body;
    // check for existing by value or sha
    const existingByValue = await storage.findByValue(value);
    const hash = sha256(value);
    const existingById = await storage.findById(hash);
    if (existingByValue || existingById) {
      return res.status(409).json({ message: 'String already exists' });
    }
    const record = analyze(value);
    await storage.createString(record);
    return res.status(201).json({
      id: record.id,
      value: record.value,
      properties: record.properties,
      created_at: record.created_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getString(req, res) {
  // support fetching by raw value or by sha256
  const param = decodeURIComponent(req.params.string_value);
  // check if param is a 64-hex sha
  const isSha = /^[a-f0-9]{64}$/.test(param);
  const record = isSha ? await storage.findById(param) : await storage.findByValue(param);
  if (!record) return res.status(404).json({ message: 'String does not exist in the system' });
  return respondRecord(res, record);
}

function _applyFilters(strings, filters) {
  let result = strings.slice();
  if (filters.is_palindrome !== undefined) {
    const want = filters.is_palindrome === 'true' || filters.is_palindrome === true;
    result = result.filter((r) => r.properties.is_palindrome === want);
  }
  if (filters.min_length !== undefined) {
    const n = Number(filters.min_length);
    if (Number.isNaN(n)) throw new Error('min_length must be integer');
    result = result.filter((r) => r.properties.length >= n);
  }
  if (filters.max_length !== undefined) {
    const n = Number(filters.max_length);
    if (Number.isNaN(n)) throw new Error('max_length must be integer');
    result = result.filter((r) => r.properties.length <= n);
  }
  if (filters.word_count !== undefined) {
    const n = Number(filters.word_count);
    if (Number.isNaN(n)) throw new Error('word_count must be integer');
    result = result.filter((r) => r.properties.word_count === n);
  }
  if (filters.contains_character !== undefined) {
    const ch = String(filters.contains_character);
    if (ch.length !== 1) throw new Error('contains_character must be a single character');
    result = result.filter((r) => Object.prototype.hasOwnProperty.call(r.properties.character_frequency_map, ch));
  }
  return result;
}

async function getAllStrings(req, res) {
  try {
    const rawFilters = {
      is_palindrome: req.query.is_palindrome,
      min_length: req.query.min_length,
      max_length: req.query.max_length,
      word_count: req.query.word_count,
      contains_character: req.query.contains_character,
    };
    // remove undefined
    Object.keys(rawFilters).forEach((k) => rawFilters[k] === undefined && delete rawFilters[k]);

    // validate types roughly
    try {
      const all = await storage.all();
      const filtered = _applyFilters(all, rawFilters);
      return res.json({
        data: filtered.map((r) => ({
          id: r.id,
          value: r.value,
          properties: r.properties,
          created_at: r.created_at,
        })),
        count: filtered.length,
        filters_applied: rawFilters,
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function naturalFilter(req, res) {
  try {
    const q = req.query.query;
    const parsed = parseNaturalQuery(q);
    if (!parsed) {
      return res.status(400).json({ message: 'Unable to parse natural language query' });
    }
    const filters = parsed.parsed_filters;
    // check for conflicts: e.g., min_length > max_length etc. We'll treat only simple conflicts
    if (filters.min_length && filters.max_length && filters.min_length > filters.max_length) {
      return res.status(422).json({ message: 'Parsed filters conflict (min_length > max_length)' });
    }
    const all = await storage.all();
    let filtered;
    try {
      filtered = _applyFilters(all, filters);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
    return res.json({
      data: filtered.map((r) => ({
        id: r.id,
        value: r.value,
        properties: r.properties,
        created_at: r.created_at,
      })),
      count: filtered.length,
      interpreted_query: {
        original: parsed.original,
        parsed_filters: parsed.parsed_filters,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteString(req, res) {
  const param = decodeURIComponent(req.params.string_value);
  const isSha = /^[a-f0-9]{64}$/.test(param);
  const record = isSha ? await storage.findById(param) : await storage.findByValue(param);
  if (!record) return res.status(404).json({ message: 'String not found' });
  await storage.deleteById(record.id);
  return res.status(204).send();
}

export default {
  createString,
  getAllStrings,
  getString,
  deleteString,
  naturalFilter
};
