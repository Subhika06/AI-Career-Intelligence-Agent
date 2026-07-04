# 🚀 AI Career Intelligence Agent

An AI-powered web application that helps students and job seekers analyze their resumes, identify skill gaps, receive personalized career recommendations, generate learning roadmaps, prepare for interviews, and improve resume quality using Google Gemini AI.

---

## 📌 Features

* 🔐 User Registration & Login
* 📄 Resume Upload (PDF/DOCX)
* 🤖 AI-Powered Resume Analysis
* 📊 Skill Gap Analysis
* 💼 Career Recommendations
* 🗺️ Personalized Learning Roadmap (30/60/90 Days)
* 🎯 Interview Preparation (Technical & HR Questions)
* ✨ Resume Improvement Suggestions
* 📋 Job Recommendations
* 📈 Career Dashboard
* 📥 Download Career Report

---

## 🛠️ Tech Stack

### Backend

* Java 17
* Spring Boot
* Spring MVC
* Spring Data JPA
* Maven

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap 5

### Database

* MySQL

### AI Integration

* Google Gemini API
* Prompt Engineering

### Tools

* VS Code
* Git
* GitHub

---

## 📂 Project Structure

```
AI-Career-Intelligence-Agent/
│── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── model/
│   │   │   ├── dto/
│   │   │   ├── config/
│   │   │   ├── util/
│   │   │   └── exception/
│   │   ├── resources/
│   │   ├── static/
│   │   └── templates/
│── pom.xml
│── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI-Career-Intelligence-Agent.git
```

### 2. Open the Project

Open the project in **VS Code** or **IntelliJ IDEA**.

### 3. Configure MySQL

Create a database:

```sql
CREATE DATABASE career_agent;
```

Update the database credentials in:

```
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/career_agent
spring.datasource.username=root
spring.datasource.password=your_password
```

### 4. Add Gemini API Key

Add your Google Gemini API key in the appropriate configuration file or environment variable.

### 5. Run the Application

```bash
mvn spring-boot:run
```

The application will start on:

```
http://localhost:8080
```

---

## 📡 API Endpoints

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| POST   | /register          | Register User             |
| POST   | /login             | User Login                |
| POST   | /uploadResume      | Upload Resume             |
| POST   | /analyzeResume     | Analyze Resume            |
| POST   | /skillGap          | Skill Gap Analysis        |
| POST   | /careerSuggestion  | Career Recommendations    |
| POST   | /learningPlan      | Generate Learning Roadmap |
| POST   | /interviewPrep     | Interview Preparation     |
| POST   | /resumeImprove     | Resume Suggestions        |
| POST   | /jobRecommendation | Job Recommendations       |
| GET    | /careerReport      | Download Career Report    |

---

## 📷 Screenshots

Add screenshots of the following pages:

* Home
* Login
* Dashboard
* Resume Upload
* AI Analysis
* Skill Gap Analysis
* Learning Roadmap
* Interview Preparation
* Career Report

---

## 🔮 Future Enhancements

* Resume ATS Score
* Live Job Portal Integration
* AI Chat Assistant
* Email Notifications
* Progress Tracking
* PDF Report Export
* Dark Mode

---

## 👩‍💻 Author

**Subhika Sekar**

Java Full Stack Developer | AI Enthusiast

---

## 📄 License

This project is developed for learning, academic, and portfolio purposes.
