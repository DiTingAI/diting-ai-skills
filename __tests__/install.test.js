#!/usr/bin/env node

/**
 * 安装上报测试（2026-11-25）
 *
 * 背景：SkillHub 详情页 885 次下载，我们站内只看到 5 个 from=skillhub 的访客。
 * 中间 99.4% 的衰减发生在「下载 → 装成功」还是「装成功 → 去拿 Key」，此前是黑盒
 * （codeload.github.com 不给下载计数）。install.sh 里补的 skill_install_done 是唯一能拆开这两段的手段。
 *
 * 钉住四件事 —— 任何一条被改坏，要么埋点白做，要么安装被网络问题拖死：
 *   1. 上报必须在「安装完成」之后（放在下载前测的就是「开始安装」，语义错了）
 *   2. 必须静默：|| true + 2>/dev/null + --max-time（安装不能因为埋点失败而失败）
 *   3. visitor_id 必须复用 scripts/channel.js 的生成逻辑（否则和「首次调通」串不起来）
 *   4. 不能出现 localhost 类 page_url（后端会当调试流量丢弃）
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const INSTALL_SH = fs.readFileSync(path.join(__dirname, '..', 'install.sh'), 'utf8');

function describe(name, fn) {
  console.log(`\n📝 ${name}:`);
  fn();
}

function it(name, fn) {
  fn();
  console.log(`  ✓ ${name}`);
}

describe('安装上报 skill_install_done', () => {
  it('上报事件名存在', () => {
    assert.ok(
      INSTALL_SH.includes('skill_install_done'),
      'install.sh 缺少 skill_install_done 上报'
    );
  });

  it('上报在「安装完成」之后（测的是装成功，不是开始装）', () => {
    const doneIdx = INSTALL_SH.indexOf('安装完成');
    const reportIdx = INSTALL_SH.indexOf('skill_install_done');
    assert.ok(doneIdx > -1, '找不到「安装完成」输出');
    assert.ok(reportIdx > doneIdx, '上报必须在安装完成之后，否则统计的是「开始安装」');
  });

  it('上报域名必须是 api.diting.cc（不是 diting.cc）', () => {
    // 回归守卫：diting.cc 是前端静态站，POST 该路径会被 nginx 挡成 405；
    // 而 curl 有 `|| true`，失败完全静默 —— 埋点会一条都进不了库却毫无报错。
    // 实测 2026-11-25：diting.cc → 405 Not Allowed；api.diting.cc → 400 event_name 不能为空。
    assert.ok(
      INSTALL_SH.includes('https://api.diting.cc/api/v1/analytics/event'),
      '上报必须打 api.diting.cc'
    );
    assert.ok(
      !INSTALL_SH.includes('https://diting.cc/api/v1/analytics/event'),
      '不能用 diting.cc 作为埋点域名（nginx 405，且会被 || true 静默吞掉）'
    );
  });

  it('必须静默：|| true + 丢弃输出 + 3 秒超时', () => {
    // 找到那段 curl 调用（从 curl 到该行结尾）
    const curlLine = INSTALL_SH
      .split('\n')
      .filter((l) => l.includes('/api/v1/analytics/event') || (l.includes('curl') && l.includes('diting.cc')));
    assert.ok(curlLine.length > 0, '找不到上报的 curl 调用');
    assert.ok(INSTALL_SH.includes('--max-time 3'), '必须限制超时，避免网络慢把安装挂住');
    assert.ok(INSTALL_SH.includes('|| true'), '必须有 || true，上报失败不能中断安装');
    assert.ok(INSTALL_SH.includes('>/dev/null 2>&1'), '必须丢弃输出，不能在安装日志里刷错误');
  });

  it('visitor_id 复用 channel.js，不自己造随机串', () => {
    assert.ok(
      INSTALL_SH.includes('getVisitorId'),
      '必须复用 scripts/channel.js 的 getVisitorId，保证「安装」与「首次调通」同一个 id'
    );
    assert.ok(
      INSTALL_SH.includes('scripts/channel.js'),
      'getVisitorId 的调用必须指向已安装的 channel.js'
    );
  });

  it('不带 localhost 类 page_url（后端会丢）', () => {
    // 只看可执行行：注释里说明「为什么不带 localhost」是正常的
    const codeOnly = INSTALL_SH
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .join('\n');
    assert.ok(!codeOnly.includes('localhost'), '可执行代码里不能出现 localhost 埋点地址');
    assert.ok(
      INSTALL_SH.includes('API_KEY_URL'),
      'page_url 应复用带渠道参数的 API_KEY_URL'
    );
  });

  it('source 用产品线标识 diting，不是渠道名', () => {
    assert.ok(
      INSTALL_SH.includes('"source\\":\\"diting\\"') || INSTALL_SH.includes('\\"source\\":\\"diting\\"'),
      'source 必须是 diting（产品线标识），渠道放 label —— source 被占用了'
    );
  });

  it('label 用渠道名（skillhub / openclaw / workbuddy）', () => {
    assert.ok(
      INSTALL_SH.includes('\\"label\\":\\"${CHANNEL}\\"') || INSTALL_SH.includes('"label\\":\\"${CHANNEL}\\"'),
      'label 必须是 ${CHANNEL}，这是渠道归因的唯一入口'
    );
  });
});
