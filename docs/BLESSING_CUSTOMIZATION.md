# Blessing Hub 界面定制

本版将默认首页、登录注册外壳及控制台的公共样式统一为米白、橙色和鼠尾草色，保留原有账户、网关、计费与功能开关。

## 页面与设置

- `/home`：工作空间入口、三步接入、模型广场（遵循启用及登录要求）、用量查询和 Hub 返回链接。
- `/guide`：公开接入指引，支持 OpenAI 兼容与 Anthropic 两种协议，复制客户端地址和带占位符的 Bash/cURL 示例。地址来自后台的 API 地址设置；未设置时使用当前域名。页面不会发起模型请求或读取用户密钥。
- `/login`、`/register` 及共用认证页：统一的品牌介绍与表单布局。
- 控制台：共享色板、卡片和导航样式，侧栏增加接入指引和返回 Hub；用户仪表盘增加指引入口。

后台站点名称、Logo、副标题仍优先生效。前端未取得站名时使用 `Blessing API`，默认 Logo 使用与 Hub favicon 相同的橙底白色四格图标。源码不会覆盖站点设置；2026-11-10 生产发布另行备份并更新了名称和副标题，Logo 保持原本的空配置，使用默认图标。

### 2026-11-12 仓库与品牌清理

- 主 README 改为本项目的中文说明；原中文入口指向主说明，日文说明同步精简，移除继承的广告、赞助商和原版下载宣传。
- `assets/logo.svg` 与 `frontend/public/logo.svg` 复用相邻 `hub/public/favicon.svg`，登录注册页、导航与浏览器图标统一使用该资源；后台自定义 Logo 仍优先。
- 移除闲置赞助素材和代理推广组件，页面仓库链接指向 `shs928/sub2shs`，补齐默认站名及中英文引导文案。
- 保留上游来源、许可证、兼容协议、存储标识和既有服务名，便于维护与数据兼容。
- 兼容构建同步纳入品牌文件；设置页只替换品牌文字，沿用生产基线的业务实现。本次清理已发布到生产，详见文末 2026-11-12 发布记录。

已有的自定义首页 HTML/URL 仍优先于内置首页；需清空该设置才能展示本版首页。简洁首页模式仍支持。管理模式继续使用原公共路由限制，不因为加入指引而放开用户功能。

## 修改入口

- `frontend/tailwind.config.js`：共享颜色与阴影；`frontend/src/style.css`：公共组件与 `--hub-*` 设计变量。
- `frontend/src/styles/blessing.css`：控制台欢迎区与布局细节。
- `frontend/src/views/HomeView.vue`、`GuideView.vue`：首页与接入指引。
- `frontend/src/components/layout/`：认证和控制台布局。
- `frontend/src/i18n/locales/{zh,en}/blessing*.ts`：本版中英文文案。

亮橙用于图形和强调，按钮及小字号文字使用较深橙色确保对比；深色主题使用对应的背景、文字和按钮前景变量。

## 构建与发布

前端使用 **pnpm 9**，与仓库 Docker 构建一致：

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm run build
```

构建包含双语 key 检查、TypeScript 检查与 Vite 打包，输出到 `backend/internal/web/dist`，供 Go embed 构建使用。完整镜像从仓库根目录 Dockerfile 构建。仓库默认 Compose 的 `weishaw/sub2api:latest` 是上游镜像，不会包含本次定制；发布时应改为自己的镜像标签，并沿用已有数据库、Redis 与应用数据卷。

### 保持现有生产后端的兼容构建

现有生产后端对应提交 `ac1b8f1271be0d674fa6f074403c1410f30a3a81`（版本 `0.2.18`）。只发布本版 UI 时，从该提交的前端构建，再覆盖明确列出的界面文件，避免将当前分支新增的管理 API 功能带给旧后端：

```sh
# 先在 frontend 中用 pnpm 9 安装当前锁定依赖，再回到仓库根目录
node deploy/build-blessing-frontend.mjs

