// API Configuration
export const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  REGISTER: `${API_BASE_URL}/api/users/register`,
  LOGIN: `${API_BASE_URL}/api/users/login`,
  PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // Match endpoints
  MATCHES: `${API_BASE_URL}/api/matches`,
  LIVE_MATCHES: `${API_BASE_URL}/api/matches/live`,
  MATCH_BY_ID: (id: string) => `${API_BASE_URL}/api/matches/${id}`,
  MATCH_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/score`,
  MATCH_START: (id: string) => `${API_BASE_URL}/api/matches/${id}/start`,
  MATCH_END: (id: string) => `${API_BASE_URL}/api/matches/${id}/end`,
  MATCH_UNDO: (id: string) => `${API_BASE_URL}/api/matches/${id}/undo`,
  
  // Sport-specific endpoints
  FOOTBALL_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/football`,
  BASKETBALL_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/basketball`,
  CRICKET_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/cricket`,
  CHESS_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/chess`,
  VOLLEYBALL_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/volleyball`,
  BADMINTON_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/badminton`,
  TABLE_TENNIS_SCORE: (id: string) => `${API_BASE_URL}/api/matches/${id}/table-tennis`,
};
