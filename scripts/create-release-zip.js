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
const filesToInclude = [
  'bin',
  'scripts',
  'references',
  'README.md',
  'SKILL.md',
  '_meta.json',
  'package.json',
  'package-lock.json',
  'LICENSE',
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

// 复制dist目录中的二进制文件（如果存在）
const distDir = path.join(projectRoot, 'dist');
if (fs.existsSync(distDir)) {
  const binaryFiles = fs.readdirSync(distDir)
    .filter(file => !file.endsWith('.zip') && !file.startsWith('.') && file !== 'diting-macos-arm64');
  
  if (binaryFiles.length > 0) {
    const destDistDir = path.join(tempDir, 'dist');
    if (!fs.existsSync(destDistDir)) {
      fs.mkdirSync(destDistDir, { recursive: true });
    }
    
    for (const binaryFile of binaryFiles) {
      const source = path.join(distDir, binaryFile);
      const dest = path.join(destDistDir, binaryFile);
      fs.copyFileSync(source, dest);
      fileCount++;
      console.log(`  ✅ 已复制二进制文件: dist/${binaryFile}`);
    }
  }
}

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