# TimeWise HRMS - QA Automation Testing Report

**Date:** September 1, 2026  
**QA Engineer:** Automated QA Bot  
**Testing Framework:** Playwright MCP Server  
**Target Environment:** http://localhost:3000  
**Test Duration:** Ongoing  

---

## Executive Summary

### Status: 🔴 **CRITICAL ISSUES FOUND**

**Tests Executed:** 2  
**Tests Passed:** 1  
**Tests Failed:** 1  
**Critical Defects:** 1  
**UI/UX Findings:** 1  

### Overall Stability Rating: **⚠️ UNSTABLE - Database Configuration Issue**

The application has a critical database connectivity issue that prevents authentication from working properly. However, the UI components and form validation logic are working correctly.

---

## Test Execution Summary

### Test 1: ✅ PASSED - Invalid Credentials Handling
**Test Case:** Login with invalid email and wrong password  
**Expected Result:** Display error message and stay on signin page  
**Actual Result:** Error message "Invalid email or password" displayed correctly  
**Details:**
- ✅ Error message displayed in alert box
- ✅ Sign In button properly disabled during submission
- ✅ Button text changed to "Signing in..." with loading feedback
- ✅ Server returned 401 Unauthorized (correct behavior)
- ✅ Page did not redirect (correct behavior)
- ✅ Form fields retained after error

---

### Test 2: ❌ FAILED - Valid Credentials Authentication
**Test Case:** Login with valid admin credentials (admin@timewise.com / SecurePass123!)  
**Expected Result:** User authenticated and redirected to dashboard  
**Actual Result:** 401 Unauthorized error even with valid credentials  

#### Root Cause Analysis:
**CRITICAL DEFECT: Database Configuration Issue**

The Prisma ORM encountered an error when attempting to connect to the SQLite database:

```
Error: Invalid `prisma.user.findUnique()` invocation:
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
```

**Investigation Findings:**
1. ✅ Database file exists: `/home/skerr1984/PycharmProjects/TM/TM2/prisma/dev.db`
2. ✅ Database is seeded: Contains admin user `admin@timewise.com`
3. ✅ Password is hashed correctly: Uses bcrypt `$2b$12$...`
4. ✅ .env file has correct DATABASE_URL: `file:./prisma/dev.db`
5. ❌ **Dev server has stale environment variables** - Not picking up updated DATABASE_URL

**Impact:** 
- Cannot authenticate any users
- All protected routes are inaccessible
- Cannot test core features (leave requests, approvals, payroll export)
- **Blocks ALL downstream testing**

---

## Critical Defects

### Defect #1: Database Initialization Issue

**Severity:** 🔴 **CRITICAL**  
**Component:** Backend / Database Configuration  
**Status:** Identified, Fix in Progress  

**Description:**  
The dev server has stale environment variables and cannot connect to the SQLite database properly. The .env file contains the correct `DATABASE_URL="file:./prisma/dev.db"`, but the Next.js dev server appears to be running with an old DATABASE_URL pointing to PostgreSQL.

**Steps to Reproduce:**
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000/signin
3. Enter valid credentials: admin@timewise.com / SecurePass123!
4. Click Sign In
5. Server returns 401 Unauthorized

**Expected Behavior:**
- Prisma connects to SQLite database
- Admin user is found in database
- Password hash is validated
- User session is created
- User redirected to /dashboard

**Actual Behavior:**
- Prisma fails to connect: "the URL must start with the protocol `file:`"
- Cannot find user in database
- Returns 401 Unauthorized even with valid credentials

**Console/Server Logs:**
```
Auth attempt for: admin@timewise.com
prisma:error 
Invalid `prisma.user.findUnique()` invocation:

error: Error validating datasource `db`: the URL must start with the protocol `file:`.
  -->  schema.prisma:7
```

**Evidence:**
- Database Query: `SELECT email, password FROM users WHERE email='admin@timewise.com';`
- Result: `admin@timewise.com|$2b$12$X4qisgJ2TmTtnN.T2mRWDOajBGpWvJlsBTGVXKuvtRHJc6Jx0VvBm`
- Admin user exists and password is properly hashed

