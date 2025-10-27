# Hoppin Backend Integration Guide

## Overview
This guide will help you set up a simple backend for Hoppin that can be deployed on a VPS server.

## Recommended Stack

### Option 1: Node.js + Express + PostgreSQL (Recommended)
**Why this stack?**
- Node.js/Express is lightweight and easy to deploy
- PostgreSQL is reliable, free, and handles relational data well
- Works great on any VPS (DigitalOcean, Linode, AWS EC2, etc.)

### Option 2: Node.js + Express + SQLite
**Why this stack?**
- Even simpler - no separate database server needed
- File-based database
- Perfect for smaller deployments
- Easy to backup (just copy the .db file)

## Basic Architecture

```
Frontend (React) ←→ REST API (Express) ←→ Database (PostgreSQL/SQLite)
```

## Quick Setup Guide

### 1. Backend Structure
```
backend/
├── server.js          # Main server file
├── routes/
│   ├── auth.js       # Authentication routes
│   ├── trips.js      # Trip management routes
│   └── users.js      # User management routes
├── models/
│   ├── User.js       # User model
│   └── Trip.js       # Trip model
├── middleware/
│   └── auth.js       # Authentication middleware
├── package.json
└── .env              # Environment variables
```

### 2. Required Dependencies
```bash
npm install express cors dotenv bcrypt jsonwebtoken pg
# or for SQLite:
npm install express cors dotenv bcrypt jsonwebtoken sqlite3
```

### 3. Basic Server Setup (server.js)
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 4. Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  whatsapp_consent BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Trips Table:**
```sql
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(20) NOT NULL,
  departure_location VARCHAR(255) NOT NULL,
  arrival_location VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  arrival_time TIME NOT NULL,
  recurrence VARCHAR(20) NOT NULL,
  recurring_days TEXT,
  is_matched BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. API Endpoints

**Authentication:**
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

**Trips:**
- `GET /api/trips` - Get all trips (admin only)
- `GET /api/trips/my` - Get user's trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `PATCH /api/trips/:id/match` - Toggle match status (admin only)

**Users:**
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID

## VPS Deployment Steps

### 1. Choose a VPS Provider
- **DigitalOcean** ($6/month basic droplet)
- **Linode** ($5/month)
- **Vultr** ($6/month)
- **AWS EC2** (free tier available)

### 2. Server Setup (Ubuntu 22.04)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install nginx
```

### 3. Deploy Backend
```bash
# Clone your repository
git clone https://github.com/yourusername/hoppin-backend.git
cd hoppin-backend

# Install dependencies
npm install

# Set up environment variables
nano .env
# Add:
# PORT=5000
# DATABASE_URL=postgresql://username:password@localhost/hoppin
# JWT_SECRET=your-secret-key

# Start with PM2
pm2 start server.js --name hoppin-backend
pm2 save
pm2 startup
```

### 4. Configure Nginx (Reverse Proxy)
```bash
sudo nano /etc/nginx/sites-available/hoppin
```

Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/hoppin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate (Free with Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 6. Frontend Connection
Update your React app to connect to the backend:

```javascript
// config.js
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com'
  : 'http://localhost:5000';

// Example API call
const response = await fetch(`${API_URL}/api/trips`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

## Security Best Practices

1. **Environment Variables**: Never commit .env files
2. **CORS**: Only allow your frontend domain
3. **Rate Limiting**: Prevent API abuse
4. **Input Validation**: Validate all user inputs
5. **Password Hashing**: Use bcrypt with salt rounds
6. **JWT Tokens**: Use secure, expiring tokens
7. **HTTPS**: Always use SSL in production

## Monitoring & Maintenance

```bash
# View logs
pm2 logs hoppin-backend

# Restart server
pm2 restart hoppin-backend

# Monitor status
pm2 status

# Database backup
pg_dump hoppin > backup_$(date +%Y%m%d).sql
```

## Cost Estimate

**Monthly costs for small deployment:**
- VPS: $5-10/month
- Domain: $12/year (~$1/month)
- SSL: Free (Let's Encrypt)
- **Total: ~$6-11/month**

## Alternative: Serverless Options

If you prefer not to manage a VPS, consider:
- **Render.com** - Free tier available, auto-deploy from Git
- **Railway.app** - $5/month, very easy setup
- **Heroku** - Paid plans starting at $5/month
- **Vercel** (frontend) + **Supabase** (backend) - Free tier available

These platforms handle deployment, scaling, and SSL automatically.

## Next Steps

1. Set up the backend repository
2. Create the database schema
3. Implement authentication
4. Build API endpoints
5. Test locally
6. Deploy to VPS
7. Connect frontend to backend
8. Test in production

## Need Help?

The simplest path to get started:
1. Use Railway.app or Render.com for hosting (no VPS management needed)
2. Use PostgreSQL for database
3. Follow their deployment guides - they auto-deploy from GitHub
4. Add your environment variables in their dashboard
5. Point your frontend to the deployed API URL

This approach gets you up and running in under an hour with minimal configuration!
