#!/usr/bin/env node
const credential = process.env.WCBS_EVAL_CREDENTIAL ?? "";
console.log(`stub-start credential:${credential}`);
console.error(`stub-error credential:${credential}`);
console.log(JSON.stringify({ home: process.env.HOME ?? process.env.USERPROFILE ?? null, inherited_probe: process.env.WCBS_EVAL_SHOULD_NOT_PASS ?? null }));
