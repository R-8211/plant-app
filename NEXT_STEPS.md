# 次回やること

## 1. CloudFront（HTTPS化）
- S3バケット `plant-app-frontend-ver1` の前にCloudFrontを設置
- HTTPSでフロントエンドにアクセスできるようにする
- 設定後、バックエンドの `CORS_ORIGIN` をCloudFrontのURLに変更

## 2. EC2のCORS設定を更新
- 現在 `CORS_ORIGIN=*`（全許可）になっているため、CloudFrontのURLに制限する
- EC2の `.env` を更新 → PM2再起動

## 3. EC2自動起動設定
- EC2を再起動したときにPM2が自動でバックエンドを起動するよう設定
- EC2上で以下を実行:
  ```bash
  pm2 startup
  pm2 save
  ```

## 4. Route53（独自ドメイン）※任意
- 独自ドメインを取得してCloudFrontに紐付ける

## 注意事項
- EC2を起動し直すとIPアドレスが変わる
  - フロントエンドの `VITE_API_URL` を新しいIPに変更してリビルド・S3再アップロードが必要
  - EC2の `.env` は変更不要
- EC2は使わないときは「停止」しておく（料金節約）
  - AWSコンソール → EC2 → インスタンス選択 → インスタンスの状態 → 停止
