# 🔍 AponKhoj - Missing & Found Persons Platform

A full-stack web application to help find missing persons and report found individuals in Bangladesh.

---

## 📋 Project Overview

**AponKhoj** is a community-driven platform that enables users to:
- 📱 Report missing persons with details and photos
- 🔎 Search for missing persons in their area
- ✅ Report found persons to help reunite them with families
- 👨‍💼 Manage user profiles and reports
- 🛡️ Admin moderation and content management

---

## ✨ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide Icons** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - API framework
- **Prisma ORM** - Database ORM
- **MSSQL Server** - Database

---

## 📋 Prerequisites

Make sure the following are installed:

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **npm** >= 9.x (comes with Node.js)
- **MSSQL Server** (Local or Cloud instance)
- **Git**
- **VS Code** (Recommended)

---

## 🚀 Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AsmitaEsha/AponKhoj-Database.git
cd AponKhoj-Database
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..