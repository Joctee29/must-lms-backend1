# Account Lock/Unlock - Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│           PASSWORD MANAGEMENT ADMIN PORTAL                      │
│         (admin-system/src/pages/PasswordManagement.tsx)         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ↓
        ┌───────────────────────────────────────┐
        │    User Selects Account Action        │
        ├───────────────────────────────────────┤
        │ - Lock User                           │
        │ - Unlock User                         │
        │ - Manual Password Reset               │
        └───────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ↓           ↓           ↓
            LOCK        UNLOCK      RESET
                │           │           │
                ↓           ↓           ↓
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ handleLock   │ │handleUnlock   │ │handleReset   │
        └──────────────┘ └──────────────┘ └──────────────┘
                │           │                    │
                ↓           ↓                    ↓
        ┌─────────────────────────────────────────────────┐
        │      BACKEND API (backend/server.js)           │
        └─────────────────────────────────────────────────┘
                │           │                    │
        ┌───────▼─────┐ ┌──▼──────────┐  ┌──────▼────────┐
        │POST /lock   │ │POST /unlock  │  │ POST /reset   │
        └───────┬─────┘ └──┬──────────┘  └──────┬────────┘
                │          │                    │
                └──────────┼────────────────────┘
                           ↓
        ┌─────────────────────────────────────┐
        │   UPDATE DATABASE TABLES            │
        ├─────────────────────────────────────┤
        │ - students table                    │
        │   SET is_locked = true/false        │
        │   SET locked_at = timestamp/null    │
        │                                     │
        │ - lecturers table                   │
        │   SET is_locked = true/false        │
        │   SET locked_at = timestamp/null    │
        │                                     │
        │ - password_reset_logs table         │
        │   INSERT reset record with code     │
        └─────────────────────────────────────┘
                           ↓
        ┌─────────────────────────────────────┐
        │    PostgreSQL Database              │
        ├─────────────────────────────────────┤
        │ Table: students                     │
        │ - id, name, email, password         │
        │ - is_locked BOOLEAN DEFAULT false   │
        │ - locked_at TIMESTAMP               │
        │                                     │
        │ Table: lecturers                    │
        │ - id, name, email, password         │
        │ - is_locked BOOLEAN DEFAULT false   │
        │ - locked_at TIMESTAMP               │
        │                                     │
        │ Table: password_reset_logs          │
        │ - id, user_id, user_name            │
        │ - reset_code VARCHAR(255)           │
        │ - expires_at, used, used_at         │
        └─────────────────────────────────────┘
```

---

## Data Flow Examples

### 📝 Lock User Flow

```
Admin clicks "Lock" button for student with id=5
                    ↓
Frontend: handleLockUser(5)
                    ↓
Frontend sends POST /api/user/lock
  {
    userId: "5",
    userType: "student"
  }
                    ↓
Backend: receives request
                    ↓
Backend queries: UPDATE students SET is_locked = TRUE, locked_at = CURRENT_TIMESTAMP WHERE id = 5
                    ↓
Database: Updates student record
  BEFORE: { id: 5, name: "John Doe", is_locked: false, locked_at: null }
  AFTER:  { id: 5, name: "John Doe", is_locked: true, locked_at: "2025-11-20 10:30:00" }
                    ↓
Backend responds: { success: true, message: "Account locked for John Doe" }
                    ↓
Frontend: Updates UI, shows success message
                    ↓
Admin sees: "Account locked for John Doe" ✅
```

### 🔓 Unlock User Flow

```
Admin clicks "Unlock" button for student with id=5
                    ↓
Frontend: handleUnlockUser(5)
                    ↓
Frontend sends POST /api/user/unlock
  {
    userId: "5",
    userType: "student"
  }
                    ↓
Backend: receives request
                    ↓
Backend queries: UPDATE students SET is_locked = FALSE, locked_at = NULL WHERE id = 5
                    ↓
Database: Updates student record
  BEFORE: { id: 5, name: "John Doe", is_locked: true, locked_at: "2025-11-20 10:30:00" }
  AFTER:  { id: 5, name: "John Doe", is_locked: false, locked_at: null }
                    ↓
Backend responds: { success: true, message: "Account unlocked for John Doe" }
                    ↓
Frontend: Updates UI, shows success message
                    ↓
Admin sees: "Account unlocked for John Doe" ✅
```

### 🔑 Manual Password Reset Flow

```
Admin enters password for student with id=5
                    ↓
Frontend: handleResetPassword()
  1. Validates: min 8 chars, uppercase, lowercase, digit, special char
  2. Sends POST /api/password-reset/manual
     {
       userId: "5",
       userType: "student",
       newPassword: "SecurePass123!",
       adminEmail: "admin@must.ac.tz"
     }
                    ↓
