# ⚽ Turfivo - Premium Turf Booking System

Turfivo is a comprehensive, full-stack platform designed to revolutionize the way sports turfs are managed and booked. Built with a focus on premium aesthetics and seamless user experience, it caters to three distinct user roles: Super Admins, Turf Owners, and Customers.

## ✨ Key Features

### 🏢 Super Admin Panel
- **System Overview**: Monitor platform-wide revenue, active turfs, and total users.
- **Moderation**: Approve or reject new turf listings to maintain quality.
- **Global Booking View**: Track all reservations across the entire platform.
- **Revenue Analytics**: Filter platform earnings by weekly, monthly, or yearly periods.

### 🏟️ Turf Owner Panel
- **Listing Management**: Add and edit turf details, pricing, and high-quality galleries.
- **Dynamic Scheduling**: Manage time slots and availability with ease.
- **Revenue Dashboard**: Track individual turf performance and payouts.
- **Booking Management**: View and update the status of incoming booking requests.

### 👤 Customer Experience
- **Interactive Explore**: Filter turfs by location, price, and sport type.
- **Premium Detail Pages**: View facilities, reviews, and interactive galleries.
- **Smart Booking**: Intuitive calendar for slot selection and cost distribution.
- **Cost Splitter**: Calculate and share costs with friends via a personalized invitation message.
- **Personal Dashboard**: Track upcoming matches and manage booking history.

---

## 🔐 Test Login Credentials

To explore the platform's features across different roles, use the following pre-configured accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@turf.com` | `Admin123!` |
| **Turf Owner** | `owner@example.com` | `password123` |
| **Customer** | `customer@example.com` | `password123` |

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js (Auth.js)](https://authjs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: Framer Motion, Date-fns

---

## 🛠️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Manasi-W/turf-booking-system.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file based on the provided configuration for Database URL and NextAuth secrets.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
