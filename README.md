# Music App

跨平台音乐播放应用，支持 Web、移动 App、电视和平板端。

## 技术栈

- **语言**: TypeScript
- **Web**: React + Vite + React Router + PWA
- **移动端**: React Native + Expo (待实现)
- **状态管理**: Zustand + TanStack Query
- **样式**: Tailwind CSS
- **音频**: Web Audio API (Web) / react-native-track-player (Native)
- **本地缓存**: IndexedDB (Web) / MMKV (Native)

## 项目结构

```
music-app/
├── packages/
│   ├── core/          # 核心逻辑：领域模型、API client、状态管理、接口定义
│   ├── ui/            # 共享 UI 组件
│   └── tsconfig/      # 共享 TypeScript 配置
├── apps/
│   ├── web/          # Web 应用 (Vite + React + PWA)
│   ├── mobile/       # 移动应用 (React Native + Expo)
│   ├── tv/           # 电视应用
│   └── pad/          # 平板应用
└── package.json      # Monorepo 根配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

Web 应用将在 http://localhost:3000 启动。

### 构建

```bash
npm run build
```

### 类型检查

```bash
npm run typecheck
```

### 代码检查

```bash
npm run lint
```

## 架构设计

采用 **共享内核 + 平台外壳** 架构：

- **Core 层**: 纯逻辑、无 UI、无平台副作用，可被任意外壳复用
- **Shell 层**: 各端入口，注入平台实现（AudioEngine、MediaCache）
- **后端 API**: 前端唯一数据来源，支持本地存储，可扩展至 Redis/S3

### 核心接口

- **AudioEngine**: 音频播放抽象，Web 用 Web Audio API，Native 用 track-player
- **MediaCache**: 媒体缓存抽象，Web 用 IndexedDB，Native 用 MMKV/FileSystem
- **MusicApiClient**: API 客户端，统一的后端数据访问层

## API 契约

前端期望的后端 API 端点：

| 资源 | 方法 & 路径 |
|---|---|
| 鉴权 | `POST /auth/login` `POST /auth/register` `POST /auth/refresh` |
| 曲目 | `GET /tracks` `GET /tracks/{id}` `GET /tracks/{id}/stream` |
| 专辑 | `GET /albums` `GET /albums/{id}` |
| 艺人 | `GET /artists` `GET /artists/{id}` |
| 歌单 | `GET /playlists` `POST /playlists` |
| 搜索 | `GET /search?q=&type=` |
| 用户 | `GET /users/me` `GET /me/history` `GET /me/favorites` |

## 扩展性

- **存储扩展**: 后端 FileStorage 接口可在本地磁盘 ↔ Redis ↔ S3 间切换，前端无感
- **离线支持**: PWA + IndexedDB 缓存，断网可播
- **跨端复用**: Core 层代码在 Web、Mobile、TV、Pad 间共享

## 开发计划

- [x] Core 包：类型定义、API 客户端、状态管理
- [x] UI 包：共享组件库
- [x] Web 应用：完整功能实现
- [ ] Mobile 应用：React Native + Expo
- [ ] TV 应用：Web 外壳或 React Native TV
- [ ] Pad 应用：响应式 Web 或 React Native 平板优化

## License

MIT
