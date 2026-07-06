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
const installScript = path.join(tempDir, 'install.sh');
const agentInstallScript = path.join(tempDir, 'scripts', 'agent-install.sh');
if (fs.existsSync(installScript)) {
  fs.chmodSync(installScript, 0o755);
}
if (fs.existsSync(agentInstallScript)) {
  fs.chmodSync(agentInstallScript, 0o755);
}

console.log(`📊 总计复制 ${fileCount} 个文件`);

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
  console.log(`🔗 下载地址: https://cdn.diting.cc/assets/${zipFileName}`);
  
  console.log(`\n📋 包内容概览:`);
  const listCommand = `unzip -l "${zipFilePath}" | grep -E "(\.sh$|\.md$|diting$|\.json$)" | head -20`;
  console.log(execSync(listCommand, { encoding: 'utf8' }));
  
  console.log(`\n🚀 Agent安装命令:`);
  console.log(`   一键安装: curl -sSL https://raw.githubusercontent.com/diting-ai/diting-skills/main/install.sh | bash`);
  console.log(`   下载地址: wget https://cdn.diting.cc/assets/${zipFileName}`);
  
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