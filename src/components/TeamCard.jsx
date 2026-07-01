import { useNavigate } from 'react-router-dom';

export default function TeamCard({ team }) {
  const navigate = useNavigate();
  const getLevelColor = (level) => {
    switch (level) {
      case '초급':
        return '#4caf50';
      case '중급':
        return '#ff9800';
      case '고급':
        return '#f44336';
      default:
        return '#667eea';
    }
  };

  return (
    <div className="team-card" onClick={() => navigate(`/team/${team.id}`)} style={{ cursor: 'pointer' }}>
      <div className="team-card-header">
        <h3>{team.teamName}</h3>
        <span className="team-level" style={{ backgroundColor: getLevelColor(team.level) }}>
          {team.level}
        </span>
      </div>

      <div className="team-card-body">
        <p className="team-location">
          📍 {team.location}
        </p>
        <p className="team-description">
          {team.description}
        </p>
        <p className="team-meta">
          팀장: {team.createdBy}
        </p>
      </div>

      <div className="team-card-footer">
      <button 
        className="join-btn"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/team/${team.id}`);
        }}
      >
        팀 참가 신청
      </button>
      </div>
    </div>
  );
}