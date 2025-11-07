# SULUHISHO LA ERROR: "column program_id does not exist"

## Tatizo
Wakati wa kuunda assignment, error hii inatokea:
```
column "program_id" of relation "assignments" does not exist
```

## Sababu
Database table ya `assignments` iliundwa bila column ya `program_id`. Backend code inahitaji column hii kwa ajili ya precise program targeting.

## Suluhisho Rahisi (Bila Kudelete Data)

### Njia 1: Tumia Script (RECOMMENDED)

**Hatua 1:** Hakikisha backend inafanya kazi
```bash
cd backend
node server.js
```

**Hatua 2:** Run script ya kuongeza column
```bash
# Kwenye root folder
add-program-id-column.bat
```

Script hii itafanya:
- ✅ Ongeza `program_id` column kwenye `assignments` table
- ✅ Haitadelete data yoyote iliyopo
- ✅ Column itakuwa nullable (optional)

### Njia 2: Tumia API Directly

Kama una curl au Postman:
```bash
curl -X POST http://localhost:5000/api/assignments/add-program-id
```

### Njia 3: Tumia PostgreSQL Directly

Kama una psql installed:
```bash
psql -U postgres -d LMS_MUST_DB_ORG
```

Kisha run:
```sql
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS program_id INTEGER;
```

## Suluhisho la Pili (Kuunda Table Upya)

⚠️ **WARNING:** Hii itadelete assignments zote zilizopo!

Kama unataka kuunda table upya na schema sahihi:

```bash
# Run script
fix-assignment-tables.bat
```

Au tumia API:
```bash
curl -X POST http://localhost:5000/api/assignments/fix
```

## Verification

Baada ya kuongeza column, verify:

### 1. Check Database
```sql
-- PostgreSQL
\d assignments

-- Unapaswa kuona:
-- program_id | integer |
```

### 2. Test Assignment Creation
1. Ingia kama lecturer
2. Jaribu kuunda assignment mpya
3. Inapaswa kufanya kazi bila error

### 3. Check Backend Logs
Backend console inapaswa kuonyesha:
```
✅ program_id column added successfully
```

## Kwa Nini Column Hii Inahitajika?

`program_id` column inatumika kwa:
1. **Precise targeting** - Students wanaona assignments za programs zao tu
2. **Better filtering** - Exact program ID match badala ya name matching
3. **Data integrity** - Foreign key relationship na programs table

## Schema Kamili ya Assignments Table

```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  program_id INTEGER,              -- ← Column hii ilikuwa inakosekana
  program_name VARCHAR(255) NOT NULL,
  deadline TIMESTAMP NOT NULL,
  submission_type VARCHAR(20) DEFAULT 'text',
  max_points INTEGER DEFAULT 100,
  lecturer_id INTEGER,
  lecturer_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Error: "relation assignments does not exist"
**Suluhisho:** Table haijatengenezwa. Run:
```bash
init-assignment-tables.bat
```

### Error: "could not connect to server"
**Suluhisho:** PostgreSQL haifanyi kazi. Start PostgreSQL service.

### Error: "backend not responding"
**Suluhisho:** 
1. Check kama backend inafanya kazi (port 5000)
2. Run: `cd backend && node server.js`

### Column tayari ipo lakini error inaendelea
**Suluhisho:**
1. Restart backend server
2. Clear browser cache
3. Log out na log in tena

## Quick Fix Summary

```bash
# 1. Start backend
cd backend
node server.js

# 2. Kwenye terminal nyingine, run:
cd ..
add-program-id-column.bat

# 3. Jaribu kuunda assignment tena
```

## Files Zilizoundwa

1. **add-program-id-column.bat** - Script ya kuongeza column (SAFE - haitadelete data)
2. **fix-assignment-tables.bat** - Script ya kuunda table upya (DELETES data)
3. **Backend endpoint:** `/api/assignments/add-program-id` - API ya kuongeza column

## Kumbuka

- ✅ `add-program-id-column.bat` ni SAFE - haitadelete data
- ⚠️ `fix-assignment-tables.bat` itadelete data yote
- ✅ Column ni optional (nullable) - assignments za zamani zitafanya kazi
- ✅ Assignments mpya zitatumia `program_id` kwa precise targeting

Tatizo limetatuliwa! 🎉