Backend: receives request
                    ↓
Backend executes:
  1. UPDATE students SET password = "SecurePass123!" WHERE id = 5
  2. UPDATE password_records SET password_hash = "SecurePass123!" WHERE user_id = 5
  3. INSERT INTO password_reset_logs
     (user_id, user_name, email, reset_code, expires_at, used, used_at)
     VALUES (5, "John Doe", "john@email.com", "MANUAL_RESET", ..., true, now())
                    ↓
Database: Updates records
  - students table: password updated
  - password_records table: hash updated
  - password_reset_logs table: reset logged (reset_code: "MANUAL_RESET")
                    ↓
Backend responds: { success: true, message: "Password reset for John Doe" }
                    ↓
Frontend: Updates UI, shows success message
                    ↓
Admin sees: "Password successfully reset for John Doe" ✅
```

---

## Database Schema

### Students Table (Relevant Columns)
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,              -- ← Expanded from VARCHAR(10)
    is_locked BOOLEAN DEFAULT false,             -- ← NEW
    locked_at TIMESTAMP,                         -- ← NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Lecturers Table (Relevant Columns)
```sql
CREATE TABLE lecturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,              -- ← Expanded from VARCHAR(10)
    is_locked BOOLEAN DEFAULT false,             -- ← NEW
    locked_at TIMESTAMP,                         -- ← NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Reset Logs Table (Relevant Columns)
```sql
CREATE TABLE password_reset_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    reset_code VARCHAR(255) NOT NULL,            -- ← Expanded from VARCHAR(10)
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoint Details

### POST /api/user/lock

**Purpose:** Lock a user account (prevent login)

**Request:**
```json
{
  "userId": "5",
  "userType": "student"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account locked for John Doe",
  "data": {
    "userName": "John Doe",
    "email": "john@example.com",
    "is_locked": true
  }
}
```

**Error Responses:**
```json
// 400 - Missing parameters
{
  "success": false,
  "error": "userId and userType are required"
}

// 404 - User not found
{
  "success": false,
  "error": "User not found"
}

// 500 - Server error
{
  "success": false,
  "error": "Error message from database"
}
```

---

### POST /api/user/unlock

**Purpose:** Unlock a user account (allow login)

**Request:**
```json
{
  "userId": "5",
  "userType": "student"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account unlocked for John Doe",
  "data": {
    "userName": "John Doe",
    "email": "john@example.com",
    "is_locked": false
  }
}
```

---

### POST /api/password-reset/manual

**Purpose:** Manually reset a user's password from admin panel

**Request:**
```json
{
  "userId": "5",
  "userType": "student",
  "newPassword": "SecurePass123!",
  "adminEmail": "admin@must.ac.tz"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password successfully reset for John Doe",
  "data": {
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "userType": "student"
  }
}
```

---

## Code Snippets

### Frontend: handleLockUser()
```typescript
const handleLockUser = async (userId: string) => {
  if (!selectedUser) {
    alert("Please select a user first");
    return;
  }

  try {
    const response = await fetch('https://must-lms-backend.onrender.com/api/user/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        userType: selectedUser.userType
      })
    });

    const result = await response.json();

    if (result.success) {
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: "locked" as const }
          : user
      ));
      alert(`Account locked for ${result.data.userName}`);
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error locking user:', error);
    alert('Failed to lock account. Please check server connection.');
  }
};
```

### Backend: POST /api/user/lock
```javascript
app.post('/api/user/lock', async (req, res) => {
  try {
    const { userId, userType } = req.body;
    
    if (!userId || !userType) {
      return res.status(400).json({ success: false, error: 'userId and userType are required' });
    }
    
    let updateResult;
    
    if (userType === 'student') {
      updateResult = await pool.query(
        'UPDATE students SET is_locked = TRUE, locked_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING name, email, is_locked',
        [userId]
      );
    } else if (userType === 'lecturer') {
      updateResult = await pool.query(
        'UPDATE lecturers SET is_locked = TRUE, locked_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING name, email, is_locked',
        [userId]
      );
    } else {
      return res.status(400).json({ success: false, error: 'Invalid userType' });
    }
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const user = updateResult.rows[0];
    res.json({ 
      success: true, 
      message: `Account locked for ${user.name}`,
      data: { userName: user.name, email: user.email, is_locked: user.is_locked }
    });
  } catch (error) {
    console.error('Error locking user account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Summary

The Account Lock/Unlock feature is implemented as a **REST API** architecture:

1. **Frontend** (React) collects user input and calls backend endpoints
2. **Backend** (Express.js) validates input and executes database queries
3. **Database** (PostgreSQL) stores lock status and reset logs
4. **Response** goes back to frontend, which updates the UI

All components work together to provide a seamless admin experience for managing user accounts.

