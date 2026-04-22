import { useState } from 'react';
import client from '../api/client';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotification() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('このブラウザはプッシュ通知に対応していません。\niPhoneの場合はホーム画面に追加してから開いてください。');
      return;
    }
    setLoading(true);
    try {
      // Service Worker登録
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 通知許可
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('通知を許可してください。');
        return;
      }

      // VAPIDキー取得（proxyで/api/push/vapid-public-key）
      const res = await fetch('/api/push/vapid-public-key');
      if (!res.ok) throw new Error(`VAPIDキー取得失敗: ${res.status}`);
      const { key } = await res.json();

      // Push購読
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      // サーバーに保存
      await client.post('/api/push/subscribe', { subscription: sub.toJSON() });
      setSubscribed(true);
      alert('通知の設定が完了しました！毎朝8時にリマインダーをお知らせします。');
    } catch (err) {
      console.error('Push通知エラー:', err);
      alert(`通知の設定に失敗しました。\n\n詳細: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { subscribed, loading, subscribe };
}
