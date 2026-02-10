# Pokerface Meetings

Pokerface Meetings is a planning-poker style app with a React client and a Node.js/Express server.

## Project Structure

- `client/`: React frontend
- `server/`: Node.js backend, WebSocket handling, and Docker image source
- `.github/workflows/deploy.yml`: GitHub Actions workflow for build/deploy automation

## Local Development

### Client

```bash
cd client
npm ci
npm start
```

### Server

```bash
cd server
npm ci
npm run server
```

## Deployment Workflow

When you push changes to the `main` branch, GitHub Actions automatically runs `.github/workflows/deploy.yml`.

That workflow:

1. Installs and builds the client into `server/build`
2. Builds the server Docker image
3. Pushes image tags to Docker Hub (`latest` and the commit SHA)

This is the deployment pipeline for the app, so pushing to `main` triggers the deploy process.
