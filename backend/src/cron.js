const cron = require('node-cron');
const webpush = require('web-push');
const db = require('./db');

webpush.setVapidDetails(
  'mailto:coldplayavicii8211@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// 毎朝8時に水やりチェック
cron.schedule('0 8 * * *', async () => {
  try {
    const { rows: subs } = await db.query('SELECT * FROM push_subscriptions');
    for (const sub of subs) {
      const { rows: plants } = await db.query(
        `SELECT p.name FROM plants p
         LEFT JOIN waterings w ON w.plant_id = p.id
         WHERE p.user_id = $1
         GROUP BY p.id
         HAVING MAX(w.watered_at) IS NULL
             OR MAX(w.watered_at) + (p.watering_interval_days || ' days')::interval < NOW()`,
        [sub.user_id]
      );
      if (plants.length === 0) continue;
      const names = plants.map(p => p.name).join('、');
      const payload = JSON.stringify({
        title: '💧 水やりリマインダー',
        body: `${names} に水やりが必要です`,
      });
      await webpush.sendNotification(JSON.parse(sub.subscription), payload).catch(() => {
        db.query('DELETE FROM push_subscriptions WHERE user_id = $1', [sub.user_id]);
      });
    }
  } catch (err) {
    console.error('cron error:', err.message);
  }
}, { timezone: 'Asia/Tokyo' });

console.log('Cron job scheduled: daily watering check at 08:00 JST');
