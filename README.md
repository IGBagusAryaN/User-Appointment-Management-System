## 📄 Documentation

[![Video Documentation](https://img.youtube.com/vi/uDtvEguE9jg/0.jpg)](https://youtu.be/uDtvEguE9jg)

### 📷 Screenshots
![Register Page](./photo%20documentation/Register%20Page.png)
![Login Page](./photo%20documentation/Login%20Page.png)
![Dashboard](./photo%20documentation/Dashboard.png)
![Create Form Appointment](./photo%20documentation/Create%20Form%20Appointment.png)
![Handling Timezone](./photo%20documentation/Handling%20Timezone.png)
![Edit Form Appointment](./photo%20documentation/Edit%20Form%20Appointment.png)
![Delete Appointment](./photo%20documentation/Delete%20Appointment.png)
![Logout](./photo%20documentation/Logout.png)

---

### ✨ Features
- JWT authentication using username
- Basic session management (expires after 1 hour)
- User management (register, login)
- Appointment CRUD
- Minimalistic user interface

---

### 🔙 Backend Tech Stack:
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- dotenv
- dayjs

---

### 🔜 Frontend Tech Stack:
- React + TypeScript
- Vite
- Tailwind CSS
- Zod (form validation)
- react-select (async select)
- js-cookie
- Zustand (state management)
- dayjs



### Instalasi Backend 
Clone repositori:
```bash
git clone https://github.com/username/nama-repo.git
cd backend


# .env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/user_appointment_management_db?schema=public"
JWT_SECRET="super_secret_key"
JWT_EXPIRES_IN="1h"
PORT=3000

# Setup Prisma
npx prisma migrate dev --name init
npx prisma generate

# Run
npm run dev
```

### Instalasi Frontend
Clone repositori:
```bash
git clone https://github.com/username/nama-repo.git
cd frontend

# Install dependencies
npm install

# Jalankan frontend
npm run dev

# .env
VITE_API_URL = http://localhost:3000/api/
