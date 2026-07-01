import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  // 수정 중인 데이터
  const [editData, setEditData] = useState({
    teamName: '',
    location: '',
    level: '',
    description: ''
  });

  // 팀 데이터 가져오기
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamDoc = doc(db, 'teams', teamId);
        const teamSnapshot = await getDoc(teamDoc);

        if (!teamSnapshot.exists()) {
          setError('팀을 찾을 수 없습니다');
          return;
        }

        const teamData = {
          id: teamSnapshot.id,
          ...teamSnapshot.data()
        };

        setTeam(teamData);
        setEditData({
          teamName: teamData.teamName,
          location: teamData.location,
          level: teamData.level,
          description: teamData.description
        });

        // 이미 신청했는지 확인
        if (auth.currentUser) {
          const applicationsRef = collection(db, 'applications');
          const q = query(
            applicationsRef,
            where('teamId', '==', teamId),
            where('applicantEmail', '==', auth.currentUser.email)
          );
          const querySnapshot = await getDocs(q);
          setIsApplied(!querySnapshot.empty);
        }
      } catch (err) {
        setError('팀 정보를 불러오는 중 에러: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  // 팀 수정
  const handleUpdate = async () => {
    setError('');
    setSuccess('');

    if (!editData.teamName || !editData.location || !editData.description) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    try {
      const teamDoc = doc(db, 'teams', teamId);
      await updateDoc(teamDoc, {
        teamName: editData.teamName,
        location: editData.location,
        level: editData.level,
        description: editData.description
      });

      setTeam({
        ...team,
        ...editData
      });
      setSuccess('팀 정보가 수정되었습니다!');
      setIsEditing(false);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('수정에 실패했습니다: ' + err.message);
    }
  };

  // 팀 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말로 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const teamDoc = doc(db, 'teams', teamId);
      await deleteDoc(teamDoc);
      
      setSuccess('팀이 삭제되었습니다!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('삭제에 실패했습니다: ' + err.message);
    }
  };

  // 팀 참가 신청
  const handleApply = async () => {
    if (!auth.currentUser) {
      setError('로그인이 필요합니다');
      return;
    }

    try {
      setApplying(true);
      setError('');
      setSuccess('');

      const applicationsRef = collection(db, 'applications');
      
      await addDoc(applicationsRef, {
        teamId: teamId,
        teamName: team.teamName,
        applicantEmail: auth.currentUser.email,
        teamOwnerId: team.createdBy,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });

      setSuccess('팀 참가 신청이 완료되었습니다!');
      setIsApplied(true);
    } catch (err) {
      setError('신청에 실패했습니다: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="team-detail-container">
        <p className="loading">팀 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-detail-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← 돌아가기
        </button>
      </div>
    );
  }

  const isOwner = auth.currentUser?.email === team.createdBy;

  return (
    <div className="team-detail-container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">
        ← 돌아가기
      </button>

      <div className="team-detail-box">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {isEditing ? (
          // 수정 모드
          <div>
            <h1>팀 정보 수정</h1>

            <div className="form-group">
              <label>팀 이름</label>
              <input
                type="text"
                value={editData.teamName}
                onChange={(e) => setEditData({ ...editData, teamName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>지역</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>팀 레벨</label>
              <select
                value={editData.level}
                onChange={(e) => setEditData({ ...editData, level: e.target.value })}
              >
                <option value="초급">초급 (처음 하는 사람)</option>
                <option value="중급">중급 (경험 있는 사람)</option>
                <option value="고급">고급 (실력 있는 사람)</option>
              </select>
            </div>

            <div className="form-group">
              <label>팀 소개</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="5"
              />
            </div>

            <div className="button-group">
              <button onClick={handleUpdate} className="save-btn">
                저장하기
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">
                취소
              </button>
            </div>
          </div>
        ) : (
          // 조회 모드
          <div>
            <div className="team-detail-header">
              <div>
                <h1>{team.teamName}</h1>
                <span className="team-level-badge" style={{
                  backgroundColor: team.level === '초급' ? '#4caf50' : team.level === '중급' ? '#ff9800' : '#f44336'
                }}>
                  {team.level}
                </span>
              </div>
              {isOwner && (
                <div className="owner-buttons">
                  <button onClick={() => setIsEditing(true)} className="edit-btn">
                    ✏️ 수정
                  </button>
                  <button onClick={handleDelete} className="delete-btn">
                    🗑️ 삭제
                  </button>
                </div>
              )}
            </div>

            <div className="team-detail-info">
              <p><strong>📍 지역:</strong> {team.location}</p>
              <p><strong>👥 팀장:</strong> {team.createdBy}</p>
              <p><strong>📝 팀 소개:</strong></p>
              <div className="team-description-full">
                {team.description}
              </div>
            </div>

            {!isOwner && (
              <button 
                className="join-btn-large"
                onClick={handleApply}
                disabled={isApplied || applying}
              >
                {isApplied ? '✅ 신청 완료 (대기 중)' : applying ? '신청 중...' : '팀 참가 신청'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}