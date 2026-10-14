import test from 'node:test';
import assert from 'node:assert/strict';
import { GalaxyClient } from '../src/lib/galaxy/client/index.js';

function trackAndGetLastEvent(client, event, properties) {
  client.track(event, properties);
  return client.eventsQueue[client.eventsQueue.length - 1];
}

function makeClient() {
  return new GalaxyClient({
    application: 'TEST',
    getUserId: () => 'test-user',
    getSessionId: () => 'test-session',
    getContext: () => ({})
  });
}

test('namespace without dots splits as before', () => {
  const e = trackAndGetLastEvent(makeClient(), 'landing.window.load');
  assert.equal(e.namespace, 'landing');
  assert.equal(e.component, 'window');
  assert.equal(e.event, 'load');
});

test('namespace with one dot (real ClickGems anomaly: llm.rb)', () => {
  const e = trackAndGetLastEvent(makeClient(), 'dashboard: llm.rb.window.load');
  assert.equal(e.namespace, 'dashboard: llm.rb');
  assert.equal(e.component, 'window');
  assert.equal(e.event, 'load');
});

test('namespace with one dot (real ClickGems anomaly: savon-ng-1.6)', () => {
  const e = trackAndGetLastEvent(makeClient(), 'dashboard: savon-ng-1.6.window.blur');
  assert.equal(e.namespace, 'dashboard: savon-ng-1.6');
  assert.equal(e.component, 'window');
  assert.equal(e.event, 'blur');
});

test('namespace with one dot (dormant ClickPy case: ruamel.yaml)', () => {
  const e = trackAndGetLastEvent(makeClient(), 'dashboard: ruamel.yaml.window.load');
  assert.equal(e.namespace, 'dashboard: ruamel.yaml');
  assert.equal(e.component, 'window');
  assert.equal(e.event, 'load');
});

test('click-style event (nav.query.select) is unaffected', () => {
  const e = trackAndGetLastEvent(makeClient(), 'nav.query.select', { interaction: 'click' });
  assert.equal(e.namespace, 'nav');
  assert.equal(e.component, 'query');
  assert.equal(e.event, 'select');
});
