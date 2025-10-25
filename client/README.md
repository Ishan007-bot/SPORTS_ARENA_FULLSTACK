# Sports Arena - Frontend

A modern React-based frontend application for real-time sports scoring and match management. Built with TypeScript, this application provides an intuitive interface for managing live sports events across 7 different sports.

## 🏆 Features

### **Multi-Sport Support**
- **Football** - Goal scoring with customizable halves and timer
- **Basketball** - Point tracking with quarter management  
- **Cricket** - Ball-by-ball scoring with overs and wickets
- **Chess** - Time-controlled matches with move tracking
- **Volleyball** - Set-based scoring with rally points
- **Badminton** - Game-based scoring with service rotation
- **Table Tennis** - Point-based games with deuce handling

### **Real-Time Capabilities**
- **Live Score Updates** - Instant score synchronization via Socket.IO
- **Live Scoreboard** - Public viewing of active matches
- **Match History** - Complete record of all completed matches
- **Real-Time Notifications** - Live updates across all connected clients

### **User Management**
- **Role-Based Authentication** - Admin, Scorer, and Normal User roles
- **Public Registration** - Anyone can register to become a scorer
- **Secure Login** - JWT token-based authentication
- **Protected Routes** - Role-based access control

### **Match Management**
- **Customizable Settings** - Configurable match parameters (time, sets, games)
- **Team/Player Names** - Dynamic naming for teams and individual players
- **Match Timers** - Auto-start timers with sport-specific rules
- **Manual Match Control** - Start, pause, and end matches
- **Winning Criteria** - Automatic match completion based on sport rules

### **User Interface**
- **Responsive Design** - Mobile-friendly across all devices
- **Modern UI/UX** - Glassmorphism design with smooth animations
- **Intuitive Navigation** - Easy-to-use interface for all user types
- **Real-Time Indicators** - Live status indicators and connection status

## 🛠️ Technology Stack

### **Core Technologies**
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with full IntelliSense
- **React Router** - Client-side routing and navigation
- **Context API** - State management for authentication and socket connections

### **UI/UX Libraries**
- **Framer Motion** - Smooth animations and transitions
- **CSS3** - Custom styling with glassmorphism effects
- **Responsive Design** - Mobile-first approach

### **Real-Time Communication**
- **Socket.IO Client** - Real-time bidirectional communication
- **WebSocket Support** - Live updates and notifications

### **Development Tools**
- **ESLint** - Code quality and consistency
- **TypeScript** - Static type checking
- **Environment Variables** - Flexible configuration management

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Footer.tsx      # Application footer
│   ├── Navbar.tsx      # Navigation bar
│   ├── Timer.tsx       # Timer component
│   ├── MatchSettings.tsx # Match configuration
│   └── TeamPlayerNamesModal.tsx # Name input modal
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── SocketContext.tsx # Socket connection management
├── pages/              # Page components
│   ├── arenas/         # Sport-specific arenas
│   │   ├── FootballArena.tsx
│   │   ├── BasketballArena.tsx
│   │   ├── CricketArena.tsx
│   │   ├── ChessArena.tsx
│   │   ├── VolleyballArena.tsx
│   │   ├── BadmintonArena.tsx
│   │   └── TableTennisArena.tsx
│   ├── Home.tsx        # Home page
│   ├── Login.tsx      # User login
│   ├── Register.tsx   # User registration
│   ├── LiveScoreboard.tsx # Live matches
│   └── History.tsx    # Match history
├── config/             # Configuration files
│   └── api.ts         # API endpoints configuration
└── App.tsx            # Main application component
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sports_Arena/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_SERVER_URL=https://sports-arena-backend.onrender.com
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - **Production**: Visit [https://sports-arena-frontend.vercel.app/](https://sports-arena-frontend.vercel.app/)
   - **Development**: Run `npm start` and open the local development server

## 🔧 Configuration

### **Environment Variables**
- `REACT_APP_SERVER_URL` - Backend server URL (https://sports-arena-backend.onrender.com)

### **Production Configuration**
For production deployment:
- **Frontend URL**: [https://sports-arena-frontend.vercel.app/](https://sports-arena-frontend.vercel.app/)
- **Backend URL**: `https://sports-arena-backend.onrender.com`
- Ensure CORS is properly configured on the backend
- HTTPS URLs are used for secure communication

### **API Configuration**
All API endpoints are centralized in `src/config/api.ts`:
- User authentication endpoints
- Match management endpoints
- Sport-specific scoring endpoints
- Real-time communication setup

## 🎮 Usage

### **For Administrators**
1. Login with admin credentials
2. Access admin panel for user management
3. Create and manage tournaments
4. Full system control and oversight

### **For Scorers**
1. Register for a new account or login
2. Navigate to desired sport arena
3. Configure match settings
4. Start match and begin scoring
5. Real-time score updates across all clients

### **For Spectators**
1. View live scores (no login required)
2. Browse match history
3. Follow real-time updates
4. Mobile-friendly experience

## 🎨 Design Features

### **Visual Design**
- **Glassmorphism Effects** - Modern glass-like UI elements
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Framer Motion powered transitions
- **Sport-Specific Theming** - Each sport has its own color scheme

### **Responsive Design**
- **Mobile-First** - Optimized for mobile devices
- **Tablet Support** - Enhanced tablet experience
- **Desktop Experience** - Full desktop functionality
- **Touch-Friendly** - Optimized for touch interactions

## 🔒 Security Features

### **Authentication**
- **JWT Tokens** - Secure token-based authentication
- **Role-Based Access** - Different permissions for different users
- **Protected Routes** - Secure access to sensitive features
- **Automatic Logout** - Session management and security

### **Data Protection**
- **Input Validation** - Client-side form validation
- **Secure Communication** - HTTPS-ready configuration
- **Environment Variables** - Secure configuration management

## 📱 Mobile Support

### **Responsive Features**
- **Touch Gestures** - Swipe and tap interactions
- **Mobile Navigation** - Collapsible navigation menu
- **Optimized Layouts** - Mobile-specific UI adjustments
- **Performance** - Optimized for mobile devices

## 🧪 Development

### **Available Scripts**
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### **Code Quality**
- **TypeScript** - Type safety and better development experience
- **ESLint** - Code quality and consistency
- **Component Architecture** - Reusable and maintainable components

## 🚀 Deployment

### **Production Build**
```bash
npm run build
```

### **Deployment Options**
- **Vercel** - [https://sports-arena-frontend.vercel.app/](https://sports-arena-frontend.vercel.app/) (Current deployment)
- **Netlify** - Drag and drop deployment
- **AWS S3** - Static website hosting
- **Heroku** - Full-stack deployment

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

**Sports Arena Frontend** - Modern, responsive, and feature-rich sports scoring interface! 🏆
