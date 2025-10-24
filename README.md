# Sports Arena - Multi-Sports Scoring Application

A comprehensive full-stack application for scoring and managing multiple sports including Cricket, Football, Basketball, Volleyball, Table Tennis, Chess, and Badminton. Built with MERN stack and real-time updates using Socket.io.

## 🏆 Features

### Core Functionality
- **Multi-Sport Support**: Cricket, Football, Basketball, Volleyball, Table Tennis, Chess, Badminton
- **Real-time Scoring**: Live score updates across all connected clients
- **Tournament Management**: Create and manage tournaments with team registration
- **Match History**: Complete history tracking for all matches and tournaments
- **Live Scoreboard**: Real-time score display on homepage and individual arenas

### Sport-Specific Features

#### 🏏 Cricket (T20/ODI Format)
- Runs tracking (+1, +2, +3, +4, +6)
- Overs and balls management
- Wickets tracking with dismissal types
- Extras (Wides, No Balls, Byes, Leg Byes)
- Current batsman and bowler statistics
- Undo last ball functionality

#### ⚽ Football
- Goal scoring
- Time tracking with periods
- Yellow and Red card management
- Match status tracking

#### 🏀 Basketball (FIBA Rules)
- Point scoring (1, 2, 3 points)
- Quarter management
- Team fouls tracking
- Time management

#### ♟️ Chess
- Tournament scoring (1-0, 0-1, 1/2-1/2)
- Dual timer system
- Player switching
- Result management

#### 🏐 Volleyball
- Rally scoring system
- Set management (best of 5)
- Service tracking
- Point-by-point scoring

#### 🏸 Badminton
- Best of 3 games format
- 21-point games with 2-point margin
- Service rotation rules
- Game and match tracking

#### 🏓 Table Tennis
- 11-point games with 2-point margin
- Service rotation (every 2 points)
- Deuce handling
- Game and match tracking

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Framer Motion** for animations
- **Socket.io Client** for real-time updates
- **Axios** for API calls
- **React Hot Toast** for notifications

## 📁 Project Structure

```
Sports_Arena/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   └── arenas/     # Sport-specific arenas
│   │   ├── context/        # React context providers
│   │   └── App.tsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   └── server.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sports_Arena
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/sports_arena
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the application**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎮 Usage

### Creating a Tournament
1. Navigate to the Tournament page
2. Click "Create Tournament"
3. Fill in tournament details (name, sport, format, dates, venue)
4. Add teams to the tournament
5. Generate matches automatically

### Starting a Match
1. Go to the desired sport arena
2. Click "Start Match"
3. Use the scoring controls to update scores
4. Scores update in real-time across all connected clients

### Live Scoreboard
- View all live matches on the Live Scoreboard page
- Real-time updates without page refresh
- Match status and current scores

### History
- View all completed matches
- Filter by sport
- Tournament results and statistics

## 🔧 API Endpoints

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/:id` - Get specific match
- `POST /api/matches` - Create new match
- `PUT /api/matches/:id/score` - Update match score
- `PUT /api/matches/:id/start` - Start match
- `PUT /api/matches/:id/end` - End match

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get specific tournament
- `POST /api/tournaments` - Create tournament
- `POST /api/tournaments/:id/teams` - Add team to tournament
- `POST /api/tournaments/:id/generate-matches` - Generate matches

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

## 🔄 Real-time Features

### Socket.io Events
- `join-match` - Join a specific match room
- `leave-match` - Leave a match room
- `join-live-scoreboard` - Join live scoreboard room
- `score-update` - Real-time score updates
- `match-started` - Match start notifications
- `match-ended` - Match end notifications

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Glassmorphism design with gradients
- **Smooth Animations**: Framer Motion for fluid transitions
- **Real-time Indicators**: Live status indicators and connection status
- **Sport-specific Theming**: Each sport has its own color scheme

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly controls
- Responsive grid layouts
- Mobile-optimized navigation
- Swipe gestures support

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Ishan Ganguly**
- Batch of '28 SST
- Scaler School of Technology

## 🙏 Acknowledgments

- Built as part of Buildspace N&W's S5 project
- MERN Course project
- Scaler School of Technology

## 📞 Support

If you find any issues, please contact the developer or create an issue in the repository.

---

**Sports Arena** - Your ultimate destination for live sports scoring and player statistics! 🏆

