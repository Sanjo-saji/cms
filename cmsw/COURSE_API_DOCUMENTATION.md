# Course Management API Documentation

## Overview
This documentation covers the Course Management API endpoints for creating, reading, updating, and deleting courses in the CMS system. The API is handled by the course controller and routed through the class router.

## Base URL
```
http://localhost:YOUR_PORT/api/class
```

## Course Model
```javascript
{
  name: String,        // Required - Course name/title
  courseName: String,  // Required - Full course name
  durationYears: Number, // Required - Course duration in years (1-10)
  createdAt: Date,     // Auto-generated
  updatedAt: Date      // Auto-generated
}
```

## Semester Model
```javascript
{
  name: String,        // Required - Semester name (auto-generated or custom)
  createdAt: Date,     // Auto-generated
  updatedAt: Date      // Auto-generated
}
```

## API Endpoints

### 1. Create Course
**POST** `/create-course` (Authenticated) — Role: Principal only

Creates a new course with the specified fields. Requires a valid auth cookie and a user with role `Principal`.

#### Request Body
```json
{
  "name": "Computer Science",
  "courseName": "Bachelor of Computer Science",
  "durationYears": 4
}
```

**Note**: Semesters are automatically created and named as `{courseName}_S1`, `{courseName}_S2`, etc. in the database.

#### Response
**Success (201)**
```json
{
  "success": true,
  "message": "Course and semesters created successfully",
  "course": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Computer Science",
    "courseName": "Bachelor of Computer Science",
    "durationYears": 4,
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  },
  "semesters": [
    {
      "_id": "64a1b2c3d4e5f6789012346",
      "name": "Bachelor of Computer Science_S1",
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6789012347",
      "name": "Bachelor of Computer Science_S2",
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  ],
  "semesterCount": 8
}
```

**Error (401/403/400)**
```json
{
  "success": false,
  "message": "Unauthorized | Access denied: only Principal can create a course | Missing required fields: name, courseName, and durationYears are required"
}
```

**Error (409)**
```json
{
  "success": false,
  "message": "Course with this name already exists"
}
```

### 2. Get All Courses
**GET** `/courses`

Retrieves all courses in the system.

#### Response
**Success (200)**
```json
{
  "success": true,
  "courses": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Computer Science",
      "courseName": "Bachelor of Computer Science",
      "durationYears": 4,
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 3. Get Course by ID
**GET** `/course/:id`

Retrieves a specific course by its ID.

#### Parameters
- `id` (string): MongoDB ObjectId of the course

#### Response
**Success (200)**
```json
{
  "success": true,
  "course": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Computer Science",
    "courseName": "Bachelor of Computer Science",
    "durationYears": 4,
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  }
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 4. Update Course
**PUT** `/update-course/:id`

Updates an existing course.

#### Parameters
- `id` (string): MongoDB ObjectId of the course

#### Request Body
```json
{
  "name": "Computer Science Engineering",
  "courseName": "Bachelor of Computer Science Engineering",
  "durationYears": 4
}
```

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "course": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Computer Science Engineering",
    "courseName": "Bachelor of Computer Science Engineering",
    "durationYears": 4,
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T11:00:00.000Z"
  }
}
```

### 5. Delete Course
**DELETE** `/delete-course/:id`

Deletes a course from the system.

#### Parameters
- `id` (string): MongoDB ObjectId of the course

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Course \"Bachelor of Computer Science\" deleted successfully"
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 6. Delete Course And All References
**DELETE** `/delete-course-and-references/:id` (Authenticated) — Role: Principal only

Deletes the specified course and cascades deletion to all documents that directly reference the course id (classes, subjects, timetables, marks, events, notes by course, and removes course entries from teacher assignments).

#### Parameters
- `id` (string): MongoDB ObjectId of the course

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Course \"Bachelor of Computer Science\" and related references deleted successfully",
  "deletedCounts": {
    "classes": 2,
    "subjects": 8,
    "timetables": 1,
    "marks": 0,
    "events": 3,
    "notes": 4,
    "assignments": 5
  }
}
```

**Error (401/403/404)**
```json
{
  "success": false,
  "message": "Unauthorized | Access denied: only Principal can delete a course and references | Course not found"
}
```

## Usage Examples

### Using cURL

#### Create a Course
```bash
curl -X POST http://localhost:3000/api/class/create-course \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_JWT_TOKEN" \
  -d '{
    "name": "Data Science",
    "courseName": "Master of Data Science",
    "durationYears": 2
  }'
```

#### Get All Courses
```bash
curl -X GET http://localhost:3000/api/class/courses
```

#### Get Course by ID
```bash
curl -X GET http://localhost:3000/api/class/course/64a1b2c3d4e5f6789012345
```

#### Update Course
```bash
curl -X PUT http://localhost:3000/api/class/update-course/64a1b2c3d4e5f6789012345 \
  -H "Content-Type: application/json" \
  -d '{
    "durationYears": 3
  }'
```

