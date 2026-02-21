/**
 * Centralized UI copy constants for FleetFlow.
 * Import from here rather than hardcoding strings in components.
 */

/* ──── General ─────────────────────────────── */
export const APP_NAME = 'FleetFlow';
export const DATE_FORMAT = { day: '2-digit', month: 'short', year: 'numeric' };    // "21 Feb 2026"
export const LOCALE = 'en-IN';
export const CURRENCY = '₹';

export const EMPTY_STATE_TITLE = 'Nothing to show yet';
export const EMPTY_STATE_HELP  = 'Create a new record or run a quick simulation to populate this screen.';
export const LOADING_TEXT = 'Loading…';
export const TOAST_SAVE_OK = 'Saved successfully.';
export const TOAST_SAVE_ERR = 'Something went wrong. Try again.';
export const SEARCH_PLACEHOLDER = 'Search by name, id, or plate...';
export const FILTER_HINT = 'Filter by status, type, or date range';
export const EXPORT_TOOLTIP = 'Export CSV / PDF';

/* ──── Buttons ─────────────────────────────── */
export const BTN_CONFIRM = 'Confirm';
export const BTN_CANCEL  = 'Cancel';
export const BTN_CLOSE   = 'Close';

/* ──── Auth ────────────────────────────────── */
export const LOGIN_TITLE       = 'Sign in to FleetFlow';
export const LOGIN_SUBTITLE    = 'Secure access to your fleet operations.';
export const EMAIL_LABEL       = 'Email';
export const EMAIL_PLACEHOLDER = 'you@company.com';
export const PASSWORD_LABEL    = 'Password';
export const PASSWORD_PLACEHOLDER = 'Enter your password';
export const REMEMBER_ME       = 'Remember me';
export const BTN_SIGN_IN       = 'Sign in';
export const FORGOT_LINK       = 'Forgot password?';
export const SIGNUP_LINK       = 'Create an account';
export const SIGNUP_TITLE      = 'Create your FleetFlow account';
export const BTN_SIGNUP        = 'Create account';
export const SIGNUP_ROLE_LABEL = 'Role';
export const PASSWORD_RULES    = 'Password must be at least 8 characters.';
export const FORGOT_TITLE      = 'Reset your password';
export const FORGOT_INSTRUCTION = "Enter your email and we'll send a recovery link.";
export const RESET_SUCCESS     = 'Your password has been updated.';

/* ──── Dashboard ───────────────────────────── */
export const DASHBOARD_SUBTITLE = 'Operational overview — rule-based safety and rapid dispatch';
export const KPI_ACTIVE_FLEET   = 'Active Fleet';
export const KPI_IN_SHOP        = 'Vehicles In Shop';
export const KPI_UTILIZATION    = 'Utilization Rate';
export const KPI_PENDING_CARGO  = 'Pending Cargo';
export const KPI_HELPER         = 'Last 24h';
export const RULE_BREAKER_HEADING = 'Rule-Breaker Feed';
export const RULE_BREAKER_EMPTY   = 'No current rule violations.';
export const QUICK_ACTION_BTN    = 'Create Trip';
export const QUICK_ACTION_HINT   = 'Simulate trip & see ROI';
export const QUICK_ACTION_TOOLTIP = 'Run a quick demo trip to show cost & ROI impact.';
export const WHY_MATTERS_BLURB   = 'Proactive maintenance reduces downtime and lowers operating costs.';

/* ──── Demo / Judge ────────────────────────── */
export const DEMO_BANNER = "For judges: Use 'Simulate trip & see ROI' to run a short demo of cost impact.";
export const DEMO_CTA    = 'Run demo';

/* ──── Vehicles ────────────────────────────── */
export const VEHICLES_TITLE      = 'Vehicles';
export const VEHICLES_ADD_BTN    = 'Add vehicle';
export const VEHICLES_EMPTY      = 'No vehicles yet. Add your first vehicle.';
export const VEHICLE_FORM_TITLE  = 'Add vehicle';
export const VEHICLE_NAME_LABEL  = 'Vehicle (Make & Model)';
export const VEHICLE_NAME_PH     = 'e.g., Ford F-350';
export const VEHICLE_PLATE_LABEL = 'License plate';
export const VEHICLE_PLATE_PH    = 'e.g., TRK-42';
export const VEHICLE_TYPE_LABEL  = 'Vehicle type';
export const VEHICLE_TYPE_PH     = 'Select truck, van or bike';
export const VEHICLE_LOAD_LABEL  = 'Max load (kg)';
export const VEHICLE_ODOMETER_LABEL = 'Odometer (km)';
export const VEHICLE_COST_LABEL  = 'Acquisition cost';
export const VEHICLE_STATUS_LABEL = 'Current status';
export const VEHICLE_ODOMETER_HINT = 'Used for maintenance schedules and cost tracking.';
export const VEHICLE_RETIRE_TITLE  = 'Retire vehicle?';
export const VEHICLE_RETIRE_BODY   = 'Retired vehicles remain in records for history but cannot be assigned to trips.';
export const VEHICLE_RETIRE_CONFIRM = 'Retire vehicle';