# 更换已核对过的生产基线时
node deploy/build-blessing-frontend.mjs --ref <production-commit>
```

脚本使用 Git archive 和系统 tar 提取基线的 `frontend` 与 `docs/legal`，检查基线与当前 `package.json`、`pnpm-lock.yaml` 完全一致（忽略换行差异），然后通过目录链接复用当前 `node_modules`。文件覆盖名单写在脚本中，不依赖是否已提交；双语 index 从基线加入五个 `blessing*` 模块，不复制当前 index 中的新管理模块。

构建直接用 Node 执行本地 Vitest、vue-tsc 和 Vite，避免全局 pnpm 版本差异。双语检查、指南工具、首页、标题、图标与注册验证测试、类型检查和打包都成功后，才替换以下输出：

- `docs-local/production-frontend/source/`：兼容源码快照。
- `docs-local/production-frontend/dist/`：完整静态发布目录。
- `docs-local/production-frontend/build-manifest.json`：基线提交、构建时间、覆盖文件哈希与入口文件哈希。

该目录已忽略，不进入 Git。失败的构建不覆盖上一次成功产物。脚本不会编译、替换后端或迁移数据库；将来如果前端依赖发生变化，脚本会拒绝复用不匹配的依赖，需要先重新评估生产基线。

静态发布应使用原站点域名，将已知 SPA 页面与实际静态文件交给 Nginx，其他请求继续反代到原后端。必须保留 `/api/`、网关、OAuth 回调 API、WebSocket 与 `/setup/status` 等现有路径。HTML 使用 `no-cache`，带哈希资源使用长期缓存，并保留上一版资源支持打开中的页面。面板 API 固定使用同源 `/api/v1`；后台公开的 `api_base_url` 仍用于生成用户的模型接入指引。未注入 `window.__APP_CONFIG__` 时，前端自动读取公开设置。

### 2026-11-10 生产发布记录

已部署至 `https://api.blessingshs.cc.cd`，发布编号 `20261110T093816Z`。

- 线上后端仍为 `0.2.18` / `ac1b8f1271be0d674fa6f074403c1410f30a3a81`；容器未重建、未重启，未执行数据库结构迁移。
- 静态目录：`/var/www/blessing-api/releases/20261110T093816Z`；`/var/www/blessing-api/current` 原子链接到该版本。
- 哈希资源：`/var/www/blessing-api/shared/assets`；缺失资源回落原后端，兼容已打开的旧页面。
- 入口脚本：`/assets/index-CO7V7dyk.js`。
- 原始 `index.html` SHA256：`cd16e60a7a23174e543e49779aabaa179409bbe13586b72f035112184bf6e439`。Cloudflare 可能修改公网响应 HTML，因此以源站文件和入口资源为准。
- 只更新 `/etc/nginx/conf.d/sub2api.conf`。明确的页面路由（含两个 alias）、`/index.html`、`/logo.svg` 和 `/assets/` 由 Nginx 提供；其他请求继续交给原 Go 服务。`/setup/status` 与根路径模型端点不被 SPA 接管。
- HTML 禁止缓存；带哈希资源长期缓存。安全响应头继承原后端策略，仅移除静态 HTML 不使用的动态 nonce。
- 数据库只更新 `site_name` 与 `site_subtitle`：名称为 `Blessing API`，副标题为“一个入口，管理你的 API 密钥、连接常用工具，让灵感与日常工作顺畅衔接。”更新前备份原值，事务内锁行并检查并发修改。

备份目录 `/var/backups/blessing-api/20261110T093816Z`（仅 root 可访问）包含原 Nginx 配置、原品牌设置、构建清单、发布状态和回滚脚本。回滚命令：

```sh
sudo sh /var/backups/blessing-api/20261110T093816Z/rollback.sh
```

回滚先确认当前 Nginx 配置仍与本次发布一致，再恢复原配置和链接、检查并 reload Nginx，最后恢复品牌。若之后有人修改品牌，不覆盖其修改，并打印需人工复核的信息。数据库不可用也不会阻止界面回滚；该故障分支已在隔离临时目录用模拟调用验证，未在生产执行回滚。

发布脚本为 `deploy/publish-blessing-frontend.py`，在 Linux 源站运行；它接收仅包含 `index.html`、`logo.svg`、`assets/` 的 tar.gz、归档 SHA256、构建 manifest、路由 JSON、UTC 发布编号和基线提交。路由 JSON 从兼容源码 `frontend/src/router/index.ts` 的 `path` 与 `alias` 提取，动态页面仅支持 `/legal/:documentId`、`/custom/:id`，不接管 catch-all。脚本验证运行镜像提交、归档路径与入口哈希，备份后切换，验证失败自动恢复。

