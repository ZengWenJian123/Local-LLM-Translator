# Windows 本地翻译软件技术文档

## 一、文档目的

本技术文档用于指导 Codex 与开发者完成 Windows 本地翻译软件的工程实现。文档重点关注：

* 技术选型
* 系统架构
* 模块拆分
* 本地服务集成方案
* 数据流设计
* 前后端边界
* 本地化部署与运行方式
* 非功能性要求
* 开发约束

本文档与以下文档配套使用：

* 产品文档（PRD）
* UI 设计文档

本项目原则：

1. **尽可能使用成熟框架与开源组件**
2. **不让 Codex 手搓基础轮子**
3. **所有前端、后端与服务默认本地运行**
4. **不依赖云服务，除非未来用户主动扩展远程模型接入**
5. **优先实现轻量、稳定、可维护的个人工具**

---

## 二、总体技术目标

### 2.1 项目定位

该项目是一个 Windows 本地桌面翻译工具，支持：

* 文本翻译
* 图片翻译
* 文档翻译
* 本地沉浸式翻译
* 接入本地 OpenAI 兼容模型服务

当前已确认的本地模型服务：

* LM Studio
* Base URL：`http://192.168.20.10:1234`
* 默认模型：`qwen3.5 35B`

### 2.2 技术目标

* 桌面应用体积尽量小
* UI 响应快
* 结构清晰，便于 Codex 分模块生成代码
* 所有功能默认可离线或局域网内使用
* 尽量复用成熟开源组件，不重复造轮子

---

## 三、技术选型

## 3.1 桌面端

* **Tauri**：作为桌面应用容器

选择原因：

* 轻量
* 与 Web 技术栈兼容性好
* 适合本地桌面工具
* 原生能力接入较清晰

## 3.2 前端技术栈

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **shadcn/ui**
* **Lucide React**
* **Framer Motion**（仅少量使用）

选择原则：

* 组件生态成熟
* 文档完善
* 易于 Codex 生成与维护
* 避免重型后台组件库

## 3.3 前端状态与数据层

* **Zustand**：管理 UI 状态、本地会话状态、草稿状态
* **TanStack Query**：管理异步请求、缓存、重试、请求状态
* **React Hook Form**：管理设置表单
* **Zod**：表单 schema 校验

## 3.4 文件与输入处理

* **react-dropzone**：拖拽上传图片/文档
* 浏览器原生 `textarea`：文本输入首版直接使用
* Tauri 文件对话框：本地文件选择

## 3.5 本地数据库与持久化

* **SQLite**：本地历史记录、设置、术语库
* **tauri-plugin-sql** 或稳定 SQLite 集成方案：避免手写底层持久化逻辑
* 前端轻量缓存：Zustand persist 或 LocalStorage，仅用于 UI 偏好临时缓存

## 3.6 文档解析与内容提取

优先使用成熟开源库：

* **TXT**：原生读取
* **DOCX**：使用成熟解析库
* **PDF**：使用成熟 PDF 文本提取库

实现原则：

* MVP 优先保证“能提取文本”
* 首版不强求复杂版式还原
* 避免自行实现 PDF/DOCX 解析器

## 3.7 图片能力

* 图片 OCR **不单独引入传统 OCR 引擎**
* 统一由本地多模态大模型处理图片理解与翻译

实现方式：

* 前端读取图片
* 转为 Base64 或本地路径映射
* 传递给本地模型接口
* 模型返回识别结果与翻译结果

## 3.8 本地模型协议适配

* 使用 **OpenAI 兼容 Chat Completions / Responses 风格接口** 作为统一抽象
* 首版默认适配：**LM Studio 本地服务**
* 未来可扩展：Ollama、本地 vLLM、其他 OpenAI 兼容服务

## 3.9 不建议采用的方案

首版禁止或不推荐：

* Electron
* Redux
* Ant Design
* 手写组件库
* 手写网络请求层
* 手写数据库 ORM
* 自研 OCR 引擎
* 自研文档解析器
* 云端中转服务

---

