# 🔐 Zitadel M2M Authentication System

A complete Machine-to-Machine (M2M) authentication system using **Zitadel** with **Svelte frontend** and **Express.js backend**.

## 🚀 Features

- ✅ **OAuth 2.0 Client Credentials Flow** with real Zitadel
- ✅ **JWT Token Generation & Verification** using JWKS
- ✅ **Protected API Endpoints** with middleware authentication
- ✅ **Svelte Frontend** with auth integration
- ✅ **Docker Setup** for easy development

## 📁 Project Structure

```
├── docker-compose.yaml     # Zitadel + PostgreSQL setup
├── frontend/              # Svelte application
└── backend/              # Express.js M2M API
    ├── authConfig.js     # Zitadel configuration
    ├── m2mAuthService.js # Core M2M authentication
    ├── m2mMiddleware.js  # JWT verification middleware
    ├── m2mClient.js      # Example M2M client
    ├── server.js         # API server with protected endpoints
    └── test-m2m.sh       # Test suite
```

## 🛠️ Setup

### 1. Start Zitadel & Database
```bash
docker-compose up -d
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install
```

### 3. Configure Zitadel
Update `backend/authConfig.js` with your Zitadel credentials:
- M2M Client ID
- Client Secret  
- Project Audience
- Issuer URL

### 4. Start Services
```bash
# Backend API
cd backend && node server.js

# Frontend (new terminal)
cd frontend && npm run dev
```

## 🧪 Testing

```bash
cd backend && ./test-m2m.sh
```

## 📚 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/m2m/discovery` | GET | ❌ | Service discovery |
| `/m2m/token` | POST | ❌ | Get M2M access token |
| `/m2m/verify` | POST | ❌ | Verify JWT token |
| `/m2m/protected` | GET | ✅ | Protected resource |
| `/m2m/admin` | GET | ✅ | Admin endpoint (needs role config) |
| `/m2m/client-info` | GET | ✅ | Client information |

## 🔑 Usage Example

```javascript
// Get M2M token
const response = await fetch('/m2m/token', { method: 'POST' });
const { access_token } = await response.json();

// Use token for protected endpoints
const protectedResponse = await fetch('/m2m/protected', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

## 🔧 Development

### Adding Protected Endpoints
```javascript
app.get('/api/data', requireM2MAuth(), (req, res) => {
  res.json({ 
    data: 'protected', 
    client: req.m2mClient 
  });
});
```

### Service-to-Service Communication
```javascript
const m2mClient = new M2MClient();
const data = await m2mClient.makeAuthenticatedRequest('/api/external-service');
```

## 🎯 Current Status

✅ **Working Features:**
- Token generation with real Zitadel
- JWT verification using JWKS
- Protected endpoints
- Security middleware
- Frontend integration

⚠️ **Optional Features:**
- Admin endpoints (requires Zitadel role configuration)

## 📝 Admin Setup (Optional)

To enable admin endpoints, configure in Zitadel:

1. **Create admin role** in your project
2. **Assign role** to your M2M client (`service-user1`)
3. **Add admin scope** to client configuration

## 🔒 Security

- JWT signature verification with Zitadel JWKS
- Token expiry validation
- Proper HTTP status codes (401/403)
- CORS configuration
- Audience and issuer validation

---

**Ready for microservices development!** 🚀