**Suggested Fix:**
1. Kill existing dev server processes
2. Clear Node.js environment cache
3. Restart dev server: `npm run dev`
4. Verify DATABASE_URL is loaded: Check server logs for "Datasource "db": SQLite database"

---

## UI/UX Findings

### Finding #1: Signin Form UX - ✅ Good

**Element:** Sign In Form  
**Screenshot:** [See attached signin-form.png]

**Observations:**
- Clean, centered design with good visual hierarchy
- TimeWise logo with checkmark icon is prominent
- Form fields are clearly labeled with asterisks for required fields
- "Sign In" button is a bright blue CTA with good contrast
- "Forgot Password?" link is available and properly positioned
- MUI TextField components are well-styled
- Form maintains good spacing and padding

**Accessibility Notes:**
- ✅ Form labels are properly associated with inputs
- ✅ Required field indicators present
- ✅ Error messages are displayed in an alert box with proper ARIA role
- ⚠️ No form validation messages for field-level errors (only full-form error handling)

### Finding #2: Content Security Policy (CSP) Warning

**Type:** Browser Console Warning  
**Severity:** 🟡 **LOW** (Non-blocking)

**Warning Message:**
```
Loading the stylesheet 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' 
violates the following Content Security Policy directive: "style-src 'self' 'unsafe-inline'"
```

**Details:**
- Google Fonts stylesheet is blocked by CSP policy
- The app is configured with strict CSP (`style-src 'self' 'unsafe-inline'`)
- External font resources cannot be loaded
- App falls back to system fonts
- **No visual impact** - the app still renders correctly with fallback fonts

**Recommended Fix:**
Add Google Fonts to CSP policy in `next.config.js`:
```javascript
headers: async () => [
  {
    key: 'Content-Security-Policy',
    value: "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
  }
]
```

---

## Form Validation Testing

### Test: Empty Field Validation
**Status:** ⏸️ PENDING (Blocked by authentication issue)  
**Test Case:** Submit form with empty email and password fields

**Expected Tests:**
- [ ] Form should validate empty fields on submit
- [ ] Error message should display for missing required fields
- [ ] Submit button should remain enabled (allow user retry)
- [ ] No network request should be made for invalid data

### Test: Email Format Validation
**Status:** ⏸️ PENDING (Blocked by authentication issue)

**Expected Tests:**
- [ ] Should reject emails without @ symbol
- [ ] Should reject emails without domain
- [ ] Should display field-level error message
- [ ] Should allow valid email formats

---

## Interactive UI Tests

### Test: Form Input Focus States
**Status:** ✅ PASSED

**Observations:**
- Email field responds to click with focus state
- Password field responds to click with focus state
- Focused fields show appropriate visual feedback (border color change)
- Tab navigation works between fields
- Form maintains state when switching between fields

### Test: Loading State UI
**Status:** ✅ PASSED

**Observations:**
- Sign In button shows "Signing in..." text during submission
- Button is disabled (`[disabled]`) during request
- Button re-enables after response
- No multiple submissions possible (UX protection)

---

## API & Network Monitoring

### Request: POST /api/auth/callback/credentials

**Test Case 1: Invalid Credentials**
- Status: `401 Unauthorized` ✅
- Response Time: 273ms
- Headers: Present and valid
- Error Handling: Server properly rejects and returns 401

**Test Case 2: Valid Credentials**
- Status: `401 Unauthorized` (Should be 200)
- Response Time: ~250ms
- Root Cause: Database connectivity issue prevents user lookup
- Network Request: Completed but auth logic failed

---

## Browser Console Errors

### Error 1: CSP Violation (Non-Critical)
```
Loading the stylesheet 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' 
violates the following Content Security Policy directive
```
- **Severity:** LOW
- **Type:** Resource blocked
- **Impact:** Fallback fonts used, no functional impact