#### Delete Course
```bash
curl -X DELETE http://localhost:3000/api/class/delete-course/64a1b2c3d4e5f6789012345
```

#### Delete Course And All References
```bash
curl -X DELETE http://localhost:3000/api/class/delete-course-and-references/64a1b2c3d4e5f6789012345 \
  --cookie "token=YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

#### Create a Course
```javascript
const createCourse = async (courseData) => {
  try {
    const response = await fetch('http://localhost:3000/api/class/create-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating course:', error);
  }
};

// Usage
const newCourse = {
  name: "Web Development",
  courseName: "Diploma in Web Development",
  durationYears: 1
};

createCourse(newCourse);
```

#### Get All Courses
```javascript
const getAllCourses = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/class/courses');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};
```

## Error Handling

All endpoints return consistent error responses with the following structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields)
- `404` - Not Found
- `409` - Conflict (duplicate course name)
- `500` - Internal Server Error

## Notes

1. All course names must be unique
2. All fields (name, courseName, durationYears) are required when creating a course
3. When updating, only provide the fields you want to change
4. The API automatically handles timestamps (createdAt, updatedAt)
5. Course names are case-sensitive for uniqueness checks
6. durationYears must be a number between 1 and 10
7. **Auto-semester creation**: When a course is created, semesters are automatically generated (2 per year)
8. **Semester naming**: All semesters are automatically named in the database as `{courseName}_S{number}` (e.g., "Bachelor of Computer Science_S1")
9. **Incremental naming**: Semesters are numbered sequentially starting from S1, S2, S3, etc.

---











# Class Management API Documentation

## Overview
This section covers the Class Management API endpoints for creating, reading, updating, and deleting classes in the CMS system. Classes are associated with courses and semesters, allowing for organized academic structure.

## Class Model
```javascript
{
  name: String,                    // Required - Class name/identifier
  course: ObjectId,               // Required - Reference to Course model
  semester: ObjectId,             // Required - Reference to Semester model
  createdAt: Date,                // Auto-generated
  updatedAt: Date                 // Auto-generated
}
```

## Class API Endpoints

### 1. Create Class
**POST** `/create-class`

Creates a new class associated with a specific course and semester.

#### Request Body
```json
{
  "name": "Computer Science A",
  "course": "64a1b2c3d4e5f6789012345",
  "semester": "64a1b2c3d4e5f6789012346"
}
```

#### Response
**Success (201)**
```json
{
  "success": true,
  "message": "Class created successfully",
  "class": {
    "_id": "64a1b2c3d4e5f6789012347",
    "name": "Computer Science A",
    "course": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Computer Science",
      "courseName": "Bachelor of Computer Science",
      "durationYears": 4
    },
    "semester": {
      "_id": "64a1b2c3d4e5f6789012346",
      "name": "Bachelor of Computer Science_S1"
    },
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  }
}
```

**Error (400)**
```json
{
  "success": false,
  "message": "Missing required fields: name, course, and semester are required"
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**Error (409)**
```json
{
  "success": false,
  "message": "Class with this name already exists for the given course and semester"
}
```

### 2. Get All Classes
**GET** `/classes`

Retrieves all classes in the system with populated course and semester information.

#### Response
**Success (200)**
```json
{
  "success": true,
  "classes": [
    {
      "_id": "64a1b2c3d4e5f6789012347",
      "name": "Computer Science A",
      "course": {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Computer Science",
        "courseName": "Bachelor of Computer Science",
        "durationYears": 4
      },
      "semester": {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Bachelor of Computer Science_S1"
      },
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 3. Get Class by ID
**GET** `/class/:id`

Retrieves a specific class by its ID with populated course and semester information.

#### Parameters
- `id` (string): MongoDB ObjectId of the class

#### Response
**Success (200)**
```json
{
  "success": true,
  "class": {
    "_id": "64a1b2c3d4e5f6789012347",
    "name": "Computer Science A",
    "course": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Computer Science",
      "courseName": "Bachelor of Computer Science",
      "durationYears": 4
    },
    "semester": {
      "_id": "64a1b2c3d4e5f6789012346",
      "name": "Bachelor of Computer Science_S1"
    },
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T10:00:00.000Z"
  }
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "Class not found"
}
```

### 4. Get Classes by Course
**GET** `/classes/course/:courseId`

Retrieves all classes associated with a specific course.

#### Parameters
- `courseId` (string): MongoDB ObjectId of the course

#### Response
**Success (200)**
```json
{
  "success": true,
  "classes": [
    {
      "_id": "64a1b2c3d4e5f6789012347",
      "name": "Computer Science A",
      "course": {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Computer Science",
        "courseName": "Bachelor of Computer Science",
        "durationYears": 4
      },
      "semester": {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Bachelor of Computer Science_S1"
      },
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "course": {
    "_id": "64a1b2c3d4e5f6789012345",
    "name": "Computer Science",
    "courseName": "Bachelor of Computer Science",
    "durationYears": 4
  }
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 5. Get Classes by Semester
**GET** `/classes/semester/:semesterId`

Retrieves all classes associated with a specific semester.

#### Parameters
- `semesterId` (string): MongoDB ObjectId of the semester

#### Response
**Success (200)**
```json
{
  "success": true,
  "classes": [
    {
      "_id": "64a1b2c3d4e5f6789012347",
      "name": "Computer Science A",
      "course": {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Computer Science",
        "courseName": "Bachelor of Computer Science",
        "durationYears": 4
      },
      "semester": {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Bachelor of Computer Science_S1"
      },
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "semester": {
    "_id": "64a1b2c3d4e5f6789012346",
    "name": "Bachelor of Computer Science_S1"
  }
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "Semester not found"
}
```

### 6. Update Class
**PUT** `/update-class/:id`

Updates an existing class. You can update any combination of name, course, or semester.

#### Parameters
- `id` (string): MongoDB ObjectId of the class

#### Request Body
```json
{
  "name": "Computer Science Advanced",
  "course": "64a1b2c3d4e5f6789012345",
  "semester": "64a1b2c3d4e5f6789012348"
}
```

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Class updated successfully",
  "class": {
    "_id": "64a1b2c3d4e5f6789012347",
    "name": "Computer Science Advanced",
    "course": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Computer Science",
      "courseName": "Bachelor of Computer Science",
      "durationYears": 4
    },
    "semester": {
      "_id": "64a1b2c3d4e5f6789012348",
      "name": "Bachelor of Computer Science_S2"
    },
    "createdAt": "2023-07-01T10:00:00.000Z",
    "updatedAt": "2023-07-01T11:00:00.000Z"
  }
}
```

### 7. Delete Class
**DELETE** `/delete-class/:id`

Deletes a class from the system.

#### Parameters
- `id` (string): MongoDB ObjectId of the class

#### Response
**Success (200)**
```json
{
  "success": true,
  "message": "Class \"Computer Science A\" deleted successfully"
}
```

**Error (404)**
```json
{
  "success": false,
  "message": "Class not found"
}
```

## Class API Usage Examples

### Using cURL

#### Create a Class
```bash
curl -X POST http://localhost:3000/api/class/create-class \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Science Fundamentals",
    "course": "64a1b2c3d4e5f6789012345",
    "semester": "64a1b2c3d4e5f6789012346"
  }'
