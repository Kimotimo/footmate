import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamMap({ teams }) {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const navigate = useNavigate();

  const teamsWithCoords = teams.filter(team => team.latitude && team.longitude);
  const selectedTeam = teamsWithCoords.find(team => team.id === selectedTeamId);

  // 기본 중심 좌표 (서울)
  const center = {
    lat: 37.5665,
    lng: 126.9780
  };

  // 선택된 팀이 있으면 그 좌표로, 없으면 서울 중심
  const mapCenter = selectedTeam 
    ? { lat: selectedTeam.latitude, lng: selectedTeam.longitude }
    : center;

  const mapLevel = selectedTeam ? 3 : 5;

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
    <div className="team-map-container">
      <Map
        center={mapCenter}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: '12px'
        }}
        level={mapLevel}
      >
        {teamsWithCoords.map((team) => (
          <MapMarker
            key={team.id}
            position={{ lat: team.latitude, lng: team.longitude }}
            onClick={() => setSelectedTeamId(selectedTeamId === team.id ? null : team.id)}
            image={{
              src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='${encodeURIComponent(getLevelColor(team.level))}'/%3E%3Ccircle cx='16' cy='16' r='14' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E`,
              size: {
                width: 40,
                height: 40
              },
              options: {
                offset: {
                  x: 20,
                  y: 40
                }
              }
            }}
          />
        ))}
      </Map>

      {/* 팀 정보 팝업 */}
      {selectedTeam && (
        <div className="map-popup">
          <div className="map-popup-content">
            <button 
              className="popup-close"
              onClick={() => setSelectedTeamId(null)}
            >
              ✕
            </button>
            <h4>{selectedTeam.teamName}</h4>
            <p className="popup-level" style={{
              backgroundColor: getLevelColor(selectedTeam.level)
            }}>
              {selectedTeam.level}
            </p>
            <p><strong>📍</strong> {selectedTeam.location}</p>
            <p><strong>👥</strong> {selectedTeam.createdBy}</p>
            <button 
              onClick={() => {
                navigate(`/team/${selectedTeam.id}`);
                setSelectedTeamId(null);
              }}
              className="popup-detail-btn"
            >
              상세보기
            </button>
          </div>
        </div>
      )}

      {teamsWithCoords.length === 0 && (
        <div className="no-teams-map">
          <p>지도에 표시할 팀이 없습니다</p>
        </div>
      )}
    </div>
  );
}