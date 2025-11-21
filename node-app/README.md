# Node Auth Client

This small Express application submits login and signup requests to the existing Flask server in `app.py`. It renders a single page with two forms and relays the responses from Flask back to the browser.

## Prerequisites

- Node.js 18+
- The Flask server running locally on port `5000` (or update `FLASK_BASE_URL`)

## Setup

```bash
cd /home/hannan/workspace/MajorProject/Server/node-app
npm install
cp env.example .env  # optional but recommended
```

Edit `.env` if your Flask server runs elsewhere:

```
FLASK_BASE_URL=http://127.0.0.1:5000
PORT=3000
```

## Usage

In separate terminals:

1. Start Flask:
   ```bash
   cd /home/hannan/workspace/MajorProject/Server
   python3 app.py
   ```
2. Start the Node client:
   ```bash
   cd /home/hannan/workspace/MajorProject/Server/node-app
   npm run dev
   ```

Visit `http://localhost:3000` to test signup and login. Responses from the Flask API are shown as flash messages, along with raw JSON for debugging.

## Customization

- Update styles in `public/styles.css`.
- Replace the EJS view in `views/index.ejs` with your preferred front-end framework.
- Extend `server.js` if you need session storage, JWT handling, or additional routes.

