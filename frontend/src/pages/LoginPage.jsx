import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const { data, error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    if (error) {
      setError(error.message);
    } else if (isSignUp && !data.session) {
      setMessage('確認メールを送りました。メールのリンクをクリックしてからログインしてください。');
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Plant App</h1>
        <h2 className={styles.subtitle}>{isSignUp ? '新規登録' : 'ログイン'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.message}>{message}</p>}
          <button type="submit">{isSignUp ? '登録' : 'ログイン'}</button>
        </form>
        <button className={styles.toggle} onClick={() => setIsSignUp(v => !v)}>
          {isSignUp ? 'すでにアカウントをお持ちの方' : 'アカウントを作成する'}
        </button>
      </div>
    </div>
  );
}