## 四、系统总体架构

## 4.1 架构概览

系统采用“本地桌面前端 + Tauri 本地能力层 + 本地模型服务 + 本地数据库”的架构。

```text
┌──────────────────────────────────────────────────────┐
│                   Windows Desktop App                │
│                     (Tauri Shell)                    │
├──────────────────────────────────────────────────────┤
│ Frontend (React + TS + Vite)                         │
│ - 主翻译界面                                          │
│ - 设置页                                              │
│ - 历史记录抽屉                                        │
│ - 输入/输出组件                                       │
├──────────────────────────────────────────────────────┤
│ Tauri Native Layer                                    │
│ - 文件系统访问                                        │
│ - 本地数据库访问                                      │
│ - 系统剪贴板                                          │
│ - 窗口控制                                            │
│ - WebView / 本地沉浸式翻译扩展                        │
├──────────────────────────────────────────────────────┤
│ Local Service Layer                                   │
│ - LLM Provider Adapter                                │
│ - Translate Service                                   │
│ - Image Translate Service                             │
│ - Document Parse Service                              │
│ - History Service                                     │
├──────────────────────────────────────────────────────┤
│ Local Dependencies                                    │
│ - LM Studio (OpenAI-compatible API)                   │
│ - SQLite                                              │
│ - Local Files                                          │
└──────────────────────────────────────────────────────┘
```

## 4.2 分层原则

* **UI 层**：只处理展示与交互
* **应用层**：只处理业务流程与状态编排
* **服务层**：只处理翻译、解析、持久化等能力
* **适配层**：只处理第三方协议或本地服务调用
* **基础设施层**：文件、数据库、系统能力

---

## 五、核心模块设计

## 5.1 前端 UI 模块

### 模块职责

* 页面渲染
* 输入采集
* 翻译结果展示
* 状态提示
* 设置配置

### 组件划分

```text
src/
  app/
  pages/
    translator/
    settings/
  components/
    common/
    translator/
    settings/
    history/
  hooks/
  stores/
  services/
  lib/
  types/
```

## 5.2 翻译编排模块

### 模块职责

* 根据输入类型选择翻译流程
* 执行文本切分
* 执行多段合并
* 控制流式输出
* 记录请求耗时与异常

### 主要流程

* 文本翻译流程
* 图片翻译流程
* 文档翻译流程

## 5.3 模型适配模块

### 模块职责

* 统一封装本地模型请求
* 屏蔽 LM Studio 与未来其他 provider 差异
* 提供连接测试能力
* 提供模型列表拉取能力（如服务支持）

### 设计原则

* 统一接口
* 明确超时、重试与取消
* 不在 UI 里直接写请求细节

## 5.4 文档解析模块

### 模块职责

* 根据文件类型执行解析
* 抽取原始文本
* 基于规则切段
* 输出统一结构给翻译模块

## 5.5 历史记录模块

### 模块职责

* 保存翻译任务摘要
* 保存输入/输出文本
* 支持搜索、删除、重载
* 控制历史记录保留数量

## 5.6 设置模块

### 模块职责

* 保存模型连接信息
* 保存默认翻译偏好
* 保存输入行为设置
* 保存本地沉浸式翻译设置

## 5.7 本地沉浸式翻译模块（后续）

### 模块职责

* 加载本地 WebView 页面
* 注入脚本抓取 DOM 文本
* 替换页面文本或覆盖显示译文
* 支持开关与回滚

---

## 六、推荐目录结构

```text
project-root/
├─ src-tauri/
│  ├─ src/
│  │  ├─ commands/
│  │  ├─ db/
│  │  ├─ services/
│  │  ├─ models/
│  │  ├─ utils/
│  │  └─ lib.rs
│  ├─ tauri.conf.json
│  └─ Cargo.toml
├─ src/
│  ├─ app/
│  ├─ pages/
│  │  ├─ translator/
│  │  └─ settings/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ translator/
│  │  ├─ settings/
│  │  └─ history/
│  ├─ stores/
│  ├─ services/
│  ├─ adapters/
│  ├─ hooks/
│  ├─ lib/
│  ├─ schemas/
│  ├─ types/
│  └─ main.tsx
├─ public/
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

目录原则：

* UI 和业务服务分开
* provider adapter 独立
* schema 与 type 独立
* Tauri 命令与前端 service 分层

---

## 七、核心数据结构设计

## 7.1 输入数据结构

```ts
type InputMode = 'text' | 'image' | 'document'

