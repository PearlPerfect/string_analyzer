# String Analyzer API

A Node.js + Express REST API that analyzes strings and stores computed properties.

## Features

- Compute and store: length, is_palindrome, unique_characters, word_count, sha256_hash, character_frequency_map
- Endpoints:
  - `POST /strings` - analyze and store a string
  - `GET /strings/:string_value` - get specific string (supports raw string or sha256 id)
  - `GET /strings` - get all strings with query filtering
  - `GET /strings/filter-by-natural-language?query=...` - heuristic natural-language filter
  - `DELETE /strings/:string_value` - delete a string

## Requirements

- Node.js >= 18
- npm

## Setup

```bash
git clone <your-repo-url>
cd string-analyzer-api
npm install
cp .env.example .env   # edit if needed
npm start
Default server: http://localhost:3000.

Environment variables
PORT (default 3000)

DB_FILE (default ./data/db.json) — path to JSON DB file

Run tests
bash
Copy code
npm test
Example requests
Create:

bash
Copy code
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "hello world"}'
Get:

bash
Copy code
curl http://localhost:3000/strings/hello%20world
# or by sha:
curl http://localhost:3000/strings/<sha256>
Filter:

bash
Copy code
curl "http://localhost:3000/strings?is_palindrome=true&min_length=5"
Natural language:

bash
Copy code
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"
Notes & design choices
Uses lowdb for easy JSON persistence (works fine on Railway/Heroku).

analyze() counts Unicode codepoints properly using Array.from.

Natural language filtering is heuristic and intentionally small scope — extendable.

GET /strings/:string_value checks if parameter matches sha256 (64 hex chars) and tries id lookup; otherwise it matches raw string value.

markdown
Copy code

---

# Extra notes & explanations (what each file does) — brief recap

- `package.json` — npm project manifest and scripts (`start`, `test`).
- `.env.example` — environment variable template.
- `src/index.js` — application entrypoint; reads `.env`, initializes DB, starts server.
- `src/app.js` — builds the Express app, sets up JSON parsing, logging and routes, plus a 404.
- `src/routes/strings.js` — defines the HTTP routes and attaches middleware/controllers.
- `src/controllers/stringsController.js` — orchestrates request handling, filtering logic, error returns matching your spec (409/400/422/404 etc).
- `src/services/analyzer.js` — core logic to compute string properties (sha256, frequency map, palindrome detection, word count).
- `src/services/storage.js` — DB wrapper around `lowdb` for CRUD operations (init, find, create, delete, list).
- `src/utils/nlParser.js` — simple rule-based natural language parser for the `filter-by-natural-language` endpoint.
- `src/middlewares/validation.js` — request validation for `POST /strings`.
- `tests/strings.test.js` — unit/integration tests using Jest + Supertest.

---

# Deployment notes

- This project uses a JSON DB file. For production deploy, you may:
  - Mount a persistent volume so `DB_FILE` persists between restarts.
  - Or swap `storage.js` to use a managed DB (MongoDB, Postgres) in a few lines.
- Works on Railway, Heroku, PXXL App, AWS, etc. (Vercel/Render banned in your cohort).

---

# Extending / improvements you might add later
- Improve NL parser (use NLP library or an LLM for advanced parsing).
- Add pagination & sorting to `GET /strings`.
- Add authentication (API keys).
- Migrate to a proper DB (MongoDB/Postgres) for scale.
- Add rate-limiting for abuse prevention.

---

# Quick sanity checklist to submit
1. Run `npm install`.
2. Copy `.env.example` to `.env`, adjust `DB_FILE` path if needed.
3. Start with `npm start`.
4. Test endpoints manually or run `npm test`.
5. Commit code and push to GitHub. Add a clear README with these setup instructions (copy the README content above). Include tests in repo.
