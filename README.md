<div align="center">

<img src="assets/logo.svg" alt="Blessing API" width="88" />

# Blessing API

一个入口，管理 API 密钥、连接 AI 工具、查看用量。

[访问服务](https://api.blessingshs.cc.cd/) · [接入指南](https://api.blessingshs.cc.cd/guide) · [Blessing Hub](https://blessingshs.cc.cd/) · [日本語](README_JA.md)

</div>

Blessing API 是 Blessing Hub 的 AI API 服务。本仓库 `shs928/sub2shs` 基于 [Sub2API](https://github.com/Wei-Shaw/sub2api) 定制，维护自己的品牌界面、接入指引和发布流程。

Hub 的[项目导航](https://blessingshs.cc.cd/projects/)、搜索和 RSS 统一使用 **Blessing API**，介绍密钥管理、接入指南、用量与余额查询和卡密充值。对外名称与图标保持一致；仓库名和既有部署目录保持兼容。

## 功能

- 首页、公开接入指南，以及 OpenAI 兼容和 Anthropic 协议的客户端配置示例。
- 用户注册登录、API 密钥管理、用量查询、余额和订阅。
- 多平台上游账号、请求转发、分组调度、限流与计费管理。
- 中英文界面、深浅主题和手机布局，使用与 Hub 一致的图标和配色。

实际开放的模型、支付方式和功能以站点设置为准。

## 项目结构

| 目录 | 内容 |
| --- | --- |
| `frontend/` | Vue 3、TypeScript、Vite、Tailwind CSS 前端 |
| `backend/` | Go、Gin、Ent 后端，使用 PostgreSQL 和 Redis |
| `assets/logo.svg` | 仓库图标，与 Hub 的 favicon 一致 |
| `deploy/` | 容器配置、前端兼容构建和发布脚本 |
| `docs/BLESSING_CUSTOMIZATION.md` | 本项目的界面、构建与部署记录 |
| `docs-local/` | 本地构建与预览资料，不提交到 Git |

## 本地开发

使用 Node.js 24、pnpm 9，以及 `backend/go.mod` 指定的 Go 版本；后端需要 PostgreSQL 和 Redis。

```bash
git clone https://github.com/shs928/sub2shs.git
cd sub2shs/frontend
pnpm install --frozen-lockfile
pnpm dev
```

开发前端默认在 `http://localhost:3000`，将 API 反代至 `http://localhost:8080`。可通过 `VITE_DEV_PORT` 和 `VITE_DEV_PROXY_TARGET` 调整。

后端配置参考 [deploy/config.example.yaml](deploy/config.example.yaml)，放入 `backend/config.yaml` 后，在另一终端启动：

```bash
cd backend
go run ./cmd/server
```

本地配置和密钥不进入 Git。首次启动按安装向导完成初始化。

## 构建与检查

```bash
cd frontend
pnpm run build
pnpm run test:run
```

前端构建会检查中英文 key 和 TypeScript，产物写入 `backend/internal/web/dist`。需要将前端嵌入后端时，先完成前端构建，再从仓库根目录执行：

```bash
cd backend
go build -tags embed -o bin/server ./cmd/server
```

也可从仓库根目录构建自己的镜像：

```bash
docker build -t blessing-api:local .
```

## 卡密充值

[卡密店铺](https://wzyp.cn/shop/M5WZ72DP/p8rlue)提供 1／5／10／20／50 元额度卡，按 **1 元人民币兑换 $1 平台额度**。用户在店铺购买并领取卡密，登录本站的[卡密充值页](https://api.blessingshs.cc.cd/redeem)提交兑换码，额度进入当前登录账号。

后台生成 `balance` 类型兑换码，美元面值须与商品面额一致；再将每行一个兑换码的 TXT 导入对应商品库存。付款和发卡由卡密平台处理，本站保留原有的单次兑换、余额更新和兑换记录。仅付款或返回本站不会自动入账，必须兑换成功。

购买入口复用后端已有的 `purchase_subscription_enabled` 和 `purchase_subscription_url` 公开设置，链接指向公开店铺或商品页。本站不需要开启 `payment_enabled`，也不需要配置在线支付回调。库存 TXT、登录凭据和部署备份均不进入 Git。

## 发布

现有生产部署采用独立静态前端和既有后端。只更新界面时，使用与生产后端匹配的兼容构建：

```bash
node deploy/build-blessing-frontend.mjs
```

它会检查生产基线和依赖，生成 `docs-local/production-frontend/`，不会直接上传或重启服务。发布步骤、后端基线和回滚说明见 [Blessing 定制与部署记录](docs/BLESSING_CUSTOMIZATION.md)。

`deploy/` 中继承的上游安装脚本和默认镜像可能获取原版程序；发布本项目时应使用本仓库构建的镜像或兼容静态产物。更新代码后重新构建、发布，线上站点才会改变。

## 来源与许可

网关核心基于 [Wei-Shaw/Sub2API](https://github.com/Wei-Shaw/sub2api)，感谢原作者与贡献者。本项目维护 Blessing 品牌、界面及部署定制，沿用仓库中的 [LGPL v3 许可证](LICENSE)。

模型服务的使用须遵守对应服务商的条款。问题与改进建议请提交至 [本项目 Issues](https://github.com/shs928/sub2shs/issues)。