```

#### Get All Classes
```bash
curl -X GET http://localhost:3000/api/class/classes
```

#### Get Class by ID
```bash
curl -X GET http://localhost:3000/api/class/class/64a1b2c3d4e5f6789012347
```

#### Get Classes by Course
```bash
curl -X GET http://localhost:3000/api/class/classes/course/64a1b2c3d4e5f6789012345
```

#### Get Classes by Semester
```bash
curl -X GET http://localhost:3000/api/class/classes/semester/64a1b2c3d4e5f6789012346
```

#### Update Class
```bash
curl -X PUT http://localhost:3000/api/class/update-class/64a1b2c3d4e5f6789012347 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Data Science"
  }'
```

#### Delete Class
```bash
curl -X DELETE http://localhost:3000/api/class/delete-class/64a1b2c3d4e5f6789012347
```

### Using JavaScript/Fetch

#### Create a Class
```javascript
const createClass = async (classData) => {
  try {
    const response = await fetch('http://localhost:3000/api/class/create-class', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating class:', error);
  }
};

// Usage
const newClass = {
  name: "Web Development Basics",
  course: "64a1b2c3d4e5f6789012345",
  semester: "64a1b2c3d4e5f6789012346"
};

createClass(newClass);
```

#### Get Classes by Course
```javascript
const getClassesByCourse = async (courseId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/class/classes/course/${courseId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching classes by course:', error);
  }
};
```

#### Update Class
```javascript
const updateClass = async (classId, updateData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/class/update-class/${classId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating class:', error);
  }
};
```

## Class API Error Handling

All class endpoints return consistent error responses with the following structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

## Class API Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields)
- `404` - Not Found (class, course, or semester not found)
- `409` - Conflict (duplicate class name for same course and semester)
- `500` - Internal Server Error

## Class API Notes

1. **Unique Constraint**: Class names must be unique within the same course and semester combination
2. **Required Fields**: All fields (name, course, semester) are required when creating a class
3. **Reference Validation**: Course and semester IDs must exist in the database
4. **Population**: All responses include populated course and semester information
5. **Partial Updates**: When updating, only provide the fields you want to change
6. **Cascading**: Deleting a class does not affect the associated course or semester
7. **Indexing**: The API uses database indexes for optimal query performance on course and semester references
8. **Filtering**: Use the course and semester filter endpoints for efficient data retrieval
