import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlants, createPlant, deletePlant } from '../api/plants';
import { useAuth } from '../hooks/useAuth';
import styles from './PlantsPage.module.css';

export default function PlantsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({ name: '', species: '', watering_interval_days: 7 });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlants().then(setPlants).catch(() => setError('植物一覧の取得に失敗しました。'));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const plant = await createPlant(form);
      setPlants(prev => [...prev, plant]);
      setForm({ name: '', species: '', watering_interval_days: 7 });
      setShowForm(false);
    } catch {
      setError('植物の追加に失敗しました。');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlant(id);
      setPlants(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('削除に失敗しました。');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Plant App</h1>
        <div className={styles.headerRight}>
          <span>{user?.email}</span>
          <button onClick={signOut}>ログアウト</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h2>植物一覧</h2>
          <button onClick={() => setShowForm(v => !v)}>+ 追加</button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showForm && (
          <form onSubmit={handleCreate} className={styles.form}>
            <input
              placeholder="名前"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              placeholder="種類"
              value={form.species}
              onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
            />
            <input
              type="number"
              placeholder="水やり間隔（日）"
              value={form.watering_interval_days}
              onChange={e => setForm(f => ({ ...f, watering_interval_days: Number(e.target.value) }))}
              min={1}
            />
            <div className={styles.formActions}>
              <button type="submit">保存</button>
              <button type="button" onClick={() => setShowForm(false)}>キャンセル</button>
            </div>
          </form>
        )}

        <div className={styles.grid}>
          {plants.map(plant => (
            <div key={plant.id} className={styles.card} onClick={() => navigate(`/plants/${plant.id}`)}>
              <h3>{plant.name}</h3>
              {plant.species && <p className={styles.species}>{plant.species}</p>}
              <p className={styles.interval}>水やり：{plant.watering_interval_days}日ごと</p>
              <button
                className={styles.deleteBtn}
                onClick={e => { e.stopPropagation(); handleDelete(plant.id); }}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
