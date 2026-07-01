import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTeam from './pages/CreateTeam';
import TeamDetail from './pages/TeamDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-team" element={<CreateTeam />} />
        <Route path='/team/:teamId' element={<TeamDetail />} />
        {/* 홈 페이지는 회원가입으로 이동 */}
        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>
    </Router>
  );
}

export default App;