interface TranslateInput {
  mode: InputMode
  sourceLanguage: 'auto' | 'zh' | 'en' | 'ru'
  targetLanguage: 'zh' | 'en' | 'ru'
  text?: string
  imagePath?: string
  documentPath?: string
}
```

## 7.2 翻译结果结构

```ts
interface TranslationSegment {
  index: number
  sourceText: string
  translatedText: string
}

interface TranslationResult {
  taskId: string
  mode: InputMode
  sourceLanguage: string
  targetLanguage: string
  segments: TranslationSegment[]
  plainText: string
  elapsedMs: number
  provider: string
  model: string
}
```

## 7.3 模型配置结构

```ts
interface ProviderConfig {
  id: string
  name: string
  providerType: 'lmstudio' | 'openai-compatible'
  baseURL: string
  apiKey?: string
  model: string
  timeoutMs: number
  enabled: boolean
}
```

## 7.4 历史记录结构

```ts
interface HistoryRecord {
  id: string
  mode: InputMode
  sourceLanguage: string
  targetLanguage: string
  sourcePreview: string
  translatedPreview: string
  provider: string
  model: string
  createdAt: string
  favorite: boolean
}
```

## 7.5 设置结构

```ts
interface AppSettings {
  defaultTargetLanguage: 'zh' | 'en' | 'ru'
  autoDetectSourceLanguage: boolean
  enableStreaming: boolean
  enableClipboardWatch: boolean
  enableCtrlEnterTranslate: boolean
  historyLimit: number
  exportDirectory?: string
}
```

---

## 八、前后端边界设计

## 8.1 前端负责

* 界面渲染
* 表单输入
* 页面状态
* 调用 Tauri command 或前端 service
* 展示翻译结果与错误状态

## 8.2 Tauri / 本地服务负责

* 文件读取
* 文档解析
* SQLite 存取
* 系统能力调用
* 本地模型请求代理（按实际实现决定）

## 8.3 是否需要独立本地后端服务

结论：**首版不建议单独起一个本地 HTTP 后端。**

原因：

* 当前项目为个人轻量工具
* Tauri + 前端 + 本地模型服务 已足够
* 再加一个本地 Node / Python 服务会增加复杂度
* 除非后续需要重型文档处理、复杂任务队列或插件隔离

推荐实现：

* 前端直接通过统一 service 调用 Tauri command 与本地模型接口
* Rust 侧负责需要本地权限与安全边界的能力

---

## 九、翻译流程设计

## 9.1 文本翻译流程

```text
用户输入文本
→ 前端校验
→ 判断源语言/目标语言
→ 执行切段
→ 构造 Prompt
→ 调用本地 LLM Provider
→ 接收流式或非流式结果
→ 合并结果
→ 展示译文
→ 写入历史记录
```

## 9.2 图片翻译流程

```text
用户上传图片
→ 前端生成预览
→ 图片路径/内容传入翻译服务
→ 构造多模态请求
→ 调用本地模型
→ 返回识别文本与译文
→ 前端展示结果
→ 写入历史记录
```

## 9.3 文档翻译流程

```text
用户上传文档
→ 调用文档解析模块
→ 抽取文本
→ 分段
→ 构造翻译任务
→ 调用本地模型
→ 合并结果
→ 展示对照内容
→ 支持导出
→ 写入历史记录
```

---

## 十、Prompt 与翻译策略设计

## 10.1 Prompt 构建原则

* 简洁
* 明确目标语言
* 明确保留术语一致性
* 明确仅输出译文或双语结果
* 不将复杂业务逻辑堆进 Prompt

## 10.2 示例 Prompt

```text
请将以下内容翻译为目标语言。
要求：
1. 保持原意准确
2. 保持术语一致
3. 不额外解释
4. 直接输出译文

