import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import path from 'path';

let db;

async function init(dbFilePath) {
  if (!fs.existsSync(dbFilePath)) {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // ✅ pass default data when creating the Low instance
  const adapter = new JSONFile(dbFilePath);
  db = new Low(adapter, { strings: [] }); // 👈 provide default data here

  await db.read();

  // ✅ Ensure db.data always exists
  db.data ||= { strings: [] };
  await db.write();
}

function getDb() {
  if (!db) throw new Error('DB not initialized. Call init(dbFilePath) first.');
  return db;
}

// CRUD operations
async function findById(id) {
  const { strings } = getDb().data;
  return strings.find((s) => s.id === id);
}

async function findByValue(value) {
  const { strings } = getDb().data;
  return strings.find((s) => s.value === value);
}

async function createString(record) {
  const dbref = getDb();
  dbref.data.strings.push(record);
  await dbref.write();
  return record;
}

async function deleteById(id) {
  const dbref = getDb();
  const before = dbref.data.strings.length;
  dbref.data.strings = dbref.data.strings.filter((s) => s.id !== id);
  await dbref.write();
  return dbref.data.strings.length < before;
}

async function all() {
  return getDb().data.strings;
}

export default {
  init,
  findById,
  findByValue,
  createString,
  deleteById,
  all,
};
