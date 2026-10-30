# ⏰ Deadline Guardian

A serverless web application that helps college students track assignments, exams, and project deadlines with automatic email reminders.

---

## Project Abstract

Deadline Guardian is a cloud-native serverless application built on Microsoft Azure. Students can add deadlines with title, subject, priority, and due date. The system automatically sends email reminders 24 hours and 1 hour before each deadline using a scheduled Azure Functions Timer Trigger. The frontend is built with React and Vite, hosted on Azure Static Web Apps. The backend uses Azure Functions HTTP Triggers for CRUD operations and Azure Table Storage as the database. No server runs continuously — all compute is event-driven, making this a true serverless architecture.

---

## Architecture

```
React (Vite) → Azure Static Web Apps managed API (HTTP) → Azure Table Storage / Gmail SMTP
```

- React frontend makes HTTP calls to /api/* endpoints
- Azure Static Web Apps serves the frontend and managed HTTP API under /api/*
- Azure Functions HTTP Triggers handle all CRUD operations
- The per-deadline HTTP endpoint sends reminders on demand
- Each deadline card can send a reminder only for that selected deadline
- Azure Table Storage stores all deadline records
- Gmail SMTP sends transactional reminder emails using a Gmail app password

---

## Folder Structure

```
deadline-guardian/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/
│       └── services/
├── api/               # Azure Functions
│   └── src/
│       ├── functions/ # HTTP + Timer triggers
│       └── lib/       # Storage + Email helpers
├── staticwebapp.config.json
└── .github/workflows/deploy.yml
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Azure Functions Core Tools v4
- Azurite (local storage emulator)

### Install
```bash
# Install Azurite globally
npm install -g azurite

# Install api dependencies
cd api && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Configure secrets
Edit `api/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
    "GMAIL_USER": "your_gmail_address",
    "GMAIL_APP_PASSWORD": "your_gmail_app_password"
  }
}
```

### Run locally (3 terminals)

Terminal 1 — Storage:
```bash
azurite --location d:\azurite-data --silent
```

Terminal 2 — Backend:
```bash
cd api && npm start
```

Terminal 3 — Frontend:
```bash
cd frontend && npm run dev
```

Open: http://localhost:5173

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/deadlines | List all deadlines |
| POST | /api/deadlines | Create a deadline |
| GET | /api/deadlines/{id} | Get one deadline |
| PUT | /api/deadlines/{id} | Update a deadline |
| DELETE | /api/deadlines/{id} | Delete a deadline |
| PATCH | /api/deadlines/{id}/complete | Mark as completed |
| GET | /api/dashboard | Get summary stats |
| POST | /api/deadlines/{id}/remind | Send a reminder for one deadline |

---

## Database Schema (Azure Table Storage)

Table name: `Deadlines`

| Field | Type | Description |
|-------|------|-------------|
| PartitionKey | String | Always "deadline" |
| RowKey | String | UUID — unique task ID |
| Title | String | Assignment title |
| Subject | String | Subject name |
| Description | String | Optional details |
| DueDateTimeUtc | String | ISO 8601 UTC datetime |
| Priority | String | Low / Medium / High |
| StudentEmail | String | Reminder recipient |
| Status | String | Pending / Completed |
| Reminder24HoursSent | Boolean | Prevents duplicate 24h email |
| Reminder1HourSent | Boolean | Prevents duplicate 1h email |
| CreatedAtUtc | String | ISO 8601 creation time |

---

## Azure Deployment

### Step 1 — Create Azure resources

Create an Azure Storage account and an Azure Static Web App. The current workflow deploys both the frontend and the HTTP API as Static Web Apps managed functions.

```bash
az login
az group create --name deadline-guardian-rg --location eastus
az storage account create --name deadlineguardiansa --resource-group deadline-guardian-rg --sku Standard_LRS
az staticwebapp create --name deadline-guardian --resource-group deadline-guardian-rg --location eastus
```

### Step 2 — Configure Static Web Apps settings

```bash
az staticwebapp appsettings set --name deadline-guardian --resource-group deadline-guardian-rg --setting-names STORAGE_CONNECTION_STRING="your_storage_connection_string" GMAIL_USER="your_gmail_address" GMAIL_APP_PASSWORD="your_gmail_app_password"
```

The API uses `STORAGE_CONNECTION_STRING`, falling back to `AzureWebJobsStorage` if it is not set. Gmail SMTP uses a Gmail app password; configure both settings on the Static Web App so the managed API can send messages.

### Step 3 — Add the GitHub secret

Add `AZURE_STATIC_WEB_APPS_API_TOKEN` using the deployment token from the Static Web App.

### Step 4 — Deploy

Push to `main`. The Static Web Apps workflow deploys both the frontend and `/api`.

Static Web Apps managed APIs support HTTP triggers only. Per-deadline reminder buttons use an HTTP endpoint; the scheduled timer requires a separately linked Azure Functions app and a Standard-plan Static Web App.

### Local development setup

The earlier steps configure production resources. To retrieve a Static Web Apps deployment token manually:

```bash
az staticwebapp secrets list --name deadline-guardian --resource-group deadline-guardian-rg
```

---

## Testing Reminders Without Waiting

Use **Send Reminder** on a deadline card, or call its reminder endpoint using its ID:
```bash
curl -X POST http://localhost:7071/api/deadlines/{id}/remind
```

---

## Faculty Demonstration Script

1. Open http://localhost:5173 — show the empty dashboard
2. Click Add Deadline — fill in a task due in 30 minutes with your email
3. Show the Dashboard — Total Tasks: 1, Pending: 1
4. Open the Deadlines page — show the countdown timer on the card
5. Run the trigger-reminder curl command — show the api terminal log
6. Check email inbox — show the received reminder email
7. Mark the task as Complete — show Dashboard updates
8. Delete the task — show it disappears

---

## Advantages

- Zero server management — fully managed by Azure
- Free tier friendly — stays within Azure free limits for academic use
- Auto-scaling — handles any number of students without configuration
- Duplicate-safe reminders — boolean flags prevent sending the same email twice
- Dev mode — works without real email credentials using console logging

## Limitations

- No user authentication — this is an academic prototype
- Email address is not verified — anyone can enter any email
- Gmail SMTP sending limits apply
- Azure Table Storage — no complex queries, suitable for simple use cases

---

## Common Errors and Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| ECONNREFUSED 10002 | Azurite not running | Run `azurite --location d:\azurite-data --silent` |
| address already in use 7071 | Old func process running | Run `taskkill /F /IM func.exe` |
| Request failed | Backend not started | Run `npm start` in api folder |
| Email not received | Gmail SMTP credentials missing or invalid | Set GMAIL_USER and GMAIL_APP_PASSWORD in Azure Function App settings; use a Gmail app password |
| func not recognized | Core Tools not in PATH | Add D:\Azure.Functions.Cli.min.win-x64.4.16.0 to system PATH |
