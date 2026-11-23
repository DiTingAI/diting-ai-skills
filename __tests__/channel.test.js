#!/usr/bin/env node

/**
 * 渠道归因模块测试（2026-11-23）
 *
 * 钉住三件事，任何一条被改坏都会让「SkillHub 渠道效果无法归因」这个老问题复活：
 *   1. 对外链接必须带 from / c 参数（page_url 是埋点里唯一可归因字段）
 *   2. 落地路径必须是规范路径 /skills（/home/apikey 是旧 URL，会 redirect）
 *   3. 请求头必须带 X-Visitor-Id 与带渠道参数的 X-Page-Url（服务端据此补报 upload_done）
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// 隔离测试目录，避免污染真实的 ~/.diting-skills/visitor_id
process.env.DITING_SKILL_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'diting-channel-test-'));

const CHANNEL_MODULE = require.resolve('../scripts/channel');

function loadChannel() {
  delete require.cache[CHANNEL_MODULE];
  return require('../scripts/channel');
}

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
        throw new Error(`Expected ${JSON.stringify(value)} to be ${JSON.stringify(expected)}`);
      }
    },
    toContain(substring) {
      if (!String(value).includes(substring)) {
        throw new Error(`Expected "${value}" to contain "${substring}"`);
      }
    },
    toMatch(pattern) {
      if (!pattern.test(String(value))) {
        throw new Error(`Expected "${value}" to match ${pattern}`);
      }
    }
  };
}

describe('Channel attribution', () => {
  test('默认渠道为 skillhub', () => {
    const channel = loadChannel();
    expect(channel.CHANNEL).toBe('skillhub');
    expect(channel.CAMPAIGN).toMatch(/^\d{8}-[a-z0-9-]+$/);
  });

  test('落地链接必须带 from 与 c', () => {
    const channel = loadChannel();
    const url = channel.apiKeyUrl();
    expect(url).toContain('from=skillhub');
    expect(url).toContain('c=');
  });

  test('落地路径是规范路径 /skills（不是旧 URL /home/apikey）', () => {
    const channel = loadChannel();
    const url = new URL(channel.apiKeyUrl());
    expect(url.pathname).toBe('/skills');
  });

  test('埋点头齐全，visitor_id 为匿名格式', () => {
    const channel = loadChannel();
    const headers = channel.buildAttributionHeaders();
    expect(headers['X-Visitor-Id']).toMatch(/^s_[0-9a-f]{32}$/);
    expect(headers['X-Analytics-Source']).toBe('diting');
    expect(headers['X-Page-Url']).toContain('from=skillhub');
    expect(headers['X-Aiditing-Client']).toBe('skill');
  });

  test('visitor_id 跨次调用保持稳定（同机去重口径）', () => {
    const channel = loadChannel();
    const first = channel.getVisitorId();
    const second = loadChannel().getVisitorId();
    expect(first).toBe(second);
  });

  test('DITING_SKILL_TELEMETRY=0 时不带任何埋点头', () => {
    process.env.DITING_SKILL_TELEMETRY = '0';
    const channel = loadChannel();
    const headers = channel.buildAttributionHeaders();
    expect(Object.keys(headers).length).toBe(0);
    delete process.env.DITING_SKILL_TELEMETRY;
  });
});

if (require.main === module) {
  console.log('✅ channel tests passed!');
}