验收结果：

- 兼容构建 30 项测试、TypeScript 与 Vite 通过；发布候选 Nginx 完整配置检查通过。
- 12 项源站探针发布前后状态与类型一致：健康检查、安装状态为 200 JSON；受保护面板、OpenAI、Anthropic、Gemini 与根路径别名均为预期的 401 JSON。
- 新页面、入口资源、Logo 校验通过；旧资源回退返回 200 JavaScript。
- 公网浏览器确认首页、登录、注册、接入指南；指南协议切换和地址复制正常，手机页面无横向溢出，所查页面无控制台错误。
- Hub、酒馆与游戏站首页仍为 200，内容哈希与发布前一致。

本次未提交真实注册、登录或付费模型请求；生产认证后业务流程未重新走通。本仓库包含定制源码、兼容构建与发布脚本；`docs-local/` 中的预览、构建产物和本地部署记录不进入 Git。

### 2026-11-12 品牌清理发布

已部署至 `https://api.blessingshs.cc.cd`，发布编号 `20261112T080821Z`。

- 线上后端仍为 `0.2.18` / `ac1b8f1271be0d674fa6f074403c1410f30a3a81`；容器 ID、启动时间均与发布前一致，没有重启后端或迁移数据库结构。
- 静态目录：`/var/www/blessing-api/releases/20261112T080821Z`；`current` 已原子切换，旧版本和哈希资源保留。
- 入口脚本：`/assets/index-BR7WX1z1.js`；源站 `index.html` SHA256：`ed7e9eb83e75819c14159ce98f91dfd36f6a8980f7801c445b214fe7d492fd6b`。
- `/logo.svg` 与 Hub 图标完全一致，SHA256：`459ccf28a2401d659726f9377bb9c18cf05e91cca1becface248a699611d2fc6`。
- 本地普通构建、生产兼容构建、TypeScript、变更源码 ESLint 及 71 项相关测试通过。
- 12 项源站健康与鉴权探针发布前后结果一致；旧入口脚本仍返回 200 JavaScript。
- 从服务器经公网 HTTPS / Cloudflare 验证首页、`/home`、登录、注册、指南、Logo、入口脚本和健康接口共 8 项，均返回 200。所有页面包含新入口；Logo 与入口脚本内容哈希匹配发布产物。
- Hub、酒馆、历史站首页均为 200，内容哈希与发布前相同。

备份目录：`/var/backups/blessing-api/20261112T080821Z`，包含原配置、旧版本链接信息、构建清单、验收记录和回滚脚本。

```sh
sudo sh /var/backups/blessing-api/20261112T080821Z/rollback.sh
```

本次未执行真实注册、登录或付费模型请求；浏览器自动化工具连续超时，未完成浏览器视觉及交互验收。本次公网检查通过服务器发起，本机直接公网请求遇到连接重置。源站与公网响应已核对，新图标和入口资源确认生效。

### 卡密充值维护

- 卡密平台：链动小铺；公开分类入口为 `https://wzyp.cn/shop/M5WZ72DP/p8rlue`。
- 面额为 1／5／10／20／50 元，按 1 元人民币对应 $1 平台额度，首批每档 10 张。
- 在本项目后台生成 `balance` 类型、对应美元面值的兑换码，逐档导入同面额商品。库存每行一个完整兑换码，禁止将未使用卡密加入 Git、截图或公开文档。
- 前端复用公开设置 `purchase_subscription_enabled=true`、`purchase_subscription_url=<公开分类链接>`；`payment_enabled` 继续关闭。设置备份后再更新，不修改支付商户密钥或用户余额。
- `frontend/src/components/common/CardRechargePanel.vue` 提供购买说明和面额展示；`utils/cardRecharge.ts` 只接受平台的 HTTPS 公开店铺、分类或商品链接，拒绝商家后台地址和含用户密码的 URL。
- 首页和 `/redeem` 根据有效配置展示入口；购买页在新标签页打开，不向卡密平台附带登录令牌、用户邮箱或本站密钥。
- 卡密售出后由用户登录 `/redeem` 兑换。付款回跳不作为入账凭据，现有后端负责验证、单次使用和余额入账。
