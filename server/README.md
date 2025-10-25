# Sports Arena - Backend

A robust Node.js backend API for real-time sports scoring and match management. Built with Express.js and MongoDB, this server provides comprehensive RESTful APIs and real-time communication for managing live sports events across 7 different sports.

## 🏆 Features

### **Multi-Sport API Support**
- **Football** - Goal scoring with customizable halves and timer
- **Basketball** - Point tracking with quarter management
- **Cricket** - Ball-by-ball scoring with overs and wickets
- **Chess** - Time-controlled matches with move tracking
- **Volleyball** - Set-based scoring with rally points
- **Badminton** - Game-based scoring with service rotation
- **Table Tennis** - Point-based games with deuce handling

### **Real-Time Communication**
- **Socket.IO Integration** - Real-time bidirectional communication
- **Live Score Updates** - Instant score synchronization across all clients
- **Match Notifications** - Real-time match status updates
- **Connection Management** - Robust connection handling and reconnection

### **User Management System**
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, Scorer, and Normal User roles
- **User Registration** - Public registration with validation
- **Password Security** - Bcrypt hashing for password protection
- **Session Management** - Token expiration and refresh handling

### **Match Management**
- **Match CRUD Operations** - Create, read, update, delete matches
- **Live Match Tracking** - Real-time match status management
- **Match History** - Complete match records and statistics
- **Sport-Specific Logic** - Custom scoring rules for each sport
- **Automatic Match Completion** - Smart winning criteria detection

### **Database Features**
- **MongoDB Integration** - Scalable NoSQL database
- **Mongoose ODM** - Object document mapping
- **Data Validation** - Schema validation and data integrity
- **Relationship Management** - User-match relationships
- **Performance Optimization** - Efficient queries and indexing

## 🛠️ Technology Stack

### **Core Technologies**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### **Authentication & Security**
- **JWT (JSON Web Tokens)** - Secure authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet.js** - Security headers

### **Real-Time Communication**
- **Socket.IO** - Real-time bidirectional communication
- **WebSocket Support** - Live updates and notifications
- **Room Management** - Match-specific communication rooms

### **Development Tools**
- **Nodemon** - Development server with auto-restart
- **Environment Variables** - Configuration management
- **Error Handling** - Comprehensive error management
- **Logging** - Application logging and debugging

## 📁 Project Structure

```
server/
├── config/             # Database configuration
│   └── database.js     # MongoDB connection setup
├── controllers/        # Route controllers
│   ├── matchController.js    # Match management logic
│   └── userController.js     # User authentication logic
├── middleware/         # Custom middleware
│   └── auth.js        # JWT authentication middleware
├── models/            # Database schemas
│   ├── Match.js       # Match data model
│   └── User.js        # User data model
├── routes/            # API routes
│   ├── matches.js     # Match-related endpoints
│   ├── users.js       # User-related endpoints
│   ├── teams.js       # Team management endpoints
│   └── tournaments.js # Tournament endpoints
├── server.js          # Main server file
└── create-admin.js    # Admin user creation script
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sports_Arena/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/sports_arena
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_URL=https://sports-arena-frontend.vercel.app/
   ```

4. **Create admin user**
   ```bash
   node create-admin.js
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Verify server is running**
   Server runs on [https://sports-arena-backend.onrender.com](https://sports-arena-backend.onrender.com)

## 🔧 Configuration

### **Environment Variables**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS ([https://sports-arena-frontend.vercel.app/](https://sports-arena-frontend.vercel.app/))

### **Production Configuration**
For deployed servers, update the following:
- Set `NODE_ENV=production`
- Server URL: `https://sports-arena-backend.onrender.com`
- Frontend URL: `https://sports-arena-frontend.vercel.app/`
- Configure production MongoDB URI
- Set secure JWT secret
- Update CORS settings for production domain

### **Database Configuration**
- **MongoDB Connection** - Automatic connection management
- **Schema Validation** - Data integrity enforcement
- **Indexing** - Performance optimization
- **Error Handling** - Connection error management

## 📊 API Endpoints

### **Authentication Endpoints**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

### **Match Management Endpoints**
- `GET /api/matches` - Get all matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/:id` - Get specific match
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id/score` - Update match score
- `PUT /api/matches/:id/start` - Start match
- `PUT /api/matches/:id/end` - End match
- `DELETE /api/matches/:id` - Delete match

### **Sport-Specific Endpoints**
- `PUT /api/matches/:id/football` - Update football score
- `PUT /api/matches/:id/basketball` - Update basketball score
- `PUT /api/matches/:id/cricket` - Update cricket score
- `PUT /api/matches/:id/chess` - Update chess score
- `PUT /api/matches/:id/volleyball` - Update volleyball score
- `PUT /api/matches/:id/badminton` - Update badminton score
- `PUT /api/matches/:id/table-tennis` - Update table tennis score

### **Cricket-Specific Endpoints**
- `POST /api/matches/:id/undo` - Undo last ball (Cricket only)

## 🔄 Real-Time Features

### **Socket.IO Events**
- `join-match` - Join a specific match room
- `leave-match` - Leave a match room
- `join-live-scoreboard` - Join live scoreboard room
- `score-update` - Real-time score updates
- `match-started` - Match start notifications
- `match-ended` - Match end notifications

### **Room Management**
- **Match Rooms** - Individual match communication
- **Live Scoreboard Room** - Global live updates
- **User Rooms** - User-specific notifications
- **Connection Management** - Automatic reconnection handling

## 🗄️ Database Schema

### **User Model**
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (admin/scorer/user),
  createdAt: Date,
  updatedAt: Date
}
```

### **Match Model**
```javascript
{
  sport: String,
  teamA: Object,
  teamB: Object,
  playerA: Object,
  playerB: Object,
  status: String,
  score: Object (sport-specific),
  settings: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### **Authentication**
- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password security
- **Token Expiration** - Automatic session management
- **Role-Based Access** - Different permissions for different users

### **Data Protection**
- **Input Validation** - Server-side validation
- **CORS Configuration** - Cross-origin security
- **Helmet.js** - Security headers
- **Error Handling** - Secure error responses

## 🧪 Development

### **Available Scripts**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node create-admin.js` - Create admin user

### **Development Features**
- **Hot Reload** - Automatic server restart
- **Error Logging** - Comprehensive error tracking
- **API Testing** - Built-in API testing capabilities
- **Database Seeding** - Admin user creation

## 🚀 Deployment

### **Production Setup**
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Run `node create-admin.js` to create admin user
4. Start server with `npm start`

### **Deployment Options**
- **Heroku** - Easy deployment with Heroku CLI
- **Railway** - Modern deployment platform
- **DigitalOcean** - VPS deployment
- **AWS EC2** - Cloud server deployment

## 📈 Performance

### **Optimization Features**
- **Database Indexing** - Optimized queries
- **Connection Pooling** - Efficient database connections
- **Caching** - In-memory caching for frequently accessed data
- **Error Handling** - Graceful error management

### **Scalability**
- **Horizontal Scaling** - Multiple server instances
- **Database Sharding** - Large dataset management
- **Load Balancing** - Traffic distribution
- **Real-Time Scaling** - Socket.IO clustering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Ishan Ganguly** - Batch of '28 SST, Scaler School of Technology

---

**Sports Arena Backend** - Robust, scalable, and feature-rich sports management API! 🏆
