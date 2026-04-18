import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWaterings, createWatering, deleteWatering } from '../api/waterings';
import styles from './PlantDetailPage.module.css';

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [waterings, setWaterings] = useState([]);
  const [form, setForm] = useState({ health_status: '', memo: '' });

  useEffect(() => {
    getWaterings(id).then(setWaterings);
  }, [id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const record = await createWatering(id, form);
    setWaterings(prev => [record, ...prev]);
    setForm({ health_status: '', memo: '' });
  };

  const handleDelete = async (wateringId) => {
    await deleteWatering(wateringId);
    setWaterings(prev => prev.filter(w => w.id !== wateringId));
  };

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={() => navigate('/')}>← 一覧へ戻る</button>
      <h2>水やり記録</h2>

      <form onSubmit={handleAdd} className={styles.form}>
        <select
          value={form.health_status}
          onChange={e => setForm(f => ({ ...f, health_status: e.target.value }))}
        >
          <option value="">健康状態（任意）</option>
          <option value="good">良好</option>
          <option value="fair">普通</option>
          <option value="poor">不良</option>
        </select>
        <input
          placeholder="メモ（任意）"
          value={form.memo}
          onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
        />
        <button type="submit">水やり記録を追加</button>
      </form>

      <ul className={styles.list}>
        {waterings.map(w => (
          <li key={w.id} className={styles.item}>
            <div>
              <span className={styles.date}>{new Date(w.watered_at).toLocaleString('ja-JP')}</span>
              {w.health_status && <span className={styles.health}>{w.health_status}</span>}
              {w.memo && <p className={styles.memo}>{w.memo}</p>}
            </div>
            <button onClick={() => handleDelete(w.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
