# Sports Arena Management System

A comprehensive web application for managing live sports scoring across multiple sports with real-time updates, user authentication, and match history tracking.

## 🏆 Features

### 🎮 Supported Sports
- **Football** - Full match scoring with customizable halves and timer
- **Basketball** - Quarter-based scoring with timer management
- **Cricket** - Ball-by-ball scoring with overs tracking
- **Chess** - Time-controlled matches with move tracking
- **Volleyball** - Set-based scoring with customizable match length
- **Badminton** - Game-based scoring with customizable match length
- **Table Tennis** - Game-based scoring with customizable match length

### 👥 User Management System
- **Admin Role** - Full system access and user management
- **Scorer Role** - Can create and manage matches for all sports
- **Normal User** - Can view live scores and match history
- **Public Registration** - Anyone can register to become a scorer

### 🔐 Authentication & Security
- **JWT Token-based** authentication
- **Password hashing** with bcrypt
- **Role-based access control**
- **Session management** with automatic logout
- **Protected routes** for sensitive operations

### 📊 Live Scoring Features
- **Real-time score updates** using Socket.IO
- **Live scoreboard** with automatic refresh
- **Match timer** with auto-start functionality
- **Automatic match completion** based on sport rules
- **Manual match ending** option for all sports
- **Team/Player name input** before match start

### 📈 Match Management
- **Match history** with detailed score tracking
- **Delete matches** from history
- **Final score display** for all sports
- **Detailed set/game scores** for multi-set sports
- **Winner announcement** with winning criteria
- **Match status tracking** (live, completed, ended)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sports_Arena
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on `localhost:27017`

5. **Create admin user**
   ```bash
   cd ../server
   node create-admin.js
   ```
   This creates an admin user with:
   - Email: `admin@sportsarena.com`
   - Password: `admin123`

6. **Start the application**
   
   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm start
   ```
   Server runs on `http://localhost:5000`

   **Terminal 2 - Frontend Client:**
   ```bash
   cd client
   npm start
   ```
   Client runs on `http://localhost:3000`

## 🎯 User Guide

### For Administrators

1. **Login** with admin credentials:
   - Email: `admin@sportsarena.com`
   - Password: `admin123`

2. **Access Features:**
   - View all users in the system
   - Create and manage matches
   - Access admin panel (Tournament feature)
   - Full system control

### For Scorers

1. **Registration:**
   - Visit `/register` or click "REGISTER" in navbar
   - Enter username, email, and password
   - Account automatically created with scorer role

2. **Login:**
   - Use registered credentials
   - Access all scoring features

3. **Creating Matches:**
   - Navigate to any sport arena
   - Enter team/player names when prompted
   - Configure match settings (halves, quarters, sets, etc.)
   - Start match and begin scoring

### For Normal Users

1. **View Live Scores:**
   - No login required
   - Visit `/live-scores` to see active matches
   - Real-time updates every second

2. **View Match History:**
   - No login required
   - Visit `/history` to see completed matches
   - View detailed scores and results

## 🏅 Sport-Specific Rules

### Football
- **Scoring:** Goals
- **Timer:** Customizable halves with auto-start
- **Winning:** Most goals at end of time
- **Settings:** Number of halves, time per half

### Basketball
- **Scoring:** Points (2-pointers, 3-pointers, free throws)
- **Timer:** Quarters with auto-start
- **Winning:** Most points at end of time
- **Settings:** Number of quarters, time per quarter

### Cricket
- **Scoring:** Runs, wickets, overs, extras
- **Winning:** Most runs or target achieved
- **Features:** Undo last ball functionality
- **Settings:** Overs per innings

### Chess
- **Timer:** Customizable time control
- **Winning:** Checkmate, time forfeit, resignation
- **Features:** Manual match ending
- **Settings:** Time per player

### Volleyball
- **Scoring:** Points per set
- **Winning:** Win majority of sets (e.g., 2 out of 3, 3 out of 5)
- **Settings:** Number of sets, points per set
- **Features:** Detailed set scores in history

### Badminton
- **Scoring:** Points per game
- **Winning:** Win majority of games (e.g., 2 out of 3, 3 out of 5)
- **Settings:** Number of games, points per game
- **Features:** Detailed game scores in history

### Table Tennis
- **Scoring:** Points per game
- **Winning:** Win majority of games (e.g., 2 out of 3, 3 out of 5)
- **Settings:** Number of games, points per game
- **Features:** Detailed game scores in history

## 🔧 Technical Details

### Backend Architecture
- **Framework:** Node.js with Express
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens with bcrypt hashing
- **Real-time:** Socket.IO for live updates
- **API:** RESTful endpoints for all operations

### Frontend Architecture
- **Framework:** React with TypeScript
- **Routing:** React Router for navigation
- **State Management:** React Context API
- **Styling:** CSS with responsive design
- **Animations:** Framer Motion for smooth transitions

### Database Schema
- **Users:** username, email, password, role, timestamps
- **Matches:** sport, teams/players, scores, settings, status, timestamps
- **Scores:** Sport-specific scoring structures with detailed tracking

## 📱 User Interface

### Navigation
- **Home Page:** Sport selection with arena cards
- **Live Scores:** Real-time match updates
- **History:** Completed matches with detailed scores
- **Login/Register:** User authentication
- **Arena Pages:** Sport-specific scoring interfaces

### Responsive Design
- **Mobile-friendly** interface
- **Tablet optimization**
- **Desktop experience**
- **Touch-friendly** controls

## 🔒 Security Features

### Authentication
- **JWT tokens** for session management
- **Password hashing** with bcrypt
- **Token expiration** handling
- **Automatic logout** on token expiry

### Authorization
- **Role-based access** control
- **Protected routes** for sensitive operations
- **Admin-only** features
- **Scorer-only** match creation

### Data Protection
- **Input validation** on all forms
- **SQL injection** prevention
- **XSS protection** with proper escaping
- **Secure password** requirements

## 🚀 Deployment

### Environment Variables
Create `.env` file in server directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sports_arena
JWT_SECRET=your_jwt_secret_key
```

### Production Build
```bash
# Build client
cd client
npm run build

# Serve with Express
cd ../server
# Serve static files from client/build
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string
   - Verify database permissions

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user credentials

3. **Real-time Updates Not Working**
   - Check Socket.IO connection
   - Verify server is running
   - Check network connectivity

4. **Match Creation Fails**
   - Ensure user is logged in as scorer/admin
   - Check team/player name requirements
   - Verify match settings are valid

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in server environment.

## 📊 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/history` - Get match history
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id` - Update match score
- `DELETE /api/matches/:id` - Delete match
- `POST /api/matches/:id/end` - End match manually

### Sports-Specific
- `PUT /api/matches/:id/football` - Update football score
- `PUT /api/matches/:id/basketball` - Update basketball score
- `PUT /api/matches/:id/cricket` - Update cricket score
- `PUT /api/matches/:id/chess` - Update chess score
- `PUT /api/matches/:id/volleyball` - Update volleyball score
- `PUT /api/matches/:id/badminton` - Update badminton score
- `PUT /api/matches/:id/table-tennis` - Update table tennis score

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**Sports Arena Management System** - Bringing sports scoring into the digital age! 🏆