import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      // Firebase로 로그인
      await signInWithEmailAndPassword(auth, email, password);
      // 로그인 성공 시 대시보드로 이동
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('존재하지 않는 계정입니다');
      } else if (err.code === 'auth/wrong-password') {
        setError('잘못된 비밀번호입니다');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일입니다');
      } else {
        setError('로그인에 실패했습니다: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>⚽ 풋메이트</h1>
        <h2>로그인</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="auth-link">
          아직 계정이 없으신가요? <a href="/signup">회원가입</a>
        </p>
      </div>
    </div>
  );
}