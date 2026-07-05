#!/usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');

function resolveHostTarget() {
  const platformMap = {
    darwin: 'macos',
    linux: 'linux',
    win32: 'win'
  };

  const archMap = {
    arm64: 'arm64',
    x64: 'x64'
  };

  const platform = platformMap[process.platform];
  const arch = archMap[process.arch];

  if (!platform || !arch) {
    throw new Error(`当前平台暂未配置二进制目标: ${process.platform}/${process.arch}`);
  }

  return `node18-${platform}-${arch}`;
}

function defaultOutputForTarget(target) {
  if (target.includes('-win-')) {
    return path.resolve(process.cwd(), 'dist/diting.exe');
  }

  return path.resolve(process.cwd(), 'dist/diting');
}

function run() {
  const args = {};
  for (let index = 0; index < process.argv.slice(2).length; index += 1) {
    const item = process.argv.slice(2)[index];
    if (!item.startsWith('--')) {
      continue;
    }

    const key = item.slice(2);
    const next = process.argv.slice(2)[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  const requestedTarget = args.target || 'host';
  const target = requestedTarget === 'host' ? resolveHostTarget() : requestedTarget;
  const output = args.output ? path.resolve(process.cwd(), args.output) : defaultOutputForTarget(target);
  const pkgBin = path.resolve(path.dirname(require.resolve('pkg/package.json')), 'lib-es5/bin.js');

  console.log(`📦 正在构建二进制文件...`);
  console.log(`   Target: ${target}`);
  console.log(`   Output: ${output}`);

  const result = spawnSync(process.execPath, [pkgBin, '.', '--targets', target, '--output', output], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    console.error(`❌ 构建失败，退出码: ${result.status}`);
    process.exit(1);
  }

  console.log(`✅ 构建成功！`);
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}