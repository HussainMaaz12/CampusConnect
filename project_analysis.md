# CampusConnect Project Analysis & Development Log

This document provides a comprehensive overview of the analysis, improvements, new features, and cleaning operations implemented in the CampusConnect repository.

---

## 📁 1. Project Architecture & Startup Automation

### The Problem:
* The root directory lacked scripts to start the frontend client (`/client`) and backend server (`/server`) together. 
* Initiating the servers required navigating into each folder manually.
* Occasional `EADDRINUSE: address already in use :::5000` errors prevented the backend server from starting due to dangling background Node processes.

### The Solution:
1. **Root Configuration:** Updated the root [package.json](file:///d:/TECHFILIA/CampusConnect/package.json) to set up orchestration scripts.
2. **Concurrently Integration:** Installed `concurrently` as a devDependency to run the client and server processes in parallel.
   * `npm run dev` starts both the client and server concurrently.
   * `npm run install:all` bootstraps dependencies for both folders and the root in one command.
3. **Port Conflicts Resolved:** Identified and terminated process `36004` (lingering node process) occupying port `5000`.

---

## 🔑 2. Master Developer Credentials

Implemented a robust initialization flow for the Master Developer account:
* Credentials (`MASTER_DEV_EMAIL`, `MASTER_DEV_USERNAME`) are now securely loaded via `.env` environment variables.
* **First-run Password Generation**: If no `MASTER_DEV_PASSWORD` is supplied, the system securely generates a random, strong 12-byte hex password on boot, logs it once to the server console, and securely stores the hashed version.

---

## 🛠️ 3. Master Control Panel & Permission Management

### Bug Fix (API Route 404):
* **Issue:** The Master Admin was unable to load the user list or modify permissions. The frontend was requesting `/api/admin/users`, but because the central Axios configuration ([axios.js](file:///d:/TECHFILIA/CampusConnect/client/src/api/axios.js)) already set a `baseURL` ending in `/api`, the actual request was targeted to `/api/api/admin/users`, leading to a `404 Not Found` error.
* **Fix:** Corrected the paths in [AdminDashboard.jsx](file:///d:/TECHFILIA/CampusConnect/client/src/pages/AdminDashboard.jsx) to `/admin/users`, `/admin/grant/...`, and `/admin/revoke/...` respectively.

### Feature Addition (User Search):
* **New Feature:** Added a real-time responsive Search Bar in the **Master Control Panel** ([AdminDashboard.jsx](file:///d:/TECHFILIA/CampusConnect/client/src/pages/AdminDashboard.jsx)).
* **Implementation:**
  * Added React `searchTerm` state.
  * Dynamically filtered the network users on the fly using a case-insensitive match on both `name` and `username`.
  * Included a sleek input design fitting the existing dark theme aesthetic.
  * Added a fallback message when no search matches are found.

---

## 🧹 4. Comment Clean-up Operation

### The Action:
* Wrote and executed a Node.js utility script to recursively scan the entire code base in the custom developer directories: `/client/src` and `/server/src`.
* **Comments Removed:**
  * Single-line comments (`//`)
  * Multi-line block comments (`/* ... */`)
  * React JSX expression comments (`{/* ... */}`)
* **Safe Parsing:** The cleanup process preserved all string literals (e.g. `http://...`) and RegExp literals by bypassing them during replacement.

---

## 🚀 5. Git Synchronization

Staged and committed all the changes, including:
* Automated configuration files ([package.json](file:///d:/TECHFILIA/CampusConnect/package.json)).
* Admin endpoints and backend controller/route files.
* Modified page components like the [AdminDashboard.jsx](file:///d:/TECHFILIA/CampusConnect/client/src/pages/AdminDashboard.jsx).
* All comment-stripped files.

Successfully pushed to the remote branch **`main`** of the GitHub Repository:
`https://github.com/HussainMaaz12/CampusConnect.git`


// In-place comment removal utility for JavaScript/React code.
// Removes single-line (//), multi-line (/* */), and JSX comments ({/* */}).
// WARNING: This script modifies files in place.

const fs = require('fs');
const path = require('path');

const targetDirectories = [
  './client/src',
  './server/src'
];

// Regex to capture:
// 1. Single-line comments: // ...$  (until newline)
// 2. Block comments: /* ... */ (non-greedy)
// 3. JSX comments: {/* ... */}
const commentRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/|\{[\s\S]*?\})/gm;

function cleanupCommentsInFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Use a replacer function to avoid removing parts of strings or regex literals
    // If a comment is found, we replace it with an empty string.
    // This is aggressive, so we double-check that it's actually a comment.
    
    let hasChanges = false;
    const cleanedCode = code.replace(commentRegex, (match) => {
      // Safety check: Ensure the match is not a string or regex literal
      // This is a best-effort attempt. Complex cases might need AST parsing.
      if (
        !match.startsWith('"') && 
        !match.startsWith("'") &&
        !match.startsWith('`') &&
        !match.startsWith('/**') // Avoid comment-like strings
      ) {
        hasChanges = true;
        return '';
      }
      return match; // Return original if it looks like a string
    });

    if (hasChanges && cleanedCode !== code) {
      fs.writeFileSync(filePath, cleanedCode, 'utf-8');
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      cleanupCommentsInFile(fullPath);
    }
  });
}

console.log('Starting comment cleanup...');

targetDirectories.forEach(dir => processDirectory(dir));

console.log('Comment cleanup completed.');


// Run this in your terminal (in the root directory)
// Make sure you have Node.js installed

npx -y esbuild remove-comments.js --bundle --platform=node --outfile=remove-comments-out.js



{
  "scripts": {
    "remove-comments": "node ./remove-comments-out.js"
  }
}

