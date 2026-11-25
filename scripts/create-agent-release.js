#!/usr/bin/env node

/**
 * 创建谛听 AI Skills Agent专用发布包
 * 专为小龙虾助手、Cursor、Claude、Codex等Agent优化
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const packageJson = require(path.join(projectRoot, 'package.json'));
const version = packageJson.version;

// 输出目录
const outputDir = path.join(projectRoot, 'dist');
const zipFileName = `diting-skills-${version}.zip`;
const zipFilePath = path.join(outputDir, zipFileName);

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Agent专用文件列表
const agentFilesToInclude = [
  'bin',
  'scripts',
  'references',
  'dist',
  'README.md',
  'SKILL.md',
  'AGENT_INSTALL_GUIDE.md',
  '_meta.json',
  'package.json',
  'LICENSE',
  '.env.example',
  'install.sh',
  'scripts/agent-install.sh'
];

// 创建临时目录
const tempDir = path.join(projectRoot, '.agent-pack');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

console.log(`📦 创建谛听 AI Skills Agent专用包 v${version}`);
console.log(`📁 临时目录: ${tempDir}`);

// 复制文件到临时目录
let fileCount = 0;
for (const file of agentFilesToInclude) {
  const source = path.join(projectRoot, file);
  const dest = path.join(tempDir, file);
  
  // 创建目标目录结构
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  if (fs.existsSync(source)) {
    if (fs.statSync(source).isDirectory()) {
      copyDirSync(source, dest);
      fileCount += countFilesInDir(source);
    } else {
      fs.copyFileSync(source, dest);
      fileCount++;
    }
    console.log(`  ✅ 已复制: ${file}`);
  } else {
    console.log(`  ⚠️  文件不存在: ${file}`);
  }
}

// 设置安装脚本权限
const installScript = path.join(tempDir, 'install.sh');const agentInstallScript = path.join(tempDir, 'scripts', 'agent-install.sh');
if (fs.existsSync(installScript)) {
  fs.chmodSync(installScript, 0o755);
}
if (fs.existsSync(agentInstallScript)) {
  fs.chmodSync(agentInstallScript, 0o755);
}

console.log(`📊 总计复制 ${fileCount} 个文件`);

// dist/ 既是二进制产物目录、又是 ZIP 的输出目录：不排除历史 ZIP 的话，
// 每次构建都会把上一次的包一起打进去，体积逐次翻倍（实测 180M → 361M）。
const packedDist = path.join(tempDir, 'dist');
if (fs.existsSync(packedDist)) {
  for (const name of fs.readdirSync(packedDist)) {
    if (name.toLowerCase().endsWith('.zip')) {
      fs.rmSync(path.join(packedDist, name), { force: true });
      console.log(`  🧹 排除历史发布包: dist/${name}`);
    }
  }
}

// 创建ZIP文件
console.log(`\n🔧 创建Agent专用ZIP包: ${zipFileName}`);
try {
  // 使用系统zip命令
  const zipCommand = `cd "${tempDir}" && zip -r "${zipFilePath}" .`;
  execSync(zipCommand, { stdio: 'inherit' });
  
  // 检查文件大小
  const stats = fs.statSync(zipFilePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n🎉 Agent专用包创建成功!`);
  console.log(`📁 文件位置: ${zipFilePath}`);
  console.log(`📏 文件大小: ${fileSizeMB} MB`);

  console.log(`\n📋 包内容概览:`);
  const listCommand = `unzip -l "${zipFilePath}" | grep -E "(\.sh$|\.md$|diting$|\.json$)" | head -20`;
  console.log(execSync(listCommand, { encoding: 'utf8' }));

  // 分发口径（2026-11-25 更正）：
  //   此前这里打印「下载地址: cdn.diting.cc/assets/<zip>」，但 install.sh 早已改为
  //   直接拉 GitHub 源码包，CDN 上按版本命名的 zip 是停更残留（AGENT_INSTALL_GUIDE.md 第五节
  //   明确写了「不要下载」）。照这行提示去 OSS 传包 → 文件既不可下载、也没人用，纯误导。
  console.log(`\n🚀 分发方式:`);
  console.log(`   SkillHub 上传: dist/diting-skills-v${version}-skill.zip`);
  console.log(`   Agent 一键安装: curl -sSL https://raw.githubusercontent.com/DiTingAI/diting-ai-skills/main/install.sh | bash`);
  console.log(`   源码包: https://codeload.github.com/DiTingAI/diting-ai-skills/tar.gz/refs/heads/main`);
  console.log(`   ⚠️  不要上传到 cdn.diting.cc/assets/ —— 该路径已停更，install.sh 不再引用`);
  
} catch (error) {
  console.error(`❌ 创建ZIP包失败: ${error.message}`);
  process.exit(1);
}

// 清理临时目录
fs.rmSync(tempDir, { recursive: true, force: true });
console.log(`\n🧹 已清理临时目录`);

// 辅助函数：复制目录
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 辅助函数：统计目录中的文件数量
function countFilesInDir(dir) {
  let count = 0;
  
  function countRecursive(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        countRecursive(fullPath);
      } else {
        count++;
      }
    }
  }
  
  countRecursive(dir);
  return count;
}