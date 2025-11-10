// API Base URL
const API_BASE_URL = 'https://must-lms-backend.onrender.com/api';

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    console.log(`API Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API Response data:`, data);
    
    // Handle different response structures
    if (data.success !== undefined) {
      // Structure: {success: true, data: [...]}
      if (!data.success) {
        throw new Error(data.error || 'API call failed');
      }
      return data.data || [];
    } else if (Array.isArray(data)) {
      // Direct array response
      return data;
    } else if (data.data) {
      // Structure: {data: [...]}
      return data.data;
    } else {
      // Return data as is
      return data;
    }
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Initialize database (handled by backend)
export const initializeDatabase = async () => {
  try {
    console.log('Database initialization handled by backend server');
    // Backend server handles database initialization
    return Promise.resolve();
  } catch (error) {
    console.error('Error connecting to backend:', error);
  }
};

// Lecturer operations
export const lecturerOperations = {
  // Create lecturer
  create: async (lecturerData: {
    name: string;
    employeeId: string;
    specialization: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    return await apiCall('/lecturers', {
      method: 'POST',
      body: JSON.stringify(lecturerData),
    });
  },

  // Get all lecturers
  getAll: async () => {
    try {
      return await apiCall('/lecturers?user_type=admin');
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      return []; // Return empty array on error
    }
  },

  // Get lecturer by ID
  getById: async (id: number) => {
    return await apiCall(`/lecturers/${id}`);
  },

  // Get lecturer by employee ID
  getByEmployeeId: async (employeeId: string) => {
    return await apiCall(`/lecturers/employee/${employeeId}`);
  },

  // Update lecturer
  update: async (id: string | number, lecturerData: {
    name?: string;
    employeeId?: string;
    specialization?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    return await apiCall(`/lecturers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lecturerData),
    });
  },

  // Delete lecturer
  delete: async (id: number) => {
    return await apiCall(`/lecturers/${id}`, { method: 'DELETE' });
  }
};

// Course operations
export const courseOperations = {
  // Create college
  createCollege: async (collegeData: {
    name: string;
    shortName: string;
    description: string;
    established: string;
  }) => {
    return await apiCall('/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData),
    });
  },

  // Create department
  createDepartment: async (departmentData: {
    name: string;
    collegeId: number;
    description: string;
    headOfDepartment: string;
  }) => {
    return await apiCall('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  },

  // Create course
  createCourse: async (courseData: {
    name: string;
    code: string;
    departmentId: number;
    duration: number;
    academicLevel: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
    description: string;
  }) => {
    return await apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  // Create program
  createProgram: async (programData: {
    name: string;
    courseId: number;
    lecturerName: string;
    credits: number;
    totalSemesters: number;
    description: string;
  }) => {
    return await apiCall('/programs', {
      method: 'POST',
      body: JSON.stringify(programData),
    });
  },

  // Get all colleges
  getAllColleges: async () => {
    try {
      return await apiCall('/colleges');
    } catch (error) {
      console.error('Error fetching colleges:', error);
      return [];
    }
  },

  // Get all departments
  getAllDepartments: async () => {
    try {
      return await apiCall('/departments');
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  // Get all courses
  getAllCourses: async () => {
    try {
      return await apiCall('/courses');
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  // Get all programs
  getAllPrograms: async () => {
    try {
      return await apiCall('/programs?user_type=admin');
    } catch (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
  },

  // Get all lecturers
  getAllLecturers: async () => {
    try {
      return await apiCall('/lecturers?user_type=admin');
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      return [];
    }
  },

  // DELETE operations
  deleteCollege: async (id: number) => {
    return await apiCall(`/colleges/${id}`, { method: 'DELETE' });
  },

  deleteDepartment: async (id: number) => {
    return await apiCall(`/departments/${id}`, { method: 'DELETE' });
  },

  deleteCourse: async (id: number) => {
    return await apiCall(`/courses/${id}`, { method: 'DELETE' });
  },

  deleteProgram: async (id: number) => {
    return await apiCall(`/programs/${id}`, { method: 'DELETE' });
  },

  // UPDATE operations
  updateCollege: async (id: number, data: {
    name: string;
    shortName: string;
    established: string;
    description: string;
  }) => {
    return await apiCall(`/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateDepartment: async (id: number, data: {
    name: string;
    collegeId: number;
    headOfDepartment: string;
    description: string;
  }) => {
    return await apiCall(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateCourse: async (id: number, data: {
    name: string;
    code: string;
    departmentId: number;
    duration: number;
    academicLevel: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
    description: string;
  }) => {
    return await apiCall(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateProgram: async (id: number, data: {
    name: string;
    courseId: number;
    lecturerName: string;
    credits: number;
    totalSemesters: number;
    duration: number;
    description: string;
  }) => {
    return await apiCall(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Student operations
export const studentOperations = {
  // Create student
  create: async (studentData: {
    name: string;
    registration_number: string;
    academic_year: string;
    course_id: number;
    course_name: string;
    department_name: string;
    college_name: string;
    academic_level: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
    current_semester: number;
    email: string;
    phone: string;
    status: string;
  }) => {
    return await apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  // Get all students
  getAll: async () => {
    try {
      return await apiCall('/students?user_type=admin');
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Get student by registration number
  getByRegistrationNumber: async (registrationNumber: string) => {
    try {
      return await apiCall(`/students/registration/${registrationNumber}`);
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  },

  // Update student
  update: async (id: number, studentData: {
    name: string;
    registration_number: string;
    academic_year: string;
    course_id: number;
    course_name: string;
    department_name: string;
    college_name: string;
    academic_level: 'certificate' | 'diploma' | 'bachelor' | 'masters' | 'phd';
    current_semester: number;
    email: string;
    phone: string;
    status: string;
  }) => {
    return await apiCall(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  // Delete student
  delete: async (id: number) => {
    return await apiCall(`/students/${id}`, { method: 'DELETE' });
  }
};

// Password management operations
export const passwordOperations = {
  // Authenticate user
  authenticate: async (username: string, password: string, userType: 'lecturer' | 'student' | 'admin') => {
    try {
      console.log('=== ADMIN AUTHENTICATION ATTEMPT ===');
      console.log('Username:', username);
      console.log('User Type:', userType);
      console.log('API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, userType }),
      });
      
      const data = await response.json();
      console.log('Authentication Response:', data);
      
      if (data.success && data.data) {
        return {
          user_id: data.data.id,
          username: data.data.username || data.data.name,
          name: data.data.name,
          email: data.data.email,
          ...data.data
        };
      }
      
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
};
