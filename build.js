/**
 * 原生插件构建脚本
 * 用于编译 Rust 动态库并打包成插件
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 平台和库文件名的映射
const TARGETS = {
  'windows-x64': {
    rustTarget: 'x86_64-pc-windows-msvc',
    libName: 'native_example.dll',
    manifestKey: 'win32-x64'
  },
  'macos-arm64': {
    rustTarget: 'aarch64-apple-darwin',
    libName: 'libnative_example.dylib',
    manifestKey: 'darwin-arm64'
  },
  'linux-x64': {
    rustTarget: 'x86_64-unknown-linux-gnu',
    libName: 'libnative_example.so',
    manifestKey: 'linux-x64'
  }
};

const CURRENT_PLATFORM = process.platform === 'win32' ? 'windows' :
                         process.platform === 'darwin' ? 'macos' : 'linux';
const CURRENT_ARCH = process.arch === 'x64' ? 'x64' : 'arm64';
const CURRENT_TARGET_KEY = `${CURRENT_PLATFORM}-${CURRENT_ARCH}`;

// 解析命令行参数
const args = process.argv.slice(2);
const isRelease = args.includes('--release');
const shouldPackage = args.includes('--package');
const mode = isRelease ? 'release' : 'debug';

console.log('🔨 构建原生插件: native-example');
console.log(`   模式: ${mode}`);
console.log('');

// 构建 Vue 组件
function buildVueComponent() {
  console.log('📦 构建 Vue 组件...');
  try {
    execSync('vite build', {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('✅ Vue 组件构建完成');
    return true;
  } catch (error) {
    console.error('❌ Vue 组件构建失败:', error.message);
    return false;
  }
}

// 构建 Rust 动态库
function buildRustLibrary() {
  const target = TARGETS[CURRENT_TARGET_KEY];
  if (!target) {
    console.error(`❌ 不支持当前平台: ${CURRENT_TARGET_KEY}`);
    process.exit(1);
  }

  console.log(`📦 构建 ${CURRENT_TARGET_KEY}...`);

  try {
    const buildCmd = isRelease
      ? `cargo build --release`
      : `cargo build`;

    console.log(`   执行: ${buildCmd}`);
    execSync(buildCmd, {
      stdio: 'inherit',
      cwd: __dirname
    });

    console.log(`✅ ${CURRENT_TARGET_KEY} 构建完成`);
    return true;
  } catch (error) {
    console.error(`❌ ${CURRENT_TARGET_KEY} 构建失败:`, error.message);
    return false;
  }
}

// 打包插件
function packagePlugin() {
  console.log('');
  console.log('📦 打包插件...');

  const distDir = path.join(__dirname, 'dist');
  const libDir = path.join(distDir, 'lib');

  // 确保输出目录存在
  fs.ensureDirSync(libDir);

  // 复制编译产物
  let copiedCount = 0;
  for (const [targetKey, target] of Object.entries(TARGETS)) {
    const libPath = path.join(
      __dirname,
      'target',
      isRelease ? 'release' : 'debug',
      target.libName
    );

    if (fs.existsSync(libPath)) {
      const destFileName = `native_example-${targetKey}${path.extname(target.libName)}`;
      const destPath = path.join(libDir, destFileName);
      fs.copySync(libPath, destPath);
      console.log(`   ✓ 复制 ${targetKey} -> lib/${destFileName}`);
      copiedCount++;
    }
  }

  if (copiedCount === 0 && !isRelease) {
    console.warn('   ⚠️  在 debug 模式下未找到构建产物，请确保已为当前平台构建。');
  } else if (copiedCount === 0 && isRelease) {
    console.error('❌ 没有找到任何构建产物，打包失败。');
    process.exit(1);
  }


  // 生成生产环境的 manifest.json
  const manifest = fs.readJsonSync(path.join(__dirname, 'manifest.json'));

  // 验证 Vue 组件并更新 manifest
  if (manifest.ui && manifest.ui.component) {
    const componentFileName = manifest.ui.component;
    const componentBaseName = path.basename(componentFileName, '.vue');
    const componentJsName = `${componentBaseName}.js`;
    
    const componentJsPath = path.join(distDir, componentJsName);
    if (!fs.existsSync(componentJsPath)) {
      console.error(`❌ 找不到编译后的 ${componentJsName} 文件`);
      process.exit(1);
    }
    console.log(`   ✓ 发现 ${componentJsName}`);
    manifest.ui.component = componentJsName;
  }

  // 更新库文件路径为生产环境路径
  manifest.native.library = {};
  for (const [targetKey, target] of Object.entries(TARGETS)) {
    const fileName = `native_example-${targetKey}${path.extname(target.libName)}`;
    if (fs.existsSync(path.join(libDir, fileName))) {
      manifest.native.library[target.manifestKey] = `lib/${fileName}`;
    }
  }

  fs.writeJsonSync(path.join(distDir, 'manifest.json'), manifest, { spaces: 2 });
  console.log('   ✓ 生成 manifest.json (生产环境)');

  // 复制 README（如果存在）
  const readmePath = path.join(__dirname, 'README.md');
  if (fs.existsSync(readmePath)) {
    fs.copySync(readmePath, path.join(distDir, 'README.md'));
    console.log('   ✓ 复制 README.md');
  }

  console.log('');
  console.log(`✅ 插件已打包到: ${distDir}`);
  return distDir;
}

// 创建 ZIP 压缩包
async function createZipArchive(distDir) {
  console.log('');
  console.log('🗜️  创建 ZIP 压缩包...');

  const manifest = fs.readJsonSync(path.join(__dirname, 'manifest.json'));
  const pluginName = manifest.id;
  const version = manifest.version;
  
  const zipFileName = `${pluginName}-v${version}.zip`;
  const zipPath = path.join(__dirname, zipFileName);

  // 删除旧的 zip 文件
  fs.removeSync(zipPath);
  console.log(`   ✓ 删除旧版本: ${zipFileName}`);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`   ✓ 压缩包大小: ${sizeInMB} MB`);
      console.log('');
      console.log(`✅ 发布包已创建: ${zipFileName}`);
      resolve(zipPath);
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);
    archive.directory(distDir, false);
    archive.finalize();
  });
}

// 主流程
async function main() {
  // 清理旧的构建产物
  console.log('🧹 清理旧的构建产物...');
  const distDir = path.join(__dirname, 'dist');
  fs.emptyDirSync(distDir);
  const distUiDir = path.join(__dirname, 'dist-ui');
  fs.removeSync(distUiDir);
  const manifestData = fs.readJsonSync(path.join(__dirname, 'manifest.json'));
  const zipFileName = `${manifestData.id}-v${manifestData.version}.zip`;
  const zipPath = path.join(__dirname, zipFileName);
  fs.removeSync(zipPath);
  console.log('✅ 清理完成');
  console.log('');
  
  // 先构建 Vue 组件
  const vueSuccess = buildVueComponent();
  if (!vueSuccess) {
    console.error('❌ Vue 组件构建失败，无法继续。');
    process.exit(1);
  }

  const buildSuccess = buildRustLibrary();

  if (buildSuccess && shouldPackage) {
    const distDir = packagePlugin();
    await createZipArchive(distDir);
  } else if (!buildSuccess) {
    console.error('❌ 构建失败，已中止。');
    process.exit(1);
  } else {
    console.log('✅ 构建完成。如需打包，请使用 --package 参数。');
  }
}

main().catch(error => {
  console.error('构建脚本执行失败:', error);
  process.exit(1);
});