# 🚚 FleetFlow – Modular Fleet & Logistics Management System

FleetFlow is a centralized, rule-based fleet management system built for the **Odoo Hackathon**.  
It replaces manual logbooks with a digital platform to manage **vehicles, drivers, trips, maintenance, safety, and finances**.

---

## 🧩 Problem Statement

Fleet operations are often managed using:
- Paper logbooks
- Manual dispatching
- Scattered expense records

This leads to:
- Unsafe trip assignments
- Poor vehicle maintenance
- No cost visibility
- No data-driven decisions

**FleetFlow solves this by providing one unified system for complete fleet lifecycle management.**

---

## 👥 User Roles

FleetFlow uses **Role-Based Access Control (RBAC)**.

- **Fleet Manager** – Vehicle & maintenance management  
- **Dispatcher** – Trip creation and assignment  
- **Safety Officer** – Driver compliance and safety  
- **Financial Analyst** – Expense tracking and reports  

Each role only sees the pages relevant to them.

---

## 🔐 Authentication

- Sign Up & Sign In using email and password
- Role selected during registration
- Secure access to pages based on role
- Unauthorized actions are blocked

---

## 📊 Main Dashboard (Command Center)

A quick overview of fleet operations:

- Active vehicles (On Trip)
- Vehicles in maintenance
- Available vehicles
- Fleet utilization rate
- Pending trips
- Maintenance alerts
- Driver license expiry alerts
- Recent trip summary
- Basic fuel & maintenance cost snapshot

Includes a **role-based navigation bar**.

---

## 🚘 Vehicle Registry (Asset Management)

Manages all fleet vehicles.

### Features:
- Add, edit, and view vehicles
- Track license plate, capacity, odometer
- Vehicle status:
  - Available
  - On Trip
  - In Shop
  - Retired
- Upload vehicle documents (insurance, permits)
- Expiry alerts
- Maintenance due indicators

Vehicles marked **In Shop** or **Retired** cannot be assigned to trips.

---

## 📦 Trip Dispatcher & Management

Handles daily delivery operations.

### Features:
- Create and manage trips
- Assign available vehicle and driver
- Cargo weight validation
- Trip lifecycle:
  **Draft → Dispatched → Completed → Cancelled**
- Visual timeline showing trip progress
- Automatic vehicle & driver status updates

Prevents unsafe and incorrect dispatching.

---

## 🛠 Maintenance & Service Logs

Keeps vehicles healthy and road-ready.

### Features:
- Log repairs and servicing
- View maintenance history

### Auto-Hide Rule:
- When maintenance is logged:
  - Vehicle status becomes **In Shop**
  - Vehicle is hidden from dispatcher selection

Prevents broken vehicles from being dispatched.

---

## ⛽ Expense & Fuel Logging

Tracks operational costs.

### Features:
- Log fuel usage after trip completion
- Record maintenance expenses
- Expenses linked to vehicle ID
- Automatic calculation of:
  - Fuel cost
  - Maintenance cost
  - Total operational cost per vehicle

---

## 👷 Driver Performance & Safety Profiles

Manages driver compliance and safety.

### Features:
- Store license number and expiry date
- **Safety Lock Rule**:
  - Expired license → driver cannot be assigned trips
- Safety score based on trip completion and incidents
- Duty status:
  - On Duty
  - Taking a Break
  - Suspended

Only eligible drivers can be assigned.

---

## 📈 Operational Analytics & Financial Reports

Big-picture insights for decision making.

### Analytics:
- Fuel efficiency (km/L)
- Vehicle ROI
- Fleet utilization rate
- Dead stock (idle vehicle) alerts
- Costliest vehicles analysis

### Reports:
- One-click PDF and Excel export
- Monthly financial summaries
- Useful for audits, payroll, and meetings

---

## 🚀 Conclusion

FleetFlow transforms fleet operations from **manual and error-prone** to **digital, safe, and data-driven**, helping organizations improve efficiency, safety, and profitability.

---

### Built for 🚀 Odoo Hackathon
