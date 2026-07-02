# AGENTS.md - Native 示例插件协作规范

## 插件定位

- 本仓库是 AIO Hub 的独立 native 示例插件仓库，插件 ID 为 `native-example`。
- 插件类型为 `native`，Rust crate 类型为 `cdylib`。
- 主要用途是演示宿主加载原生动态库、通过 ABI 调用方法，以及配套 Vue UI。
- `manifest.json` 当前声明 `reloadable: true`，并为 Windows、macOS、Linux 指定动态库路径。

## 关键文件

- `manifest.json` 是 native 库路径、方法声明、host 版本和 UI 组件的事实来源。
- `src/lib.rs` 暴露 ABI：`call` 和 `free_string`，并在 `call` 内按 `method` 分发。
- `Cargo.toml` 必须保留 `[lib] crate-type = ["cdylib"]`。
- `NativeExample.vue` 是 UI 入口。
- `build.js` 和 `package.json` 负责 Rust/Vue 构建及打包。

## 实现约束

- ABI 契约必须稳定：`call(_method_name_ptr, payload_ptr) -> *mut c_char` 和 `free_string(ptr)` 不要随意改签名。
- Native 返回值必须是宿主可解析的 JSON 字符串；错误也应返回 JSON，而不是 panic 或裸文本。
- 新增 native 方法时，同步更新 `manifest.json.methods`、`src/lib.rs` 分发逻辑和 UI 调用。
- 跨平台库名和路径必须与 `manifest.json.native.library` 保持一致。
- 指针、CString 和内存释放相关代码要格外保守，避免泄漏或 double free。

## 命令

- 安装依赖使用 Bun。
- 构建插件：`bun run build`
- Rust 调试构建：`bun run build:rust`
- Rust 发布构建：`bun run build:rust:release`
- Vue UI 构建：`bun run build:vue`
- 打包：`bun run package`
- Rust watch：`bun run dev`
- 清理：`bun run clean`
- Vue UI 构建时，`vite.config.js` 的 `rollupOptions.output` 需配置 `codeSplitting: false`（Vite 8 / Rolldown 推荐写法），禁用代码分割，消灭分块 JS，彻底解决相对路径加载问题。

本仓库是独立 Git 仓库，提交应在本目录内完成。

## 验证重点

- Rust ABI 或方法改动至少运行 `bun run build:rust`。
- UI 改动至少运行 `bun run build:vue` 或 `bun run build`。
- 原生库加载、reload 和方法调用必须在 AIO Hub Tauri 真实运行态验证。

