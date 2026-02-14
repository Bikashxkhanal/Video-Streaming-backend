# 🎬🚀 Video Streaming Backend API

> A **modern, scalable, and secure video streaming backend** built with **Node.js, Express.js, MongoDB, and Mongoose**. Designed with real-world backend practices, clean architecture, API versioning, and optimized database queries.

---

## 🛠️ Tech Stack

🟢 **Node.js**
⚡ **Express.js**
🍃 **MongoDB + Mongoose**
🔐 **JWT Authentication**
📤 **Multer** (file uploads)
☁️ **Cloudinary** (media storage)

---

## 🔐 Authentication (JWT)

### ✅ Integrated Features

* Secure user authentication using JWT
* Access-protected API routes
* Middleware-based token verification
* Scalable authentication structure

---

## 👤 User Module (v1)

### ✅ Integrated Features

* User registration
* User login & logout
* Update user profile details
* Fetch user watch history

### 🖼️ Media Support

* Avatar image
* Cover image

All user-related media is handled via **Multer** and stored on **Cloudinary**.

Video uploads are processed using **Multer** and stored on **Cloudinary**.

## 📊 MongoDB Aggregation Pipelines

### ✅ Integrated Usage

* User watch history computation
* Cross-collection joins (users ↔ videos)
* Server-side filtering & sorting
* Pagination-ready queries

Designed to keep controllers thin and logic database-driven.

---

## 📤 File Upload System

🧩 **Multer** handles multipart data
☁️ **Cloudinary** stores all media
🧹 Local cleanup after upload

Supports:

* User avatar
* Cover image
* Video file
* Video thumbnail

---

## ☁️ Cloudinary Media Storage

🌐 Cloud-based & CDN-backed
⚡ Optimized video delivery
🔒 Secure asset handling
🎨 Image & video transformations

---

## 🧭 API Versioning

```
/api/v1/users
/api/v1/videos
```

✔ Clean upgrades
✔ Backward compatibility
✔ Production-ready structure
---
## 🛡️ Security & Reliability Considerations

### 🔐 Security

* Password hashing before persistence
* JWT validation on protected routes
* Centralized error handling
* Safe request parsing & validation-ready setup

### ⚙️ Backend Quality Practices

* Versioned APIs for backward compatibility
* Separation of concerns (routes, controllers, models)
* Reusable middleware architecture
* Clean response structure

### 🚀 Streaming-Ready Design

* Cloud-based media storage (Cloudinary)
* Optimized data fetching via aggregation
* Scalable schema design
* CDN-backed media delivery

## 👨‍💻 Author

**Bikash Khanal**
Backend Developer | Node.js | MongoDB | REST APIs
---


⭐ *Star this repo if you like clean backend architecture!*