/* ──── Drivers ─────────────────────────────── */
export const DRIVERS_TITLE       = 'Drivers';
export const DRIVERS_ADD_BTN     = 'Add driver';
export const DRIVER_FORM_TITLE   = 'Add driver';
export const DRIVER_NAME_LABEL   = 'Full name';
export const DRIVER_NAME_PH      = 'e.g., Rajesh Kumar';
export const DRIVER_LICENSE_LABEL = 'License number';
export const DRIVER_LICENSE_PH   = 'DL-XXXX-000';
export const DRIVER_EXPIRY_LABEL = 'License expiry date';
export const DRIVER_EXPIRY_PH    = 'Select date';
export const DRIVER_CONTACT_LABEL = 'Contact';
export const DRIVER_CONTACT_PH   = '+91-XXXXXXXXXX';
export const SAFETY_SCORE_LABEL  = 'Safety score';
export const SAFETY_GAUGE_TOOLTIP = 'Higher is better. Below 75% triggers a warning.';
export const DRIVER_LICENSE_HINT = 'Expired licenses automatically suspend driver assignment.';
export const DRIVER_STATUS_HINT  = "Only drivers 'On Duty' are selectable for new trips.";
export const SUSPEND_TITLE       = 'Suspend driver?';
export const SUSPEND_BODY        = 'This will prevent the driver from being assigned to new trips.';
export const BAN_TITLE           = 'Ban driver permanently?';
export const BAN_BODY            = 'Banned drivers cannot be assigned and must be reviewed by Admin.';

/* ──── Trips ───────────────────────────────── */
export const TRIPS_TITLE         = 'Trips';
export const TRIPS_NEW_BTN       = 'New trip';
export const TRIPS_EMPTY         = 'No trips yet. Create a trip to get started.';
export const TRIP_WIZARD_TITLE   = 'Create Trip';
export const WIZARD_STEP_1       = 'Details';
export const WIZARD_STEP_2       = 'Assign';
export const WIZARD_STEP_3       = 'Confirm';
export const WIZARD_STEP_1_HINT  = 'Enter pickup, delivery and cargo details.';
export const WIZARD_STEP_2_HINT  = 'Select only Available vehicles and On Duty drivers.';
export const WIZARD_STEP_3_HINT  = 'Review the trip and dispatch when ready.';
export const TRIP_STATUS_CONFIRM = 'Change status to {status}?';
export const DISPATCH_CONFIRM    = 'Dispatch trip';
export const TIMELINE_TITLE      = 'Trip timeline';
export const LOG_EXPENSE_BTN     = 'Log expense';
export const EXPENSE_CTA_HINT   = 'Available after trip is Completed.';
export const TRIP_LOCKED         = 'This trip is completed and locked for edits.';

/* ──── Maintenance ─────────────────────────── */
export const MAINTENANCE_TITLE   = 'Maintenance';
export const MAINTENANCE_ADD_BTN = 'Add service log';
export const MAINTENANCE_OPEN_HINT = "Opening a service log moves the vehicle to 'In Shop' and it will not be available for dispatch.";
export const MAINTENANCE_COMPLETE_CONFIRM = 'Mark service as Completed?';

/* ──── Expenses ────────────────────────────── */
export const EXPENSES_TITLE      = 'Expenses';
export const EXPENSES_ADD_BTN    = 'Add expense';
export const EXPENSE_SAVED_TOAST = 'Expense recorded.';

/* ──── Analytics ───────────────────────────── */
export const ANALYTICS_TITLE     = 'Analytics';
export const FUEL_EFFICIENCY_LABEL = 'Fuel efficiency (km / L)';
export const VEHICLE_ROI_LABEL   = 'Vehicle ROI';
export const ROI_HELPER          = 'ROI = (Revenue - (Maintenance + Fuel)) / Acquisition cost';
export const DEAD_STOCK_LABEL    = 'Dead stock & underused vehicles';
export const DOWNLOAD_REPORT     = 'Download report';
export const PDF_TOAST           = 'Generating PDF…';
export const CSV_TOAST           = 'CSV ready. Download started.';

/* ──── Alerts / Rule-Breaker Feed ──────────── */
export const ALERT_RESOLVE_TITLE   = 'Resolve alert';
export const ALERT_RESOLVE_PH      = 'Add a short resolution note';
export const ALERT_RESOLVE_SUCCESS = 'Alert resolved.';
export const SEVERITY_LABELS = { info: 'Info', warning: 'Warning', critical: 'Critical' };

/* ──── Tooltips ────────────────────────────── */
export const TOOLTIP_UTILIZATION   = 'Percent of fleet currently generating revenue.';
export const TOOLTIP_PENDING_CARGO = 'Shipments that need dispatcher attention.';
export const TOOLTIP_MAX_LOAD      = 'Maximum safe load for this vehicle.';
export const TOOLTIP_ODOMETER      = 'Used to estimate maintenance due.';
export const TOOLTIP_SAFETY_SCORE  = 'Composite score from incidents, timeliness, and complaints.';
export const TOOLTIP_DISPATCH      = 'Assign vehicle & driver and start the trip.';
export const TOOLTIP_SIMULATE      = 'Run a quick demo trip to show ROI impact.';

/* ──── Error pages ─────────────────────────── */
export const NOT_FOUND_TITLE = 'Page not found';
export const NOT_FOUND_BODY  = "We couldn't find that page. Check the URL or return to Dashboard.";
export const SERVER_ERR_TITLE = 'Something went wrong';
export const SERVER_ERR_BODY  = 'An unexpected error occurred. Try reloading the page.';

/* ──── Navigation ──────────────────────────── */
export const NAV_LOGOUT = 'Sign out';

/* ──── Helpers ─────────────────────────────── */
export function formatDate(dateVal) {
  if (!dateVal) return '—';
  return new Date(dateVal).toLocaleDateString(LOCALE, DATE_FORMAT);
}

export function formatCurrency(amount) {
  if (amount == null) return '—';
  return `${CURRENCY}${Number(amount).toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
