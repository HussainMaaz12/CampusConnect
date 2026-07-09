# CampusConnect

CampusConnect is a MERN stack application featuring a client built with React (Vite) and a backend running Express/Node.js.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/)

### Installation
We use a single command from the project root to install all dependencies for both the frontend (`/client`) and backend (`/server`):

```bash
npm run install:all
```
*This command runs `npm install` in the root, followed by the client and server directories.*

### Running the Application (Development)
You can start both the client and server concurrently using:

```bash
npm run dev
```
*This leverages `concurrently` to spin up Vite and Nodemon side-by-side, so you do not need to open multiple terminals.*

## Administration
The platform supports a Master Developer account which is auto-provisioned. The seed credentials should be configured using `.env` variables in the `server` directory.

- `MASTER_DEV_EMAIL`
- `MASTER_DEV_USERNAME`
- `MASTER_DEV_PASSWORD` (If left blank, one is generated on the first run).