目标语言：英文
文本：
{content}
```

## 10.3 长文本处理策略

* 按段落优先切分
* 超长段落按字符数二次切分
* 保留 segment index
* 翻译完成后按顺序合并

## 10.4 一致性策略

* 同一任务共享基础系统提示
* 后续阶段可追加术语库注入
* 首版不做复杂记忆链路

---

## 十一、数据库设计

## 11.1 表设计建议

### `provider_configs`

* id
* name
* provider_type
* base_url
* api_key
* model
* timeout_ms
* enabled
* created_at
* updated_at

### `app_settings`

* id
* default_target_language
* auto_detect_source_language
* enable_streaming
* enable_clipboard_watch
* enable_ctrl_enter_translate
* history_limit
* export_directory
* updated_at

### `history_records`

* id
* mode
* source_language
* target_language
* source_preview
* translated_preview
* source_text
* translated_text
* provider
* model
* favorite
* created_at

### `glossary_terms`（后续）

* id
* source_term
* target_term
* note
* created_at

## 11.2 数据库原则

* 首版只保留必要表
* 不引入重量级 ORM
* 如有成熟轻量查询方案可直接复用
* API Key 要加密保存或最少进行本地安全保护

---

## 十二、API 与服务抽象设计

## 12.1 Provider 接口

```ts
interface LLMProvider {
  name: string
  testConnection(): Promise<boolean>
  translateText(input: TranslateInput): Promise<TranslationResult>
  translateImage(input: TranslateInput): Promise<TranslationResult>
  translateDocument(input: TranslateInput): Promise<TranslationResult>
}
```

## 12.2 前端服务层建议

```text
src/services/
  provider-service.ts
  translate-service.ts
  document-service.ts
  history-service.ts
  settings-service.ts
```

## 12.3 适配器层建议

```text
src/adapters/
  llm/
    lmstudio-adapter.ts
    openai-compatible-adapter.ts
