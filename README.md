# 勤怠・日報管理システム

このプロジェクトは社内向けのサンプル勤怠管理システムです。Node.js/Express で動作するバックエンド API、nginx で配信される静的フロントエンド、そして PostgreSQL データベースを含みます。すべてのコンポーネントは Docker Compose を使ってローカルで実行できます。

## ローカル環境のセットアップ

1. Docker と Docker Compose をインストールします。
2. 初回起動時にマイグレーションを手動で実行します。まずデータベースコンテナを起動します。
   ```bash
   docker compose up db -d
   ```
   **Linux/Mac の場合**
   ```bash
   docker compose exec -T db psql -U postgres -d attendance < backend/migrations/001_create_tables.sql
   docker compose exec -T db psql -U postgres -d attendance < backend/migrations/002_seed_admin.sql
   ```
   **PowerShell の場合**
   `<` リダイレクトが使用できないため、ファイル内容をパイプで渡します。
   ```powershell
   Get-Content backend/migrations/001_create_tables.sql | docker compose exec -T db psql -U postgres -d attendance
   ```
3. サービスを起動します。
   ```bash
   docker compose up
   ```
4. フロントエンドは <http://localhost:8080>、API は <http://localhost:3000> にアクセスします。
5. `ADMIN_EMAILS` 環境変数で管理者アカウントのメールアドレスをカンマ区切りで指定できます。デフォルトでは `admin@example.com` が含まれています。
6. Microsoft Entra ID を利用せずにテストする場合は、環境変数 `USE_LOCAL_LOGIN=true` を設定すると `/api/auth/login` でシンプルなメールアドレス入力フォームが表示されます。Docker Compose を使用せずバックエンドを直接起動する場合は `http://localhost:3000/auth/login` を開いてください。
フロントエンドは静的 HTML で構成されているためビルド工程はありません。そのまま nginx コンテナから配信されます。
テスト実行方法:
```bash
cd backend
npm install
npm test
```

## Windows でのテスト手順

Windows 環境でアプリを動作確認する場合は、PowerShell で以下の手順を実行します。

1. リポジトリをクローンして移動します。
   ```powershell
   git clone https://github.com/<your-account>/team_train2.git
   cd team_train2
   ```
2. 依存パッケージをインストールしてテストを実行します。
   ```powershell
   cd backend
   npm install
   npm install express-session   # 必要に応じて追加
   npm test
   cd ..
   ```
3. データベースを起動し、マイグレーションを適用します。
   ```powershell
   docker compose up db -d
   Get-Content backend/migrations/001_create_tables.sql | docker compose exec -T db psql -U postgres -d attendance
   ```
4. すべてのコンテナを起動します。
   ```powershell
   $env:USE_LOCAL_LOGIN="true"   # ローカルログインを使う場合
   docker compose up
   ```
   フロントエンドは <http://localhost:8080/> 、API のヘルスチェックは <http://localhost:3000/health> で確認できます。

## VM 環境へのデプロイ

1. Azure などで Linux VM を作成し、Docker をインストールします。
2. その VM に本リポジトリをクローンします。
3. データベース用ポート `5432` はローカルホストのみに開放するようファイアウォールを設定します。
4. ローカル環境と同様に `docker compose up` を実行します。
5. `docker-compose.yml` 内で Microsoft Entra ID 用の環境変数を設定します。
6. `apt update && apt upgrade` など、パッケージマネージャーを使って定期的に VM を更新してください。

マイグレーションスクリプトは `backend/migrations/` にあります。

## アーキテクチャ

ER 図やシーケンス図は `docs/` フォルダーに配置しています。

## CI/CD（任意）

CI/CD を試したい方向けに、GitHub Actions のワークフロー (`.github/workflows/nodejs.yml`) を用意しています。

## UI スクリーンショット

ダッシュボード、日報入力画面、管理者ダッシュボードの例をここに掲載する予定です。(画像ファイルはリポジトリには含めていません)
