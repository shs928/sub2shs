<div align="center">

<img src="assets/logo.svg" alt="Blessing API" width="88" />

# Blessing API

API キーの管理、AI ツールの接続、利用状況の確認をひとつの入口で。

[サービス](https://api.blessingshs.cc.cd/) · [接続ガイド](https://api.blessingshs.cc.cd/guide) · [Blessing Hub](https://blessingshs.cc.cd/) · [中文](README.md)

</div>

Blessing API は Blessing Hub の AI API サービスです。このリポジトリ `shs928/sub2shs` では、[Sub2API](https://github.com/Wei-Shaw/sub2api) を基にブランド、画面、接続ガイド、デプロイ手順をカスタマイズしています。

## 機能と構成

- API キー管理、利用状況の確認、残高とサブスクリプション。
- OpenAI 互換および Anthropic プロトコルの接続ガイド。
- 複数の上流アカウント、リクエスト転送、グループ、レート制限と課金管理。
- Hub と共通のアイコン、ライト・ダークテーマ、モバイル対応。

フロントエンドは `frontend/` の Vue 3・TypeScript、バックエンドは `backend/` の Go・Gin・Ent です。PostgreSQL と Redis を使用します。提供するモデルや機能はサイトの設定に従います。

## 開発とビルド

Node.js 24、pnpm 9、`backend/go.mod` に指定された Go バージョンを使用します。

```bash
git clone https://github.com/shs928/sub2shs.git
cd sub2shs/frontend
pnpm install --frozen-lockfile
pnpm dev
```

開発画面は既定で `http://localhost:3000`、API の接続先は `http://localhost:8080` です。バックエンドの設定例は [deploy/config.example.yaml](deploy/config.example.yaml) を参照してください。

```bash
cd frontend
pnpm run build
pnpm run test:run
```

フロントエンドの出力先は `backend/internal/web/dist` です。既存の本番バックエンドに合わせた静的フロントエンドは、リポジトリのルートで次のコマンドを実行して生成します。

```bash
node deploy/build-blessing-frontend.mjs
```

このコマンドはアップロードやサービスの再起動を行いません。詳細は [カスタマイズとデプロイの記録](docs/BLESSING_CUSTOMIZATION.md) および [中文 README](README.md) を参照してください。上流の既定イメージには本プロジェクトのカスタマイズが含まれないため、本リポジトリからビルドした成果物を使用してください。

## 出典とライセンス

ゲートウェイのコアは [Wei-Shaw/Sub2API](https://github.com/Wei-Shaw/sub2api) に基づいています。原作者とコントリビューターに感謝します。ライセンスはリポジトリの [LGPL v3](LICENSE) を引き継ぎます。問題の報告は [本プロジェクトの Issues](https://github.com/shs928/sub2shs/issues) にお願いします。
