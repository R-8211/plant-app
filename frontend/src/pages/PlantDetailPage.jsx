import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlant } from '../api/plants';
import { getWaterings, createWatering, deleteWatering } from '../api/waterings';
import styles from './PlantDetailPage.module.css';

const healthLabel = {
  good: { label: '😊 良好', cls: styles.healthGood },
  fair: { label: '😐 普通', cls: styles.healthFair },
  poor: { label: '😟 不良', cls: styles.healthPoor },
};

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [waterings, setWaterings] = useState([]);
  const [form, setForm] = useState({ health_status: '', memo: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    getPlant(id).then(setPlant).catch(() => navigate('/'));
    getWaterings(id).then(setWaterings).catch(() => {});
  }, [id, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const record = await createWatering(id, form);
      setWaterings(prev => [record, ...prev]);
      setForm({ health_status: '', memo: '' });
    } catch {
      setError('記録の追加に失敗しました。');
    }
  };

  const handleDelete = async (wateringId) => {
    try {
      await deleteWatering(wateringId);
      setWaterings(prev => prev.filter(w => w.id !== wateringId));
    } catch {
      setError('削除に失敗しました。');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        {plant?.photo_url
          ? <img src={plant.photo_url} alt={plant.name} className={styles.heroImage} />
          : <div className={styles.heroNoImage}>🌱</div>
        }
        <div className={styles.heroOverlay} />
        <button className={styles.back} onClick={() => navigate('/')}>← 戻る</button>
        {plant && (
          <div className={styles.heroInfo}>
            <h2 className={styles.heroName}>{plant.name}</h2>
            {plant.species && <p className={styles.heroSpecies}>{plant.species}</p>}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <p className={styles.formTitle}>💧 水やりを記録する</p>
          <form onSubmit={handleAdd} className={styles.form}>
            <select
              value={form.health_status}
              onChange={e => setForm(f => ({ ...f, health_status: e.target.value }))}
            >
              <option value="">健康状態（任意）</option>
              <option value="good">😊 良好</option>
              <option value="fair">😐 普通</option>
              <option value="poor">😟 不良</option>
            </select>
            <input
              placeholder="メモ（任意）"
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.submitBtn}>記録を追加</button>
          </form>
        </div>

        <div className={styles.historyHeader}>
          📋 水やり履歴
          {waterings.length > 0 && <span className={styles.historyCount}>{waterings.length}件</span>}
        </div>

        {waterings.length === 0 ? (
          <div className={styles.emptyHistory}>まだ記録がありません</div>
        ) : (
          <ul className={styles.list}>
            {waterings.map(w => {
              const h = healthLabel[w.health_status];
              return (
                <li key={w.id} className={styles.item}>
                  <div className={styles.itemLeft}>
                    <div className={styles.itemTop}>
                      <span className={styles.date}>
                        {new Date(w.watered_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {h && <span className={`${styles.healthBadge} ${h.cls}`}>{h.label}</span>}
                    </div>
                    {w.memo && <p className={styles.memo}>{w.memo}</p>}
                  </div>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(w.id)}>削除</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
