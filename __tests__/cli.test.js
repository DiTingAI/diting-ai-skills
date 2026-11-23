#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

function describe(name, fn) {
  console.log(`\n📝 ${name}:`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.log(`  ❌ ${name} - ${error.message}`);
    throw error;
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toContain(substring) {
      if (!value.includes(substring)) {
        throw new Error(`Expected output to contain "${substring}"`);
      }
    }
  };
}

describe('CLI interface', () => {
  const cliPath = path.join(__dirname, '../bin/diting.js');

  test('should show help when no command provided', () => {
    const output = execSync(`node ${cliPath}`, { encoding: 'utf8' });
    expect(output).toContain('谛听 AI CLI');
    expect(output).toContain('Usage:');
    expect(output).toContain('Commands:');
  });

  test('should show help with --help flag', () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' });
    expect(output).toContain('谛听 AI CLI');
    expect(output).toContain('Usage:');
  });

  test('should show help with -h flag', () => {
    const output = execSync(`node ${cliPath} -h`, { encoding: 'utf8' });
    expect(output).toContain('谛听 AI CLI');
    expect(output).toContain('Usage:');
  });

  test('should show error for unknown command', () => {
    try {
      execSync(`node ${cliPath} unknown-command`, { encoding: 'utf8' });
      throw new Error('Expected command to fail but it succeeded');
    } catch (error) {
      expect(error.status).toBe(1);
      expect(error.stderr).toContain('Unknown command: unknown-command');
    }
  });

  test('should list all available commands in help', () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' });
    expect(output).toContain('transcribe');
    expect(output).toContain('asset-read');
    expect(output).toContain('search');
    expect(output).toContain('update');
  });

  test('should show environment variables in help', () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' });
    expect(output).toContain('DITING_API_KEY');
    expect(output).toContain('DITING_API_BASE_URL');
    // 2026-11-23：取 Key 链接改为规范路径 /skills 并带渠道归因参数
    // （/home/apikey 是前端旧 URL，会 redirect，query 不可靠）
    expect(output).toContain('https://diting.cc/skills');
    expect(output).toContain('from=skillhub');
  });

  test('should print version with --version', () => {
    const output = execSync(`node ${cliPath} --version`, { encoding: 'utf8' }).trim();
    const { version } = require('../package.json');
    expect(output).toContain(version);
    expect(output).toContain('channel=');
  });

  test('config command should not require an API key', () => {
    const output = execSync(`env -u DITING_API_KEY node ${cliPath} config`, { encoding: 'utf8' });
    const parsed = JSON.parse(output);
    expect(parsed.api_key_configured).toBe(false);
    expect(String(parsed.get_api_key)).toContain('from=skillhub');
  });
});

if (require.main === module) {
  console.log('✅ CLI interface tests passed!');
}