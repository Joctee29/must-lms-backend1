# MUST LMS - Learning Management System

A modern Learning Management System split into three independent role-based systems for Mbeya University of Science and Technology.

## 🎯 System Overview

This LMS has been split into three independent systems:

- **🎓 Lecture System** (Port 3000) - For instructors and lecturers
- **📚 Student System** (Port 3001) - For students and learners  
- **⚙️ Admin System** (Port 3002) - For administrators

## 🚀 Quick Start

### Option 1: Automatic Start (Recommended)
Double-click `quick-start.bat` to automatically:
- Install all dependencies
- Start all three systems
- Open web browsers for each system

### Option 2: Manual Start
```bash
# Start Lecture System
cd lecture-system
npm install
npm run dev  # Runs on http://localhost:3000

# Start Student System  
cd student-system
npm install
npm run dev  # Runs on http://localhost:3001

# Start Admin System
cd admin-system
npm install  
npm run dev  # Runs on http://localhost:3002
```

## 📁 Project Structure

```
mbaya-learn-hub-main/
├── lecture-system/     # Instructor portal (Port 3000)
├── student-system/     # Student portal (Port 3001)
├── admin-system/       # Admin portal (Port 3002)
├── quick-start.bat     # Auto-start all systems
├── start-systems.bat   # Alternative start script
└── README.md
```

## 🎓 System Features

### Lecture System (Instructors)
- Course content management
- Student progress tracking
- Assignment creation and grading
- Lecture scheduling
- Student communications

### Student System (Learners)
- Course enrollment and access
- Assignment submission
- Progress tracking
- Discussion forums
- Achievement badges

### Admin System (Administrators)
- User management
- System configuration
- Analytics and reports
- Security settings
- Database management

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Components**: ShadCN UI

## 🌐 Access URLs

- **Lecture System**: http://localhost:3000
- **Student System**: http://localhost:3001  
- **Admin System**: http://localhost:3002

## 📋 Requirements

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

## 🎨 Design

Each system maintains the same professional MUST branding and UI design while providing role-specific functionality and navigation tailored to different user types.

---

**Mbeya University of Science and Technology**  
*Chuo Kikuu cha Sayansi na Teknolojia Mbeya*
