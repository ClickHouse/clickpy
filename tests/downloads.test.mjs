import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultDownloadRange, groupOtherVersions } from '../src/utils/downloads.mjs';

test('default window includes the latest day and exactly thirty calendar dates', () => {
    assert.deepEqual(defaultDownloadRange('2026-11-02'), { min_date: '2026-10-04', max_date: '2026-11-02' });
    assert.deepEqual(defaultDownloadRange('2024-03-01'), { min_date: '2024-02-01', max_date: '2024-03-01' });
});

test('version slices conserve all downloads, including string-valued counts', () => {
    const rows = Array.from({ length: 9 }, (_, i) => ({ name: `0.${i}`, value: String(9 - i) }));
    const slices = groupOtherVersions(rows);
    assert.deepEqual(slices.slice(0, 6), rows.slice(0, 6));
    assert.deepEqual(slices.at(-1), { name: 'Other versions', value: 6, isOther: true });
    assert.equal(slices.reduce((n, row) => n + Number(row.value), 0), 45);
    assert.equal(rows.length, 9);
});

test('no synthetic slice is added when every version is already visible', () => {
    assert.deepEqual(groupOtherVersions([]), []);
    const rows = Array.from({ length: 6 }, (_, i) => ({ name: String(i), value: 1 }));
    assert.deepEqual(groupOtherVersions(rows), rows);
});
