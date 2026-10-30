import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync('public/packs/cells-v1.json','utf8'));
test('every question references a real lesson and has a valid answer',()=>{const ids=new Set();for(const q of p.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(p.lessons.some(l=>l.id===q.topic));assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(q.explanation);assert.equal(q.verification,'original-unreviewed')}});
test('all original lessons provide objectives, explanatory content and retrieval prompts',()=>{assert.equal(p.lessons.length,4);for(const l of p.lessons){assert.ok(l.objective);assert.ok(l.paragraphs.length>=3);assert.ok(l.check);assert.ok(l.takeaways.length>=3)}});
