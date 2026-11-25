#!/usr/bin/env node

/**
 * 平台识别与多输入能力测试（1.0.10）
 *
 * 这一组不联网络，只测「输入被路由到哪条通道」——
 * 判错的后果是最难解释的一类故障：文档说支持、CLI 说链接无效。
 */

const {
  detectPlatform,
  extractFirstUrl,
  isBilibiliShortUrl
} = require('../scripts/transcribe');
const { requestMultipart } = require('../scripts/shared');

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
    toBeTruthy() {
      if (!value) throw new Error(`Expected ${value} to be truthy`);
    },
    toContain(substring) {
      if (!String(value).includes(substring)) {
        throw new Error(`Expected ${value} to contain ${substring}`);
      }
    }
  };
}

describe('平台识别', () => {
  test('B 站标准页地址', () => {
    expect(detectPlatform('https://www.bilibili.com/video/BV1f6HheYExS')).toBe('bilibili');
  });

  test('B 站 b23.tv 短链', () => {
    expect(detectPlatform('https://b23.tv/abcdefg')).toBe('bilibili');
  });

  test('裸 BV 号', () => {
    expect(detectPlatform('BV1f6HheYExS')).toBe('bilibili');
  });

  test('抖音短链', () => {
    expect(detectPlatform('https://v.douyin.com/xxxxxxx/')).toBe('douyin');
  });

  test('抖音分享文案（带一堆话术）', () => {
    const text = '8.97 复制打开抖音，看看【某某】的作品 https://v.douyin.com/xxxxxxx/ 很好看';
    expect(detectPlatform(text)).toBe('douyin');
  });

  test('小红书标准页 / 短链（com 与 cn 都要认）', () => {
    expect(detectPlatform('https://www.xiaohongshu.com/explore/6600abcd')).toBe('xhs');
    expect(detectPlatform('https://xhslink.com/a/xxxxxx')).toBe('xhs');
    // App 当前真实分享形态
    expect(detectPlatform('https://xhslink.cn/o/5gyR9qCUpMR')).toBe('xhs');
  });

  test('小红书真实分享文案', () => {
    const text = '小红书视频转文字一键变Obsidian笔记 刷到干货视频，... https://xhslink.cn/o/5gyR9qCUpMR 去【小红书】看看这篇宝藏笔记吧！';
    expect(detectPlatform(text)).toBe('xhs');
    expect(extractFirstUrl(text)).toBe('https://xhslink.cn/o/5gyR9qCUpMR');
  });

  test('不支持的平台返回 null（YouTube / 快手）', () => {
    expect(detectPlatform('https://www.youtube.com/watch?v=abc')).toBe(null);
    expect(detectPlatform('https://v.kuaishou.com/abc')).toBe(null);
  });

  test('空输入返回 null', () => {
    expect(detectPlatform('')).toBe(null);
    expect(detectPlatform(undefined)).toBe(null);
  });
});

describe('分享文案链接提取', () => {
  test('从中文话术里抠出链接', () => {
    const url = extractFirstUrl('复制打开，看看【xx】的作品 https://v.douyin.com/abc123/ 挺好看');
    expect(url).toBe('https://v.douyin.com/abc123/');
  });

  test('全文没有链接时返回空串', () => {
    expect(extractFirstUrl('就是一段没有链接的话')).toBe('');
  });
});

describe('b23.tv 短链放行（1.0.10 修复项）', () => {
  test('短链应被识别为合法 B 站输入', () => {
    expect(isBilibiliShortUrl('https://b23.tv/abcdefg')).toBe(true);
    expect(isBilibiliShortUrl('https://b23.tv/abcdefg?share_source=qq')).toBe(true);
  });

  test('标准页地址不算短链（走 BV 提取）', () => {
    expect(isBilibiliShortUrl('https://www.bilibili.com/video/BV1f6HheYExS')).toBe(false);
  });
});

describe('multipart 上传能力', () => {
  test('requestMultipart 已导出（--file 的前提）', () => {
    expect(typeof requestMultipart).toBe('function');
  });
});
