import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlants, createPlant, updatePlant, deletePlant } from '../api/plants';
import { uploadPlantImage } from '../api/storage';
import { useAuth } from '../hooks/useAuth';
import { usePushNotification } from '../hooks/usePushNotification';
import client from '../api/client';
import styles from './PlantsPage.module.css';

export default function PlantsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({ name: '', species: '', watering_interval_days: 7 });
  const [imageFile, setImageFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', species: '', watering_interval_days: 7 });
  const [editImageFile, setEditImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [needsWatering, setNeedsWatering] = useState(new Set());
  const [error, setError] = useState('');
  const { subscribed, loading: pushLoading, subscribe } = usePushNotification();

  useEffect(() => {
    getPlants().then(setPlants).catch(() => setError('植物一覧の取得に失敗しました。'));
    client.get('/api/reminders').then(r => {
      setNeedsWatering(new Set(r.data.map(p => p.id)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const openForm = () => { setShowForm(true); setError(''); };
  const closeForm = () => { setShowForm(false); setImageFile(null); setForm({ name: '', species: '', watering_interval_days: 7 }); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);
    try {
      let photo_url = null;
      if (imageFile) photo_url = await uploadPlantImage(imageFile);
      const plant = await createPlant({ ...form, photo_url });
      setPlants(prev => [...prev, plant]);
      closeForm();
    } catch {
      setError('植物の追加に失敗しました。');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (e, plant) => {
    e.stopPropagation();
    setEditingId(plant.id);
    setEditForm({ name: plant.name, species: plant.species || '', watering_interval_days: plant.watering_interval_days, photo_url: plant.photo_url || null });
    setEditImageFile(null);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    setError('');
    setUploading(true);
    try {
      let photo_url = editForm.photo_url;
      if (editImageFile) photo_url = await uploadPlantImage(editImageFile);
      const updated = await updatePlant(id, { ...editForm, photo_url });
      setPlants(prev => prev.map(p => p.id === id ? updated : p));
      setEditingId(null);
      setEditImageFile(null);
    } catch {
      setError('更新に失敗しました。');
    } finally {
      setUploading(false);
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
        <div className={styles.headerLogo}>
          <span>🌿</span> Plant App
        </div>
        <div className={styles.headerRight}>
          {!subscribed && (
            <button onClick={subscribe} disabled={pushLoading} className={styles.notifyBtn}>
              {pushLoading ? '設定中...' : '🔔 通知'}
            </button>
          )}
          <button onClick={signOut} className={styles.signOutBtn}>ログアウト</button>
        </div>
      </header>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.sectionHeader}>
          <h2>マイ植物</h2>
          {plants.length > 0 && <span className={styles.count}>{plants.length}種</span>}
        </div>

        {plants.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🪴</div>
            <p>まだ植物が登録されていません</p>
            <p>右下の＋ボタンから追加しましょう</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {plants.map(plant => (
              <div
                key={plant.id}
                className={styles.card}
                onClick={() => editingId !== plant.id && navigate(`/plants/${plant.id}`)}
              >
                {editingId === plant.id ? (
                  <form
                    onSubmit={e => handleUpdate(e, plant.id)}
                    className={styles.editForm}
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      required
                      placeholder="学名（例：Monstera deliciosa）"
                    />
                    <input
                      type="number"
                      value={editForm.watering_interval_days}
                      onChange={e => setEditForm(f => ({ ...f, watering_interval_days: Number(e.target.value) }))}
                      min={1}
                      placeholder="水やり間隔（日）"
                    />
                    <label className={styles.fileLabel}>
                      📷 写真を変更
                      <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files[0])} />
                    </label>
                    {editImageFile && <p className={styles.fileName}>{editImageFile.name}</p>}
                    <div className={styles.formActions}>
                      <button type="submit" disabled={uploading}>{uploading ? '保存中...' : '保存'}</button>
                      <button type="button" onClick={e => { e.stopPropagation(); setEditingId(null); setEditImageFile(null); }}>キャンセル</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {plant.photo_url
                      ? <img src={plant.photo_url} alt={plant.name} className={styles.cardImage} />
                      : <div className={styles.cardNoImage}>🌱</div>
                    }
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardName}>
                        {plant.name}
                        {needsWatering.has(plant.id) && <span className={styles.badge}>💧 水やり必要</span>}
                      </h3>
                      {plant.species && <p className={styles.species}>{plant.species}</p>}
                      <p className={styles.interval}>💧 {plant.watering_interval_days}日ごと</p>
                      <div className={styles.cardActions}>
                        <button className={styles.editBtn} onClick={e => startEdit(e, plant)}>編集</button>
                        <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); handleDelete(plant.id); }}>削除</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <button className={styles.fab} onClick={openForm}>＋</button>

      {showForm && (
        <div className={styles.overlay} onClick={closeForm}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🌱 植物を追加</h3>
              <button className={styles.modalClose} onClick={closeForm}>✕</button>
            </div>
            <form onSubmit={handleCreate} className={styles.form}>
              <input
                placeholder="学名（例：Monstera deliciosa）"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                type="number"
                placeholder="水やり間隔（日）"
                value={form.watering_interval_days}
                onChange={e => setForm(f => ({ ...f, watering_interval_days: Number(e.target.value) }))}
                min={1}
              />
              <label className={styles.fileLabel}>
                📷 写真を選択
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </label>
              {imageFile && <p className={styles.fileName}>📎 {imageFile.name}</p>}
              <button type="submit" className={styles.submitBtn} disabled={uploading}>
                {uploading ? 'アップロード中...' : '追加する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
