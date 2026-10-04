import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Compile the TypeScript helpers into isolated contexts; never contact Notehub.
function load(file, fetch) {
  const filename = path.resolve(file);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const compiled = { exports: {} };
  vm.runInNewContext(code, {
    module: compiled, exports: compiled.exports, URLSearchParams, AbortSignal, Date,
    process: { env: { NOTEHUB_PERSONAL_ACCESS_TOKEN: 'test', NOTEHUB_PROJECT_UID: 'test' } },
    fetch,
    require: (name) => load(path.resolve(path.dirname(filename), name + '.ts'), fetch),
  }, { filename });
  return compiled.exports;
}

test('default request fetches only 24h, paginates, and trims metadata', async () => {
  const calls = [];
  const { getEvents } = load('app/utils/notehub.ts', async (url, options) => {
    const params = new URL(url).searchParams;
    calls.push({ params, options });
    return { ok: true, json: async () => ({
      events: [{ when: 123, body: { co2: 500 }, device: 'test', best_id: 'Office', secretMetadata: 'discard' }],
      has_more: params.get('pageNum') === '1',
    }) };
  });
  const events = await getEvents();
  assert.equal(calls.length, 2);
  const first = calls[0].params;
  assert.equal(Number(first.get('endDate')) - Number(first.get('startDate')), 86400);
  assert.equal(first.get('dateType'), 'captured');
  assert.equal(first.get('files'), 'data.qo');
  assert.equal(first.get('selectFields'), 'when,body,device,best_id');
  assert.equal(calls[1].params.get('pageNum'), '2');
  assert.equal(first.get('endDate'), calls[1].params.get('endDate'));
  assert.equal(calls[0].options.next.revalidate, 60);
  assert.equal(events.length, 2);
  assert.equal(events[0].secretMetadata, undefined);
});

test('month request covers the full selected window', async () => {
  let query;
  const { getEvents } = load('app/utils/notehub.ts', async (url) => {
    query = new URL(url).searchParams;
    return { ok: true, json: async () => ({ events: [], has_more: false }) };
  });
  assert.equal((await getEvents('30d')).length, 0);
  assert.equal(Number(query.get('endDate')) - Number(query.get('startDate')), 30 * 86400);
});

test('upstream failures are errors rather than empty charts', async () => {
  const { getEvents } = load('app/utils/notehub.ts', async () => ({ ok: false, status: 503 }));
  await assert.rejects(getEvents(), /503/);
});

test('an empty page with has_more fails instead of looping forever', async () => {
  const { getEvents } = load('app/utils/notehub.ts', async () => ({
    ok: true, json: async () => ({ events: [], has_more: true }),
  }));
  await assert.rejects(getEvents(), /Invalid Notehub/);
});

test('request cancellation is propagated upstream', async () => {
  const controller = new AbortController();
  controller.abort();
  const { getEvents } = load('app/utils/notehub.ts', async (_url, options) => {
    options.signal.throwIfAborted();
  });
  await assert.rejects(getEvents('24h', controller.signal), { name: 'AbortError' });
});

test('time range validation rejects unknown and inherited property names', () => {
  const { isTimeRange } = load('app/utils/timeRanges.ts');
  assert.equal(isTimeRange('24h'), true);
  assert.equal(isTimeRange('30d'), true);
  assert.equal(isTimeRange('all'), false);
  assert.equal(isTimeRange('toString'), false);
});
