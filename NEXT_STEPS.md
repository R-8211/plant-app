# 作業ログ・次のステップ

---

## 2026-05-05 本日の作業

### ✅ CloudFront設定（HTTPS化）
**目的:** S3とEC2の前にCDNを置き、HTTPSでアクセスできるようにする  
**メリット:**
- 通信が暗号化され、セキュリティが向上する
- ブラウザの「保護されていない通信」警告がなくなる
- 世界中のエッジロケーションにキャッシュされ、表示が速くなる
- フロントエンド・バックエンドを1つのURLで統一できる

**設定内容:**
- URL: `https://d3mjillehsp521.cloudfront.net`
- `/*` → S3（フロントエンド）
- `/api/*` → EC2（バックエンド）
- S3 OriginのプロトコルはHTTP onlyに設定（S3ウェブサイトエンドポイントはHTTPSに非対応）

---

### ✅ EC2自動起動設定
**目的:** EC2が再起動したときにバックエンドを自動で起動させる  
**メリット:**
- 再起動後に手動でSSH接続してアプリを起動する手間がなくなる
- AWS側の自動再起動（メンテナンス等）でもサービスが止まらない

**実施コマンド:**
```bash
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

---

### ✅ CORS制限
**目的:** バックエンドへのリクエストをCloudFrontのURLからのみ許可する  
**メリット:**
- 第三者のサイトからAPIを勝手に叩かれるリスクが減る
- セキュリティポリシーが明確になる

**変更内容:** EC2の `.env` で `CORS_ORIGIN=https://d3mjillehsp521.cloudfront.net` に変更

---

### ✅ PWA対応（iPhoneホーム画面追加）
**目的:** WebアプリをiPhoneのホーム画面に追加し、ネイティブアプリのように使えるようにする  
**メリット:**
- ブラウザのUIが非表示になりアプリらしい見た目になる
- ホーム画面にアイコンが表示される
- iOS 16.4以上でプッシュ通知が使えるようになる（後述）

**実施内容:**
- `vite-plugin-pwa` + `@vite-pwa/assets-generator` でアイコン・SW自動生成
- `src/sw.js` でキャッシュ + プッシュ通知を統合
- `apple-touch-icon-180x180.png` を追加

**iPhoneへのインストール手順:**
1. Safariで `https://d3mjillehsp521.cloudfront.net` を開く
2. 下部の共有ボタン → 「ホーム画面に追加」

---

## 次回の作業

### 1. プッシュ通知の動作確認
**目的:** 水やり時期になったらiPhoneにバナー通知を届ける  
**メリット:**
- アプリを開かなくても水やりのタイミングがわかる
- 毎朝8時（JST）に自動で通知が届く

**手順:**
1. EC2を起動する
2. iPhoneのホーム画面からアプリを開く（Safari経由ではなくアイコンから）
3. 植物一覧画面の「🔔 通知」ボタンをタップして通知を許可
4. 翌朝8時に水やりが必要な植物があれば通知が届く

**動作条件:** iOS 16.4以上 + ホーム画面に追加済みのPWA

---

### 2. Route53（独自ドメイン）※任意
**目的:** `d3mjillehsp521.cloudfront.net` のような自動生成URLではなく、独自ドメインでアクセスできるようにする  
**メリット:**
- ユーザーが覚えやすいURLになる
- ブランドとして信頼感が増す
- CloudFrontと連携してHTTPSも維持できる

---

## ⚠️ EC2 IP変更時の対応（毎回必要）
EC2を停止・再起動するとIPアドレスが変わるため以下を実施する：
1. AWSコンソールで新しいパブリックIPを確認
2. CloudFront → Origins → EC2のOriginを編集
   - ドメイン名を `ec2-X-X-X-X.ap-northeast-1.compute.amazonaws.com` に更新（IPの`.`を`-`に変換）
3. SSHは新しいIPで接続: `ssh -i plant-app-key.pem ubuntu@<新しいIP>`
4. CloudFrontの変更反映まで数分待つ
