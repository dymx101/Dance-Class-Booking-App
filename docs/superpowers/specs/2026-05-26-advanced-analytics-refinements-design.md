# Design Spec: Advanced Admin Analytics Refinements (Phase 2)

**Date:** 2026-05-26
**Topic:** Admin Dashboard - Production Phase 11
**Status:** Approved

## 1. Goal
Upgrade the Admin Analytics Dashboard from a static visual overview to a dynamic business intelligence tool. The focus is on real financial comparisons (Period-over-Period) and member retention tracking to help the studio owner identify growth trends and "at-risk" students.

## 2. Data Strategy: Advanced Aggregation

### 2.1 Studio Health RPC (`get_studio_health`)
A single optimized Postgres function that calculates all top-level summary metrics and their deltas:
- **Metrics:** Total Revenue, Avg. Fill Rate, Active Members, No-Show Rate.
- **Deltas:** Compares the last 30 days against the previous 30 days (31-60 days ago).
- **Output:** Returns a JSON object with `current_value`, `previous_value`, and `percentage_change` for each metric.

### 2.2 Retention Logic (`view_at_risk_members`)
A dedicated view to identify members requiring outreach:
- **Criteria:** User has `remainingpasses > 0` but has not attended or booked a class in the last 30 days.
- **Output:** A list of user profiles with their last activity date and remaining pass count.

## 3. UI/UX Refinements

### 3.1 Real Trend Indicators
- Replace hardcoded "+12%" labels with dynamic, color-coded delta indicators.
- **Emerald:** Growth/Improvement (e.g., higher revenue, higher fill rate, lower no-shows).
- **Rose:** Decline/Risk (e.g., lower revenue, lower signups, higher no-shows).

### 3.2 Member Retention CRM List
- A new section in the dashboard showing the "At-Risk Members" fetched from the Postgres view.
- Provides immediate actionable data for customer relationship management (CRM).

### 3.3 Visual Polish
- Summary cards will use high-contrast branding with trend icons (TrendingUp/TrendingDown).
- Consistent with the "PLAN A" high-contrast design system.

## 4. Security
- **RBAC**: Function execution restricted to users with the `admin` metadata role.
- **Privacy**: The retention list displays member names and activity dates but masks sensitive contact details (unless viewed in the full user management section).

## 5. Success Criteria
- Owner can see real, accurate growth percentages for the studio's finances.
- Owner can identify specific students who are at risk of churning.
- Dashboard performance remains high by consolidating calculations into a single RPC call.
