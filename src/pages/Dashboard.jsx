import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import TeamCard from '../components/TeamCard';
import TeamMap from '../components/TeamMap';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [searchTeam, setSearchTeam] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filterLevel, setFilterLevel] = useState('전체');
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    // 로그인한 사용자 정보 가져오기
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        // 로그인 안 되어 있으면 로그인 페이지로 이동
        navigate('/login');
      } else {
        setUser(currentUser);
      }
    });

    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    // 팀 목록 가져오기
    const fetchTeams = async () => {
      try {
        const teamsCollection = collection(db, 'teams');
        const teamsSnapshot = await getDocs(teamsCollection);
        const teamsList = teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeams(teamsList);
      } catch (err) {
        console.error('팀 목록을 가져오는 중 에러:', err);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // 팀 목록 필터링
  const filteredTeams = teams.filter((team) => {
    const matchTeamName = team.teamName.toLowerCase().includes(searchTeam.toLowerCase());
    const matchLocation = team.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchLevel = filterLevel === '전체' || team.level === filterLevel;

    return matchTeamName && matchLocation && matchLevel;
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>⚽ 풋메이트</h1>
        <button onClick={handleLogout} className="logout-btn">
          로그아웃
        </button>
      </div>

      <div className="dashboard-content">
        <h2>환영합니다! 👋</h2>
        {user && <p className="user-email">로그인 정보: {user.email}</p>}

        <button 
          onClick={() => navigate('/create-team')} 
          className="create-team-btn"
        >
          + 새 팀 등록하기
        </button>

        {/* 탭 버튼 */}
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 목록 보기
          </button>
          <button 
            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ 지도 보기
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'list' ? (
          // 리스트 탭
          <div>
            <div className="search-filter-section">
              <h3>팀 찾기</h3>
              
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="팀 이름으로 검색..."
                  value={searchTeam}
                  onChange={(e) => setSearchTeam(e.target.value)}
                  className="search-input"
                />

                <input
                  type="text"
                  placeholder="지역으로 검색..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="search-input"
                />

                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="filter-select"
                >
                  <option value="전체">모든 레벨</option>
                  <option value="초급">초급</option>
                  <option value="중급">중급</option>
                  <option value="고급">고급</option>
                </select>
              </div>
            </div>

            <div className="teams-section">
              <h3>등록된 팀들</h3>
              
              {loadingTeams ? (
                <p className="loading">팀 목록을 불러오는 중...</p>
              ) : teams.length === 0 ? (
                <p className="no-teams">등록된 팀이 없습니다. 첫 번째 팀을 만들어보세요!</p>
              ) : (
                <div className="teams-grid">
                  {filteredTeams.length === 0 ? (
                    <p className="no-results">검색 결과가 없습니다</p>
                  ) : (
                    filteredTeams.map((team) => (
                      <TeamCard key={team.id} team={team} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // 지도 탭
          <div className="map-tab">
            <h3>지도에서 팀 찾기</h3>
            {loadingTeams ? (
              <p className="loading">지도를 불러오는 중...</p>
            ) : (
              <TeamMap teams={teams} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}