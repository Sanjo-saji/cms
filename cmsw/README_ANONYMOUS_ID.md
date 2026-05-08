# Anonymous ID System

## Overview

The Anonymous ID system provides privacy for students when communicating with teachers. Each student has a **single global anonymous ID** that is used across all teacher communications.

## Key Features

- **Single Global ID**: Each student has one anonymous ID used for all teachers
- **Simple Regeneration**: Easy GET request to regenerate the ID
- **Complete Privacy Reset**: When ID is reset, old messages become orphaned and untraceable
- **Privacy Focused**: Teachers only see anonymous IDs, never real student names

## Architecture

### Student Anonymous ID Flow

1. **First Message**: When a student sends their first message to any teacher, a global anonymous ID is generated
2. **Global Usage**: This same ID is used for all subsequent communications with any teacher
3. **Regeneration**: Student can regenerate their ID at any time with a simple GET request
4. **Privacy Reset**: When ID is regenerated, a NEW entry is created and old messages become orphaned
5. **Message Isolation**: Old messages are no longer tied to the new anonymous ID for complete privacy

### Database Schema

The system uses the existing `Chat` model with student entries containing:
- `anonId`: The global anonymous ID for the student
- `studentId`: Internal reference to the student (for system use only)
- `messages`: Array of chat messages
- `lastActivity`: Timestamp of last activity
- `isActive`: Whether the entry is currently active
- `createdAt`: When the entry was created

## API Endpoints

### Student Routes

- `GET /api/chat/student/regenerate-anonid-global` - Regenerate global anonymous ID

### Chat Routes

- `POST /api/chat/student/send` - Send message (automatically uses current anonId)
- `GET /api/chat/student/chat/:teacherId` - Get chat history with a teacher
- `POST /api/chat/teacher/send` - Teacher sends message to student by anonId
- `GET /api/chat/teacher/chats` - Get all student chats (anonIds only)
- `GET /api/chat/teacher/chat/:anonId` - Get chat with specific student by anonId

## Usage Examples

### Regenerating Global Anonymous ID

```javascript
// Student regenerates their global anonymous ID
const response = await fetch('/api/chat/student/regenerate-anonid-global', {
  method: 'GET',
  headers: { 
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

// Response includes the new anonymous ID and old anonIds
const { newGlobalAnonId, updatedChats, oldAnonIds, note } = await response.json();
console.log(`New anonId: ${newGlobalAnonId}, Updated ${updatedChats} chats`);
console.log(`Old anonIds: ${oldAnonIds.join(', ')}`);
console.log(`Note: ${note}`);
```

### Sending Messages

```javascript
// Student sends message (automatically uses current anonId)
const response = await fetch('/api/chat/student/send', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    teacherId: 'teacher123',
    message: 'Hello teacher!'
  })
});

// Response includes the anonId used
const { chat: { anonId } } = await response.json();
console.log(`Message sent with anonId: ${anonId}`);
```

### Teacher Receiving Messages

```javascript
// Teacher gets all student chats (anonIds only)
const response = await fetch('/api/chat/teacher/chats', {
  headers: { 'Authorization': 'Bearer TEACHER_TOKEN' }
});

const { students } = await response.json();
students.forEach(student => {
  console.log(`Student ${student.anonId}: ${student.messageCount} messages`);
});
```

## Privacy Features

- **JWT Authentication**: All endpoints require valid authentication
- **Student Isolation**: Students can only access their own data
- **Teacher Privacy**: Teachers only see anonymous IDs, never real names
- **Message Orphaning**: When anonId is reset, old messages become untraceable
- **Complete Reset**: New anonId starts with clean slate, no message history

## Testing

Run the test script to verify the system:

```bash
cd cmsw
node test-global-anonid.js
```

## Migration from Legacy System

The system automatically handles legacy chat data:
- Legacy `s`/`t` message fields are automatically migrated to `sender`/`text`
- Missing `anonId` fields are automatically generated
- All existing chats are preserved during migration

## Benefits

1. **Simplicity**: One ID per student, easy to manage
2. **Privacy**: Complete anonymity across all teacher communications
3. **Efficiency**: No need to manage multiple IDs per teacher
4. **Flexibility**: Easy regeneration when needed
5. **Complete Privacy Reset**: Old messages become completely untraceable
6. **Message Isolation**: New anonId starts fresh with no connection to old messages
