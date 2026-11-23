#!/usr/bin/env node
'use strict';

/**
 * 渠道归因与埋点（2026-11-23 新增）
 *
 * 背景：Skill 在 SkillHub 上累计 791 次下载，但因为
 *   1) 落地链接是裸链（https://diting.cc/home/apikey，没有 from/c 参数）
 *   2) CLI 调接口不带任何终端标识
 * 导致这 791 次下载**一条都归因不了**，算不出渠道 ROI。
 *
 * 归因口径（与 diting-portal/docs/渠道归因链接规范.md 完全一致）：
 *   - from：渠道白名单，本包固定 skillhub（可用 DITING_SKILL_CHANNEL 覆盖）
 *   - c：活动标识，格式 YYYYMMDD-主题
 *   - page_url 是埋点里唯一可用于渠道归因的字段，所以渠道只能写在 URL 参数里
 *
 * 埋点链路（零后端改动即可生效）：
 *   CLI 每次请求带 X-Visitor-Id / X-Analytics-Source / X-Page-Url
 *     → 服务端在任务落库后补报 upload_done 事件（controllers/analytics_instrumentation.go）
 *     → analytics_events 里同时有 visitor_id、user_id、page_url（含 from=skillhub）
 *     → 「渠道落地 → 注册 → 转写」可以用 visitor_id 串起来
 *
 * 隐私：只上报一个随机生成的匿名设备标识（不含用户名、路径、IP），
 *      可用 DITING_SKILL_TELEMETRY=0 关闭。
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SKILL_VERSION = require('../package.json').version;

const LANDING_ORIGIN = 'https://diting.cc';
const DEFAULT_CHANNEL = 'skillhub';
const DEFAULT_CAMPAIGN = '20261123-skillhub';

const CHANNEL = sanitize(process.env.DITING_SKILL_CHANNEL) || DEFAULT_CHANNEL;
const CAMPAIGN = sanitize(process.env.DITING_SKILL_CAMPAIGN) || DEFAULT_CAMPAIGN;
const TELEMETRY_ENABLED = String(process.env.DITING_SKILL_TELEMETRY || '1').trim() !== '0';

let cachedVisitorId = '';

/** 只允许白名单字符，避免把任意 env 值拼进 URL / 请求头 */
function sanitize(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32);
}

function getInstallDir() {
  return process.env.DITING_SKILL_HOME || path.join(os.homedir(), '.diting-skills');
}

function getVisitorFile() {
  return path.join(getInstallDir(), 'visitor_id');
}

/**
 * 匿名设备标识（与网页端 track.js 的 visitor_id 同口径：随机、持久化、不含个人信息）。
 *
 * 复用网页端的去重语义：同一台机器多次调用只算一个 UV，
 * 换机器/删文件就是新访客，不做设备指纹，也不上报主机名。
 */
function getVisitorId() {
  if (!TELEMETRY_ENABLED) return '';
  if (cachedVisitorId) return cachedVisitorId;

  try {
    const file = getVisitorFile();
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (/^s_[0-9a-f]{32}$/.test(existing)) {
      cachedVisitorId = existing;
      return cachedVisitorId;
    }
  } catch {
    // 文件不存在 / 无读权限，走新建分支
  }

  const id = 's_' + crypto.randomBytes(16).toString('hex');
  try {
    fs.mkdirSync(getInstallDir(), { recursive: true });
    fs.writeFileSync(getVisitorFile(), id + '\n', { mode: 0o600 });
  } catch {
    // 写不了就只在本次进程内有效，不影响功能
  }
  cachedVisitorId = id;
  return id;
}

/**
 * 构造带渠道归因参数的落地链接。
 *
 * 注意：不要指向 /home/apikey —— 该路径在前端是旧 URL，会 redirect 到 /skills，
 * redirect 过程中 query 参数不可靠；直接用规范路径 /skills。
 */
function buildAttributedUrl(pathname = '/skills', extra = {}) {
  const target = new URL(pathname, LANDING_ORIGIN);
  target.searchParams.set('from', CHANNEL);
  target.searchParams.set('c', CAMPAIGN);
  Object.entries(extra).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    target.searchParams.set(key, String(value));
  });
  return target.toString();
}

/** API Key 获取页（转化主入口） */
function apiKeyUrl() {
  return buildAttributedUrl('/skills', { client: 'skill' });
}

/** 额度不足时的升级入口 */
function pricingUrl() {
  return buildAttributedUrl('/pricing', { client: 'skill' });
}

/** 产品首页（Agent 需要给用户介绍谛听时用） */
function homeUrl() {
  return buildAttributedUrl('/', { client: 'skill' });
}

/**
 * 埋点请求头。服务端只在「带 X-Visitor-Id」时补报 upload_done，
 * 因此这三个头是渠道可归因的前提，不能省。
 */
function buildAttributionHeaders() {
  if (!TELEMETRY_ENABLED) return {};
  return {
    'X-Visitor-Id': getVisitorId(),
    'X-Analytics-Source': 'diting',
    'X-Page-Url': buildAttributedUrl('/skills', {
      client: 'skill',
      v: SKILL_VERSION
    }),
    // 服务端 client 白名单见 diting-api models/video_tasks.go 的 knownClients，
    // 白名单外的值会被归一化成空串（随后兜底成 api），不会污染数据。
    'X-Aiditing-Client': 'skill'
  };
}

function getUserAgent() {
  return `DiTingSkill/${SKILL_VERSION} (${CHANNEL}; +${homeUrl()})`;
}

module.exports = {
  CHANNEL,
  CAMPAIGN,
  SKILL_VERSION,
  TELEMETRY_ENABLED,
  apiKeyUrl,
  buildAttributedUrl,
  buildAttributionHeaders,
  getVisitorId,
  getUserAgent,
  homeUrl,
  pricingUrl
};
