#!/usr/bin/env node
const secret = process.env.WCBS_EVAL_CREDENTIAL ?? "";
console.log(`stub-start secret=${secret}`);
console.error(`stub-error secret=${secret}`);
console.log(JSON.stringify({ home: process.env.HOME ?? process.env.USERPROFILE ?? null, inherited_probe: process.env.WCBS_EVAL_SHOULD_NOT_PASS ?? null }));
