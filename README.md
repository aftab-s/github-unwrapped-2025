# GitHub Unwrapped 2025 — Combined Docs

This file merges auxiliary documentation into a single README. It was generated automatically.

---

## UI/UX Improvements

(merged from `UI_IMPROVEMENTS.md`)

# UI/UX Improvements - November 11, 2025

## Issues Fixed

### 1. ✅ Best Day/Time Calculation Accuracy

**Problem**: The best day and best hour were using simple heuristics that didn't reflect actual user patterns.

**Solution**:
- **Best Day**: Now calculates based on total contributions per day of week, filtering out days with zero contributions
- **Best Hour**: Improved algorithm that considers:
  - Weekday vs weekend contribution ratio
  - Average daily contribution density
  - Returns more accurate time estimates:
    - High weekday ratio (>75%) → 2 PM or 11 AM (work hours)
    - Balanced ratio → 3 PM (afternoon)
    - High weekend ratio → 10 PM or 4 PM (flexible schedule)

**Files Changed**: `src/lib/github.ts`

---

## Token Setup Guide

(merged from `SETUP_TOKEN.md`)

# 🔑 GitHub Token Setup Guide

## Why You Need This

The GitHub Unwrapped app needs a GitHub Personal Access Token to fetch user statistics from GitHub's GraphQL API. **This gives you higher rate limits** (5,000 requests/hour vs 60 for unauthenticated).

## Quick Setup (5 minutes)

### Step 1: Create a GitHub Personal Access Token

1. **Go to GitHub Settings**: https://github.com/settings/tokens/new
2. **Click**: "Generate new token (classic)"
3. **Fill in**:
   - Note: `GitHub Unwrapped 2025`
   - Expiration: `90 days` (or choose your preference)
   - **Scopes**: ✅ **LEAVE ALL UNCHECKED** (no scopes needed for public data!)
4. **Click**: "Generate token" (green button at bottom)
5. **Copy the token** - it will look like: `ghp_1234567890abcdefghijklmnopqrstuvwxyzAB`
   - ⚠️ **IMPORTANT**: You can only see this once! Copy it now.

### Step 2: Add Token to Your Project

1. **Open**: `.env.local` file in this directory
2. **Replace** this line:
   ```bash
   GITHUB_APP_TOKEN=
   ```
   With your actual token:
   ```bash
   GITHUB_APP_TOKEN=ghp_YOUR_ACTUAL_TOKEN_HERE
   ```
3. **Save** the file

### Step 3: Restart Dev Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Test It

1. **Open**: http://localhost:3000
2. **Enter** any GitHub username (e.g., "octocat")
3. **Click** "Generate Card"
4. ✅ **Success**: Card should generate without errors!

---

## Quickstart (merged)

(merged from `QUICKSTART.md`)

# GitHub Unwrapped 2025 - Quick Start Guide

## 🎯 Goal

Build a production-ready GitHub year-in-review card generator that works out of the box.

## ⚡ Fastest Setup (30 seconds)

1. **Install dependencies**:
   ```bash
   cd github-unwrapped-2025
   npm install
   ```

2. **Run**:
   ```bash
   npm run dev
   ```

3. **Open**: http://localhost:3000

That's it! 🎉 **No configuration required!**

---

## Project Summary

(merged from `PROJECT_SUMMARY.md`)

# 🎉 GitHub Unwrapped 2025 - Project Complete!

## ✅ What Has Been Built

A production-ready, card-first GitHub year-in-review app that generates beautiful social cards for 2025 activity.

(Full project summary omitted for brevity — original file contains detailed deliverables and checklists.)

---

## Preflight Checklist

(merged from `PREFLIGHT_CHECKLIST.md`)

# 🚀 Pre-Flight Checklist - GitHub Unwrapped 2025

Use this checklist before running or deploying the application.

(Full checklist omitted for brevity — original file contains detailed setup and QA items.)

---

## OAuth Setup

(merged from `OAUTH_SETUP.md`)

# OAuth Setup (Optional)

## Current Status: ✅ Not Required

The app works perfectly **without** OAuth configuration. The "Sign in with GitHub" button will automatically hide when OAuth is not set up.

(See original `OAUTH_SETUP.md` for full instructions.)

---


If you'd like, I can now:

- Replace the existing `README.md` with this merged version (overwrite), or
- Rename this file to `README.md` and remove the other `.md` files, or
- Keep this as `README_MERGED.md` and wait for your confirmation before deleting the original files.

Which option do you prefer? If you want me to proceed with deletion and overwrite, confirm and I'll continue (I'll also update the repo TODOs).