# Evos AI Deployment Guide

## Architecture

Evos consists of two parts:
1. **Frontend** - React + Vite (static hosting)
2. **Backend** - Express.js + SQLite API server

---

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Backend (Railway)
1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Connect your GitHub repo, select the `server/` directory
4. Add environment variables:
   - `OPENAI_API_KEY` (optional, works without)
   - `JWT_SECRET` (generate a secure random string)
   - `PORT` = 3001
5. Deploy!

#### Frontend (Vercel)
1. Create new project on [Vercel](https://vercel.com)
2. Connect your GitHub repo
3. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL (e.g., `https://evos-api.up.railway.app/api`)
4. Deploy!

---

### Option 2: Single Server (VPS/Docker)

#### Using Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./data:/app/data
  
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - api
```

#### Manual Setup
```bash
# Backend
cd server
npm install
npm run build
NODE_ENV=production npm run start:prod

# Frontend
npm install
VITE_API_URL=http://your-server:3001/api npm run build
# Serve dist/ with nginx or similar
```

---

## Environment Variables

### Backend (`server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for AI features (works without in mock mode) |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `PORT` | No | Server port (default: 3001) |

### Frontend (`.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |

---

## Database

Evos uses SQLite for simplicity. The database file (`evos.db`) is created automatically in the server directory.

For production, consider:
- Mounting a persistent volume for the database
- Regular backups
- Migrating to PostgreSQL for scale (future)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/demo` | No | Demo login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/nodes` | Yes | Get identity nodes |
| POST | `/api/nodes` | Yes | Create node |
| PATCH | `/api/nodes/:id` | Yes | Update node |
| DELETE | `/api/nodes/:id` | Yes | Delete node |
| GET | `/api/tracking/:date?` | Yes | Get tracking data |
| POST | `/api/tracking` | Yes | Save tracking |
| GET | `/api/actions/:date?` | Yes | Get daily actions |
| PATCH | `/api/actions/:id` | Yes | Update action status |
| POST | `/api/actions/regenerate` | Yes | Generate new actions |
| POST | `/api/chat` | Yes | Chat with Evos AI |
| POST | `/api/chat/work-session` | Yes | Work session chat |
| GET | `/api/summary/:date?` | Yes | Get daily summary |
| GET | `/api/analytics` | Yes | Get analytics |
| GET | `/api/health` | No | Health check |

---

## Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Demo login
curl -X POST http://localhost:3001/api/auth/demo

# Get nodes (with token)
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/nodes
```

---

## Troubleshooting

### "AI not available"
- This is normal if `OPENAI_API_KEY` is not set
- The app works fully in mock mode with predefined responses

### Database errors
- Ensure the server has write permissions to its directory
- Check that `better-sqlite3` compiled correctly for your platform

### CORS errors
- Update the `cors()` configuration in `server/index.ts` for your frontend domain

---

## Support

Questions? Contact: hello@evos.ai


