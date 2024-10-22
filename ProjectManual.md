# AI Placement Management System Manual

## Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Project Setup](#project-setup)
4. [Project Structure](#project-structure)
5. [Features](#features)
6. [User Roles](#user-roles)
7. [How It Works](#how-it-works)
8. [API Endpoints](#api-endpoints)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 1. Introduction

The AI Placement Management System is a web application designed to assist students in their job placement process and help Training and Placement Officers (TPOs) manage job listings. The system uses AI to analyze resumes, provide interview preparation, and recommend jobs based on students' profiles.

## 2. System Requirements

- Node.js (v14 or later)
- npm (v6 or later)
- Python (v3.7 or later)
- MongoDB

## 3. Project Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/ai-placement-management-system.git
   cd ai-placement-management-system
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory
   - Add the following variables:
     ```
     MONGO_URI=mongodb://localhost:27017/ai_placement_db
     JWT_SECRET_KEY=your_secret_key_here
     HUGGINGFACE_TOKEN=your_huggingface_token_here
     ```

5. Start the backend server:
   ```
   python app.py
   ```

6. In a new terminal, start the frontend development server:
   ```
   npm run dev
   ```

## 4. Project Structure

- `/src`: Frontend React application
  - `/components`: Reusable React components
  - `/pages`: Main page components
  - `/context`: React context for state management
- `/backend`: Flask backend application
- `/public`: Static assets

## 5. Features

1. User Authentication (Student and TPO)
2. Resume Analysis
3. Interview Preparation
4. Job Recommendations
5. TPO Dashboard for managing job listings

## 6. User Roles

1. Student:
   - Can sign up and log in
   - Upload and analyze resumes
   - Practice interview questions
   - Receive job recommendations

2. TPO (Training and Placement Officer):
   - Single account (TPO@gmail.com / 123)
   - Manage job listings
   - View student data and placement statistics

## 7. How It Works

### Authentication
- Students can sign up using email and password
- TPO has a single, predefined account
- JWT is used for maintaining user sessions

### Resume Analysis
1. Student uploads a PDF resume
2. Backend extracts text from the PDF
3. AI model analyzes the resume and provides improvement suggestions

### Interview Preparation
1. Student uploads a resume
2. AI generates relevant interview questions based on the resume
3. Student can practice answering questions
4. AI provides feedback on the answers

### Job Recommendations
1. Student uploads a resume
2. System compares resume content with available job listings
3. AI recommends the most suitable jobs based on similarity

### TPO Dashboard
- TPO can add, edit, and remove job listings
- View overall placement statistics

## 8. API Endpoints

- POST `/api/signup`: Student registration
- POST `/api/login`: User login (Student and TPO)
- GET `/api/user`: Get current user info
- POST `/api/analyze-resume`: Resume analysis and job recommendation
- POST `/api/interview-prep`: Interview preparation
- GET, POST `/api/companies`: Manage job listings (TPO only)

## 9. Deployment

1. Build the frontend:
   ```
   npm run build
   ```

2. Set up a production MongoDB database

3. Deploy the Flask backend to a cloud platform (e.g., Heroku, AWS, Google Cloud)

4. Deploy the built frontend to a static hosting service (e.g., Netlify, Vercel)

5. Update the API base URL in the frontend to point to the deployed backend

## 10. Troubleshooting

- Ensure MongoDB is running and accessible
- Check if all required environment variables are set
- Verify that the Hugging Face API token is valid
- For any API errors, check the backend console logs for detailed error messages

---

This manual provides a comprehensive overview of the AI Placement Management System. For specific code-related questions or issues, please refer to the inline comments in the source code or reach out to the development team.