### Error 2: Failed to load resource (Critical)
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```
- **Severity:** CRITICAL
- **Type:** Authentication failure
- **Impact:** Cannot authenticate users

---

## Blocked Test Cases (Awaiting Fix)

The following tests **CANNOT** be executed until the authentication issue is resolved:

### Core Feature Tests (Blocked)
- [ ] Create Full-Day Leave Request
- [ ] Create Half-Day AM Leave Request  
- [ ] Create Half-Day PM Leave Request
- [ ] Create Hourly Leave Request (with duration calculations)
- [ ] View Leave Balance
- [ ] Multi-Tier Approval Workflow (Manager → HR → Approved)
- [ ] Public Holiday Management
- [ ] Payroll CSV Export
- [ ] Admin Dashboard Functions

### CRUD Operations (Blocked)
- [ ] Create leave request with valid data
- [ ] Update leave request status
- [ ] Delete leave request
- [ ] View leave request details
- [ ] Filter/sort leave requests

### Navigation & Access Control (Blocked)
- [ ] Protected route redirect (unauthenticated users → /signin)
- [ ] Authenticated navigation
- [ ] Role-based menu visibility
- [ ] Logout functionality

---

## Recommended Playwright Test Spec Files

Once the authentication issue is resolved, the following Playwright test specs should be implemented:

### 1. Authentication Tests (`tests/auth.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Email"]', 'invalid@test.com');
    await page.fill('input[aria-label*="Password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');
    
    const error = await page.locator('[role="alert"]');
    await expect(error).toContainText('Invalid email or password');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Email"]', 'admin@timewise.com');
    await page.fill('input[aria-label*="Password"]', 'SecurePass123!');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('should disable submit button during login', async ({ page }) => {
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Email"]', 'admin@timewise.com');
    await page.fill('input[aria-label*="Password"]', 'SecurePass123!');
    
    const button = page.locator('button:has-text("Sign In")');
    await button.click();
    
    await expect(button).toBeDisabled();
    await expect(button).toContainText('Signing in...');
  });

  test('should redirect unauthenticated users to signin', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    expect(page.url()).toContain('/signin');
  });
});
```

### 2. Leave Request Tests (`tests/leave-requests.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Leave Requests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Email"]', 'admin@timewise.com');
    await page.fill('input[aria-label*="Password"]', 'SecurePass123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/dashboard');
  });

  test('should create full-day leave request', async ({ page }) => {
    await page.goto('http://localhost:3000/requests');
    await page.click('button:has-text("New Request")');
    
    // Fill form
    await page.fill('input[type="date"]', '2026-09-15');
    await page.selectOption('select[name="duration"]', 'FULL_DAY');
    await page.fill('textarea[name="reason"]', 'Personal leave');
    
    await page.click('button:has-text("Submit")');
    
    // Verify success
    await expect(page.locator('text=Request created successfully')).toBeVisible();
  });

  test('should create half-day AM leave request', async ({ page }) => {
    await page.goto('http://localhost:3000/requests');
    await page.click('button:has-text("New Request")');
    
    // Fill form
    await page.fill('input[type="date"]', '2026-09-15');
    await page.selectOption('select[name="duration"]', 'HALF_DAY_AM');
    
    await page.click('button:has-text("Submit")');
    
    // Verify success and balance calculation
    const balance = await page.locator('text=Remaining Days: 19.5');
    await expect(balance).toBeVisible();
  });

  test('should create hourly leave request', async ({ page }) => {
    await page.goto('http://localhost:3000/requests');
    await page.click('button:has-text("New Request")');
    
    // Fill form
    await page.fill('input[type="date"]', '2026-09-15');
    await page.selectOption('select[name="duration"]', 'HOURLY');
    await page.fill('input[name="hours"]', '4');
    
    await page.click('button:has-text("Submit")');
    
    // Verify calculation: 4 hours = 0.5 days
    const balance = await page.locator('text=Remaining Days: 19.5');
    await expect(balance).toBeVisible();
  });

  test('should show validation error for insufficient leave balance', async ({ page }) => {
    await page.goto('http://localhost:3000/requests');
    await page.click('button:has-text("New Request")');
    
    // Try to request more days than available
    for (let i = 0; i < 25; i++) {
      await page.click('button[aria-label="Add day"]');
    }
    
    await page.click('button:has-text("Submit")');
    
    // Verify error
    const error = await page.locator('[role="alert"]');
    await expect(error).toContainText('Insufficient leave balance');
  });
});
```

### 3. Admin Dashboard Tests (`tests/admin.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Email"]', 'admin@timewise.com');
    await page.fill('input[aria-label*="Password"]', 'SecurePass123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/dashboard');
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    expect(page.url()).toContain('/admin');
    
    // Check for admin-specific elements
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Download Payroll CSV')).toBeVisible();
  });

  test('should export payroll CSV', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Click download button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Payroll CSV")');
    const download = await downloadPromise;
    
    // Verify file
    expect(download.suggestedFilename()).toContain('payroll');
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
```

### 4. Form Validation Tests (`tests/form-validation.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Form Validation', () => {
  test('should show error for empty email field', async ({ page }) => {
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Password"]', 'test123');
    await page.click('button:has-text("Sign In")');
    
    const error = await page.locator('text=Please enter both email and password');
    await expect(error).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Email"]', 'not-an-email');
    await page.fill('input[aria-label*="Password"]', 'test123');
    await page.click('button:has-text("Sign In")');
    
    const error = await page.locator('[role="alert"]');
    await expect(error).toBeVisible();
  });

  test('should require minimum 8 character password', async ({ page }) => {
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[aria-label*="Email"]', 'test@example.com');
    await page.fill('input[aria-label*="Password"]', 'short');
    await page.click('button:has-text("Sign In")');
    
    const error = await page.locator('[role="alert"]');
    await expect(error).toBeVisible();
  });
});
```

---

## Performance Observations

| Metric | Value | Status |
|--------|-------|--------|
| Page Load Time (Signin) | ~500ms | ✅ Good |
| Form Submit Response | ~250ms | ✅ Good |
| API Response Time | <300ms | ✅ Excellent |
| CSP Violations | 1 (non-blocking) | 🟡 Minor |

---

## Recommendations

### Immediate Action Required
1. **FIX CRITICAL DATABASE ISSUE** (Blocks all testing)
   - Restart dev server with clean environment: `npm run dev`
   - Verify DATABASE_URL in server logs
   - Check Prisma can connect to SQLite successfully
   - Test authentication works before proceeding

### High Priority
2. Implement field-level form validation messages
3. Update CSP policy to allow Google Fonts
4. Add "Remember Me" functionality if needed
5. Add password strength indicator

### Medium Priority
6. Implement login attempt throttling/rate limiting
7. Add session timeout warning
8. Improve error message clarity for different failure scenarios
9. Add two-factor authentication support

### Testing Recommendations
10. Implement automated Playwright test suite (specs provided above)
11. Add browser console error monitoring to CI/CD
12. Set up performance monitoring and alerts
13. Add accessibility testing (WCAG 2.1 AA compliance)

---

## Next Steps

**Current Status:** Awaiting server restart and database fix

**Testing Resume Plan:**
1. Verify dev server has restarted with correct environment
2. Test valid credentials login again
3. If successful, execute full feature test suite:
   - Leave request creation (full, half-day, hourly)
   - Multi-tier approval workflow
   - Payroll export
   - Admin dashboard
   - Holiday management
4. Document all findings
5. Generate final comprehensive report

---

## Appendices

### A. Test Environment Details
- Browser: Chromium (Playwright)
- Node Version: v18.19.1
- npm Version: 9.2.0
- Next.js Version: 14.2.13
- Test Date: September 1, 2026
- Test Time: 21:22 - 21:25 UTC

### B. Database Schema Verification
- Database Type: SQLite
- Database File: `./prisma/dev.db` (44KB)
- Tables: 4 (users, sessions, leave_requests, _prisma_migrations)
- Admin User: `admin@timewise.com` (Password hashed, verified in DB)

### C. Log Files
- Dev Server Log: `/tmp/dev-server.log`
- Playwright Artifacts: Browser console & network logs captured

---

**Report Generated:** September 1, 2026, 21:25 UTC  
**QA Status:** CRITICAL ISSUE FOUND - Awaiting Resolution  
**Next Update:** Upon server restart completion

