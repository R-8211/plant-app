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
      <div className={styles.leftPanel}>
        <div className={styles.leftDecor} />
        <div className={styles.leftInner}>
          <div className={styles.leftContent}>
            <span className={styles.leafMark}>✦</span>
            <h1 className={styles.brandName}>Plant App</h1>
            <p className={styles.brandTagline}>植物の成長を、丁寧に記録する</p>
          </div>
          <blockquote className={styles.quote}>
            "To plant a garden is to believe in tomorrow."
          </blockquote>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.mobileLogoArea}>
            <span className={styles.mobileLogo}>✦</span>
            <span className={styles.mobileTitle}>Plant App</span>
          </div>
          <h2 className={styles.formHeading}>
            {isSignUp ? 'はじめましょう' : 'おかえりなさい'}
          </h2>
          <p className={styles.formSub}>
            {isSignUp ? 'アカウントを作成する' : 'アカウントにサインイン'}
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>メールアドレス</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>パスワード</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.message}>{message}</p>}
            <button type="submit" className={styles.submitBtn}>
              {isSignUp ? 'アカウントを作成' : 'サインイン'}
            </button>
          </form>
          <div className={styles.divider} />
          <button className={styles.toggle} onClick={() => setIsSignUp(v => !v)}>
            {isSignUp ? 'すでにアカウントをお持ちの方 →' : 'アカウントをお持ちでない方 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
