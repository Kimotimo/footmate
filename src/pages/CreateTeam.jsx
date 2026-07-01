import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('초급');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 입력 값 확인
    if (!teamName || !location || !description) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    if (teamName.length < 2) {
      setError('팀 이름은 2자 이상이어야 합니다');
      return;
    }

    if (description.length < 10) {
      setError('팀 소개는 10자 이상이어야 합니다');
      return;
    }

    try {
      setLoading(true);
      
      // Firestore에 팀 저장
      const teamsCollection = collection(db, 'teams');
      await addDoc(teamsCollection, {
        teamName: teamName,
        location: location,
        level: level,
        description: description,
        createdBy: auth.currentUser.email,
        createdAt: serverTimestamp(),
        members: [auth.currentUser.email],
      });

      setSuccess(true);
      
      // 2초 후 대시보드로 이동
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setError('팀 등록에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-team-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← 돌아가기
      </button>

      <div className="create-team-box">
        <h1>⚽ 새 팀 등록</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">팀이 성공적으로 등록되었습니다! 대시보드로 이동 중...</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>팀 이름</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: 홍대 풋살팀"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>지역</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 서울 마포구"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>팀 레벨</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={loading}>
              <option value="초급">초급 (처음 하는 사람)</option>
              <option value="중급">중급 (경험 있는 사람)</option>
              <option value="고급">고급 (실력 있는 사람)</option>
            </select>
          </div>

          <div className="form-group">
            <label>팀 소개</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="팀에 대해 소개해주세요. (최소 10자)"
              rows="5"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? '등록 중...' : '팀 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}