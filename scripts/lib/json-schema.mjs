/**
 * Minimal JSON Schema validator (draft 2020-12 subset).
 *
 * Why this exists: the kit previously PUBLISHED schemas but enforced only a
 * hand-written subset of them. A schema that is published but not enforced is
 * not a contract; it is documentation that lies. The adapter Definition of Done
 * says manifests and mappings "validate against their schemas", so they must
 * actually be validated against those schemas.
 *
 * Zero third-party dependencies: package.json must stay dependency-free, and
 * `checkPackage()` enforces that.
 *
 * Supported keywords:
 *   type, enum, const, required, properties, additionalProperties,
 *   items, minItems, maxItems, minLength, maxLength, pattern,
 *   minimum, maximum, format (date-time), $ref (local $defs), $defs
 *
 * The complete schema is preflighted before instance validation. Any unsupported
 * keyword, unsupported format, or malformed supported keyword fails even when it
 * appears in an absent optional property or an unused $defs entry. `$ref` is
 * conjunctive with sibling assertions, matching draft 2020-12 behavior.
 */

const typeOf = (value) => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
};
const typeMatches = (value, expected) => {
  const actual = typeOf(value);
  if (expected === "number") return actual === "number" || actual === "integer";
  if (expected === "integer") return actual === "integer";
  return actual === expected;
};
function resolveRef(root, ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) throw new Error(`unsupported non-local $ref: ${String(ref)}`);
  let node = root;
  for (const rawSegment of ref.slice(2).split("/")) {
    const segment = rawSegment.replaceAll("~1", "/").replaceAll("~0", "~");
    node = node?.[segment];
    if (node === undefined) throw new Error(`unresolvable $ref: ${ref}`);
  }
  return node;
}
const SUPPORTED_KEYWORDS = new Set(["type","enum","const","required","properties","additionalProperties","items","minItems","maxItems","minLength","maxLength","pattern","minimum","maximum","format","$schema","$id","$ref","$defs","title","description","default","examples"]);
const VALID_TYPES = new Set(["null","boolean","object","array","number","integer","string"]);
const isSchema = (value) => value === true || value === false || Boolean(value && typeof value === "object" && !Array.isArray(value));
const isPlainObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
function assertSupported(schema, schemaPath) {
  for (const keyword of Object.keys(schema)) {
    if (!SUPPORTED_KEYWORDS.has(keyword)) throw new Error(`${schemaPath}: unsupported schema keyword "${keyword}": this validator would silently ignore it. Implement it in scripts/lib/json-schema.mjs, or remove it from the schema. A published-but-unenforced keyword is not a contract.`);
  }
}
function assertKeywordShapes(schema, schemaPath) {
  const bad = (keyword, expected) => { throw new Error(`${schemaPath}.${keyword}: malformed supported keyword; expected ${expected}`); };
  if (schema.type !== undefined) {
    const values = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (values.length === 0 || values.some((value) => typeof value !== "string" || !VALID_TYPES.has(value)) || new Set(values).size !== values.length) bad("type", "a valid type name or a non-empty array of unique valid type names");
  }
  if (schema.enum !== undefined && (!Array.isArray(schema.enum) || schema.enum.length === 0)) bad("enum", "a non-empty array");
  if (schema.required !== undefined && (!Array.isArray(schema.required) || schema.required.some((value) => typeof value !== "string") || new Set(schema.required).size !== schema.required.length)) bad("required", "an array of unique strings");
  for (const keyword of ["properties","$defs"]) if (schema[keyword] !== undefined && !isPlainObject(schema[keyword])) bad(keyword, "an object whose values are schemas");
  if (schema.additionalProperties !== undefined && !isSchema(schema.additionalProperties)) bad("additionalProperties", "a boolean or schema");
  if (schema.items !== undefined && !isSchema(schema.items)) bad("items", "a boolean or schema");
  for (const keyword of ["minItems","maxItems","minLength","maxLength"]) if (schema[keyword] !== undefined && (!Number.isInteger(schema[keyword]) || schema[keyword] < 0)) bad(keyword, "a non-negative integer");
  for (const keyword of ["minimum","maximum"]) if (schema[keyword] !== undefined && (typeof schema[keyword] !== "number" || !Number.isFinite(schema[keyword]))) bad(keyword, "a finite number");
  for (const keyword of ["pattern","format","$schema","$id","$ref","title","description"]) if (schema[keyword] !== undefined && typeof schema[keyword] !== "string") bad(keyword, "a string");
  if (schema.examples !== undefined && !Array.isArray(schema.examples)) bad("examples", "an array");
  if (schema.minItems !== undefined && schema.maxItems !== undefined && schema.minItems > schema.maxItems) throw new Error(`${schemaPath}: minItems cannot exceed maxItems`);
  if (schema.minLength !== undefined && schema.maxLength !== undefined && schema.minLength > schema.maxLength) throw new Error(`${schemaPath}: minLength cannot exceed maxLength`);
  if (schema.minimum !== undefined && schema.maximum !== undefined && schema.minimum > schema.maximum) throw new Error(`${schemaPath}: minimum cannot exceed maximum`);
}
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(\.\d+)?([Zz]|([+-])(\d{2}):(\d{2}))$/;
const isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
function daysInMonth(year, month) { if (month === 2) return isLeapYear(year) ? 29 : 28; return [4,6,9,11].includes(month) ? 30 : 31; }
function isValidDateTime(value) {
  const match = DATE_TIME.exec(value);
  if (!match) return false;
  const year=Number(match[1]), month=Number(match[2]), day=Number(match[3]), hour=Number(match[4]), minute=Number(match[5]), second=Number(match[6]);
  const offsetSign=match[9], offsetHour=match[10]===undefined?0:Number(match[10]), offsetMinute=match[11]===undefined?0:Number(match[11]);
  if (month<1||month>12||day<1||day>daysInMonth(year,month)||hour>23||minute>59||second>60||offsetHour>23||offsetMinute>59) return false;
  if (second < 60) return true;
  const offsetTotal=(offsetHour*60+offsetMinute)*(offsetSign==="-"?-1:1);
  const utc=new Date(0); utc.setUTCFullYear(year,month-1,day); utc.setUTCHours(hour,minute,59,0); utc.setTime(utc.getTime()-offsetTotal*60000);
  const utcYear=utc.getUTCFullYear(), utcMonth=utc.getUTCMonth()+1, utcDay=utc.getUTCDate();
  return utc.getUTCHours()===23&&utc.getUTCMinutes()===59&&utc.getUTCSeconds()===59&&utcDay===daysInMonth(utcYear,utcMonth);
}
const FORMAT_CHECKS={"date-time":isValidDateTime};
function preflightSchema(root) {
  const seen=new WeakSet();
  const visit=(schema,schemaPath)=>{
    if (schema===true||schema===false) return;
    if (!schema||typeof schema!=="object"||Array.isArray(schema)) throw new Error(`${schemaPath}: schema must be an object or boolean`);
    if (seen.has(schema)) return;
    seen.add(schema);
    assertSupported(schema,schemaPath);
    assertKeywordShapes(schema,schemaPath);
    if (schema.format!==undefined&&!FORMAT_CHECKS[schema.format]) throw new Error(`${schemaPath}: unsupported format "${schema.format}": this validator would silently ignore it. Implement it, or remove it from the schema.`);
    if (schema.pattern!==undefined) { try { new RegExp(schema.pattern); } catch(error) { throw new Error(`${schemaPath}: invalid pattern ${JSON.stringify(schema.pattern)}: ${error.message}`); } }
    if (schema.$ref!==undefined) resolveRef(root,schema.$ref);
    for (const [name,child] of Object.entries(schema.properties??{})) visit(child,`${schemaPath}.properties.${name}`);
    for (const [name,child] of Object.entries(schema.$defs??{})) visit(child,`${schemaPath}.$defs.${name}`);
    if (schema.items!==undefined) visit(schema.items,`${schemaPath}.items`);
    if (schema.additionalProperties!==undefined&&schema.additionalProperties!==true&&schema.additionalProperties!==false) visit(schema.additionalProperties,`${schemaPath}.additionalProperties`);
  };
  visit(root,"(root schema)");
}
function walk(root,schema,value,pointer,errors,activeRefs=new Set()) {
  if (schema===true||schema===undefined) return;
  if (schema===false) { errors.push(`${pointer||"(root)"}: schema forbids any value here`); return; }
  if (schema.$ref) { if (activeRefs.has(schema.$ref)) throw new Error(`cyclic $ref is not supported by this validator: ${schema.$ref}`); activeRefs.add(schema.$ref); walk(root,resolveRef(root,schema.$ref),value,pointer,errors,activeRefs); activeRefs.delete(schema.$ref); }
  const at=pointer||"(root)";
  if (schema.type!==undefined) { const allowed=Array.isArray(schema.type)?schema.type:[schema.type]; if (!allowed.some((t)=>typeMatches(value,t))) { errors.push(`${at}: expected type ${allowed.join(" or ")}, got ${typeOf(value)}`); return; } }
  if (Array.isArray(schema.enum)&&!schema.enum.some((option)=>option===value)) errors.push(`${at}: value ${JSON.stringify(value)} is not one of [${schema.enum.join(", ")}]`);
  if (schema.const!==undefined&&value!==schema.const) errors.push(`${at}: value must be ${JSON.stringify(schema.const)}`);
  if (typeof value==="number") { if (schema.minimum!==undefined&&value<schema.minimum) errors.push(`${at}: value ${value} is below minimum ${schema.minimum}`); if (schema.maximum!==undefined&&value>schema.maximum) errors.push(`${at}: value ${value} is above maximum ${schema.maximum}`); }
  if (typeof value==="string") { if (schema.minLength!==undefined&&value.length<schema.minLength) errors.push(`${at}: string is shorter than minLength ${schema.minLength}`); if (schema.maxLength!==undefined&&value.length>schema.maxLength) errors.push(`${at}: string is longer than maxLength ${schema.maxLength}`); if (schema.pattern!==undefined&&!new RegExp(schema.pattern).test(value)) errors.push(`${at}: value ${JSON.stringify(value)} does not match required pattern ${schema.pattern}`); if (schema.format!==undefined&&!FORMAT_CHECKS[schema.format](value)) errors.push(`${at}: value ${JSON.stringify(value)} is not a valid ${schema.format}`); }
  if (Array.isArray(value)) { if (schema.minItems!==undefined&&value.length<schema.minItems) errors.push(`${at}: array has ${value.length} items, fewer than minItems ${schema.minItems}`); if (schema.maxItems!==undefined&&value.length>schema.maxItems) errors.push(`${at}: array has ${value.length} items, more than maxItems ${schema.maxItems}`); if (schema.items!==undefined) value.forEach((entry,index)=>walk(root,schema.items,entry,`${at}[${index}]`,errors,activeRefs)); }
  if (value&&typeof value==="object"&&!Array.isArray(value)) {
    for (const key of schema.required??[]) if (value[key]===undefined) errors.push(`${at}: missing required property "${key}"`);
    const properties=schema.properties??{};
    for (const [key,subSchema] of Object.entries(properties)) if (value[key]!==undefined) walk(root,subSchema,value[key],pointer?`${pointer}.${key}`:key,errors,activeRefs);
    if (schema.additionalProperties===false) { for (const key of Object.keys(value)) if (!(key in properties)) errors.push(`${at}: undeclared property "${key}" is not permitted`); }
    else if (schema.additionalProperties&&typeof schema.additionalProperties==="object") { for (const [key,entry] of Object.entries(value)) if (!(key in properties)) walk(root,schema.additionalProperties,entry,pointer?`${pointer}.${key}`:key,errors,activeRefs); }
  }
}
export function validateAgainstSchema(schema,document) { preflightSchema(schema); const errors=[]; walk(schema,schema,document,"",errors); return errors; }
