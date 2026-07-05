#!/usr/bin/env node

const { getConfig } = require('../scripts/shared');

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
    toThrow(expectedMessage) {
      try {
        value();
        throw new Error('Expected function to throw but it did not');
      } catch (error) {
        if (expectedMessage && !error.message.includes(expectedMessage)) {
          throw new Error(`Expected error message to contain "${expectedMessage}" but got "${error.message}"`);
        }
      }
    }
  };
}

describe('Configuration', () => {
  test('getConfig should throw error when DITING_API_KEY is not set', () => {
    const originalKey = process.env.DITING_API_KEY;
    delete process.env.DITING_API_KEY;
    try {
      expect(() => getConfig()).toThrow('缺少环境变量 DITING_API_KEY');
    } finally {
      if (originalKey) process.env.DITING_API_KEY = originalKey;
    }
  });

  test('getConfig should return config with default base URL', () => {
    const originalKey = process.env.DITING_API_KEY;
    const originalBaseUrl = process.env.DITING_API_BASE_URL;
    
    process.env.DITING_API_KEY = 'test-api-key';
    delete process.env.DITING_API_BASE_URL;
    
    try {
      const config = getConfig();
      expect(config.token).toBe('test-api-key');
      expect(config.baseURL).toBe('https://api.diting.cc');
    } finally {
      if (originalKey) process.env.DITING_API_KEY = originalKey;
      if (originalBaseUrl) process.env.DITING_API_BASE_URL = originalBaseUrl;
    }
  });

  test('getConfig should use custom base URL from env', () => {
    const originalKey = process.env.DITING_API_KEY;
    const originalBaseUrl = process.env.DITING_API_BASE_URL;
    
    process.env.DITING_API_KEY = 'test-api-key';
    process.env.DITING_API_BASE_URL = 'https://custom-api.example.com';
    
    try {
      const config = getConfig();
      expect(config.token).toBe('test-api-key');
      expect(config.baseURL).toBe('https://custom-api.example.com');
    } finally {
      if (originalKey) process.env.DITING_API_KEY = originalKey;
      if (originalBaseUrl) process.env.DITING_API_BASE_URL = originalBaseUrl;
    }
  });

  test('getConfig should use options parameter', () => {
    const originalKey = process.env.DITING_API_KEY;
    const originalBaseUrl = process.env.DITING_API_BASE_URL;
    
    process.env.DITING_API_KEY = 'test-api-key';
    delete process.env.DITING_API_BASE_URL;
    
    try {
      const options = { custom: 'option' };
      const config = getConfig(options);
      expect(config.token).toBe('test-api-key');
      expect(config.baseURL).toBe('https://api.diting.cc');
    } finally {
      if (originalKey) process.env.DITING_API_KEY = originalKey;
      if (originalBaseUrl) process.env.DITING_API_BASE_URL = originalBaseUrl;
    }
  });
});

if (require.main === module) {
  console.log('✅ Configuration tests passed!');
}