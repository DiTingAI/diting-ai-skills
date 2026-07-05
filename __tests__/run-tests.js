#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 运行谛听 AI Skills 测试套件\n');

// 测试文件列表
const testFiles = [
  'shared.test.js',
  'config.test.js', 
  'cli.test.js'
];

let passed = 0;
let failed = 0;

function runTest(testFile) {
  const testPath = path.join(__dirname, testFile);
  
  console.log(`📝 运行测试: ${testFile}`);
  
  try {
    // 清除 require 缓存以确保重新加载模块
    delete require.cache[require.resolve(testPath)];
    
    // 运行测试文件
    require(testPath);
    
    console.log(`✅ ${testFile} - 通过\n`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testFile} - 失败`);
    console.log(`   错误: ${error.message}\n`);
    failed++;
  }
}

// 运行所有测试
testFiles.forEach(runTest);

// 输出结果
console.log('📊 测试结果:');
console.log(`   通过: ${passed}`);
console.log(`   失败: ${failed}`);
console.log(`   总计: ${testFiles.length}`);

if (failed > 0) {
  console.log('\n⚠️  有些测试失败，请检查问题');
  process.exit(1);
} else {
  console.log('\n🎉 所有测试通过！');
  process.exit(0);
}