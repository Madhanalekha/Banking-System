# Banking System - Week 1

## Project Overview

Week 1 focuses on setting up the backend environment using Spring Boot, PostgreSQL, Git, and Postman. The objective is to ensure that the application can run successfully and expose basic REST APIs.

---

## Technologies Used

- Java 17
- Spring Boot
- Maven
- PostgreSQL
- Git & GitHub
- Postman
- IntelliJ IDEA

---

## Week 1 Objectives

- Set up Spring Boot project
- Configure PostgreSQL
- Create basic REST APIs
- Test APIs using Postman
- Manage project using Git
- Create project documentation

---

## Project Structure

```
banking-system
│
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com.gct.banking_system
│   │   └── resources
│   │       └── application.properties
│   └── test
│
├── pom.xml
├── README.md
└── .gitignore
```

---

## REST APIs

### Health Check API

**Method**

```
GET
```

**URL**

```
http://localhost:8080/health
```

**Response**

```text
Application is Running Successfully
```

---

### Application Information API

**Method**

```
GET
```

**URL**

```
http://localhost:8080/api/info
```

**Sample Response**

```json
{
  "project": "Mini Banking System",
  "version": "1.0",
  "status": "Running"
}
```

---

## Database Configuration

Database: PostgreSQL

Database Name:

```
banking_db
```

Spring Boot connects to PostgreSQL using the configuration in `application.yml`.

---

## Postman Testing

The REST APIs were tested successfully using Postman.

- GET /health
- GET /api/info

---

## Git Workflow

- Initialized Git repository
- Added project files
- Committed changes
- Pushed project to GitHub

---

## Week 1 Progress

| Task | Status      |
|------|-------------|
| Spring Boot Project Setup |  Completed |
| PostgreSQL Setup |  Completed  |
| REST API Development | Completed   |
| Postman Testing | Completed   |
| Git Repository | Completed   |
| GitHub Push | Completed   |
| README Documentation | Completed   |

---

## Author

**Madhanalekha L**

Government College of Technology (GCT)

Department of Computer Science and Engineering