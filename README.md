# College Management System (CMS)

Welcome to the College Management System (CMS). This project is designed to comprehensively manage and control student records and college operations using a suite of interconnected applications. 

## Project Structure

This repository is organized into several dedicated modules, each serving a specific role within the system:

### 1. `cmsw` (Server / Backend)
The core backend server that provides the RESTful API and database integration for all client applications. It handles the central business logic, user authentication, and data management. Built with Node.js.

### 2. `cmsx` (Student App)
A mobile application specifically designed for students. It allows students to access their records, view courses, track attendance, and interact with the college system directly from their devices. Built with React Native / Expo.

### 3. `cmst` (Teacher App)
A mobile application tailored for teachers. It provides tools for teachers to manage their classes, update student academic records, handle attendance, and communicate effectively. Built with React Native / Expo.

### 4. `cmsd` (Admin Dashboard)
A web-based dashboard for college administrators. It offers a comprehensive administrative interface to oversee the entire system, manage users (students and teachers), and monitor college operations. Built with React / Vite.

### 5. `cmsl` (Library System)
A web application dedicated to the college library staff. It manages library resources, book inventory, issuing, and returning of books. Built with React / Vite.

## Overview

The CMS aims to digitalize and streamline college administration by offering dedicated, user-friendly interfaces for each stakeholder—Students, Teachers, Admins, and Librarians—while maintaining a single, unified source of truth via the central server.
