# HCM Lite — Human Capital Management System

A web-based Human Capital Management (HCM) application designed to manage employees, attendance, leave requests, and payroll through role-based dashboards.

## 🚀 Project Overview

HCM Lite provides a centralized interface for managing essential HR operations. It includes separate dashboards and management modules for Admin, HR, and Employees.

## ✨ Features

- **Authentication:** User signup and login with Firebase Authentication.
- **Role-Based Dashboards:** Separate dashboards for Admin, HR, and Employees.
- **HR Management:** Manage HR-related requests.
- **Employee Management:** View and manage employee records.
- **Attendance Management:** Record and view attendance information.
- **Leave Management:** Submit and manage leave requests.
- **Payroll Management:** Enter salary details and view payroll records.
- **Responsive UI:** User-friendly interface built with Tailwind CSS.
- **Protected Routes:** Restrict page access according to user roles.

## 🛠️ Technologies Used

- React.js
- JavaScript (ES6+)
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- React Router
- React Toastify
- Vite

## 📁 Project Structure

```text
src/
├── Auth/
│   ├── dashboard.jsx
│   ├── login.jsx
│   ├── signup.jsx
│   ├── adminDashboard.jsx
│   ├── hrDashboard.jsx
│   ├── hrManagement.jsx
│   ├── employeeManagement.jsx
│   ├── attendanceManagement.jsx
│   ├── leaveManagement.jsx
│   └── payrollManagement.jsx
├── components/
│   ├── button.jsx
│   ├── input.jsx
│   ├── ProtectedRoute.jsx
│   └── Sidebar.jsx
├── firebase/
│   └── config.js
├── App.jsx
└── main.jsx
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the project folder

```bash
cd YOUR_PROJECT_FOLDER
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure Firebase

Create a Firebase project and configure Firebase Authentication and Cloud Firestore. Add your Firebase configuration to the appropriate configuration file.

**Security note:** Never commit private credentials or sensitive environment configuration to a public repository.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal.

## 👥 User Roles

- **Admin:** Access to administrative dashboards and management modules.
- **HR:** Access to HR operations, employee records, attendance, leave requests, and payroll.
- **Employee:** Access to the employee dashboard and applicable employee features.

## 🎯 Project Goal

The goal of HCM Lite is to simplify everyday HR operations by bringing employee information and essential workforce management tools into one application.

## 👨‍💻 Developer

**Hasnain Tanoli**

- GitHub: https://github.com/hasnaintanoli5656-bit
- LinkedIn: https://linkedin.com/in/hasnain-tanoli-92a057414/
- Email: hasnaintanoli5656@gmail.com
