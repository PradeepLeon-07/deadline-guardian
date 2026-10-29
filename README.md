# ⏰ Deadline Guardian

A serverless web application that helps college students track assignments, exams, and project deadlines with automatic email reminders.

---

## Project Abstract

Deadline Guardian is a cloud-native serverless application built on Microsoft Azure. Students can add deadlines with title, subject, priority, and due date. The system automatically sends email reminders 24 hours and 1 hour before each deadline using a scheduled Azure Functions Timer Trigger. The frontend is built with React and Vite, hosted on Azure Static Web Apps. The backend uses Azure Functions HTTP Triggers for CRUD operations and Azure Table Storage as the database. No server runs continuously — all compute is event-driven, making this a true serverless architecture.

---

## Architecture

```
React (Vite) → Azure Static Web Apps → Azure Functions (HTTP) → Azure Table Storage
                                                                        ↑
                                    Azure Functions (Timer) ────────────┘
                                            ↓
                                      Resend Email API
```

- React frontend makes HTTP calls to /api/* endpoints
- Azure Static Web Apps routes /api/* to Azure Functions automatically
- Azure Functions HTTP Triggers handle all CRUD operations
- Azure Functions Timer Trigger runs every 15 minutes to check and send reminders
- Azure Table Storage stores all deadline records
- Resend sends transactional reminder emails

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
    "RESEND_API_KEY": "re_your_key_here",
    "REMINDER_FROM_EMAIL": "onboarding@resend.dev"
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
| POST | /api/test/trigger-reminder | Manually trigger reminders |

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
```bash
az login
az group create --name deadline-guardian-rg --location eastus
az storage account create --name deadlineguardiansa --resource-group deadline-guardian-rg --sku Standard_LRS
az staticwebapp create --name deadline-guardian --resource-group deadline-guardian-rg
```

### Step 2 — Get deployment token
```bash
az staticwebapp secrets list --name deadline-guardian --resource-group deadline-guardian-rg
```

### Step 3 — Add GitHub secret
Go to GitHub repo → Settings → Secrets → New secret:
- Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- Value: paste the token from Step 2

### Step 4 — Set production environment variables
```bash
az staticwebapp appsettings set --name deadline-guardian --resource-group deadline-guardian-rg --setting-names \
  STORAGE_CONNECTION_STRING="your_storage_connection_string" \
  RESEND_API_KEY="your_resend_api_key" \
  REMINDER_FROM_EMAIL="onboarding@resend.dev"
```

### Step 5 — Deploy
Push to main branch — GitHub Actions deploys automatically.

---

## Testing Reminders Without Waiting

Add a deadline due within 1 hour, then call:
```bash
curl -X POST http://localhost:7071/api/test/trigger-reminder
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
- Resend free tier — limited to 100 emails/day and requires domain for production
- Azure Table Storage — no complex queries, suitable for simple use cases

---

## Common Errors and Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| ECONNREFUSED 10002 | Azurite not running | Run `azurite --location d:\azurite-data --silent` |
| address already in use 7071 | Old func process running | Run `taskkill /F /IM func.exe` |
| Request failed | Backend not started | Run `npm start` in api folder |
| Email not received | Wrong API key | Check RESEND_API_KEY in local.settings.json |
| func not recognized | Core Tools not in PATH | Add D:\Azure.Functions.Cli.min.win-x64.4.16.0 to system PATH |
