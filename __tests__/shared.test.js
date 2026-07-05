#!/usr/bin/env node

const { parseArgs, extractBilibiliUrl, isValidBilibiliUrl } = require('../scripts/shared');

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
        throw new Error(`Expected ${value} to contain ${substring}`);
      }
    }
  };
}

describe('shared utilities', () => {
  test('parseArgs should parse command line arguments', () => {
    const args = parseArgs(['--url', 'https://example.com', '--poll', '--top-k', '10']);
    expect(args.url).toBe('https://example.com');
    expect(args.poll).toBe(true);
    expect(args['top-k']).toBe('10');
  });

  test('parseArgs should handle boolean flags without values', () => {
    const args = parseArgs(['--help', '--version']);
    expect(args.help).toBe(true);
    expect(args.version).toBe(true);
  });

  test('extractBilibiliUrl should extract valid Bilibili URLs', () => {
    const testCases = [
      {
        input: 'Check this video: https://www.bilibili.com/video/BV1f6HheYExS',
        expected: 'https://www.bilibili.com/video/BV1f6HheYExS'
      },
      {
        input: 'Short URL: https://b23.tv/abc123',
        expected: 'https://b23.tv/abc123'
      },
      {
        input: 'Just BV: BV1f6HheYExS',
        expected: 'https://www.bilibili.com/video/BV1f6HheYExS'
      },
      {
        input: 'No video here',
        expected: null
      }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(extractBilibiliUrl(input)).toBe(expected);
    });
  });

  test('isValidBilibiliUrl should validate Bilibili URLs', () => {
    expect(isValidBilibiliUrl('https://www.bilibili.com/video/BV1f6HheYExS')).toBe(true);
    expect(isValidBilibiliUrl('https://b23.tv/abc123')).toBe(true);
    expect(isValidBilibiliUrl('BV1f6HheYExS')).toBe(true);
    expect(isValidBilibiliUrl('https://youtube.com/watch?v=abc')).toBe(false);
    expect(isValidBilibiliUrl('invalid')).toBe(false);
  });
});

if (require.main === module) {
  console.log('✅ All shared utility tests passed!');
}