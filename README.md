# Native Example - 原生插件示例

这是一个基于 Rust 的原生插件示例，展示了如何通过动态链接库 (DLL/SO/Dylib) 扩展 AIO Hub 的后端能力。

## 功能特性

- ✅ **高性能**: 作为原生代码在主进程内运行，无跨进程通信开销。
- ✅ **长期运行**: 生命周期与主应用后端绑定，适合需要常驻的服务。
- ✅ **简化部署**: 无需管理独立的 Sidecar 进程。
- ✅ **C-ABI 接口**: 通过标准的 C 语言接口与 Tauri 后端交互。
- ✅ **完整的 Vue UI 界面**: 提供了一个简单的前端界面来调用原生方法。
- ✅ **支持开发和生产环境**: 提供了完整的构建和打包脚本。

## 开发环境

### 前置要求

- Rust 1.70+ 及 Cargo
- `cargo-watch` (用于开发时自动编译)
- Node.js 18+ (用于运行构建脚本)
- Bun (推荐) 或 npm

### 安装 cargo-watch

首次开发前，请先安装 `cargo-watch`：
```bash
cargo install cargo-watch
```

### 开发模式 - 自动重载

在插件目录下运行以下命令，启动开发模式：

```bash
# 启动自动监视模式（推荐）
bun run dev
```

该命令会启动 `cargo-watch` 来监视 `src/` 目录下的 Rust 源码。当代码发生变化时，它会自动重新编译 debug 版本的动态库。

- ✅ **Rust 部分自动编译**: 代码变更时，动态库会自动重新生成。
- ✅ **Vue 部分热重载**: `index.vue` 由主应用的 Vite 服务器处理，支持 HMR。
- ⚠️ **需要重启主应用**: 与 Sidecar 不同，原生插件被加载到主进程后无法热卸载。因此，在重新编译动态库后，**你需要手动重启 AIO Hub** 才能使改动生效。

## 生产构建与打包

### 构建

构建 release 版本的动态库和 Vue 组件：

```bash
# 1. 安装依赖
bun install

# 2. 执行构建
bun run build
```

### 打包发布

生成可分发的 `.zip` 插件包：

```bash
# 1. 安装依赖
bun install

# 2. 打包插件
bun run package
```

此命令会执行以下操作：
1.  **编译 Vue 组件**: `index.vue` → `dist-ui/index.js`
2.  **编译 Rust release 版本**: 生成 `.dll`, `.so`, 或 `.dylib`
3.  **创建 `dist/` 目录**，包含：
    ```
    dist/
    ├── lib/
    │   ├── native_example-windows-x64.dll
    │   └── ...
    ├── index.js           (编译后的 Vue 组件)
    ├── manifest.json      (生产环境配置)
    └── README.md
    ```
4.  **生成 `.zip` 压缩包**: `native-example-v1.0.0.zip`

## 目录结构

```
native-example/
├── src/
│   └── lib.rs             # Rust 源码
├── target/                # Cargo 构建产物（开发）
│   └── debug/
│       └── native_example.dll
├── dist/                  # 打包产物（生产）
├── dist-ui/               # Vue 构建产物（临时）
├── index.vue              # UI 组件
├── build.js               # 构建脚本
├── vite.config.js         # Vue 组件构建配置
├── Cargo.toml             # Rust 项目配置
├── manifest.json          # 插件清单
├── package.json           # 构建命令 + 依赖
└── README.md