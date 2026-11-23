#!/usr/bin/env node

/**
 * 创建谛听 AI Skills 发布包
 * 用于生成SKILLS所需的ZIP压缩包
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const packageJson = require(path.join(projectRoot, 'package.json'));
const version = packageJson.version;
const packageName = packageJson.name;

// 输出目录
const outputDir = path.join(projectRoot, 'dist');
const zipFileName = `${packageName}-v${version}-skill.zip`;
const zipFilePath = path.join(outputDir, zipFileName);

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 需要包含的文件和目录列表（基于package.json中的files字段）
//
// ⚠️ 不要放 LICENSE（2026-11-23 踩坑）：SkillHub 上传校验会直接拒绝**无扩展名**的文件，
// 报「不允许的文件类型: LICENSE」，整个更新提交失败。许可证声明放在 README 里说明即可，
// 仓库根目录仍然保留 LICENSE 文件（GitHub / npm 侧需要）。
const filesToInclude = [
  'bin',
  'scripts',
  'references',
  'README.md',
  'SKILL.md',
  '_meta.json',
  'package.json',
  'package-lock.json',
  '.env.example'
];

// 检查LICENSE文件是否存在
if (!fs.existsSync(path.join(projectRoot, 'LICENSE'))) {
  console.log('⚠️  LICENSE文件不存在，创建默认MIT-0许可证文件...');
  const licenseContent = `MIT No Attribution License (MIT-0)

Copyright ${new Date().getFullYear()} 谛听 AI

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
  
  fs.writeFileSync(path.join(projectRoot, 'LICENSE'), licenseContent, 'utf8');
}

// 创建临时目录用于打包
const tempDir = path.join(projectRoot, '.temp-pack');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

console.log(`📦 创建谛听 AI Skills 发布包 v${version}`);
console.log(`📁 临时目录: ${tempDir}`);
console.log(`📄 包含文件: ${filesToInclude.join(', ')}`);

// 复制文件到临时目录
let fileCount = 0;
for (const file of filesToInclude) {
  const source = path.join(projectRoot, file);
  const dest = path.join(tempDir, file);
  
  if (fs.existsSync(source)) {
    if (fs.statSync(source).isDirectory()) {
      // 复制目录
      copyDirSync(source, dest);
      fileCount += countFilesInDir(source);
    } else {
      // 复制文件
      fs.copyFileSync(source, dest);
      fileCount++;
    }
    console.log(`  ✅ 已复制: ${file}`);
  } else {
    console.log(`  ⚠️  文件不存在: ${file}`);
  }
}

// 打包不再附带 dist/ 预编译二进制（2026-11-23）
//
// 原因：
//   1. dist/ 里的二进制是 1.0.0 时代用 pkg 打的（单平台 46~51MB），
//      和包内脚本版本长期不同步，用户跑到的是旧代码；
//   2. zip 因此从 44KB 膨胀到 33MB，SkillHub 上传与审核都更慢；
//   3. 脚本零第三方依赖，Node 18+ 直接跑，没有必须用二进制的理由。
// 需要二进制的场景请用 npm run build:binary:* 单独构建，不要再塞进分发包。

console.log(`📊 总计复制 ${fileCount} 个文件`);

// 创建ZIP文件
console.log(`\n🔧 创建ZIP压缩包: ${zipFileName}`);
try {
  // 使用系统zip命令
  const zipCommand = `cd "${tempDir}" && zip -r "${zipFilePath}" .`;
  execSync(zipCommand, { stdio: 'inherit' });
  
  // 检查文件大小
  const stats = fs.statSync(zipFilePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n🎉 ZIP包创建成功!`);
  console.log(`📁 文件位置: ${zipFilePath}`);
  console.log(`📏 文件大小: ${fileSizeMB} MB`);
  console.log(`🔍 文件内容:`);
  
  // 列出ZIP文件内容
  const listCommand = `unzip -l "${zipFilePath}" | head -30`;
  console.log('\n' + execSync(listCommand, { encoding: 'utf8' }));
  
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