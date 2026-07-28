#!/usr/bin/env node
const credential = process.env.WCBS_EVAL_CREDENTIAL ?? "";
const literal = credential;
const base64 = Buffer.from(credential, "utf8").toString("base64");
const urlEncoded = encodeURIComponent(credential);
const jsonEscaped = JSON.stringify(credential).slice(1, -1);
const basic = Buffer.from(`agent:${credential}`, "utf8").toString("base64");
console.log(`stub-literal credential:${literal}`);
console.log(`stub-base64 credential:${base64}`);
console.log(`stub-url credential:${urlEncoded}`);
console.log(`stub-json credential:${jsonEscaped}`);
console.error(`Authorization: Basic ${basic}`);
console.log(JSON.stringify({ home: process.env.HOME ?? process.env.USERPROFILE ?? null, inherited_probe: process.env.WCBS_EVAL_SHOULD_NOT_PASS ?? null }));
