# 🚛 FleetFlow — Smart Fleet Management System
A full-stack fleet management web application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). FleetFlow helps logistics companies manage vehicles, drivers, trips, expenses, and maintenance — all from a single, unified dashboard.
---
**PPT Link(Major Implemented and useful Features):**[Link](https://www.canva.com/design/DAHB8p7lixA/jNTep2ajko_fZ6JUSAWGdw/edit?utm_content=DAHB8p7lixA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
## ✨ Features
### 📊 Dashboard
- **KPI Cards** — Active fleet, maintenance alerts, utilization rate, pending cargo (with descriptive subtitles)
- **Trip Status Donut Chart** — Visual breakdown of Draft, Dispatched, Completed, Cancelled trips
- **Recent Trips Table** — Last 5 trips at a glance
- **Driver Availability Bar** — Stacked bar showing On Duty / Off Duty / Suspended
- **Fleet Sorting Tools** — Filter vehicles by type (Truck/Van/Bike) and status (Ready/Busy/In Shop)
- **Quick Actions** — Role-gated navigation shortcuts
- **Rule-Breaker Feed** — Real-time alerts for safety violations (Admin/Fleet Manager/Safety Officer only)
### 🚗 Vehicle Management
- Full CRUD for vehicles (Truck, Van, Bike)
- Vehicle detail modal with KPI cards, quick actions
- Status tracking: Available, On Trip, In Shop
- Odometer, capacity, license plate, acquisition cost tracking
### 👤 Driver Management
- Driver profiles with license details and status
- Status management: On Duty, Off Duty, Suspended, Banned
- License expiry and penalty tracking
- Safety alert integration
### 📦 Trip Management
- **3-Step Wizard**: Details → Assign → Confirm
- Auto-generated trip codes (T-YYYYMMDD-###)
- Vehicle and driver assignment with availability checks
- Estimated fuel cost and revenue fields
- Trip lifecycle: Draft → Dispatched → Completed / Cancelled
- Cargo weight, distance, and date tracking
### 💰 Expense Management
- Trip-linked expense recording (fuel, miscellaneous costs)
- Status lifecycle: Pending → Approved → Recorded
- Role-based approval (Financial Analyst / Admin)
- **CSV Export** with properly formatted dates
- Detail modal with cost breakdown
### 🔧 Maintenance Records
- Service type, cost, and odometer tracking
- Status management: Open → Completed
- Vehicle-linked maintenance history
- Detail modal with quick action to mark as completed
### 📈 Analytics & Reports
- **KPI Summary** — Total Fuel Cost, Fleet ROI %, Utilization Rate, Maintenance Cost
- **Fuel Efficiency Trend** — km/L line chart across trips
- **Top 5 Costliest Vehicles** — Bar chart visualization
- **Financial Summary of Month** — Revenue, Fuel, Maintenance, Net Profit table
- **Vehicle Revenue vs Costs** — Grouped bar chart
- **Fleet Utilization Doughnut** — Available vs On Trip vs In Shop
- **Per-Vehicle ROI Cards** — Individual ROI percentages
- **Dead Stock Detection** — Identifies underutilized vehicles
- **PDF Report Download** — Vehicle ROI report with summary
### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC):
  - **Admin** — Full access
  - **Fleet Manager** — Vehicles, drivers, trips
  - **Financial Analyst** — Expenses management
  - **Safety Officer** — Driver monitoring, alerts
  - **Viewer** — Read-only dashboard access
- Secure password hashing with bcryptjs
### ⚠️ Alerts System
- Rule-breaker severity levels (Low, Medium, High, Critical)
- Entity-linked alerts (Vehicle, Driver, Trip)
- Resolve/dismiss workflow
- Role-gated visibility
---
## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router v7, Vite 7, Chart.js, jsPDF |
| **Backend** | Node.js, Express.js 4 |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT, bcryptjs |
| **Styling** | Vanilla CSS (Google Lite aesthetic) |
| **Icons** | react-icons (Material Design) |
| **HTTP Client** | Axios |
---
## 📁 Project Structure
```
Fleet Flow/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── api/               # Axios instance
│   │   ├── components/        # Reusable components (Modal, Navbar, Sidebar, etc.)
│   │   ├── context/           # Auth context provider
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Vehicles.jsx
│   │   │   ├── Drivers.jsx
│   │   │   ├── Trips.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── utils/             # Helper functions & copy constants
│   │   └── index.css          # Global stylesheet
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express Backend
│   ├── models/                # Mongoose schemas
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Trip.js
│   │   ├── Expense.js
│   │   ├── Maintenance.js
│   │   ├── Alert.js
│   │   └── User.js
│   ├── routes/                # API route handlers
│   │   ├── vehicles.js
│   │   ├── drivers.js
│   │   ├── trips.js
│   │   ├── expenses.js
│   │   ├── maintenance.js
│   │   ├── analytics.js
│   │   ├── alerts.js
│   │   ├── auth.js
│   │   └── users.js
│   ├── middleware/            # Auth & RBAC middleware
│   ├── seed.js                # Database seeder
│   ├── index.js               # Server entry point
│   └── package.json
│
└── README.md
```
---
## 🚀 Getting Started
### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** or **yarn**
### 1. Clone the Repository
```bash
git clone https://github.com/Jenil-Mungalpara/ODOO-HACKATHON-PROJECT-2026.git
cd fleet-flow
```
### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fleetflow?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```
### 3. Seed the Database (Optional)
```bash
npm run seed
```
This populates sample vehicles, drivers, trips, expenses, and users.
### 4. Setup Frontend
```bash
cd ../client
npm install
```
### 5. Run the Application
**Start backend** (from `server/`):
```bash
npm run dev
```
**Start frontend** (from `client/`):
```bash
npm run dev
```
The app will be available at **http://localhost:5173** with the API proxied to port 5000.
---
## 🔌 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/vehicles` | Create vehicle |
| `PUT` | `/api/vehicles/:id` | Update vehicle |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle |
| `GET` | `/api/drivers` | List all drivers |
| `POST` | `/api/drivers` | Create driver |
| `PUT` | `/api/drivers/:id` | Update driver |
| `DELETE` | `/api/drivers/:id` | Delete driver |
| `GET` | `/api/trips` | List all trips |
| `POST` | `/api/trips` | Create trip |
| `PUT` | `/api/trips/:id` | Update trip |
| `DELETE` | `/api/trips/:id` | Delete trip |
| `GET` | `/api/expenses` | List all expenses |
| `POST` | `/api/expenses` | Create expense |
| `PUT` | `/api/expenses/:id` | Update expense |
| `DELETE` | `/api/expenses/:id` | Delete expense |
| `GET` | `/api/maintenance` | List all maintenance records |
| `POST` | `/api/maintenance` | Create maintenance record |
| `PUT` | `/api/maintenance/:id` | Update record |
| `GET` | `/api/analytics/dashboard` | Dashboard stats |
| `GET` | `/api/analytics/vehicle-roi` | Vehicle ROI data |
| `GET` | `/api/analytics/fuel-efficiency` | Fuel efficiency data |
| `GET` | `/api/analytics/utilization` | Fleet utilization |
| `GET` | `/api/analytics/monthly-summary` | Monthly financial summary |
| `GET` | `/api/alerts` | List alerts |
| `POST` | `/api/alerts` | Create alert |
| `PUT` | `/api/alerts/:id/resolve` | Resolve alert |
---
## 👥 Default Roles
| Role | Permissions |
|------|------------|
| **Admin** | Full system access |
| **Fleet Manager** | Manage vehicles, drivers, trips |
| **Financial Analyst** | Manage expenses, view analytics |
| **Safety Officer** | Monitor drivers, manage alerts |
| **Viewer** | Read-only dashboard access |
---
## 📸 Key Screens
1. **Dashboard** — KPI overview with charts, filters, and quick actions
2. **Trips** — 3-step wizard for trip creation and management
3. **Analytics** — ROI analysis, fuel efficiency, financial summaries
4. **Vehicles / Drivers / Expenses / Maintenance** — Full CRUD with detail modals
---
## 📄 License
This project is for educational and demonstration purposes.
---
Built with ❤️ using the MERN Stack