```

原则：

* 所有 provider 请求都走 adapter
* UI 不直接请求模型接口
* 所有异常在 service 层归一化

---

## 十三、本地沉浸式翻译技术方案（后续阶段）

## 13.1 目标

在本地 WebView 页面中对网页文本执行翻译与替换，实现类沉浸式翻译体验。

## 13.2 技术实现思路

* Tauri 打开 WebView 窗口
* 注入 JS 脚本
* 遍历 DOM 文本节点
* 提取可翻译内容
* 发送到本地翻译服务
* 替换原节点内容或以覆盖层方式显示译文

## 13.3 风险点

* 页面动态渲染内容多
* DOM 结构复杂
* 批量替换可能影响页面布局
* 不同网站文本节点抽取规则差异大

## 13.4 处理策略

* 首版仅支持“手动触发整页翻译”
* 不做自动监听页面变化
* 不做复杂网页兼容逻辑
* 后续再逐步增强

---

## 十四、异常处理与容错设计

## 14.1 需要统一处理的异常

* 模型服务不可达
* 请求超时
* 模型返回空结果
* 图片/文档读取失败
* 文件类型不支持
* 数据库存取失败

## 14.2 处理原则

* UI 给出明确错误文案
* 异步请求提供重试能力
* 可恢复错误不导致应用崩溃
* 失败记录不写入正式历史，可写入日志

## 14.3 超时与取消

* 请求必须支持超时设置
* 长任务允许取消
* 流式任务取消后应立即停止 UI 更新

---

## 十五、性能设计

## 15.1 首版性能目标

* 短文本翻译：响应尽量控制在 3 秒内
* 主界面操作无明显卡顿
* 切换页面与抽屉流畅

## 15.2 性能策略

* 长文本切段
* 图片预览与原图分离
* 结果懒渲染
* 历史列表分页或虚拟化（数据量大时）
* 避免在 React 中存放过大原始二进制内容

---

## 十六、安全与隐私设计

## 16.1 安全原则

* 默认所有数据本地保存
* 不上传云端
* 不依赖第三方云 API
* 配置和历史记录仅保存在本机

## 16.2 敏感信息处理

* API Key 本地安全存储
* 日志中不打印完整密钥
* 文档与图片处理尽量走临时路径

## 16.3 权限控制

* 最小化 Tauri 权限
* 文件系统权限按需开放
* 不开放无关系统能力

---

## 十七、开发规范与 Codex 约束

## 17.1 总体原则

* 优先使用成熟库
* 优先使用现成插件
* 禁止手写基础设施轮子
* 禁止把所有逻辑堆在单文件
* 保持模块可替换

## 17.2 明确要求 Codex 不要手搓的内容

* 不手写自定义组件库
* 不手写状态管理框架
* 不手写 HTTP 请求封装底层
* 不手写表单校验框架
* 不手写数据库驱动
* 不手写 PDF/DOCX 解析器
* 不手写拖拽上传能力
* 不手写图标系统
* 不手写复杂动画系统

## 17.3 要求 Codex 优先使用的成熟方案

* UI：shadcn/ui
* 样式：Tailwind CSS
* 状态：Zustand
* 异步请求：TanStack Query
* 表单：React Hook Form + Zod
* 拖拽：react-dropzone
* 图标：Lucide React
* 本地存储：SQLite
* 桌面能力：Tauri plugin / 官方能力

## 17.4 代码风格要求

* TypeScript 严格模式
* 函数单一职责
* 业务逻辑与 UI 分离
* adapter / service / store / component 分层
* 所有接口与类型显式定义

---

## 十八、MVP 技术实现范围

## P0

* Tauri 桌面壳
* React 主翻译页
* 文本翻译
* LM Studio 本地模型接入
* 设置页
* 历史记录
* SQLite 本地持久化

## P1

* 图片翻译
* 文档翻译
* 流式输出
* 导出结果

## P2

* 术语库
* 沉浸式翻译
* 悬浮窗
* 剪贴板监听

---

## 十九、推荐实施顺序

### 阶段一：工程骨架

1. 初始化 Tauri + React + TypeScript + Vite
2. 接入 Tailwind + shadcn/ui
3. 接入 Zustand + TanStack Query
4. 搭建页面骨架与路由/布局

### 阶段二：基础能力

1. 设置页表单
2. Provider 配置存储
3. LM Studio 连接测试
4. 文本翻译主链路

### 阶段三：持久化与体验

1. SQLite 历史记录
2. 复制/导出
3. 错误提示
4. 流式输出

### 阶段四：扩展能力

1. 图片翻译
2. 文档翻译
3. 术语库
4. 沉浸式翻译

---

## 二十、给 Codex 的最终技术约束

请严格按照以下技术约束实施：

```md
- Desktop: Tauri
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- State Management: Zustand
- Request State / Cache: TanStack Query
- Forms: React Hook Form + Zod
- Icons: Lucide React
- Drag & Drop: react-dropzone
- Local Database: SQLite
- Local Model Service: LM Studio (OpenAI-compatible API)

约束：
1. 不使用 Electron
2. 不使用 Redux
3. 不使用 Ant Design
4. 不自研组件库
5. 不自研 OCR 引擎
6. 不自研 PDF / DOCX 解析器
7. 不增加云端中转服务
8. 不拆出额外本地 HTTP 后端，除非后续复杂度确实需要
9. 所有能力默认本地运行
10. 所有请求、存储、解析能力必须模块化封装
```

---

## 二十一、结论

本项目的最佳技术路径是：

* 用 **Tauri + React** 构建轻量桌面应用
* 用 **LM Studio** 作为本地模型服务
* 用 **SQLite** 作为本地持久化方案
* 用 **成熟开源组件** 代替自研基础设施
* 用 **清晰分层** 帮助 Codex 稳定生成和维护代码

该技术方案适合你的当前目标：
**个人工具、轻量、本地优先、可逐步扩展。**
