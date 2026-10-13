// @bun
// ../node_modules/zod/v4/core/core.js
var _a;
function $constructor(name, initializer, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: new Set
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0;i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;

  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a;
    const inst = params?.Parent ? new Definition : this;
    init(inst, def);
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $brand = Symbol("zod_brand");

class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

class $ZodEncodeError extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
// ../node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set = false;
  return {
    get value() {
      if (!set) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === undefined;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = undefined;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        return;
      }
      if (value === undefined) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v
      });
    },
    configurable: true
  });
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === undefined)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== undefined) {
    if (params?.error !== undefined)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-340282346638528860000000000000000000000, 340282346638528860000000000000000000000],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a;
    (_a = iss).path ?? (_a.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
  const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
  rest.path ?? (rest.path = []);
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}

// ../node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue) => issue.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error, path = []) => {
    for (const issue of error.issues) {
      if (issue.code === "invalid_union" && issue.errors.length) {
        issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
      } else if (issue.code === "invalid_key") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else if (issue.code === "invalid_element") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else {
        const fullpath = [...path, ...issue.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// ../node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
// ../node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var _null = /^null$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// ../node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a = inst._zod).onattach ?? (_a.onattach = []);
});
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst) => {
    var _a;
    (_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = new Set);
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a = inst._zod).check ?? (_a.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// ../node_modules/zod/v4/core/doc.js
class Doc {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split(`
`).filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [``];
    const lines = [...content.map((x) => `  ${x}`)];
    return new F(...args, lines.join(`
`));
  }
}

// ../node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 4,
  patch: 3
};

// ../node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError;
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary) => {
            return handleCanaryResult(canary, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return result.then((result) => runChecks(result, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_) {}
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === undefined)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      if (!def.normalize && def.protocol?.source === httpProtocol.source) {
        if (!/^https?:\/\//i.test(trimmed)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid URL format",
            input: payload.value,
            inst,
            continue: !def.abort
          });
          return;
        }
      }
      const url = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error;
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error;
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error;
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error;
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : undefined : undefined;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = _null;
  inst._zod.values = new Set([null]);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (input === null)
      return payload;
    payload.issues.push({
      expected: "null",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0;i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResult(result, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
  const isPresent = key in input;
  if (result.issues.length) {
    if (isOptionalIn && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && !isOptionalIn) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: undefined,
        path: [key]
      });
    }
    return;
  }
  if (result.value === undefined) {
    if (isPresent) {
      final.value[key] = undefined;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalIn = _catchall.optin === "optional";
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (key === "__proto__")
      continue;
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = new Set);
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const isOptionalIn = el._zod.optin === "optional";
      const isOptionalOut = el._zod.optout === "optional";
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
      } else {
        handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    };
    doc.write(`const input = payload.value;`);
    const ids = Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(`const newResult = {};`);
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      const schema = shape[key];
      const isOptionalIn = schema?._zod?.optin === "optional";
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(key)};`);
      if (isOptionalIn && isOptionalOut) {
        doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      } else if (!isOptionalIn) {
        doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : undefined);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, payload, inst, ctx);
    });
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left, right]) => {
        return handleIntersectionResults(payload, left, right);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = new Map;
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  if (def.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output) => {
        payload.value = output;
        payload.fallback = true;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError;
    }
    payload.value = _out;
    payload.fallback = true;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (input === undefined && (result.issues.length || result.fallback)) {
    return { issues: [], value: undefined };
  }
  return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, undefined]) : undefined;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const input = payload.value;
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, input));
      return handleOptionalResult(result, input);
    }
    if (payload.value === undefined) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleDefaultResult(result, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleNonOptionalResult(result, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => {
        payload.value = result.value;
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
          payload.fallback = true;
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
      payload.fallback = true;
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right) => handlePipeResult(right, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      path: [...inst._zod.def.path ?? []],
      continue: !inst._zod.def.abort
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
// ../node_modules/zod/v4/core/registries.js
var _a2;
var $output = Symbol("ZodOutput");
var $input = Symbol("ZodInput");

class $ZodRegistry {
  constructor() {
    this._map = new WeakMap;
    this._idmap = new Map;
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.set(meta.id, schema);
    }
    return this;
  }
  clear() {
    this._map = new WeakMap;
    this._idmap = new Map;
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : undefined;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
}
function registry() {
  return new $ZodRegistry;
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
// ../node_modules/zod/v4/core/api.js
function _string(Class, params) {
  return new Class({
    type: "string",
    ...normalizeParams(params)
  });
}
function _email(Class, params) {
  return new Class({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class, params) {
  return new Class({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class, params) {
  return new Class({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class, params) {
  return new Class({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class, params) {
  return new Class({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class, params) {
  return new Class({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class, params) {
  return new Class({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class, params) {
  return new Class({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class, params) {
  return new Class({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class, params) {
  return new Class({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class, params) {
  return new Class({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class, params) {
  return new Class({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class, params) {
  return new Class({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class, params) {
  return new Class({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class, params) {
  return new Class({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class, params) {
  return new Class({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _isoDateTime(Class, params) {
  return new Class({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class, params) {
  return new Class({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class, params) {
  return new Class({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class, params) {
  return new Class({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _number(Class, params) {
  return new Class({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
function _int(Class, params) {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
function _boolean(Class, params) {
  return new Class({
    type: "boolean",
    ...normalizeParams(params)
  });
}
function _null2(Class, params) {
  return new Class({
    type: "null",
    ...normalizeParams(params)
  });
}
function _unknown(Class) {
  return new Class({
    type: "unknown"
  });
}
function _never(Class, params) {
  return new Class({
    type: "never",
    ...normalizeParams(params)
  });
}
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class, element, params) {
  return new Class({
    type: "array",
    element,
    ...normalizeParams(params)
  });
}
function _refine(Class, fn, _params) {
  const schema = new Class({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn, params) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// ../node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: new Map,
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? undefined
  };
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta)
    Object.assign(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a = result.schema).default ?? (_a.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = new Map;
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id) => id);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema = seen.schema;
    for (const key in schema) {
      delete schema[key];
    }
    schema.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error("Cycle detected: " + `#/${seen.cycle?.join("/")}/<root>` + '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema = seen.def ?? seen.schema;
    const _cached = { ...schema };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema.allOf = schema.allOf ?? [];
        schema.allOf.push(refSchema);
      } else {
        Object.assign(schema, refSchema);
      }
      Object.assign(schema, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {}
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== undefined && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      if (seen.def.id === seen.defId)
        delete seen.def.id;
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {} else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: new Set };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
// ../node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json.type = "integer";
  else
    json.type = "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (typeof multipleOf === "number")
    json.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
var nullProcessor = (_schema, ctx, json, _params) => {
  if (ctx.target === "openapi-3.0") {
    json.type = "string";
    json.nullable = true;
    json.enum = [null];
  } else {
    json.type = "null";
  }
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var literalProcessor = (schema, ctx, json, _params) => {
  const def = schema._zod.def;
  const vals = [];
  for (const val of def.values) {
    if (val === undefined) {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      }
    } else if (typeof val === "bigint") {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        vals.push(Number(val));
      }
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {} else if (vals.length === 1) {
    const val = vals[0];
    json.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json.type = "boolean";
    if (vals.every((v) => v === null))
      json.type = "null";
    json.enum = vals;
  }
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process2(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  json.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json.properties[key] = process2(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === undefined;
    } else {
      return v.optout === undefined;
    }
  }));
  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process2(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process2(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process2(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process2(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => ("allOf" in val) && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(undefined);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  process2(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
// ../node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// ../node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
    },
    addIssue: {
      value: (issue) => {
        inst.issues.push(issue);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    addIssues: {
      value: (issues) => {
        inst.issues.push(...issues);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, {
  Parent: Error
});

// ../node_modules/zod/v4/classic/parse.js
var parse3 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// ../node_modules/zod/v4/classic/schemas.js
var _installedGroups = /* @__PURE__ */ new WeakMap;
function _installLazyMethods(inst, group, methods) {
  const proto = Object.getPrototypeOf(inst);
  let installed = _installedGroups.get(proto);
  if (!installed) {
    installed = new Set;
    _installedGroups.set(proto, installed);
  }
  if (installed.has(group))
    return;
  installed.add(group);
  for (const key in methods) {
    const fn = methods[key];
    Object.defineProperty(proto, key, {
      configurable: true,
      enumerable: false,
      get() {
        const bound = fn.bind(this);
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: bound
        });
        return bound;
      },
      set(v) {
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v
        });
      }
    });
  }
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.parse = (data, params) => parse3(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse2(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode(inst, data, params);
  inst.decode = (data, params) => decode(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
  _installLazyMethods(inst, "ZodType", {
    check(...chks) {
      const def = this.def;
      return this.clone(mergeDefs(def, {
        checks: [
          ...def.checks ?? [],
          ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
        ]
      }), { parent: true });
    },
    with(...chks) {
      return this.check(...chks);
    },
    clone(def, params) {
      return clone(this, def, params);
    },
    brand() {
      return this;
    },
    register(reg, meta) {
      reg.add(this, meta);
      return this;
    },
    refine(check, params) {
      return this.check(refine(check, params));
    },
    superRefine(refinement, params) {
      return this.check(superRefine(refinement, params));
    },
    overwrite(fn) {
      return this.check(_overwrite(fn));
    },
    optional() {
      return optional(this);
    },
    exactOptional() {
      return exactOptional(this);
    },
    nullable() {
      return nullable(this);
    },
    nullish() {
      return optional(nullable(this));
    },
    nonoptional(params) {
      return nonoptional(this, params);
    },
    array() {
      return array(this);
    },
    or(arg) {
      return union([this, arg]);
    },
    and(arg) {
      return intersection(this, arg);
    },
    transform(tx) {
      return pipe(this, transform(tx));
    },
    default(d) {
      return _default(this, d);
    },
    prefault(d) {
      return prefault(this, d);
    },
    catch(params) {
      return _catch(this, params);
    },
    pipe(target) {
      return pipe(this, target);
    },
    readonly() {
      return readonly(this);
    },
    describe(description) {
      const cl = this.clone();
      globalRegistry.add(cl, { description });
      return cl;
    },
    meta(...args) {
      if (args.length === 0)
        return globalRegistry.get(this);
      const cl = this.clone();
      globalRegistry.add(cl, args[0]);
      return cl;
    },
    isOptional() {
      return this.safeParse(undefined).success;
    },
    isNullable() {
      return this.safeParse(null).success;
    },
    apply(fn) {
      return fn(this);
    }
  });
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  _installLazyMethods(inst, "_ZodString", {
    regex(...args) {
      return this.check(_regex(...args));
    },
    includes(...args) {
      return this.check(_includes(...args));
    },
    startsWith(...args) {
      return this.check(_startsWith(...args));
    },
    endsWith(...args) {
      return this.check(_endsWith(...args));
    },
    min(...args) {
      return this.check(_minLength(...args));
    },
    max(...args) {
      return this.check(_maxLength(...args));
    },
    length(...args) {
      return this.check(_length(...args));
    },
    nonempty(...args) {
      return this.check(_minLength(1, ...args));
    },
    lowercase(params) {
      return this.check(_lowercase(params));
    },
    uppercase(params) {
      return this.check(_uppercase(params));
    },
    trim() {
      return this.check(_trim());
    },
    normalize(...args) {
      return this.check(_normalize(...args));
    },
    toLowerCase() {
      return this.check(_toLowerCase());
    },
    toUpperCase() {
      return this.check(_toUpperCase());
    },
    slugify() {
      return this.check(_slugify());
    }
  });
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  _installLazyMethods(inst, "ZodNumber", {
    gt(value, params) {
      return this.check(_gt(value, params));
    },
    gte(value, params) {
      return this.check(_gte(value, params));
    },
    min(value, params) {
      return this.check(_gte(value, params));
    },
    lt(value, params) {
      return this.check(_lt(value, params));
    },
    lte(value, params) {
      return this.check(_lte(value, params));
    },
    max(value, params) {
      return this.check(_lte(value, params));
    },
    int(params) {
      return this.check(int(params));
    },
    safe(params) {
      return this.check(int(params));
    },
    positive(params) {
      return this.check(_gt(0, params));
    },
    nonnegative(params) {
      return this.check(_gte(0, params));
    },
    negative(params) {
      return this.check(_lt(0, params));
    },
    nonpositive(params) {
      return this.check(_lte(0, params));
    },
    multipleOf(value, params) {
      return this.check(_multipleOf(value, params));
    },
    step(value, params) {
      return this.check(_multipleOf(value, params));
    },
    finite() {
      return this;
    }
  });
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
  $ZodNull.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullProcessor(inst, ctx, json, params);
});
function _null3(params) {
  return _null2(ZodNull, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  _installLazyMethods(inst, "ZodArray", {
    min(n, params) {
      return this.check(_minLength(n, params));
    },
    nonempty(params) {
      return this.check(_minLength(1, params));
    },
    max(n, params) {
      return this.check(_maxLength(n, params));
    },
    length(n, params) {
      return this.check(_length(n, params));
    },
    unwrap() {
      return this.element;
    }
  });
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  defineLazy(inst, "shape", () => {
    return def.shape;
  });
  _installLazyMethods(inst, "ZodObject", {
    keyof() {
      return _enum(Object.keys(this._zod.def.shape));
    },
    catchall(catchall) {
      return this.clone({ ...this._zod.def, catchall });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: never() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: undefined });
    },
    extend(incoming) {
      return extend(this, incoming);
    },
    safeExtend(incoming) {
      return safeExtend(this, incoming);
    },
    merge(other) {
      return merge(this, other);
    },
    pick(mask) {
      return pick(this, mask);
    },
    omit(mask) {
      return omit(this, mask);
    },
    partial(...args) {
      return partial(ZodOptional, this, args[0]);
    },
    required(...args) {
      return required(ZodNonOptional, this, args[0]);
    }
  });
});
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...normalizeParams(params)
  };
  return new ZodObject(def);
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output) => {
        payload.value = output;
        payload.fallback = true;
        return payload;
      });
    }
    payload.value = output;
    payload.fallback = true;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
// ../node_modules/@hatch/space-sdk/dist/server-contract.js
var PRIVILEGED_CONTRACT_BRAND = "@hatch/space-sdk/privileged-contract/v1";
var PRIVILEGED_HANDLERS_FORMAT = "hatch-space-privileged-handlers-v1";
function definePrivilegedContracts(specs) {
  const contracts = {};
  for (const [name, spec] of Object.entries(specs)) {
    contracts[name] = {
      __brand: PRIVILEGED_CONTRACT_BRAND,
      name,
      request: spec.request,
      response: spec.response,
      ...spec.capabilities !== undefined ? { capabilities: spec.capabilities } : {},
      ...spec.timeoutMs !== undefined ? { timeoutMs: spec.timeoutMs } : {}
    };
  }
  return contracts;
}
function definePrivilegedHandlers(contracts, handlers) {
  const entries = [];
  for (const [key, handler] of Object.entries(handlers)) {
    if (handler === undefined) {
      continue;
    }
    const contract = contracts[key];
    if (!isPrivilegedContract(contract)) {
      throw new Error(`privileged handler '${key}' does not have a contract descriptor`);
    }
    entries.push({
      contract,
      handler
    });
  }
  return {
    format: PRIVILEGED_HANDLERS_FORMAT,
    entries
  };
}
function isPrivilegedContract(value) {
  return typeof value === "object" && value !== null && "__brand" in value && value.__brand === PRIVILEGED_CONTRACT_BRAND;
}
var ACTION_BRAND = "@hatch/space-sdk/action/v1";
var LEGACY_ACTION_BRAND = Symbol.for("@hatch/space-sdk/action");
function createDefineAction() {
  return function defineAction(spec) {
    return {
      __brand: ACTION_BRAND,
      request: spec.request,
      response: spec.response,
      ...spec.privileged !== undefined ? { privileged: spec.privileged } : {},
      handler: spec.handler
    };
  };
}
// ../node_modules/@hatch/space-sdk/dist/index.js
var defineAction = createDefineAction();

// src/moderation/wordlists.ts
var WORD_LISTS = {
  en: ["2g1c", "2 girls 1 cup", "acrotomophilia", "alabama hot pocket", "alaskan pipeline", "anal", "anilingus", "anus", "apeshit", "arsehole", "ass", "asshole", "assmunch", "auto erotic", "autoerotic", "babeland", "baby batter", "baby juice", "ball gag", "ball gravy", "ball kicking", "ball licking", "ball sack", "ball sucking", "bangbros", "bangbus", "bareback", "barely legal", "barenaked", "bastard", "bastardo", "bastinado", "bbw", "bdsm", "beaner", "beaners", "beaver cleaver", "beaver lips", "beastiality", "bestiality", "big black", "big breasts", "big knockers", "big tits", "bimbos", "birdlock", "bitch", "bitches", "black cock", "blonde action", "blonde on blonde action", "blowjob", "blow job", "blow your load", "blue waffle", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "booty call", "brown showers", "brunette action", "bukkake", "bulldyke", "bullet vibe", "bullshit", "bung hole", "bunghole", "busty", "butt", "buttcheeks", "butthole", "camel toe", "camgirl", "camslut", "camwhore", "carpet muncher", "carpetmuncher", "chocolate rosebuds", "cialis", "circlejerk", "cleveland steamer", "clit", "clitoris", "clover clamps", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "coon", "coons", "creampie", "cum", "cumming", "cumshot", "cumshots", "cunnilingus", "cunt", "darkie", "date rape", "daterape", "deep throat", "deepthroat", "dendrophilia", "dick", "dildo", "dingleberry", "dingleberries", "dirty pillows", "dirty sanchez", "doggie style", "doggiestyle", "doggy style", "doggystyle", "dog style", "dolcett", "domination", "dominatrix", "dommes", "donkey punch", "double dong", "double penetration", "dp action", "dry hump", "dvda", "eat my ass", "ecchi", "ejaculation", "erotic", "erotism", "escort", "eunuch", "fag", "faggot", "fecal", "felch", "fellatio", "feltch", "female squirting", "femdom", "figging", "fingerbang", "fingering", "fisting", "foot fetish", "footjob", "frotting", "fuck", "fuck buttons", "fuckin", "fucking", "fucktards", "fudge packer", "fudgepacker", "futanari", "gangbang", "gang bang", "gay sex", "genitals", "giant cock", "girl on", "girl on top", "girls gone wild", "goatcx", "goatse", "god damn", "gokkun", "golden shower", "goodpoop", "goo girl", "goregasm", "grope", "group sex", "g-spot", "guro", "hand job", "handjob", "hard core", "hardcore", "hentai", "homoerotic", "honkey", "hooker", "horny", "hot carl", "hot chick", "how to kill", "how to murder", "huge fat", "humping", "incest", "intercourse", "jack off", "jail bait", "jailbait", "jelly donut", "jerk off", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing", "leather restraint", "leather straight jacket", "lemon party", "livesex", "lolita", "lovemaking", "make me come", "male squirting", "masturbate", "masturbating", "masturbation", "menage a trois", "milf", "missionary position", "mong", "motherfucker", "mound of venus", "mr hands", "muff diver", "muffdiving", "nambla", "nawashi", "negro", "neonazi", "nigga", "nigger", "nig nog", "nimphomania", "nipple", "nipples", "nsfw", "nsfw images", "nude", "nudity", "nutten", "nympho", "nymphomania", "octopussy", "omorashi", "one cup two girls", "one guy one jar", "orgasm", "orgy", "paedophile", "paki", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "phone sex", "piece of shit", "pikey", "pissing", "piss pig", "pisspig", "playboy", "pleasure chest", "pole smoker", "ponyplay", "poof", "poon", "poontang", "punany", "poop chute", "poopchute", "porn", "porno", "pornography", "prince albert piercing", "pthc", "pubes", "pussy", "queaf", "queef", "quim", "raghead", "raging boner", "rape", "raping", "rapist", "rectum", "reverse cowgirl", "rimjob", "rimming", "rosy palm", "rosy palm and her 5 sisters", "rusty trombone", "sadism", "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexcam", "sexo", "sexy", "sexual", "sexually", "sexuality", "shaved beaver", "shaved pussy", "shemale", "shibari", "shit", "shitblimp", "shitty", "shota", "shrimping", "skeet", "slanteye", "slut", "s&m", "smut", "snatch", "snowballing", "sodomize", "sodomy", "spastic", "spic", "splooge", "splooge moose", "spooge", "spread legs", "spunk", "strap on", "strapon", "strappado", "strip club", "style doggy", "suck", "sucks", "suicide girls", "sultry women", "swastika", "swinger", "tainted love", "taste my", "tea bagging", "threesome", "throating", "thumbzilla", "tied up", "tight white", "tit", "tits", "titties", "titty", "tongue in a", "topless", "tosser", "towelhead", "tranny", "tribadism", "tub girl", "tubgirl", "tushy", "twat", "twink", "twinkie", "two girls one cup", "undressing", "upskirt", "urethra play", "urophilia", "vagina", "venus mound", "viagra", "vibrator", "violet wand", "vorarephilia", "voyeur", "voyeurweb", "voyuer", "vulva", "wank", "wetback", "wet dream", "white power", "whore", "worldsex", "wrapping men", "wrinkled starfish", "xx", "xxx", "yaoi", "yellow showers", "yiffy", "zoophilia"],
  hi: ["aand", "aandu", "balatkar", "balatkari", "behen chod", "beti chod", "bhadva", "bhadve", "bhandve", "bhangi", "bhootni ke", "bhosad", "bhosadi ke", "boobe", "chakke", "chinaal", "chinki", "chod", "chodu", "chodu bhagat", "chooche", "choochi", "choope", "choot", "choot ke baal", "chootia", "chootiya", "chuche", "chuchi", "chudaap", "chudai khanaa", "chudam chudai", "chude", "chut", "chut ka chuha", "chut ka churan", "chut ka mail", "chut ke baal", "chut ke dhakkan", "chut maarli", "chutad", "chutadd", "chutan", "chutia", "chutiya", "gaand", "gaandfat", "gaandmasti", "gaandufad", "gandfattu", "gandu", "gashti", "gasti", "ghassa", "ghasti", "gucchi", "gucchu", "harami", "haramzade", "hawas", "hawas ke pujari", "hijda", "hijra", "jhant", "jhant chaatu", "jhant ka keeda", "jhant ke baal", "jhant ke pissu", "jhantu", "kamine", "kaminey", "kanjar", "kutta", "kutta kamina", "kutte ki aulad", "kutte ki jat", "kuttiya", "loda", "lodu", "lund", "lund choos", "lund ka bakkal", "lund khajoor", "lundtopi", "lundure", "maa ki chut", "maal", "madar chod", "madarchod", "madhavchod", "mooh mein le", "mutth", "mutthal", "najayaz", "najayaz aulaad", "najayaz paidaish", "paki", "pataka", "patakha", "raand", "randaap", "randi", "randi rona", "saala", "saala kutta", "saali kutti", "saali randi", "suar", "suar ke lund", "suar ki aulad", "tatte", "tatti", "teri maa ka bhosada", "teri maa ka boba chusu", "teri maa ki behenchod", "teri maa ki chut", "tharak", "tharki", "tu chuda"],
  es: ["Asesinato", "asno", "bastardo", "Bollera", "Cabr\xF3n", "Caca", "Chupada", "Chupapollas", "Chupet\xF3n", "concha", "Concha de tu madre", "Co\xF1o", "Coprofag\xEDa", "Culo", "Drogas", "Esperma", "Fiesta de salchichas", "Follador", "Follar", "Gilipichis", "Gilipollas", "Hacer una paja", "Haciendo el amor", "Hero\xEDna", "Hija de puta", "Hijaputa", "Hijo de puta", "Hijoputa", "Idiota", "Imb\xE9cil", "infierno", "Jilipollas", "Kapullo", "Lameculos", "Maciza", "Macizorra", "maldito", "Mamada", "Marica", "Maric\xF3n", "Mariconazo", "martillo", "Mierda", "Nazi", "Orina", "Pedo", "Pendejo", "Pervertido", "Pez\xF3n", "Pinche", "Pis", "Prostituta", "Puta", "Racista", "Ramera", "S\xE1dico", "Semen", "Sexo", "Sexo oral", "Soplagaitas", "Soplapollas", "Tetas grandes", "T\xEDa buena", "Travesti", "Trio", "Verga", "vete a la mierda", "Vulva"],
  fr: ["baiser", "bander", "bigornette", "bite", "bitte", "bloblos", "bordel", "bourr\xE9", "bourr\xE9e", "brackmard", "branlage", "branler", "branlette", "branleur", "branleuse", "brouter le cresson", "caca", "chatte", "chiasse", "chier", "chiottes", "clito", "clitoris", "con", "connard", "connasse", "conne", "couilles", "cramouille", "cul", "d\xE9conne", "d\xE9conner", "emmerdant", "emmerder", "emmerdeur", "emmerdeuse", "encul\xE9", "encul\xE9e", "enculeur", "enculeurs", "enfoir\xE9", "enfoir\xE9e", "\xE9tron", "fille de pute", "fils de pute", "folle", "foutre", "gerbe", "gerber", "gouine", "grande folle", "grogniasse", "gueule", "jouir", "la putain de ta m\xE8re", "MALPT", "m\xE9nage \xE0 trois", "merde", "merdeuse", "merdeux", "meuf", "n\xE8gre", "negro", "nique ta m\xE8re", "nique ta race", "palucher", "p\xE9dale", "p\xE9d\xE9", "p\xE9ter", "pipi", "pisser", "pouffiasse", "pousse-crotte", "putain", "pute", "ramoner", "sac \xE0 foutre", "sac \xE0 merde", "salaud", "salope", "suce", "tapette", "tanche", "teuch", "tringler", "trique", "troncher", "trou du cul", "turlute", "zigounette", "zizi"],
  ar: ["\u0633\u0643\u0633", "\u0637\u064A\u0632", "\u0634\u0631\u062C", "\u0644\u0639\u0642", "\u0644\u062D\u0633", "\u0645\u0635", "\u062A\u0645\u0635", "\u0628\u064A\u0636\u0627\u0646", "\u062B\u062F\u064A", "\u0628\u0632", "\u0628\u0632\u0627\u0632", "\u062D\u0644\u0645\u0629", "\u0645\u0641\u0644\u0642\u0633\u0629", "\u0628\u0638\u0631", "\u0643\u0633", "\u0641\u0631\u062C", "\u0634\u0647\u0648\u0629", "\u0634\u0627\u0630", "\u0645\u0628\u0627\u062F\u0644", "\u0639\u0627\u0647\u0631\u0629", "\u062C\u0645\u0627\u0639", "\u0642\u0636\u064A\u0628", "\u0632\u0628", "\u0644\u0648\u0637\u064A", "\u0644\u0648\u0627\u0637", "\u0633\u062D\u0627\u0642", "\u0633\u062D\u0627\u0642\u064A\u0629", "\u0627\u063A\u062A\u0635\u0627\u0628", "\u062E\u0646\u062B\u064A", "\u0627\u062D\u062A\u0644\u0627\u0645", "\u0646\u064A\u0643", "\u0645\u062A\u0646\u0627\u0643", "\u0645\u062A\u0646\u0627\u0643\u0629", "\u0634\u0631\u0645\u0648\u0637\u0629", "\u0639\u0631\u0635", "\u062E\u0648\u0644", "\u0642\u062D\u0628\u0629", "\u0644\u0628\u0648\u0629"]
};

// src/moderation/wordlist.ts
var wordSets = new Map;
function getSet(lang) {
  let set = wordSets.get(lang);
  if (!set) {
    set = new Set((WORD_LISTS[lang] || []).map((w) => w.toLowerCase()));
    wordSets.set(lang, set);
  }
  return set;
}
function findBannedWord(text, lang = "en") {
  const words = getSet(lang);
  if (words.size === 0)
    return null;
  const lower = text.toLowerCase();
  const tokens = lower.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  for (const token of tokens) {
    if (words.has(token))
      return token;
  }
  return null;
}
function findBannedWordAny(text) {
  for (const lang of ["en", "hi", "es", "fr", "ar"]) {
    const word = findBannedWord(text, lang);
    if (word)
      return { word, lang };
  }
  return null;
}
function detectSpam(text) {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 10) {
    const caps = letters.replace(/[^A-Z]/g, "").length;
    if (caps / letters.length > 0.7)
      return "excessive_caps";
  }
  if (/(.)\1{5,}/.test(text))
    return "repeated_chars";
  const emojiCount = (text.match(/\p{Extended_Pictographic}/gu) || []).length;
  if (emojiCount > 10)
    return "excessive_emoji";
  const urls = (text.match(/https?:\/\/\S+/g) || []).length;
  if (urls > 2)
    return "link_spam";
  return null;
}

// ../node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind");
var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(`Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`);
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

// ../node_modules/drizzle-orm/column.js
class Column {
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  static [entityKind] = "Column";
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = undefined;
  generated = undefined;
  generatedIdentity = undefined;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  shouldDisableInsert() {
    return this.config.generated !== undefined && this.config.generated.type !== "byDefault";
  }
}

// ../node_modules/drizzle-orm/column-builder.js
class ColumnBuilder {
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: undefined,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: undefined,
      uniqueType: undefined,
      dataType,
      columnType,
      generated: undefined
    };
  }
  $type() {
    return this;
  }
  notNull() {
    this.config.notNull = true;
    return this;
  }
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  $default = this.$defaultFn;
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  $onUpdate = this.$onUpdateFn;
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  setName(name) {
    if (this.config.name !== "")
      return;
    this.config.name = name;
  }
}

// ../node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");

// ../node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// ../node_modules/drizzle-orm/pg-core/columns/enum.js
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}

// ../node_modules/drizzle-orm/subquery.js
class Subquery {
  static [entityKind] = "Subquery";
  constructor(sql, fields, alias, isWith = false, usedTables = []) {
    this._ = {
      brand: "Subquery",
      sql,
      selectedFields: fields,
      alias,
      isWith,
      usedTables
    };
  }
}

// ../node_modules/drizzle-orm/version.js
var version2 = "0.45.2";

// ../node_modules/drizzle-orm/tracing.js
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version2);
    }
    return iife((otel2, rawTracer2) => rawTracer2.startActiveSpan(name, (span) => {
      try {
        return fn(span);
      } catch (e) {
        span.setStatus({
          code: otel2.SpanStatusCode.ERROR,
          message: e instanceof Error ? e.message : "Unknown error"
        });
        throw e;
      } finally {
        span.end();
      }
    }), otel, rawTracer);
  }
};

// ../node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

// ../node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");

class Table {
  static [entityKind] = "Table";
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    ExtraConfigColumns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  [TableName];
  [OriginalName];
  [Schema];
  [Columns];
  [ExtraConfigColumns];
  [BaseName];
  [IsAlias] = false;
  [IsDrizzleTable] = true;
  [ExtraConfigBuilder] = undefined;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
}

// ../node_modules/drizzle-orm/sql/sql.js
function isSQLWrapper(value) {
  return value !== null && value !== undefined && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}

class StringChunk {
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
}

class SQL {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
    for (const chunk of queryChunks) {
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        this.usedTables.push(schemaName === undefined ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]);
      }
    }
  }
  static [entityKind] = "SQL";
  decoder = noopDecoder;
  shouldInlineParams = false;
  usedTables = [];
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === undefined) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === undefined || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === undefined ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === undefined || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, SQL.Aliased) && chunk.fieldAlias !== undefined) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === undefined) {
      return this;
    }
    return new SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  if(condition) {
    return condition ? this : undefined;
  }
}

class Name {
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
var noopDecoder = {
  mapFromDriverValue: (value) => value
};
var noopEncoder = {
  mapToDriverValue: (value) => value
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};

class Param {
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== undefined) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {

  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));

class Placeholder {
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
}
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");

class View {
  static [entityKind] = "View";
  [ViewBaseConfig];
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
}
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// ../node_modules/drizzle-orm/utils.js
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
var textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder;

// ../node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
var eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
var ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter((c) => c !== undefined);
  if (conditions.length === 0) {
    return;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter((c) => c !== undefined);
  if (conditions.length === 0) {
    return;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
var gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
var lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}

// ../node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

// ../node_modules/drizzle-orm/sqlite-core/foreign-keys.js
class ForeignKeyBuilder {
  static [entityKind] = "SQLiteForeignKeyBuilder";
  reference;
  _onUpdate;
  _onDelete;
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action;
    return this;
  }
  build(table) {
    return new ForeignKey(table, this);
  }
}

class ForeignKey {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "SQLiteForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
}

// ../node_modules/drizzle-orm/sqlite-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}

// ../node_modules/drizzle-orm/sqlite-core/columns/common.js
class SQLiteColumnBuilder extends ColumnBuilder {
  static [entityKind] = "SQLiteColumnBuilder";
  foreignKeyConfigs = [];
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    return this;
  }
  generatedAlwaysAs(as, config) {
    this.config.generated = {
      as,
      type: "always",
      mode: config?.mode ?? "virtual"
    };
    return this;
  }
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return ((ref2, actions2) => {
        const builder = new ForeignKeyBuilder(() => {
          const foreignColumn = ref2();
          return { columns: [column], foreignColumns: [foreignColumn] };
        });
        if (actions2.onUpdate) {
          builder.onUpdate(actions2.onUpdate);
        }
        if (actions2.onDelete) {
          builder.onDelete(actions2.onDelete);
        }
        return builder.build(table);
      })(ref, actions);
    });
  }
}

class SQLiteColumn extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "SQLiteColumn";
}

// ../node_modules/drizzle-orm/sqlite-core/columns/blob.js
class SQLiteBigIntBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBigIntBuilder";
  constructor(name) {
    super(name, "bigint", "SQLiteBigInt");
  }
  build(table) {
    return new SQLiteBigInt(table, this.config);
  }
}

class SQLiteBigInt extends SQLiteColumn {
  static [entityKind] = "SQLiteBigInt";
  getSQLType() {
    return "blob";
  }
  mapFromDriverValue(value) {
    if (typeof Buffer !== "undefined" && Buffer.from) {
      const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
      return BigInt(buf.toString("utf8"));
    }
    return BigInt(textDecoder.decode(value));
  }
  mapToDriverValue(value) {
    return Buffer.from(value.toString());
  }
}

class SQLiteBlobJsonBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBlobJsonBuilder";
  constructor(name) {
    super(name, "json", "SQLiteBlobJson");
  }
  build(table) {
    return new SQLiteBlobJson(table, this.config);
  }
}

class SQLiteBlobJson extends SQLiteColumn {
  static [entityKind] = "SQLiteBlobJson";
  getSQLType() {
    return "blob";
  }
  mapFromDriverValue(value) {
    if (typeof Buffer !== "undefined" && Buffer.from) {
      const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
      return JSON.parse(buf.toString("utf8"));
    }
    return JSON.parse(textDecoder.decode(value));
  }
  mapToDriverValue(value) {
    return Buffer.from(JSON.stringify(value));
  }
}

class SQLiteBlobBufferBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBlobBufferBuilder";
  constructor(name) {
    super(name, "buffer", "SQLiteBlobBuffer");
  }
  build(table) {
    return new SQLiteBlobBuffer(table, this.config);
  }
}

class SQLiteBlobBuffer extends SQLiteColumn {
  static [entityKind] = "SQLiteBlobBuffer";
  mapFromDriverValue(value) {
    if (Buffer.isBuffer(value)) {
      return value;
    }
    return Buffer.from(value);
  }
  getSQLType() {
    return "blob";
  }
}
function blob(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "json") {
    return new SQLiteBlobJsonBuilder(name);
  }
  if (config?.mode === "bigint") {
    return new SQLiteBigIntBuilder(name);
  }
  return new SQLiteBlobBufferBuilder(name);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/custom.js
class SQLiteCustomColumnBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "SQLiteCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  build(table) {
    return new SQLiteCustomColumn(table, this.config);
  }
}

class SQLiteCustomColumn extends SQLiteColumn {
  static [entityKind] = "SQLiteCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
}
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config } = getColumnNameAndConfig(a, b);
    return new SQLiteCustomColumnBuilder(name, config, customTypeParams);
  };
}

// ../node_modules/drizzle-orm/sqlite-core/columns/integer.js
class SQLiteBaseIntegerBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBaseIntegerBuilder";
  constructor(name, dataType, columnType) {
    super(name, dataType, columnType);
    this.config.autoIncrement = false;
  }
  primaryKey(config) {
    if (config?.autoIncrement) {
      this.config.autoIncrement = true;
    }
    this.config.hasDefault = true;
    return super.primaryKey();
  }
}

class SQLiteBaseInteger extends SQLiteColumn {
  static [entityKind] = "SQLiteBaseInteger";
  autoIncrement = this.config.autoIncrement;
  getSQLType() {
    return "integer";
  }
}

class SQLiteIntegerBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteIntegerBuilder";
  constructor(name) {
    super(name, "number", "SQLiteInteger");
  }
  build(table) {
    return new SQLiteInteger(table, this.config);
  }
}

class SQLiteInteger extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteInteger";
}

class SQLiteTimestampBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteTimestampBuilder";
  constructor(name, mode) {
    super(name, "date", "SQLiteTimestamp");
    this.config.mode = mode;
  }
  defaultNow() {
    return this.default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
  }
  build(table) {
    return new SQLiteTimestamp(table, this.config);
  }
}

class SQLiteTimestamp extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteTimestamp";
  mode = this.config.mode;
  mapFromDriverValue(value) {
    if (this.config.mode === "timestamp") {
      return new Date(value * 1000);
    }
    return new Date(value);
  }
  mapToDriverValue(value) {
    const unix = value.getTime();
    if (this.config.mode === "timestamp") {
      return Math.floor(unix / 1000);
    }
    return unix;
  }
}

class SQLiteBooleanBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteBooleanBuilder";
  constructor(name, mode) {
    super(name, "boolean", "SQLiteBoolean");
    this.config.mode = mode;
  }
  build(table) {
    return new SQLiteBoolean(table, this.config);
  }
}

class SQLiteBoolean extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteBoolean";
  mode = this.config.mode;
  mapFromDriverValue(value) {
    return Number(value) === 1;
  }
  mapToDriverValue(value) {
    return value ? 1 : 0;
  }
}
function integer2(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "timestamp" || config?.mode === "timestamp_ms") {
    return new SQLiteTimestampBuilder(name, config.mode);
  }
  if (config?.mode === "boolean") {
    return new SQLiteBooleanBuilder(name, config.mode);
  }
  return new SQLiteIntegerBuilder(name);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/numeric.js
class SQLiteNumericBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteNumericBuilder";
  constructor(name) {
    super(name, "string", "SQLiteNumeric");
  }
  build(table) {
    return new SQLiteNumeric(table, this.config);
  }
}

class SQLiteNumeric extends SQLiteColumn {
  static [entityKind] = "SQLiteNumeric";
  mapFromDriverValue(value) {
    if (typeof value === "string")
      return value;
    return String(value);
  }
  getSQLType() {
    return "numeric";
  }
}

class SQLiteNumericNumberBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteNumericNumberBuilder";
  constructor(name) {
    super(name, "number", "SQLiteNumericNumber");
  }
  build(table) {
    return new SQLiteNumericNumber(table, this.config);
  }
}

class SQLiteNumericNumber extends SQLiteColumn {
  static [entityKind] = "SQLiteNumericNumber";
  mapFromDriverValue(value) {
    if (typeof value === "number")
      return value;
    return Number(value);
  }
  mapToDriverValue = String;
  getSQLType() {
    return "numeric";
  }
}

class SQLiteNumericBigIntBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteNumericBigIntBuilder";
  constructor(name) {
    super(name, "bigint", "SQLiteNumericBigInt");
  }
  build(table) {
    return new SQLiteNumericBigInt(table, this.config);
  }
}

class SQLiteNumericBigInt extends SQLiteColumn {
  static [entityKind] = "SQLiteNumericBigInt";
  mapFromDriverValue = BigInt;
  mapToDriverValue = String;
  getSQLType() {
    return "numeric";
  }
}
function numeric(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  const mode = config?.mode;
  return mode === "number" ? new SQLiteNumericNumberBuilder(name) : mode === "bigint" ? new SQLiteNumericBigIntBuilder(name) : new SQLiteNumericBuilder(name);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/real.js
class SQLiteRealBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteRealBuilder";
  constructor(name) {
    super(name, "number", "SQLiteReal");
  }
  build(table) {
    return new SQLiteReal(table, this.config);
  }
}

class SQLiteReal extends SQLiteColumn {
  static [entityKind] = "SQLiteReal";
  getSQLType() {
    return "real";
  }
}
function real(name) {
  return new SQLiteRealBuilder(name ?? "");
}

// ../node_modules/drizzle-orm/sqlite-core/columns/text.js
class SQLiteTextBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteTextBuilder";
  constructor(name, config) {
    super(name, "string", "SQLiteText");
    this.config.enumValues = config.enum;
    this.config.length = config.length;
  }
  build(table) {
    return new SQLiteText(table, this.config);
  }
}

class SQLiteText extends SQLiteColumn {
  static [entityKind] = "SQLiteText";
  enumValues = this.config.enumValues;
  length = this.config.length;
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return `text${this.config.length ? `(${this.config.length})` : ""}`;
  }
}

class SQLiteTextJsonBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteTextJsonBuilder";
  constructor(name) {
    super(name, "json", "SQLiteTextJson");
  }
  build(table) {
    return new SQLiteTextJson(table, this.config);
  }
}

class SQLiteTextJson extends SQLiteColumn {
  static [entityKind] = "SQLiteTextJson";
  getSQLType() {
    return "text";
  }
  mapFromDriverValue(value) {
    return JSON.parse(value);
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
}
function text(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "json") {
    return new SQLiteTextJsonBuilder(name);
  }
  return new SQLiteTextBuilder(name, config);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/all.js
function getSQLiteColumnBuilders() {
  return {
    blob,
    customType,
    integer: integer2,
    numeric,
    real,
    text
  };
}

// ../node_modules/drizzle-orm/sqlite-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:SQLiteInlineForeignKeys");

class SQLiteTable extends Table {
  static [entityKind] = "SQLiteTable";
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys
  });
  [Table.Symbol.Columns];
  [InlineForeignKeys] = [];
  [Table.Symbol.ExtraConfigBuilder] = undefined;
}
function sqliteTableBase(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new SQLiteTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getSQLiteColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
    const colBuilder = colBuilderBase;
    colBuilder.setName(name2);
    const column = colBuilder.build(rawTable);
    rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
    return [name2, column];
  }));
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumns;
  if (extraConfig) {
    table[SQLiteTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return table;
}
var sqliteTable = (name, columns, extraConfig) => {
  return sqliteTableBase(name, columns, extraConfig);
};

// ../node_modules/drizzle-orm/sqlite-core/indexes.js
class IndexBuilderOn {
  constructor(name, unique) {
    this.name = name;
    this.unique = unique;
  }
  static [entityKind] = "SQLiteIndexBuilderOn";
  on(...columns) {
    return new IndexBuilder(this.name, columns, this.unique);
  }
}

class IndexBuilder {
  static [entityKind] = "SQLiteIndexBuilder";
  config;
  constructor(name, columns, unique) {
    this.config = {
      name,
      columns,
      unique,
      where: undefined
    };
  }
  where(condition) {
    this.config.where = condition;
    return this;
  }
  build(table) {
    return new Index(this.config, table);
  }
}

class Index {
  static [entityKind] = "SQLiteIndex";
  config;
  constructor(config, table) {
    this.config = { ...config, table };
  }
}
function index(name) {
  return new IndexBuilderOn(name, false);
}
function uniqueIndex(name) {
  return new IndexBuilderOn(name, true);
}

// ../node_modules/drizzle-orm/sqlite-core/primary-keys.js
function primaryKey(...config) {
  if (config[0].columns) {
    return new PrimaryKeyBuilder(config[0].columns, config[0].name);
  }
  return new PrimaryKeyBuilder(config);
}

class PrimaryKeyBuilder {
  static [entityKind] = "SQLitePrimaryKeyBuilder";
  columns;
  name;
  constructor(columns, name) {
    this.columns = columns;
    this.name = name;
  }
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
}

class PrimaryKey {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  static [entityKind] = "SQLitePrimaryKey";
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[SQLiteTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
}

// src/schema.ts
var profiles = sqliteTable("profiles", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  displayName: text("display_name").notNull(),
  handle: text("handle").notNull(),
  email: text("email"),
  passwordHash: text("password_hash"),
  recoveryCodeHash: text("recovery_code_hash"),
  bio: text("bio"),
  avatarBlobKey: text("avatar_blob_key"),
  isFounder: integer2("is_founder", { mode: "boolean" }).notNull().default(false),
  badge: text("badge", { enum: ["none", "community", "official"] }).notNull().default("none"),
  badgeGrantedAt: integer2("badge_granted_at", { mode: "timestamp_ms" }),
  isPrivate: integer2("is_private", { mode: "boolean" }).notNull().default(false),
  themeColor: text("theme_color", { enum: ["teal", "coral", "amber", "lime", "emerald", "sky", "blue", "indigo", "violet", "pink", "rose", "slate"] }).notNull().default("teal"),
  themeChangedAt: integer2("theme_changed_at", { mode: "timestamp_ms" }),
  language: text("language", { enum: ["en", "bn", "hi", "es", "fr", "ar"] }).notNull().default("en"),
  continent: text("region", { enum: ["AF", "AN", "AS", "EU", "NA", "SA", "OC"] }).notNull().default("AS"),
  deactivatedUntil: integer2("deactivated_until", { mode: "timestamp_ms" }),
  lastDeactivatedAt: integer2("last_deactivated_at", { mode: "timestamp_ms" }),
  profileUpdatedAt: integer2("profile_updated_at", { mode: "timestamp_ms" }),
  approvalStatus: text("approval_status", { enum: ["pending", "approved", "declined"] }).notNull().default("approved"),
  violationCount: integer2("violation_count").notNull().default(0),
  fakeReportCount: integer2("fake_report_count").notNull().default(0),
  reportingSuspended: integer2("reporting_suspended", { mode: "boolean" }).notNull().default(false),
  postRestrictedUntil: integer2("post_restricted_until", { mode: "timestamp_ms" }),
  mentionPrivacy: text("mention_privacy", { enum: ["everyone", "peopleIFollow", "off"] }).notNull().default("everyone"),
  discordUserId: text("discord_user_id"),
  googleSub: text("google_sub"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [
  uniqueIndex("profiles_handle_unique").on(table.handle),
  uniqueIndex("profiles_email_unique").on(table.email),
  uniqueIndex("profiles_discord_user_id_unique").on(table.discordUserId),
  uniqueIndex("profiles_google_sub_unique").on(table.googleSub)
]);
var sessions = sqliteTable("sessions", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  profileId: integer2("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer2("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [uniqueIndex("sessions_token_hash_unique").on(table.tokenHash)]);
var posts = sqliteTable("posts", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  authorId: integer2("author_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  slug: text("slug"),
  editedAt: integer2("edited_at", { mode: "timestamp_ms" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var postImages = sqliteTable("post_images", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  postId: integer2("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  blobKey: text("blob_key").notNull(),
  altText: text("alt_text").notNull().default("Photo shared with this post"),
  position: integer2("position").notNull()
});
var comments = sqliteTable("comments", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  postId: integer2("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorId: integer2("author_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  parentCommentId: integer2("parent_comment_id"),
  text: text("text").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var likes = sqliteTable("likes", {
  profileId: integer2("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  postId: integer2("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.profileId, table.postId] })]);
var reposts = sqliteTable("reposts", {
  profileId: integer2("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  postId: integer2("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.profileId, table.postId] })]);
var follows = sqliteTable("follows", {
  followerId: integer2("follower_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  followingId: integer2("following_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.followerId, table.followingId] })]);
var notifications = sqliteTable("notifications", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  recipientId: integer2("recipient_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  actorId: integer2("actor_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["like", "comment", "follow", "repost", "story_reaction", "mention", "reply", "message", "approval"] }).notNull(),
  postId: integer2("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: integer2("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  storyId: integer2("story_id"),
  conversationId: integer2("conversation_id"),
  readAt: integer2("read_at", { mode: "timestamp_ms" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var stories = sqliteTable("stories", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  authorId: integer2("author_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  text: text("text"),
  blobKey: text("blob_key"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date),
  expiresAt: integer2("expires_at", { mode: "timestamp_ms" }).notNull(),
  visibility: text("visibility").notNull().default("everyone"),
  bgColor: text("bg_color")
});
var storyViews = sqliteTable("story_views", {
  storyId: integer2("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  viewerId: integer2("viewer_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  viewedAt: integer2("viewed_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.storyId, table.viewerId] })]);
var storyReactions = sqliteTable("story_reactions", {
  storyId: integer2("story_id").notNull().references(() => stories.id, { onDelete: "cascade" }),
  reactorId: integer2("reactor_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  emoji: text("emoji", { enum: ["\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE0D", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDC4F"] }).notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.storyId, table.reactorId] })]);
var bookmarks = sqliteTable("bookmarks", {
  profileId: integer2("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  postId: integer2("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.profileId, table.postId] })]);
var collections = sqliteTable("collections", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  profileId: integer2("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var collectionPosts = sqliteTable("collection_posts", {
  collectionId: integer2("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  postId: integer2("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.collectionId, table.postId] })]);
var conversations = sqliteTable("conversations", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userLowId: integer2("user_low_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  userHighId: integer2("user_high_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [uniqueIndex("conversations_pair_unique").on(table.userLowId, table.userHighId)]);
var messages = sqliteTable("messages", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  conversationId: integer2("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: integer2("sender_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  readAt: integer2("read_at", { mode: "timestamp_ms" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var blocks = sqliteTable("blocks", {
  blockerId: integer2("blocker_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  blockedId: integer2("blocked_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [primaryKey({ columns: [table.blockerId, table.blockedId] })]);
var pushTokens = sqliteTable("push_tokens", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  profileId: integer2("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  pushToken: text("push_token").notNull(),
  platform: text("platform", { enum: ["android", "ios", "web"] }).notNull().default("android"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [uniqueIndex("push_tokens_token_unique").on(table.pushToken)]);
var googleIntegrations = sqliteTable("google_integrations", {
  id: integer2("id").primaryKey(),
  sheetsEnabled: integer2("sheets_enabled", { mode: "boolean" }).notNull().default(false),
  spreadsheetId: text("spreadsheet_id"),
  spreadsheetUrl: text("spreadsheet_url"),
  driveFileUrl: text("drive_file_url"),
  connectedAt: integer2("connected_at", { mode: "timestamp_ms" }),
  lastSyncAt: integer2("last_sync_at", { mode: "timestamp_ms" }),
  lastError: text("last_error"),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var googleSyncQueue = sqliteTable("google_sync_queue", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  tab: text("tab", { enum: ["users", "posts", "comments", "logins", "follows", "likes"] }).notNull(),
  recordKey: text("record_key").notNull(),
  operation: text("operation", { enum: ["upsert", "delete", "login", "signup"] }).notNull(),
  payload: text("payload").notNull(),
  status: text("status", { enum: ["pending", "synced", "failed"] }).notNull().default("pending"),
  error: text("error"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date),
  syncedAt: integer2("synced_at", { mode: "timestamp_ms" })
}, (table) => [index("google_sync_queue_status_idx").on(table.status)]);
var reports = sqliteTable("reports", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  reporterId: integer2("reporter_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  targetType: text("target_type", { enum: ["post", "account", "comment"] }).notNull(),
  targetId: integer2("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status", { enum: ["pending", "genuine", "fake", "dismissed"] }).notNull().default("pending"),
  reviewedAt: integer2("reviewed_at", { mode: "timestamp_ms" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
}, (table) => [
  index("reports_status_idx").on(table.status),
  index("reports_reporter_idx").on(table.reporterId)
]);

// src/privileged.ts
import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
var privileged = definePrivilegedContracts({
  googleConnectionStatus: {
    request: object({ service: _enum(["drive", "sheets"]) }),
    response: object({ connected: boolean2(), message: string2() }),
    capabilities: ["google.workspace.status"],
    timeoutMs: 8000
  },
  initializeGoogleSheets: {
    request: object({
      title: string2(),
      tabs: array(object({ tab: _enum(["users", "posts", "comments", "logins", "follows", "likes"]), rows: array(array(union([string2(), number2(), boolean2(), _null3()]))) }))
    }),
    response: object({ ok: boolean2(), spreadsheetId: string2().nullable(), spreadsheetUrl: string2().nullable(), error: string2().nullable() }),
    capabilities: ["google.sheets.write"],
    timeoutMs: 45000
  },
  appendGoogleSheetRow: {
    request: object({ spreadsheetId: string2(), tab: _enum(["users", "posts", "comments", "logins", "follows", "likes"]), values: array(union([string2(), number2(), boolean2(), _null3()])) }),
    response: object({ ok: boolean2(), error: string2().nullable() }),
    capabilities: ["google.sheets.write"],
    timeoutMs: 1e4
  },
  uploadSourceToDrive: {
    request: object({ filename: string2(), dataBase64: string2().min(1) }),
    response: object({ ok: boolean2(), fileUrl: string2().nullable(), error: string2().nullable() }),
    capabilities: ["google.drive.write", "filesystem.write"],
    timeoutMs: 45000
  }
});
async function runCli(args) {
  try {
    const process2 = Bun.spawn(["hatch_gws_cli", ...args], { stdout: "pipe", stderr: "pipe" });
    const [stdout, stderr, exitCode] = await Promise.all([new Response(process2.stdout).text(), new Response(process2.stderr).text(), process2.exited]);
    const text = stdout.trim();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (exitCode !== 0)
      return { ok: false, data, error: stderr.trim() || "Google Workspace could not complete the request." };
    return { ok: true, data, error: null };
  } catch {
    return { ok: false, data: null, error: "Google Workspace is unavailable right now." };
  }
}
function readString(value) {
  return typeof value === "string" && value ? value : null;
}
var privilegedHandlers = definePrivilegedHandlers(privileged, {
  async googleConnectionStatus({ service }) {
    const result = await runCli([service, "status"]);
    const connected = result.ok && result.data?.status === "connected";
    return { connected, message: connected ? `${service === "drive" ? "Google Drive" : "Google Sheets"} is connected.` : `${service === "drive" ? "Google Drive" : "Google Sheets"} needs to be connected in Muse first.` };
  },
  async initializeGoogleSheets({ title, tabs }) {
    const status = await runCli(["sheets", "status"]);
    if (!status.ok || status.data?.status !== "connected")
      return { ok: false, spreadsheetId: null, spreadsheetUrl: null, error: "Connect Google Sheets to Muse, then try again." };
    const createBody = { properties: { title }, sheets: tabs.map(({ tab }) => ({ properties: { title: tab } })) };
    const created = await runCli(["sheets", "spreadsheets", "create", "--json", JSON.stringify(createBody)]);
    const spreadsheetId = readString(created.data?.spreadsheetId);
    const spreadsheetUrl = readString(created.data?.spreadsheetUrl);
    if (!created.ok || !spreadsheetId)
      return { ok: false, spreadsheetId: null, spreadsheetUrl: null, error: created.error ?? "The Gola Database spreadsheet could not be created." };
    for (const { tab, rows } of tabs) {
      const endColumn = String.fromCharCode(64 + Math.max(1, rows[0]?.length ?? 1));
      const updated = await runCli(["sheets", "spreadsheets", "values", "update", "--params", JSON.stringify({ spreadsheetId, range: `${tab}!A1:${endColumn}${Math.max(1, rows.length)}`, valueInputOption: "USER_ENTERED" }), "--json", JSON.stringify({ majorDimension: "ROWS", values: rows })]);
      if (!updated.ok)
        return { ok: false, spreadsheetId, spreadsheetUrl, error: updated.error ?? `The ${tab} tab could not be prepared.` };
    }
    const verified = await runCli(["sheets", "spreadsheets", "get", "--params", JSON.stringify({ spreadsheetId, fields: "spreadsheetId,spreadsheetUrl,sheets.properties.title" })]);
    if (!verified.ok)
      return { ok: false, spreadsheetId, spreadsheetUrl, error: "The spreadsheet was created, but Gola could not verify it." };
    return { ok: true, spreadsheetId, spreadsheetUrl: readString(verified.data?.spreadsheetUrl) ?? spreadsheetUrl, error: null };
  },
  async appendGoogleSheetRow({ spreadsheetId, tab, values }) {
    const status = await runCli(["sheets", "status"]);
    if (!status.ok || status.data?.status !== "connected")
      return { ok: false, error: "Google Sheets is not connected." };
    const result = await runCli(["sheets", "spreadsheets", "values", "append", "--params", JSON.stringify({ spreadsheetId, range: `${tab}!A:Z`, valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS" }), "--json", JSON.stringify({ majorDimension: "ROWS", values: [values] })]);
    return result.ok ? { ok: true, error: null } : { ok: false, error: result.error ?? "Google Sheets did not accept the update." };
  },
  async uploadSourceToDrive({ filename, dataBase64 }) {
    const status = await runCli(["drive", "status"]);
    if (!status.ok || status.data?.status !== "connected")
      return { ok: false, fileUrl: null, error: "Connect Google Drive to Muse, then try again." };
    const exportDir = "/home/hatch/workspace/gola-exports";
    await mkdir(exportDir, { recursive: true });
    const path = join(exportDir, `${crypto.randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/gu, "-")}`);
    try {
      await writeFile(path, Buffer.from(dataBase64, "base64"));
      const uploaded = await runCli(["drive", "+upload", path, "--name", filename]);
      const fileId = readString(uploaded.data?.id);
      if (!uploaded.ok || !fileId)
        return { ok: false, fileUrl: null, error: uploaded.error ?? "Google Drive could not save the ZIP." };
      const details = await runCli(["drive", "files", "get", "--params", JSON.stringify({ fileId, fields: "id,name,webViewLink" })]);
      return details.ok ? { ok: true, fileUrl: readString(details.data?.webViewLink), error: null } : { ok: true, fileUrl: null, error: null };
    } finally {
      await rm(path, { force: true });
    }
  }
});
// src/actions.ts
var fcmTokenCache = null;
function getFcmServiceAccount() {
  try {
    const raw = typeof process !== "undefined" ? process.env.FCM_SERVICE_ACCOUNT : null;
    if (!raw) {
      console.log("[gola][push] FCM_SERVICE_ACCOUNT not set \u2014 pushes disabled");
      return null;
    }
    const sa = JSON.parse(raw);
    if (!sa.project_id || !sa.client_email || !sa.private_key) {
      console.log("[gola][push] FCM_SERVICE_ACCOUNT is missing required fields");
      return null;
    }
    return sa;
  } catch (e) {
    console.log("[gola][push] Failed to parse FCM_SERVICE_ACCOUNT:", e instanceof Error ? e.message : e);
    return null;
  }
}
function b64url(data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let bin = "";
  for (const b of bytes)
    bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function getFcmAccessToken(sa) {
  if (fcmTokenCache && Date.now() < fcmTokenCache.expiresAt - 60000) {
    return fcmTokenCache.token;
  }
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: sa.private_key_id ?? "" }));
    const payload = b64url(JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    }));
    const pem = sa.private_key.replace(/\\n/g, `
`);
    const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
    const keyBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("pkcs8", keyBytes, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${payload}`));
    const jwt = `${header}.${payload}.${b64url(new Uint8Array(sig))}`;
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    if (!res.ok)
      return null;
    const json = await res.json();
    if (!json.access_token)
      return null;
    fcmTokenCache = { token: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
    return json.access_token;
  } catch {
    return null;
  }
}
async function sendPushNotification(ctx, recipientId, title, body, data) {
  try {
    const sa = getFcmServiceAccount();
    if (!sa)
      return;
    const db = ctx.db();
    const tokens = await db.select({ pushToken: pushTokens.pushToken }).from(pushTokens).where(eq(pushTokens.profileId, recipientId)).limit(10);
    if (!tokens.length)
      return;
    const accessToken = await getFcmAccessToken(sa);
    if (!accessToken)
      return;
    const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
    await Promise.all(tokens.map(async ({ pushToken }) => {
      try {
        await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: {
              token: pushToken,
              notification: { title, body },
              android: {
                notification: {
                  channel_id: "gola_alerts",
                  sound: "gola_chime",
                  icon: "ic_notification"
                }
              },
              data: { ...data, channel_id: "gola_alerts" }
            }
          })
        });
      } catch {}
    }));
  } catch {}
}
async function pushName(ctx, profileId) {
  try {
    const db = ctx.db();
    const [p] = await db.select({ displayName: profiles.displayName }).from(profiles).where(eq(profiles.id, profileId)).limit(1);
    return p?.displayName || "Someone";
  } catch {
    return "Someone";
  }
}
var colorChoiceSchema = _enum(["teal", "coral", "amber", "lime", "emerald", "sky", "blue", "indigo", "violet", "pink", "rose", "slate"]);
var LATEST_APP_VERSION = "2.0.0";
var LATEST_APP_URL = "https://gola-site.pages.dev/gola.apk";
var LATEST_APP_NOTES = "";
var profileSchema = object({
  id: number2(),
  displayName: string2(),
  handle: string2(),
  bio: string2().nullable(),
  isFounder: boolean2(),
  badge: _enum(["none", "community", "official"]),
  badgeGrantedAt: string2().nullable(),
  isPrivate: boolean2(),
  mentionPrivacy: _enum(["everyone", "peopleIFollow", "off"]),
  createdAt: string2(),
  avatarUrl: string2().nullable(),
  themeColor: colorChoiceSchema,
  safetyStatus: _enum(["safe", "caution", "restricted"]).optional()
});
var languageSchema = _enum(["en", "bn", "hi", "es", "fr", "ar"]);
var continentSchema = _enum(["AF", "AN", "AS", "EU", "NA", "SA", "OC"]);
var accountProfileSchema = profileSchema.extend({ approvalStatus: _enum(["pending", "approved", "declined"]), profileUpdatedAt: string2().nullable(), themeColor: colorChoiceSchema, themeChangedAt: string2().nullable(), language: languageSchema, continent: continentSchema, lastDeactivatedAt: string2().nullable() });
var commentSchema = object({ id: number2(), parentCommentId: number2().nullable(), text: string2(), createdAt: string2(), author: profileSchema });
var postSchema = object({
  id: number2(),
  text: string2(),
  slug: string2().nullable(),
  createdAt: string2(),
  editedAt: string2().nullable(),
  author: profileSchema,
  images: array(object({ id: number2(), url: string2(), altText: string2() })),
  likeCount: number2(),
  commentCount: number2(),
  repostCount: number2(),
  viewerLiked: boolean2(),
  viewerReposted: boolean2(),
  viewerBookmarked: boolean2(),
  comments: array(commentSchema)
});
var storyReactionSchema = _enum(["\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE0D", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDC4F"]);
var storySchema = object({ id: number2(), text: string2().nullable(), imageUrl: string2().nullable(), createdAt: string2(), expiresAt: string2(), author: profileSchema, viewerReaction: storyReactionSchema.nullable(), visibility: string2(), bgColor: string2().nullable() });
var writeResponse = object({ status: _enum(["ok", "blocked", "error"]), message: string2().nullable(), id: number2().nullable(), slug: string2().nullable().optional() });
var authResponse = object({ status: _enum(["ok", "error"]), message: string2().nullable(), token: string2().nullable(), profile: accountProfileSchema.nullable() });
var recoveryResponse = object({ status: _enum(["ok", "error"]), message: string2(), recoveryCode: string2().nullable() });
var profileUpdateResponse = object({ status: _enum(["ok", "error"]), message: string2().nullable(), profile: accountProfileSchema.nullable(), nextEditableAt: string2().nullable() });
var colorThemeResponse = object({ status: _enum(["ok", "error"]), message: string2(), profile: accountProfileSchema.nullable(), nextChangeAt: string2().nullable() });
var preferenceResponse = object({ status: _enum(["ok", "error"]), message: string2(), profile: accountProfileSchema.nullable() });
var toggleResponse = object({ active: boolean2(), count: number2() });
var connectionProfileSchema = profileSchema.extend({ viewerFollowing: boolean2(), followerCount: number2() });
var moderationSchema = object({ allowed: boolean2(), feedback: string2() });
var visibleNotificationTypeSchema = _enum(["like", "comment", "follow", "repost", "story_reaction", "mention", "reply", "approval"]);
function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0;i < binary.length; i += 1)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function bytesToBase64(bytes) {
  let value = "";
  for (const byte of bytes)
    value += String.fromCharCode(byte);
  return btoa(value);
}
function wordCount(value) {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}
async function sha256(value) {
  return bytesToBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
function normalizeRecoveryCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/gu, "");
}
function createRecoveryCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const value = Array.from(bytes, (byte) => alphabet[byte % alphabet.length] ?? "2").join("");
  return `GOLA-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 120000 }, key, 256);
  return `120000.${bytesToBase64(salt)}.${bytesToBase64(new Uint8Array(bits))}`;
}
async function verifyPassword(password, stored) {
  const [iterationsText, saltText, expected] = stored.split(".");
  const iterations = Number(iterationsText);
  if (!iterations || !saltText || !expected)
    return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = bytesToBase64(new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: decodeBase64(saltText), iterations }, key, 256)));
  if (bits.length !== expected.length)
    return false;
  let difference = 0;
  for (let i = 0;i < bits.length; i += 1)
    difference |= bits.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}
async function createSession(ctx, profileId) {
  const raw = bytesToBase64(crypto.getRandomValues(new Uint8Array(32))).replace(/[+/=]/gu, "");
  await ctx.db().insert(sessions).values({ profileId, tokenHash: await sha256(raw), expiresAt: new Date(Date.now() + 30 * 86400000) });
  return raw;
}
function isActiveProfile(row) {
  return !row.deactivatedUntil || row.deactivatedUntil.getTime() <= Date.now();
}
function isApprovedProfile(row) {
  return row.approvalStatus === "approved";
}
async function approvedProfile(ctx, token) {
  const profile = await authenticatedProfile(ctx, token);
  return profile && isApprovedProfile(profile) ? profile : null;
}
async function mentionAllowed(ctx, actorId, person) {
  if (person.mentionPrivacy === "off")
    return false;
  if (person.mentionPrivacy === "peopleIFollow") {
    const [link] = await ctx.db().select({ followerId: follows.followerId }).from(follows).where(and(eq(follows.followerId, person.id), eq(follows.followingId, actorId))).limit(1);
    if (!link)
      return false;
  }
  return true;
}
async function profileForSession(ctx, token) {
  if (!token)
    return null;
  const rows = await ctx.db().select({ session: sessions, profile: profiles }).from(sessions).innerJoin(profiles, eq(sessions.profileId, profiles.id)).where(eq(sessions.tokenHash, await sha256(token))).limit(1);
  const row = rows[0];
  return row && row.session.expiresAt.getTime() > Date.now() ? row.profile : null;
}
async function authenticatedProfile(ctx, token) {
  const profile = await profileForSession(ctx, token);
  return profile && isActiveProfile(profile) ? profile : null;
}
async function publicProfile(ctx, row, viewerId) {
  const hidden = row.isPrivate && row.id !== viewerId;
  const safetyStatus = await getSafetyStatus(ctx, row.id);
  return { id: row.id, displayName: row.displayName, handle: row.handle, bio: hidden ? null : row.bio, isFounder: row.isFounder, badge: row.badge, badgeGrantedAt: row.badgeGrantedAt?.toISOString() ?? null, isPrivate: row.isPrivate, mentionPrivacy: row.mentionPrivacy, createdAt: row.createdAt.toISOString(), avatarUrl: !hidden && row.avatarBlobKey ? await ctx.blobs.getUrl(row.avatarBlobKey) : null, themeColor: row.themeColor, safetyStatus };
}
async function getSafetyStatus(ctx, profileId) {
  const db = ctx.db();
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
  if (!profile)
    return "safe";
  if (profile.postRestrictedUntil && new Date(profile.postRestrictedUntil).getTime() > Date.now())
    return "restricted";
  if ((profile.violationCount || 0) >= 2)
    return "restricted";
  if ((profile.violationCount || 0) >= 1)
    return "caution";
  const accountReports = await db.select({ id: reports.id }).from(reports).where(and(eq(reports.targetType, "account"), eq(reports.targetId, profileId), eq(reports.status, "pending"))).limit(1);
  if (accountReports.length > 0)
    return "caution";
  const userPosts = await db.select({ id: posts.id }).from(posts).where(eq(posts.authorId, profileId));
  const postIds = userPosts.map((p) => p.id);
  if (postIds.length > 0) {
    const postReports = await db.select({ id: reports.id }).from(reports).where(and(eq(reports.targetType, "post"), inArray(reports.targetId, postIds), eq(reports.status, "pending"))).limit(1);
    if (postReports.length > 0)
      return "caution";
  }
  return "safe";
}
async function accountProfile(ctx, row) {
  return { ...await publicProfile(ctx, row, row.id), approvalStatus: row.approvalStatus, profileUpdatedAt: row.profileUpdatedAt?.toISOString() ?? null, themeColor: row.themeColor, themeChangedAt: row.themeChangedAt?.toISOString() ?? null, language: row.language, continent: row.continent, lastDeactivatedAt: row.lastDeactivatedAt?.toISOString() ?? null };
}
async function canAccessPost(ctx, viewerId, postId) {
  const [row] = await ctx.db().select({ authorId: posts.authorId, isPrivate: profiles.isPrivate, deactivatedUntil: profiles.deactivatedUntil }).from(posts).innerJoin(profiles, eq(posts.authorId, profiles.id)).where(eq(posts.id, postId)).limit(1);
  return Boolean(row && (!row.deactivatedUntil || row.deactivatedUntil.getTime() <= Date.now()) && (row.authorId === viewerId || !row.isPrivate && !await blockedPair(ctx, viewerId, row.authorId)));
}
async function moderateText(ctx, text) {
  const banned = findBannedWordAny(text);
  if (banned) {
    return { allowed: false, feedback: "Please remove the inappropriate language and try again." };
  }
  const spam = detectSpam(text);
  if (spam) {
    const messages = {
      excessive_caps: "Please don't use excessive capital letters.",
      repeated_chars: "Please don't use excessive repeated characters.",
      excessive_emoji: "Please use fewer emoji.",
      link_spam: "Please don't post multiple links."
    };
    return { allowed: false, feedback: messages[spam] || "This looks like spam. Please revise." };
  }
  return ctx.inference.complete(`Review this social post for a kindness-first community. Block attacks, criticism aimed at a person, insults, stereotypes, dehumanization, threats, racism, discrimination, dog whistles, and praise of harm. Allow supportive speech, neutral information, first-person feelings, constructive self-reflection, and discussion condemning racism. If blocked, give one calm sentence helping the writer rephrase around their own experience or a positive request. If allowed, feedback is empty. Text: ${JSON.stringify(text)}`, { schema: moderationSchema, timeout_secs: 30 });
}
async function blockedPair(ctx, a, b) {
  const rows = await ctx.db().select().from(blocks).where(and(inArray(blocks.blockerId, [a, b]), inArray(blocks.blockedId, [a, b])));
  return rows.some((row) => row.blockerId === a && row.blockedId === b || row.blockerId === b && row.blockedId === a);
}
async function blockedIdsFor(ctx, viewerId) {
  const rows = await ctx.db().select().from(blocks).where(eq(blocks.blockerId, viewerId));
  return new Set(rows.map((row) => row.blockedId));
}
function mentionedHandles(text) {
  return [...new Set(Array.from(text.matchAll(/@([a-z0-9_]{3,24})/giu), (match) => (match[1] ?? "").toLowerCase()).filter(Boolean))];
}
async function triageReport(ctx, reportId) {
  const db = ctx.db();
  const [report] = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  if (!report || report.status !== "pending")
    return;
  let contentText = "";
  let targetAuthorId = 0;
  if (report.targetType === "post") {
    const [post] = await db.select().from(posts).where(eq(posts.id, report.targetId)).limit(1);
    if (post) {
      contentText = post.text || "";
      targetAuthorId = post.authorId;
    }
  } else if (report.targetType === "comment") {
    const [comment] = await db.select().from(comments).where(eq(comments.id, report.targetId)).limit(1);
    if (comment) {
      contentText = comment.text || "";
      targetAuthorId = comment.authorId;
    }
  } else if (report.targetType === "account") {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, report.targetId)).limit(1);
    if (profile) {
      contentText = (profile.displayName || "") + " " + (profile.bio || "");
      targetAuthorId = profile.id;
    }
  }
  if (!contentText.trim()) {
    await db.update(reports).set({ status: "dismissed", reviewedAt: new Date }).where(eq(reports.id, reportId));
    return;
  }
  const review = await moderateText(ctx, contentText);
  if (!review.allowed) {
    await db.update(reports).set({ status: "genuine", reviewedAt: new Date }).where(eq(reports.id, reportId));
    if (targetAuthorId) {
      const [violator] = await db.select().from(profiles).where(eq(profiles.id, targetAuthorId)).limit(1);
      if (violator) {
        const newCount = (violator.violationCount || 0) + 1;
        let postRestrictedUntil = null;
        if (newCount === 2) {
          postRestrictedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        await db.update(profiles).set({
          violationCount: newCount,
          postRestrictedUntil
        }).where(eq(profiles.id, targetAuthorId));
        await db.insert(notifications).values({
          recipientId: targetAuthorId,
          actorId: report.reporterId,
          type: "approval",
          postId: null
        });
      }
    }
  } else {
    const [reporter] = await db.select().from(profiles).where(eq(profiles.id, report.reporterId)).limit(1);
    if (reporter) {
      const fakeCount = reporter.fakeReportCount || 0;
      if (fakeCount >= 2) {
        await db.update(reports).set({ status: "fake", reviewedAt: new Date }).where(eq(reports.id, reportId));
        const newFakeCount = fakeCount + 1;
        await db.update(profiles).set({
          fakeReportCount: newFakeCount,
          reportingSuspended: newFakeCount >= 3
        }).where(eq(profiles.id, report.reporterId));
      }
    }
  }
}
async function notifyMentions(ctx, actorId, text, postId, commentId) {
  const handles = mentionedHandles(text);
  if (!handles.length)
    return;
  const db = ctx.db();
  const people = await db.select().from(profiles).where(inArray(profiles.handle, handles));
  for (const person of people) {
    if (person.id === actorId || !isActiveProfile(person) || await blockedPair(ctx, actorId, person.id) || !await mentionAllowed(ctx, actorId, person))
      continue;
    await db.insert(notifications).values({ recipientId: person.id, actorId, type: "mention", postId, commentId });
    const n = await pushName(ctx, actorId);
    sendPushNotification(ctx, person.id, `${n} mentioned you`, text.slice(0, 100), { type: "mention", postId: String(postId) });
  }
}
var sheetValuesSchema = array(union([string2(), number2(), boolean2(), _null3()]));
var googleSyncStatusSchema = object({ enabled: boolean2(), spreadsheetUrl: string2().nullable(), driveFileUrl: string2().nullable(), lastSyncAt: string2().nullable(), lastError: string2().nullable(), pendingCount: number2(), failedCount: number2() });
var googleWriteResponse = object({ status: _enum(["ok", "error"]), message: string2(), url: string2().nullable() });
function profileSheetRow(profile, operation = "upsert") {
  return [profile.id, profile.displayName, profile.handle, profile.bio, profile.isPrivate, profile.isFounder, isActiveProfile(profile) ? "active" : "deactivated", profile.createdAt.toISOString(), operation, new Date().toISOString()];
}
function postSheetRow(post, operation = "upsert") {
  return [post.id, post.authorId, post.text, post.createdAt.toISOString(), post.editedAt?.toISOString() ?? null, operation === "delete" ? "deleted" : "active", operation, new Date().toISOString()];
}
function commentSheetRow(comment) {
  return [comment.id, comment.postId, comment.authorId, comment.parentCommentId, comment.text, comment.createdAt.toISOString(), "upsert", new Date().toISOString()];
}
async function queueGoogleSync(ctx, tab, recordKey, operation, values) {
  try {
    const db = ctx.db();
    const [config] = await db.select().from(googleIntegrations).where(eq(googleIntegrations.id, 1)).limit(1);
    if (!config?.sheetsEnabled || !config.spreadsheetId)
      return;
    const [job] = await db.insert(googleSyncQueue).values({ tab, recordKey, operation, payload: JSON.stringify(values) }).returning({ id: googleSyncQueue.id });
    if (!job)
      return;
    try {
      const result = await ctx.executePrivileged(privileged.appendGoogleSheetRow, { spreadsheetId: config.spreadsheetId, tab, values });
      if (result.ok) {
        const now = new Date;
        await db.batch([db.update(googleSyncQueue).set({ status: "synced", error: null, syncedAt: now }).where(eq(googleSyncQueue.id, job.id)), db.update(googleIntegrations).set({ lastSyncAt: now, lastError: null, updatedAt: now }).where(eq(googleIntegrations.id, 1))]);
      } else {
        await db.batch([db.update(googleSyncQueue).set({ status: "failed", error: result.error }).where(eq(googleSyncQueue.id, job.id)), db.update(googleIntegrations).set({ lastError: result.error, updatedAt: new Date }).where(eq(googleIntegrations.id, 1))]);
      }
    } catch {
      const message = "Google Sheets is temporarily unreachable. This update is queued for retry.";
      await db.batch([db.update(googleSyncQueue).set({ status: "failed", error: message }).where(eq(googleSyncQueue.id, job.id)), db.update(googleIntegrations).set({ lastError: message, updatedAt: new Date }).where(eq(googleIntegrations.id, 1))]);
    }
    ctx.invalidateQueries();
  } catch {}
}
async function deleteAccountData(ctx, profile) {
  const db = ctx.db();
  const ownPosts = (await db.select({ id: posts.id }).from(posts).where(eq(posts.authorId, profile.id))).map((row) => row.id);
  const ownStories = await db.select({ id: stories.id, blobKey: stories.blobKey }).from(stories).where(eq(stories.authorId, profile.id));
  const postImages2 = ownPosts.length ? await db.select({ blobKey: postImages.blobKey }).from(postImages).where(inArray(postImages.postId, ownPosts)) : [];
  const ownComments = await db.select({ id: comments.id }).from(comments).where(eq(comments.authorId, profile.id));
  const commentsOnOwnPosts = ownPosts.length ? await db.select({ id: comments.id }).from(comments).where(inArray(comments.postId, ownPosts)) : [];
  const commentIds = [...new Set([...ownComments, ...commentsOnOwnPosts].map((row) => row.id))];
  await db.delete(notifications).where(eq(notifications.recipientId, profile.id));
  await db.delete(notifications).where(eq(notifications.actorId, profile.id));
  if (ownPosts.length)
    await db.delete(notifications).where(inArray(notifications.postId, ownPosts));
  await db.delete(follows).where(eq(follows.followerId, profile.id));
  await db.delete(follows).where(eq(follows.followingId, profile.id));
  await db.delete(likes).where(eq(likes.profileId, profile.id));
  await db.delete(reposts).where(eq(reposts.profileId, profile.id));
  await db.delete(bookmarks).where(eq(bookmarks.profileId, profile.id));
  if (ownPosts.length) {
    await db.delete(likes).where(inArray(likes.postId, ownPosts));
    await db.delete(reposts).where(inArray(reposts.postId, ownPosts));
    await db.delete(bookmarks).where(inArray(bookmarks.postId, ownPosts));
    await db.delete(comments).where(inArray(comments.postId, ownPosts));
    await db.delete(postImages).where(inArray(postImages.postId, ownPosts));
  }
  await db.delete(comments).where(eq(comments.authorId, profile.id));
  await db.delete(reports).where(eq(reports.reporterId, profile.id));
  if (ownPosts.length)
    await db.delete(reports).where(and(eq(reports.targetType, "post"), inArray(reports.targetId, ownPosts)));
  if (commentIds.length)
    await db.delete(reports).where(and(eq(reports.targetType, "comment"), inArray(reports.targetId, commentIds)));
  await db.delete(storyViews).where(eq(storyViews.viewerId, profile.id));
  await db.delete(storyReactions).where(eq(storyReactions.reactorId, profile.id));
  if (ownStories.length) {
    const storyIds = ownStories.map((row) => row.id);
    await db.delete(storyViews).where(inArray(storyViews.storyId, storyIds));
    await db.delete(storyReactions).where(inArray(storyReactions.storyId, storyIds));
  }
  await db.delete(stories).where(eq(stories.authorId, profile.id));
  if (ownPosts.length)
    await db.delete(posts).where(inArray(posts.id, ownPosts));
  await db.delete(sessions).where(eq(sessions.profileId, profile.id));
  await db.delete(pushTokens).where(eq(pushTokens.profileId, profile.id));
  await db.delete(profiles).where(eq(profiles.id, profile.id));
  const blobKeys = [profile.avatarBlobKey, ...postImages2.map((row) => row.blobKey), ...ownStories.map((row) => row.blobKey)].filter((key) => Boolean(key));
  for (const key of blobKeys) {
    try {
      await ctx.blobs.delete(key);
    } catch {}
  }
}
async function loadPosts(ctx, viewerId, authorIds, limit, onlyIds) {
  if (authorIds.length === 0)
    return [];
  const db = ctx.db();
  let rows = await db.select({ post: posts, author: profiles }).from(posts).innerJoin(profiles, eq(posts.authorId, profiles.id)).where(inArray(posts.authorId, authorIds)).orderBy(desc(posts.createdAt), desc(posts.id)).limit(Math.max(limit, onlyIds?.length ?? 0));
  const hiddenIds = await blockedIdsFor(ctx, viewerId);
  rows = rows.filter((row) => isActiveProfile(row.author) && !hiddenIds.has(row.author.id));
  if (onlyIds)
    rows = rows.filter((row) => onlyIds.includes(row.post.id));
  rows = rows.slice(0, limit);
  const ids = rows.map((row) => row.post.id);
  if (ids.length === 0)
    return [];
  const [imagesRaw, commentsRaw, likes2, reposts2, bookmarks2] = await Promise.all([
    db.select().from(postImages).where(inArray(postImages.postId, ids)).orderBy(asc(postImages.position)),
    db.select({ comment: comments, author: profiles }).from(comments).innerJoin(profiles, eq(comments.authorId, profiles.id)).where(inArray(comments.postId, ids)).orderBy(asc(comments.createdAt), asc(comments.id)),
    db.select().from(likes).where(inArray(likes.postId, ids)),
    db.select().from(reposts).where(inArray(reposts.postId, ids)),
    db.select().from(bookmarks).where(and(eq(bookmarks.profileId, viewerId), inArray(bookmarks.postId, ids)))
  ]);
  const commentsVisible = commentsRaw.filter(({ author }) => isActiveProfile(author) && !hiddenIds.has(author.id));
  const images = await Promise.all(imagesRaw.map(async (row) => ({ ...row, url: await ctx.blobs.getUrl(row.blobKey) })));
  return Promise.all(rows.map(async ({ post, author }) => ({ id: post.id, text: post.text, slug: post.slug ?? null, createdAt: post.createdAt.toISOString(), editedAt: post.editedAt?.toISOString() ?? null, author: await publicProfile(ctx, author, viewerId), images: images.filter((x) => x.postId === post.id).map((x) => ({ id: x.id, url: x.url, altText: x.altText })), likeCount: likes2.filter((x) => x.postId === post.id).length, commentCount: commentsVisible.filter((x) => x.comment.postId === post.id).length, repostCount: reposts2.filter((x) => x.postId === post.id).length, viewerLiked: likes2.some((x) => x.postId === post.id && x.profileId === viewerId), viewerReposted: reposts2.some((x) => x.postId === post.id && x.profileId === viewerId), viewerBookmarked: bookmarks2.some((x) => x.postId === post.id), comments: await Promise.all(commentsVisible.filter((x) => x.comment.postId === post.id).map(async ({ comment, author: commentAuthor }) => ({ id: comment.id, parentCommentId: comment.parentCommentId, text: comment.text, createdAt: comment.createdAt.toISOString(), author: await publicProfile(ctx, commentAuthor, viewerId) }))) })));
}
var Actions = {
  getGoogleIntegrationStatus: defineAction({ request: object({ token: string2() }), response: googleSyncStatusSchema, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer?.isFounder)
      return { enabled: false, spreadsheetUrl: null, driveFileUrl: null, lastSyncAt: null, lastError: null, pendingCount: 0, failedCount: 0 };
    const db = ctx.db();
    const [config, pending, failed] = await Promise.all([db.select().from(googleIntegrations).where(eq(googleIntegrations.id, 1)).limit(1), db.select({ id: googleSyncQueue.id }).from(googleSyncQueue).where(eq(googleSyncQueue.status, "pending")), db.select({ id: googleSyncQueue.id }).from(googleSyncQueue).where(eq(googleSyncQueue.status, "failed"))]);
    const row = config[0];
    return { enabled: Boolean(row?.sheetsEnabled && row.spreadsheetId), spreadsheetUrl: row?.spreadsheetUrl ?? null, driveFileUrl: row?.driveFileUrl ?? null, lastSyncAt: row?.lastSyncAt?.toISOString() ?? null, lastError: row?.lastError ?? null, pendingCount: pending.length, failedCount: failed.length };
  } }),
  connectGoogleSheets: defineAction({ request: object({ token: string2() }), response: googleWriteResponse, privileged: [privileged.initializeGoogleSheets], async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer?.isFounder)
      return { status: "error", message: "Only the Gola creator can connect the database.", url: null };
    const db = ctx.db();
    const [profiles2, posts2, comments2, sessions2, follows2, likes2] = await Promise.all([db.select().from(profiles).orderBy(asc(profiles.id)), db.select().from(posts).orderBy(asc(posts.id)), db.select().from(comments).orderBy(asc(comments.id)), db.select().from(sessions).orderBy(asc(sessions.createdAt)), db.select().from(follows).orderBy(asc(follows.createdAt)), db.select().from(likes).orderBy(asc(likes.createdAt))]);
    const now = new Date().toISOString();
    const result = await ctx.executePrivileged(privileged.initializeGoogleSheets, { title: "Gola Database", tabs: [
      { tab: "users", rows: [["id", "display_name", "username", "bio", "is_private", "is_founder", "status", "created_at", "operation", "event_at"], ...profiles2.map((profile) => profileSheetRow(profile))] },
      { tab: "posts", rows: [["id", "author_id", "text", "created_at", "edited_at", "status", "operation", "event_at"], ...posts2.map((post) => postSheetRow(post))] },
      { tab: "comments", rows: [["id", "post_id", "author_id", "parent_comment_id", "text", "created_at", "operation", "event_at"], ...comments2.map((comment) => commentSheetRow(comment))] },
      { tab: "logins", rows: [["profile_id", "event_type", "logged_in_at"], ...sessions2.map((session) => [session.profileId, "login", session.createdAt.toISOString()])] },
      { tab: "follows", rows: [["follower_id", "following_id", "created_at", "status", "operation", "event_at"], ...follows2.map((follow) => [follow.followerId, follow.followingId, follow.createdAt.toISOString(), "active", "upsert", now])] },
      { tab: "likes", rows: [["profile_id", "post_id", "created_at", "status", "operation", "event_at"], ...likes2.map((like) => [like.profileId, like.postId, like.createdAt.toISOString(), "active", "upsert", now])] }
    ] });
    if (!result.ok || !result.spreadsheetId) {
      const message = result.error ?? "Google Sheets could not be connected.";
      const [existing] = await db.select().from(googleIntegrations).where(eq(googleIntegrations.id, 1)).limit(1);
      if (existing)
        await db.update(googleIntegrations).set({ lastError: message, updatedAt: new Date }).where(eq(googleIntegrations.id, 1));
      else
        await db.insert(googleIntegrations).values({ id: 1, sheetsEnabled: false, lastError: message });
      ctx.invalidateQueries();
      return { status: "error", message, url: result.spreadsheetUrl };
    }
    const connectedAt = new Date;
    const [existing] = await db.select().from(googleIntegrations).where(eq(googleIntegrations.id, 1)).limit(1);
    if (existing)
      await db.update(googleIntegrations).set({ sheetsEnabled: true, spreadsheetId: result.spreadsheetId, spreadsheetUrl: result.spreadsheetUrl, connectedAt, lastSyncAt: connectedAt, lastError: null, updatedAt: connectedAt }).where(eq(googleIntegrations.id, 1));
    else
      await db.insert(googleIntegrations).values({ id: 1, sheetsEnabled: true, spreadsheetId: result.spreadsheetId, spreadsheetUrl: result.spreadsheetUrl, connectedAt, lastSyncAt: connectedAt, lastError: null });
    ctx.invalidateQueries();
    return { status: "ok", message: "Gola Database is connected. Existing records were copied and new activity will sync automatically.", url: result.spreadsheetUrl };
  } }),
  retryGoogleSheetsSync: defineAction({ request: object({ token: string2() }), response: googleWriteResponse, privileged: [privileged.appendGoogleSheetRow], async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer?.isFounder)
      return { status: "error", message: "Only the Gola creator can retry database sync.", url: null };
    const db = ctx.db();
    const [config] = await db.select().from(googleIntegrations).where(eq(googleIntegrations.id, 1)).limit(1);
    if (!config?.sheetsEnabled || !config.spreadsheetId)
      return { status: "error", message: "Connect Google Sheets first.", url: null };
    const jobs = await db.select().from(googleSyncQueue).where(inArray(googleSyncQueue.status, ["pending", "failed"])).orderBy(asc(googleSyncQueue.id)).limit(50);
    let synced = 0;
    for (const job of jobs) {
      try {
        const parsed = sheetValuesSchema.safeParse(JSON.parse(job.payload));
        if (!parsed.success)
          continue;
        const result = await ctx.executePrivileged(privileged.appendGoogleSheetRow, { spreadsheetId: config.spreadsheetId, tab: job.tab, values: parsed.data });
        if (!result.ok) {
          await db.update(googleSyncQueue).set({ status: "failed", error: result.error }).where(eq(googleSyncQueue.id, job.id));
          continue;
        }
        await db.update(googleSyncQueue).set({ status: "synced", error: null, syncedAt: new Date }).where(eq(googleSyncQueue.id, job.id));
        synced += 1;
      } catch {
        await db.update(googleSyncQueue).set({ status: "failed", error: "Google Sheets is still unreachable." }).where(eq(googleSyncQueue.id, job.id));
      }
    }
    const lastError = synced === jobs.length ? null : jobs.length ? "Some updates are still waiting for Google Sheets." : null;
    await db.update(googleIntegrations).set({ lastSyncAt: synced ? new Date : config.lastSyncAt, lastError, updatedAt: new Date }).where(eq(googleIntegrations.id, 1));
    ctx.invalidateQueries();
    return { status: synced === jobs.length ? "ok" : "error", message: jobs.length === 0 ? "Everything is already synced." : `${synced} of ${jobs.length} queued updates synced.`, url: config.spreadsheetUrl };
  } }),
  saveSourceToGoogleDrive: defineAction({ request: object({ token: string2(), filename: string2().max(100), dataBase64: string2().min(1) }), response: googleWriteResponse, privileged: [privileged.uploadSourceToDrive], async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer?.isFounder)
      return { status: "error", message: "Only the Gola creator can save the source export.", url: null };
    const result = await ctx.executePrivileged(privileged.uploadSourceToDrive, { filename: args.filename, dataBase64: args.dataBase64 });
    if (!result.ok)
      return { status: "error", message: result.error ?? "Google Drive could not save the source ZIP.", url: null };
    const db = ctx.db();
    const now = new Date;
    const [existing] = await db.select().from(googleIntegrations).where(eq(googleIntegrations.id, 1)).limit(1);
    if (existing)
      await db.update(googleIntegrations).set({ driveFileUrl: result.fileUrl, updatedAt: now }).where(eq(googleIntegrations.id, 1));
    else
      await db.insert(googleIntegrations).values({ id: 1, sheetsEnabled: false, driveFileUrl: result.fileUrl });
    ctx.invalidateQueries();
    return { status: "ok", message: "gola-complete-source.zip was saved to your Google Drive.", url: result.fileUrl };
  } }),
  currentAccount: defineAction({ request: object({ token: string2() }), response: object({ profile: accountProfileSchema.nullable() }), async handler(ctx, args) {
    const row = await authenticatedProfile(ctx, args.token);
    return { profile: row ? await accountProfile(ctx, row) : null };
  } }),
  createAccount: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ email: string2().trim().email().max(200), password: string2().min(8).max(100), displayName: string2().trim().min(2).max(40), handle: string2().trim().min(3).max(24), bio: string2().trim().max(160).optional(), isPrivate: boolean2().default(false) }), response: authResponse, async handler(ctx, args) {
    const db = ctx.db();
    const email = args.email.trim().toLowerCase();
    const handle = args.handle.toLowerCase().replace(/^@/u, "");
    if (!/^[a-z0-9_]+$/u.test(handle))
      return { status: "error", message: "Use only letters, numbers, and underscores in your username.", token: null, profile: null };
    if ((await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1))[0])
      return { status: "error", message: "An account already uses that email. Log in instead.", token: null, profile: null };
    if ((await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.handle, handle)).limit(1))[0])
      return { status: "error", message: "That username is already taken.", token: null, profile: null };
    const [created] = await db.insert(profiles).values({ email, passwordHash: await hashPassword(args.password), displayName: args.displayName.trim(), handle, bio: args.bio?.trim() || null, isPrivate: args.isPrivate, isFounder: handle === "gola" || handle === "golaadmin", approvalStatus: "approved", continent: "AS" }).returning();
    if (!created)
      return { status: "error", message: "The account could not be created.", token: null, profile: null };
    const token = await createSession(ctx, created.id);
    await queueGoogleSync(ctx, "users", String(created.id), "upsert", profileSheetRow(created));
    await queueGoogleSync(ctx, "logins", `${created.id}:signup:${Date.now()}`, "signup", [created.id, "signup", new Date().toISOString()]);
    ctx.invalidateQueries();
    return { status: "ok", message: null, token, profile: await accountProfile(ctx, created) };
  } }),
  loginAccount: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ email: string2().trim().email().max(200), password: string2().min(1).max(100) }), response: authResponse, async handler(ctx, args) {
    const [profile] = await ctx.db().select().from(profiles).where(eq(profiles.email, args.email.trim().toLowerCase())).limit(1);
    if (!profile?.passwordHash || !await verifyPassword(args.password, profile.passwordHash))
      return { status: "error", message: "The email or password is incorrect.", token: null, profile: null };
    if (!isActiveProfile(profile))
      return { status: "error", message: `This account is deactivated until ${profile.deactivatedUntil?.toLocaleDateString() ?? "its return date"}.`, token: null, profile: null };
    if (profile.approvalStatus === "declined")
      return { status: "error", message: "This account request was not approved.", token: null, profile: null };
    if (profile.deactivatedUntil)
      await ctx.db().update(profiles).set({ deactivatedUntil: null }).where(eq(profiles.id, profile.id));
    const token = await createSession(ctx, profile.id);
    await queueGoogleSync(ctx, "logins", `${profile.id}:login:${Date.now()}`, "login", [profile.id, "login", new Date().toISOString()]);
    return { status: "ok", message: null, token, profile: await accountProfile(ctx, { ...profile, deactivatedUntil: null }) };
  } }),
  resetPassword: defineAction({ request: object({ email: string2().trim().email().max(200), handle: string2().trim().max(24), recoveryCode: string2().trim().max(80).optional(), newPassword: string2().min(8).max(100) }), response: recoveryResponse, async handler(ctx, args) {
    const db = ctx.db();
    const email = args.email.trim().toLowerCase();
    const handle = args.handle.trim().toLowerCase().replace(/^@/u, "");
    const [profile] = await db.select().from(profiles).where(and(eq(profiles.email, email), eq(profiles.handle, handle))).limit(1);
    const suppliedCode = normalizeRecoveryCode(args.recoveryCode ?? "");
    const codeValid = profile?.recoveryCodeHash && suppliedCode ? await sha256(suppliedCode) === profile.recoveryCodeHash : false;
    const legacyValid = Boolean(profile && !profile.recoveryCodeHash && handle === profile.handle);
    if (!profile || !codeValid && !legacyValid)
      return { status: "error", message: "Those recovery details do not match this account.", recoveryCode: null };
    const nextCode = createRecoveryCode();
    await db.batch([db.update(profiles).set({ passwordHash: await hashPassword(args.newPassword), recoveryCodeHash: await sha256(normalizeRecoveryCode(nextCode)) }).where(eq(profiles.id, profile.id)), db.delete(sessions).where(eq(sessions.profileId, profile.id))]);
    ctx.invalidateQueries();
    return { status: "ok", message: "Your password is reset. Save this new recovery key somewhere safe.", recoveryCode: nextCode };
  } }),
  createRecoveryCode: defineAction({ request: object({ token: string2() }), response: recoveryResponse, async handler(ctx, args) {
    const viewer = await authenticatedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", recoveryCode: null };
    const nextCode = createRecoveryCode();
    await ctx.db().update(profiles).set({ recoveryCodeHash: await sha256(normalizeRecoveryCode(nextCode)) }).where(eq(profiles.id, viewer.id));
    ctx.invalidateQueries();
    return { status: "ok", message: "A new recovery key is ready. Any older recovery key will no longer work.", recoveryCode: nextCode };
  } }),
  logoutAccount: defineAction({ request: object({ token: string2() }), response: object({ ok: literal(true) }), async handler(ctx, args) {
    await ctx.db().delete(sessions).where(eq(sessions.tokenHash, await sha256(args.token)));
    ctx.invalidateQueries();
    return { ok: true };
  } }),
  deactivateAccount: defineAction({ request: object({ token: string2() }), response: object({ status: _enum(["ok", "error"]), message: string2(), nextAvailableAt: string2().nullable() }), async handler(ctx, args) {
    const viewer = await authenticatedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", nextAvailableAt: null };
    const nextAvailable = viewer.lastDeactivatedAt ? new Date(viewer.lastDeactivatedAt.getTime() + 30 * 86400000) : null;
    if (nextAvailable && nextAvailable.getTime() > Date.now())
      return { status: "error", message: "You can deactivate your account once every 30 days.", nextAvailableAt: nextAvailable.toISOString() };
    const now = new Date;
    const until = new Date(now.getTime() + 7 * 86400000);
    const db = ctx.db();
    await db.update(profiles).set({ deactivatedUntil: until, lastDeactivatedAt: now }).where(eq(profiles.id, viewer.id));
    ctx.invalidateQueries();
    return { status: "ok", message: "Your account is hidden for 7 days and will return automatically.", nextAvailableAt: new Date(now.getTime() + 30 * 86400000).toISOString() };
  } }),
  deleteAccountPermanently: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), confirmation: literal("DELETE") }), response: object({ status: _enum(["ok", "error"]), message: string2() }), async handler(ctx, args) {
    const viewer = await profileForSession(ctx, args.token);
    if (!viewer || args.confirmation !== "DELETE")
      return { status: "error", message: "The account could not be deleted. Please log in again." };
    await queueGoogleSync(ctx, "users", String(viewer.id), "delete", profileSheetRow(viewer, "delete"));
    await deleteAccountData(ctx, viewer);
    ctx.invalidateQueries();
    return { status: "ok", message: "Your account and its data were permanently deleted." };
  } }),
  updateProfile: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), displayName: string2().trim().min(2).max(40), bio: string2().trim().max(160) }), response: profileUpdateResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", profile: null, nextEditableAt: null };
    const next = viewer.profileUpdatedAt ? new Date(viewer.profileUpdatedAt.getTime() + 86400000) : null;
    if (next && next.getTime() > Date.now())
      return { status: "error", message: "You can edit your name and bio again after the 24-hour wait.", profile: await accountProfile(ctx, viewer), nextEditableAt: next.toISOString() };
    const [updated] = await ctx.db().update(profiles).set({ displayName: args.displayName.trim(), bio: args.bio.trim() || null, profileUpdatedAt: new Date }).where(eq(profiles.id, viewer.id)).returning();
    if (!updated)
      return { status: "error", message: "Your profile could not be updated.", profile: await accountProfile(ctx, viewer), nextEditableAt: null };
    await queueGoogleSync(ctx, "users", String(updated.id), "upsert", profileSheetRow(updated));
    ctx.invalidateQueries();
    return { status: "ok", message: "Profile updated.", profile: await accountProfile(ctx, updated), nextEditableAt: new Date((updated.profileUpdatedAt ?? new Date).getTime() + 86400000).toISOString() };
  } }),
  setProfilePrivacy: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), isPrivate: boolean2() }), response: profileUpdateResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", profile: null, nextEditableAt: null };
    const [updated] = await ctx.db().update(profiles).set({ isPrivate: args.isPrivate }).where(eq(profiles.id, viewer.id)).returning();
    if (!updated)
      return { status: "error", message: "Privacy setting could not be changed.", profile: await accountProfile(ctx, viewer), nextEditableAt: null };
    await queueGoogleSync(ctx, "users", String(updated.id), "upsert", profileSheetRow(updated));
    ctx.invalidateQueries();
    return { status: "ok", message: args.isPrivate ? "Your account is now private." : "Your account is now public.", profile: await accountProfile(ctx, updated), nextEditableAt: updated.profileUpdatedAt ? new Date(updated.profileUpdatedAt.getTime() + 86400000).toISOString() : null };
  } }),
  setBadge: defineAction({ request: object({ token: string2(), profileId: number2().int().positive(), badge: _enum(["none", "community", "official"]) }), response: object({ status: _enum(["ok", "error"]), message: string2() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer?.isFounder)
      return { status: "error", message: "Only the Gola creator can grant badges." };
    const db = ctx.db();
    const [target] = await db.select().from(profiles).where(eq(profiles.id, args.profileId)).limit(1);
    if (!target || !isActiveProfile(target))
      return { status: "error", message: "That account could not be found." };
    if (target.badge === args.badge)
      return { status: "ok", message: args.badge === "none" ? `@${target.handle} has no badge to remove.` : `@${target.handle} already has the ${args.badge} badge.` };
    await db.update(profiles).set({ badge: args.badge, badgeGrantedAt: args.badge === "none" ? null : new Date }).where(eq(profiles.id, target.id));
    ctx.invalidateQueries();
    const label = args.badge === "none" ? "removed" : args.badge === "official" ? "marked as official" : "marked as a community member";
    return { status: "ok", message: `@${target.handle} has been ${label}.` };
  } }),
  setColorTheme: defineAction({ request: object({ token: string2(), color: colorChoiceSchema }), response: colorThemeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", profile: null, nextChangeAt: null };
    if (viewer.themeColor === args.color)
      return { status: "ok", message: "That color is already active.", profile: await accountProfile(ctx, viewer), nextChangeAt: viewer.themeChangedAt ? new Date(viewer.themeChangedAt.getTime() + 30 * 86400000).toISOString() : null };
    const hasGoldenBadge = viewer.badge === "official";
    const next = viewer.themeChangedAt ? new Date(viewer.themeChangedAt.getTime() + 30 * 86400000) : null;
    if (!hasGoldenBadge && next && next.getTime() > Date.now())
      return { status: "error", message: "You can choose a new app color once every 30 days.", profile: await accountProfile(ctx, viewer), nextChangeAt: next.toISOString() };
    const changedAt = new Date;
    const [updated] = await ctx.db().update(profiles).set({ themeColor: args.color, themeChangedAt: changedAt }).where(eq(profiles.id, viewer.id)).returning();
    if (!updated)
      return { status: "error", message: "Your app color could not be changed.", profile: await accountProfile(ctx, viewer), nextChangeAt: null };
    ctx.invalidateQueries();
    return { status: "ok", message: "Your new color is now live across Gola.", profile: await accountProfile(ctx, updated), nextChangeAt: new Date(changedAt.getTime() + 30 * 86400000).toISOString() };
  } }),
  updatePreferences: defineAction({ request: object({ token: string2(), language: languageSchema, continent: continentSchema }), response: preferenceResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", profile: null };
    const [updated] = await ctx.db().update(profiles).set({ language: args.language, continent: args.continent }).where(eq(profiles.id, viewer.id)).returning();
    if (!updated)
      return { status: "error", message: "Your preferences could not be saved.", profile: await accountProfile(ctx, viewer) };
    ctx.invalidateQueries();
    return { status: "ok", message: "Language and continent saved.", profile: await accountProfile(ctx, updated) };
  } }),
  setAvatar: defineAction({ request: object({ token: string2(), photo: object({ dataBase64: string2().min(1), mimeType: _enum(["image/jpeg", "image/png", "image/webp"]) }) }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null };
    const key = `avatars/${viewer.id}/${crypto.randomUUID()}`;
    await ctx.blobs.put(key, decodeBase64(args.photo.dataBase64), { contentType: args.photo.mimeType });
    await ctx.db().update(profiles).set({ avatarBlobKey: key }).where(eq(profiles.id, viewer.id));
    ctx.invalidateQueries();
    return { status: "ok", message: "Profile photo updated.", id: viewer.id };
  } }),
  listFeed: defineAction({ request: object({ token: string2(), limit: number2().int().positive().max(50).default(30) }), response: object({ posts: array(postSchema) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { posts: [] };
    const followed = await ctx.db().select({ id: follows.followingId }).from(follows).innerJoin(profiles, eq(follows.followingId, profiles.id)).where(and(eq(follows.followerId, viewer.id), eq(profiles.isPrivate, false)));
    return { posts: await loadPosts(ctx, viewer.id, [viewer.id, ...followed.map((x) => x.id)], args.limit) };
  } }),
  getPost: defineAction({ request: object({ token: string2(), postId: string2() }), response: object({ post: postSchema.nullable() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { post: null };
    const db = ctx.db();
    const isNumeric = /^\d+$/.test(args.postId);
    const [postRow] = await db.select().from(posts).where(isNumeric ? eq(posts.id, Number(args.postId)) : eq(posts.slug, args.postId)).limit(1);
    if (!postRow)
      return { post: null };
    if (!await canAccessPost(ctx, viewer.id, postRow.id))
      return { post: null };
    const posts2 = await loadPosts(ctx, viewer.id, [postRow.authorId], 50);
    const post = posts2.find((p) => String(p.id) === String(postRow.id)) ?? null;
    return { post };
  } }),
  getProfile: defineAction({ request: object({ token: string2(), profileId: number2().int().positive() }), response: object({ profile: profileSchema.nullable(), postCount: number2(), followerCount: number2(), followingCount: number2(), viewerFollowing: boolean2(), viewerBlocked: boolean2(), blockedByTarget: boolean2(), privateView: boolean2(), posts: array(postSchema) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { profile: null, postCount: 0, followerCount: 0, followingCount: 0, viewerFollowing: false, viewerBlocked: false, blockedByTarget: false, privateView: false, posts: [] };
    const db = ctx.db();
    const [target] = await db.select().from(profiles).where(eq(profiles.id, args.profileId)).limit(1);
    if (!target || !isActiveProfile(target))
      return { profile: null, postCount: 0, followerCount: 0, followingCount: 0, viewerFollowing: false, viewerBlocked: false, blockedByTarget: false, privateView: false, posts: [] };
    const blockRows = await db.select().from(blocks).where(and(inArray(blocks.blockerId, [viewer.id, target.id]), inArray(blocks.blockedId, [viewer.id, target.id])));
    const viewerBlocked = blockRows.some((row) => row.blockerId === viewer.id && row.blockedId === target.id);
    const blockedByTarget = blockRows.some((row) => row.blockerId === target.id && row.blockedId === viewer.id);
    const privateView = target.isPrivate && target.id !== viewer.id;
    const profile = await publicProfile(ctx, target, viewer.id);
    if (privateView || viewerBlocked)
      return { profile, postCount: 0, followerCount: 0, followingCount: 0, viewerFollowing: false, viewerBlocked, blockedByTarget, privateView: true, posts: [] };
    const [postRows, followers, following, people] = await Promise.all([db.select({ id: posts.id }).from(posts).where(eq(posts.authorId, target.id)), db.select().from(follows).where(eq(follows.followingId, target.id)), db.select().from(follows).where(eq(follows.followerId, target.id)), db.select().from(profiles)]);
    const activeIds = new Set(people.filter(isActiveProfile).map((person) => person.id));
    const visibleFollowers = followers.filter((link) => activeIds.has(link.followerId));
    const visibleFollowing = following.filter((link) => activeIds.has(link.followingId));
    return { profile, postCount: postRows.length, followerCount: visibleFollowers.length, followingCount: visibleFollowing.length, viewerFollowing: visibleFollowers.some((x) => x.followerId === viewer.id), viewerBlocked, blockedByTarget, privateView: false, posts: await loadPosts(ctx, viewer.id, [target.id], 50) };
  } }),
  resolveHandle: defineAction({ request: object({ token: string2(), handle: string2().min(1).max(30) }), response: object({ profileId: number2().nullable() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { profileId: null };
    const db = ctx.db();
    const handle = args.handle.toLowerCase().replace(/^@/, "");
    const [target] = await db.select().from(profiles).where(eq(profiles.handle, handle)).limit(1);
    if (!target || !isActiveProfile(target))
      return { profileId: null };
    return { profileId: target.id };
  } }),
  getLatestVersion: defineAction({ request: object({ token: string2() }), response: object({ version: string2(), url: string2(), notes: string2() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { version: "", url: "", notes: "" };
    return { version: LATEST_APP_VERSION, url: LATEST_APP_URL, notes: LATEST_APP_NOTES };
  } }),
  listProfileConnections: defineAction({ request: object({ token: string2(), profileId: number2().int().positive(), kind: _enum(["followers", "following"]) }), response: object({ privateView: boolean2(), profiles: array(connectionProfileSchema) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { privateView: false, profiles: [] };
    const db = ctx.db();
    const [target] = await db.select().from(profiles).where(eq(profiles.id, args.profileId)).limit(1);
    if (!target || !isActiveProfile(target))
      return { privateView: false, profiles: [] };
    if (target.isPrivate && target.id !== viewer.id)
      return { privateView: true, profiles: [] };
    const links = args.kind === "followers" ? await db.select({ id: follows.followerId }).from(follows).where(eq(follows.followingId, target.id)).orderBy(desc(follows.createdAt)) : await db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, target.id)).orderBy(desc(follows.createdAt));
    const ids = links.map((link) => link.id);
    if (ids.length === 0)
      return { privateView: false, profiles: [] };
    const [people, allFollows, everyProfile] = await Promise.all([db.select().from(profiles).where(inArray(profiles.id, ids)), db.select().from(follows), db.select().from(profiles)]);
    const activeIds = new Set(everyProfile.filter(isActiveProfile).map((person) => person.id));
    const ordered = ids.map((id) => people.find((person) => person.id === id)).filter((person) => Boolean(person && isActiveProfile(person)));
    return { privateView: false, profiles: await Promise.all(ordered.map(async (person) => ({ ...await publicProfile(ctx, person, viewer.id), viewerFollowing: allFollows.some((follow) => follow.followerId === viewer.id && follow.followingId === person.id), followerCount: person.isPrivate && person.id !== viewer.id ? 0 : allFollows.filter((follow) => follow.followingId === person.id && activeIds.has(follow.followerId)).length }))) };
  } }),
  createPost: defineAction({
    privileged: [privileged.appendGoogleSheetRow],
    request: object({ token: string2(), text: string2().max(12000), photos: array(object({ dataBase64: string2().min(1), mimeType: _enum(["image/jpeg", "image/png", "image/webp", "image/gif"]), filename: string2().max(200).optional() })).max(10) }),
    response: writeResponse,
    async handler(ctx, args) {
      const author = await approvedProfile(ctx, args.token);
      if (!author)
        return { status: "error", message: "Please log in again before posting.", id: null };
      const db0 = ctx.db();
      const [posterRow] = await db0.select().from(profiles).where(eq(profiles.id, author.id)).limit(1);
      if (posterRow?.postRestrictedUntil && new Date(posterRow.postRestrictedUntil).getTime() > Date.now()) {
        return { status: "error", message: "Your account is temporarily restricted from posting due to community guideline violations.", id: null };
      }
      const text = args.text.trim();
      if (!text && args.photos.length === 0)
        return { status: "error", message: "Write something or add a photo first.", id: null };
      if (wordCount(text) > 1000)
        return { status: "error", message: "Posts can be up to 1,000 words.", id: null };
      if (text) {
        const review = await moderateText(ctx, text);
        if (!review.allowed)
          return { status: "blocked", message: review.feedback || "Please rewrite this around your own experience or a positive request.", id: null };
      }
      const db = ctx.db();
      const [post] = await db.insert(posts).values({ authorId: author.id, text }).returning({ id: posts.id });
      let newSlug = null;
      if (post) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.random().toString(36).slice(2, 6);
        newSlug = `${author.handle}-${dateStr}-${rand}`;
        await db.update(posts).set({ slug: newSlug }).where(eq(posts.id, post.id));
      }
      if (!post)
        return { status: "error", message: "Your post could not be saved.", id: null };
      for (let index = 0;index < args.photos.length; index += 1) {
        const photo = args.photos[index];
        if (!photo)
          continue;
        const key = `posts/${post.id}/${crypto.randomUUID()}`;
        await ctx.blobs.put(key, decodeBase64(photo.dataBase64), { contentType: photo.mimeType });
        await db.insert(postImages).values({ postId: post.id, blobKey: key, position: index, altText: "Photo shared with this post" });
      }
      if (text)
        await notifyMentions(ctx, author.id, text, post.id, null);
      const [savedPost] = await db.select().from(posts).where(eq(posts.id, post.id)).limit(1);
      if (savedPost)
        await queueGoogleSync(ctx, "posts", String(savedPost.id), "upsert", postSheetRow(savedPost));
      ctx.invalidateQueries();
      return { status: "ok", message: null, id: post.id, slug: newSlug };
    }
  }),
  editPost: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), postId: number2().int().positive(), text: string2().max(12000) }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null };
    const text = args.text.trim();
    if (!text || wordCount(text) > 1000)
      return { status: "error", message: "Write between 1 and 1,000 words.", id: null };
    const [post] = await ctx.db().select().from(posts).where(eq(posts.id, args.postId)).limit(1);
    if (!post || post.authorId !== viewer.id)
      return { status: "error", message: "You can only edit your own posts.", id: null };
    const review = await moderateText(ctx, text);
    if (!review.allowed)
      return { status: "blocked", message: review.feedback || "Please rewrite this kindly.", id: null };
    const [updated] = await ctx.db().update(posts).set({ text, editedAt: new Date }).where(eq(posts.id, args.postId)).returning();
    if (updated)
      await queueGoogleSync(ctx, "posts", String(updated.id), "upsert", postSheetRow(updated));
    ctx.invalidateQueries();
    return { status: "ok", message: "Post updated.", id: args.postId };
  } }),
  deletePost: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), postId: number2().int().positive() }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null };
    const [post] = await ctx.db().select().from(posts).where(eq(posts.id, args.postId)).limit(1);
    if (!post || post.authorId !== viewer.id)
      return { status: "error", message: "You can only delete your own posts.", id: null };
    await queueGoogleSync(ctx, "posts", String(post.id), "delete", postSheetRow(post, "delete"));
    await ctx.db().delete(posts).where(eq(posts.id, args.postId));
    ctx.invalidateQueries();
    return { status: "ok", message: null, id: args.postId };
  } }),
  deleteComment: defineAction({ request: object({ token: string2(), commentId: number2().int().positive() }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null };
    const db = ctx.db();
    const [comment] = await db.select().from(comments).where(eq(comments.id, args.commentId)).limit(1);
    if (!comment)
      return { status: "error", message: "Comment not found.", id: null };
    const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, comment.postId)).limit(1);
    const isAuthor = comment.authorId === viewer.id;
    const isPostOwner = post?.authorId === viewer.id;
    if (!isAuthor && !isPostOwner)
      return { status: "error", message: "You can only delete your own comments.", id: null };
    await db.delete(comments).where(or(eq(comments.id, args.commentId), eq(comments.parentCommentId, args.commentId)));
    ctx.invalidateQueries();
    return { status: "ok", message: null, id: args.commentId };
  } }),
  addComment: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), postId: number2().int().positive(), parentCommentId: number2().int().positive().nullable().default(null), text: string2().trim().min(1).max(3000) }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer || !await canAccessPost(ctx, viewer.id, args.postId))
      return { status: "error", message: "This post is unavailable.", id: null };
    const text = args.text.trim();
    if (wordCount(text) > 250)
      return { status: "error", message: "Comments can be up to 250 words.", id: null };
    const review = await moderateText(ctx, text);
    if (!review.allowed)
      return { status: "blocked", message: review.feedback || "Please make this response supportive.", id: null };
    const db = ctx.db();
    let parent = null;
    if (args.parentCommentId) {
      const [found] = await db.select().from(comments).where(and(eq(comments.id, args.parentCommentId), eq(comments.postId, args.postId))).limit(1);
      parent = found ?? null;
      if (!parent)
        return { status: "error", message: "That comment is no longer available.", id: null };
    }
    const [created] = await db.insert(comments).values({ postId: args.postId, authorId: viewer.id, parentCommentId: parent?.id ?? null, text }).returning({ id: comments.id });
    if (!created)
      return { status: "error", message: "Your comment could not be saved.", id: null };
    const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, args.postId)).limit(1);
    if (parent && parent.authorId !== viewer.id && !await blockedPair(ctx, viewer.id, parent.authorId)) {
      await db.insert(notifications).values({ recipientId: parent.authorId, actorId: viewer.id, type: "reply", postId: args.postId, commentId: created.id });
      const n = await pushName(ctx, viewer.id);
      sendPushNotification(ctx, parent.authorId, `${n} replied to your comment`, text.slice(0, 100), { type: "reply", postId: String(args.postId) });
    } else if (post && post.authorId !== viewer.id && !await blockedPair(ctx, viewer.id, post.authorId)) {
      await db.insert(notifications).values({ recipientId: post.authorId, actorId: viewer.id, type: "comment", postId: args.postId, commentId: created.id });
      const n = await pushName(ctx, viewer.id);
      sendPushNotification(ctx, post.authorId, `${n} commented on your post`, text.slice(0, 100), { type: "comment", postId: String(args.postId) });
    }
    await notifyMentions(ctx, viewer.id, text, args.postId, created.id);
    const [savedComment] = await db.select().from(comments).where(eq(comments.id, created.id)).limit(1);
    if (savedComment)
      await queueGoogleSync(ctx, "comments", String(savedComment.id), "upsert", commentSheetRow(savedComment));
    ctx.invalidateQueries();
    return { status: "ok", message: null, id: created.id };
  } }),
  toggleLike: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), postId: number2().int().positive() }), response: toggleResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer || !await canAccessPost(ctx, viewer.id, args.postId))
      return { active: false, count: 0 };
    const db = ctx.db();
    const where = and(eq(likes.profileId, viewer.id), eq(likes.postId, args.postId));
    const [existing] = await db.select().from(likes).where(where).limit(1);
    if (existing) {
      await db.delete(likes).where(where);
      await db.delete(notifications).where(and(eq(notifications.actorId, viewer.id), eq(notifications.postId, args.postId), eq(notifications.type, "like")));
    } else {
      await db.insert(likes).values({ profileId: viewer.id, postId: args.postId });
      const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, args.postId)).limit(1);
      if (post && post.authorId !== viewer.id) {
        await db.insert(notifications).values({ recipientId: post.authorId, actorId: viewer.id, type: "like", postId: args.postId });
        const n = await pushName(ctx, viewer.id);
        sendPushNotification(ctx, post.authorId, `${n} liked your post`, "Tap to see it.", { type: "like", postId: String(args.postId) });
      }
    }
    const count = (await db.select().from(likes).where(eq(likes.postId, args.postId))).length;
    const eventAt = new Date().toISOString();
    await queueGoogleSync(ctx, "likes", `${viewer.id}:${args.postId}`, existing ? "delete" : "upsert", [viewer.id, args.postId, existing?.createdAt.toISOString() ?? eventAt, existing ? "deleted" : "active", existing ? "delete" : "upsert", eventAt]);
    ctx.invalidateQueries();
    return { active: !existing, count };
  } }),
  toggleRepost: defineAction({ request: object({ token: string2(), postId: number2().int().positive() }), response: toggleResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer || !await canAccessPost(ctx, viewer.id, args.postId))
      return { active: false, count: 0 };
    const db = ctx.db();
    const where = and(eq(reposts.profileId, viewer.id), eq(reposts.postId, args.postId));
    const [existing] = await db.select().from(reposts).where(where).limit(1);
    if (existing) {
      await db.delete(reposts).where(where);
      await db.delete(notifications).where(and(eq(notifications.actorId, viewer.id), eq(notifications.postId, args.postId), eq(notifications.type, "repost")));
    } else {
      await db.insert(reposts).values({ profileId: viewer.id, postId: args.postId });
      const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, args.postId)).limit(1);
      if (post && post.authorId !== viewer.id)
        await db.insert(notifications).values({ recipientId: post.authorId, actorId: viewer.id, type: "repost", postId: args.postId });
    }
    const count = (await db.select().from(reposts).where(eq(reposts.postId, args.postId))).length;
    ctx.invalidateQueries();
    return { active: !existing, count };
  } }),
  toggleBookmark: defineAction({ request: object({ token: string2(), postId: number2().int().positive() }), response: toggleResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer || !await canAccessPost(ctx, viewer.id, args.postId))
      return { active: false, count: 0 };
    const db = ctx.db();
    const where = and(eq(bookmarks.profileId, viewer.id), eq(bookmarks.postId, args.postId));
    const [existing] = await db.select().from(bookmarks).where(where).limit(1);
    if (existing)
      await db.delete(bookmarks).where(where);
    else
      await db.insert(bookmarks).values({ profileId: viewer.id, postId: args.postId });
    ctx.invalidateQueries();
    return { active: !existing, count: 0 };
  } }),
  listSaved: defineAction({ request: object({ token: string2() }), response: object({ posts: array(postSchema) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { posts: [] };
    const saved = await ctx.db().select({ id: bookmarks.postId }).from(bookmarks).where(eq(bookmarks.profileId, viewer.id)).orderBy(desc(bookmarks.createdAt));
    const publicIds = (await ctx.db().select().from(profiles).where(eq(profiles.isPrivate, false))).filter(isActiveProfile).map((x) => x.id);
    return { posts: await loadPosts(ctx, viewer.id, [...publicIds, viewer.id], 100, saved.map((x) => x.id)) };
  } }),
  listCollections: defineAction({ request: object({ token: string2() }), response: object({ collections: array(object({ id: number2(), name: string2(), postCount: number2(), coverUrl: string2().nullable() })) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { collections: [] };
    const db = ctx.db();
    const cols = await db.select().from(collections).where(eq(collections.profileId, viewer.id)).orderBy(desc(collections.createdAt));
    return { collections: await Promise.all(cols.map(async (c) => {
      const items = await db.select({ postId: collectionPosts.postId }).from(collectionPosts).where(eq(collectionPosts.collectionId, c.id)).orderBy(desc(collectionPosts.createdAt)).limit(1);
      let coverUrl = null;
      if (items[0]) {
        const [img] = await db.select().from(postImages).where(eq(postImages.postId, items[0].postId)).orderBy(asc(postImages.position)).limit(1);
        if (img)
          coverUrl = await ctx.blobs.getUrl(img.blobKey);
      }
      const [{ n }] = await db.select({ n: sql`count(*)` }).from(collectionPosts).where(eq(collectionPosts.collectionId, c.id));
      return { id: c.id, name: c.name, postCount: Number(n), coverUrl };
    })) };
  } }),
  createCollection: defineAction({ request: object({ token: string2(), name: string2().trim().min(1).max(40) }), response: object({ status: _enum(["ok", "error"]), message: string2().nullable(), id: number2().nullable(), name: string2().nullable() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null, name: null };
    const name = args.name.trim();
    if (!name)
      return { status: "error", message: "Give your collection a name.", id: null, name: null };
    const [created] = await ctx.db().insert(collections).values({ profileId: viewer.id, name }).returning({ id: collections.id });
    if (!created)
      return { status: "error", message: "Could not create the collection.", id: null, name: null };
    ctx.invalidateQueries();
    return { status: "ok", message: null, id: created.id, name };
  } }),
  deleteCollection: defineAction({ request: object({ token: string2(), collectionId: number2().int().positive() }), response: object({ status: _enum(["ok", "error"]) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error" };
    const db = ctx.db();
    const [col] = await db.select().from(collections).where(and(eq(collections.id, args.collectionId), eq(collections.profileId, viewer.id))).limit(1);
    if (!col)
      return { status: "error" };
    await db.delete(collections).where(eq(collections.id, col.id));
    ctx.invalidateQueries();
    return { status: "ok" };
  } }),
  toggleCollectionPost: defineAction({ request: object({ token: string2(), collectionId: number2().int().positive(), postId: number2().int().positive() }), response: object({ saved: boolean2() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer || !await canAccessPost(ctx, viewer.id, args.postId))
      return { saved: false };
    const db = ctx.db();
    const [col] = await db.select().from(collections).where(and(eq(collections.id, args.collectionId), eq(collections.profileId, viewer.id))).limit(1);
    if (!col)
      return { saved: false };
    const where = and(eq(collectionPosts.collectionId, col.id), eq(collectionPosts.postId, args.postId));
    const [existing] = await db.select().from(collectionPosts).where(where).limit(1);
    if (existing) {
      await db.delete(collectionPosts).where(where);
    } else {
      await db.insert(collectionPosts).values({ collectionId: col.id, postId: args.postId });
      await db.insert(bookmarks).values({ profileId: viewer.id, postId: args.postId }).onConflictDoNothing();
    }
    ctx.invalidateQueries();
    return { saved: !existing };
  } }),
  listCollectionPosts: defineAction({ request: object({ token: string2(), collectionId: number2().int().positive() }), response: object({ posts: array(postSchema), name: string2().nullable() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { posts: [], name: null };
    const db = ctx.db();
    const [col] = await db.select().from(collections).where(and(eq(collections.id, args.collectionId), eq(collections.profileId, viewer.id))).limit(1);
    if (!col)
      return { posts: [], name: null };
    const items = await db.select({ postId: collectionPosts.postId }).from(collectionPosts).where(eq(collectionPosts.collectionId, col.id)).orderBy(desc(collectionPosts.createdAt));
    const postIds = items.map((x) => x.postId);
    if (postIds.length === 0)
      return { posts: [], name: col.name };
    const publicIds = (await db.select().from(profiles).where(eq(profiles.isPrivate, false))).filter(isActiveProfile).map((x) => x.id);
    return { posts: await loadPosts(ctx, viewer.id, [...publicIds, viewer.id], 100, postIds), name: col.name };
  } }),
  getSaveState: defineAction({ request: object({ token: string2(), postId: number2().int().positive() }), response: object({ bookmarked: boolean2(), collectionIds: array(number2()) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { bookmarked: false, collectionIds: [] };
    const db = ctx.db();
    const [bm] = await db.select().from(bookmarks).where(and(eq(bookmarks.profileId, viewer.id), eq(bookmarks.postId, args.postId))).limit(1);
    const cols = await db.select({ id: collections.id }).from(collections).innerJoin(collectionPosts, and(eq(collectionPosts.collectionId, collections.id), eq(collectionPosts.postId, args.postId))).where(eq(collections.profileId, viewer.id));
    return { bookmarked: !!bm, collectionIds: cols.map((c) => c.id) };
  } }),
  reportContent: defineAction({ request: object({ token: string2(), targetType: _enum(["post", "comment"]), targetId: number2().int().positive(), reason: string2().trim().min(3).max(300) }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null };
    const db = ctx.db();
    const existing = await db.select({ id: reports.id }).from(reports).where(and(eq(reports.reporterId, viewer.id), eq(reports.targetType, args.targetType), eq(reports.targetId, args.targetId))).limit(1);
    if (existing[0])
      return { status: "ok", message: "You already reported this content.", id: existing[0].id };
    const [created] = await db.insert(reports).values({ reporterId: viewer.id, targetType: args.targetType, targetId: args.targetId, reason: args.reason.trim() }).returning({ id: reports.id });
    ctx.invalidateQueries();
    return { status: "ok", message: "Report received. Thank you for helping keep Gola kind.", id: created?.id ?? null };
  } }),
  searchProfiles: defineAction({ request: object({ token: string2(), query: string2().max(60).default("") }), response: object({ profiles: array(profileSchema.extend({ viewerFollowing: boolean2(), followerCount: number2() })) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { profiles: [] };
    const db = ctx.db();
    const [profiles2, follows2] = await Promise.all([db.select().from(profiles).orderBy(asc(profiles.displayName)), db.select().from(follows)]);
    const needle = args.query.trim().toLowerCase().replace(/^@/u, "");
    const activeIds = new Set(profiles2.filter(isActiveProfile).map((person) => person.id));
    const hiddenIds = await blockedIdsFor(ctx, viewer.id);
    const filtered = profiles2.filter((x) => x.id !== viewer.id && isActiveProfile(x) && !hiddenIds.has(x.id)).filter((x) => !needle || x.handle.toLowerCase().includes(needle) || x.displayName.toLowerCase().includes(needle)).slice(0, 30);
    return { profiles: await Promise.all(filtered.map(async (person) => ({ ...await publicProfile(ctx, person, viewer.id), viewerFollowing: person.isPrivate ? false : follows2.some((f) => f.followerId === viewer.id && f.followingId === person.id), followerCount: person.isPrivate ? 0 : follows2.filter((f) => f.followingId === person.id && activeIds.has(f.followerId)).length }))) };
  } }),
  toggleFollow: defineAction({ privileged: [privileged.appendGoogleSheetRow], request: object({ token: string2(), followingId: number2().int().positive() }), response: toggleResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer || viewer.id === args.followingId)
      return { active: false, count: 0 };
    const db = ctx.db();
    const [target] = await db.select().from(profiles).where(eq(profiles.id, args.followingId)).limit(1);
    if (!target || !isActiveProfile(target) || target.isPrivate || await blockedPair(ctx, viewer.id, target.id))
      return { active: false, count: 0 };
    const where = and(eq(follows.followerId, viewer.id), eq(follows.followingId, args.followingId));
    const [existing] = await db.select().from(follows).where(where).limit(1);
    if (existing) {
      await db.delete(follows).where(where);
      await db.delete(notifications).where(and(eq(notifications.actorId, viewer.id), eq(notifications.recipientId, args.followingId), eq(notifications.type, "follow")));
    } else {
      await db.insert(follows).values({ followerId: viewer.id, followingId: args.followingId });
      await db.insert(notifications).values({ recipientId: args.followingId, actorId: viewer.id, type: "follow", postId: null });
      const n = await pushName(ctx, viewer.id);
      sendPushNotification(ctx, args.followingId, `${n} started following you`, "Say hello!", { type: "follow", profileId: String(viewer.id) });
    }
    const count = (await db.select().from(follows).where(eq(follows.followingId, args.followingId))).length;
    const eventAt = new Date().toISOString();
    await queueGoogleSync(ctx, "follows", `${viewer.id}:${args.followingId}`, existing ? "delete" : "upsert", [viewer.id, args.followingId, existing?.createdAt.toISOString() ?? eventAt, existing ? "deleted" : "active", existing ? "delete" : "upsert", eventAt]);
    ctx.invalidateQueries();
    return { active: !existing, count };
  } }),
  listNotifications: defineAction({ request: object({ token: string2(), limit: number2().int().positive().max(50).default(30) }), response: object({ unreadCount: number2(), notifications: array(object({ id: number2(), type: visibleNotificationTypeSchema, postId: number2().nullable(), commentId: number2().nullable(), storyId: number2().nullable(), createdAt: string2(), read: boolean2(), actor: profileSchema })) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { unreadCount: 0, notifications: [] };
    const hiddenIds = await blockedIdsFor(ctx, viewer.id);
    const rows = (await ctx.db().select({ notification: notifications, actor: profiles }).from(notifications).innerJoin(profiles, eq(notifications.actorId, profiles.id)).where(and(eq(notifications.recipientId, viewer.id), ne(notifications.type, "message"))).orderBy(desc(notifications.createdAt), desc(notifications.id)).limit(args.limit)).filter(({ actor }) => isActiveProfile(actor) && !hiddenIds.has(actor.id));
    return { unreadCount: rows.filter((x) => x.notification.readAt === null).length, notifications: await Promise.all(rows.map(async ({ notification, actor }) => ({ id: notification.id, type: visibleNotificationTypeSchema.parse(notification.type), postId: notification.postId, commentId: notification.commentId, storyId: notification.storyId, createdAt: notification.createdAt.toISOString(), read: notification.readAt !== null, actor: await publicProfile(ctx, actor, viewer.id) }))) };
  } }),
  markNotificationsRead: defineAction({ request: object({ token: string2() }), response: object({ ok: literal(true) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (viewer)
      await ctx.db().update(notifications).set({ readAt: new Date }).where(and(eq(notifications.recipientId, viewer.id), isNull(notifications.readAt)));
    ctx.invalidateQueries();
    return { ok: true };
  } }),
  toggleBlock: defineAction({ request: object({ token: string2(), profileId: number2().int().positive() }), response: toggleResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer || viewer.id === args.profileId)
      return { active: false, count: 0 };
    const db = ctx.db();
    const where = and(eq(blocks.blockerId, viewer.id), eq(blocks.blockedId, args.profileId));
    const [existing] = await db.select().from(blocks).where(where).limit(1);
    if (existing)
      await db.delete(blocks).where(where);
    else {
      await db.insert(blocks).values({ blockerId: viewer.id, blockedId: args.profileId });
      await db.delete(follows).where(and(inArray(follows.followerId, [viewer.id, args.profileId]), inArray(follows.followingId, [viewer.id, args.profileId])));
      await db.delete(notifications).where(and(inArray(notifications.actorId, [viewer.id, args.profileId]), inArray(notifications.recipientId, [viewer.id, args.profileId])));
    }
    ctx.invalidateQueries();
    return { active: !existing, count: 0 };
  } }),
  reportUser: defineAction({
    request: object({ token: string2(), profileId: number2().int().positive(), reason: string2().max(50), details: string2().max(500).optional() }),
    response: object({ ok: boolean2() }),
    async handler(ctx, args) {
      const reporter = await approvedProfile(ctx, args.token);
      if (!reporter || reporter.id === args.profileId)
        return { ok: false };
      if (reporter.reportingSuspended)
        return { ok: false };
      const db = ctx.db();
      const [target] = await db.select().from(profiles).where(eq(profiles.id, args.profileId)).limit(1);
      if (!target)
        return { ok: false };
      await db.insert(reports).values({ reporterId: reporter.id, targetType: "account", targetId: args.profileId, reason: args.reason, details: args.details || null, status: "pending" });
      const [latestReport] = await db.select().from(reports).where(eq(reports.reporterId, reporter.id)).orderBy(desc(reports.id)).limit(1);
      if (latestReport) {
        triageReport(ctx, latestReport.id).catch(() => {});
      }
      return { ok: true };
    }
  }),
  reportPost: defineAction({
    request: object({ token: string2(), postId: number2().int().positive(), reason: string2().max(50), details: string2().max(500).optional() }),
    response: object({ ok: boolean2() }),
    async handler(ctx, args) {
      const reporter = await approvedProfile(ctx, args.token);
      if (!reporter)
        return { ok: false };
      if (reporter.reportingSuspended)
        return { ok: false };
      const db = ctx.db();
      const [post] = await db.select().from(posts).where(eq(posts.id, args.postId)).limit(1);
      if (!post)
        return { ok: false };
      await db.insert(reports).values({ reporterId: reporter.id, targetType: "post", targetId: args.postId, reason: args.reason, details: args.details || null, status: "pending" });
      const [latestReport] = await db.select().from(reports).where(eq(reports.reporterId, reporter.id)).orderBy(desc(reports.id)).limit(1);
      if (latestReport) {
        triageReport(ctx, latestReport.id).catch(() => {});
      }
      return { ok: true };
    }
  }),
  reportComment: defineAction({
    request: object({ token: string2(), commentId: number2().int().positive(), reason: string2().max(50), details: string2().max(500).optional() }),
    response: object({ ok: boolean2() }),
    async handler(ctx, args) {
      const reporter = await approvedProfile(ctx, args.token);
      if (!reporter)
        return { ok: false };
      if (reporter.reportingSuspended)
        return { ok: false };
      const db = ctx.db();
      const [comment] = await db.select().from(comments).where(eq(comments.id, args.commentId)).limit(1);
      if (!comment)
        return { ok: false };
      await db.insert(reports).values({ reporterId: reporter.id, targetType: "comment", targetId: args.commentId, reason: args.reason, details: args.details || null, status: "pending" });
      const [latestReport] = await db.select().from(reports).where(eq(reports.reporterId, reporter.id)).orderBy(desc(reports.id)).limit(1);
      if (latestReport) {
        triageReport(ctx, latestReport.id).catch(() => {});
      }
      return { ok: true };
    }
  }),
  getBlockedUsers: defineAction({ request: object({ token: string2() }), response: object({ users: array(profileSchema) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { users: [] };
    const db = ctx.db();
    const blockedIds = await blockedIdsFor(ctx, viewer.id);
    if (blockedIds.size === 0)
      return { users: [] };
    const rows = await db.select().from(profiles).where(inArray(profiles.id, [...blockedIds]));
    const users = [];
    for (const row of rows) {
      users.push(await publicProfile(ctx, row, viewer.id));
    }
    return { users };
  } }),
  createStory: defineAction({ request: object({ token: string2(), text: string2().trim().max(280), photo: object({ dataBase64: string2().min(1), mimeType: _enum(["image/jpeg", "image/png", "image/webp"]) }).nullable(), visibility: _enum(["everyone", "followers", "only_me"]).default("everyone"), bgColor: string2().regex(/^#[0-9a-fA-F]{6}$/).nullable().default(null) }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null };
    if (!args.text && !args.photo)
      return { status: "error", message: "Add a photo or a short message.", id: null };
    if (args.text) {
      const review = await moderateText(ctx, args.text);
      if (!review.allowed)
        return { status: "blocked", message: review.feedback || "Please rewrite this kindly.", id: null };
    }
    let blobKey = null;
    if (args.photo) {
      blobKey = `stories/${viewer.id}/${crypto.randomUUID()}`;
      await ctx.blobs.put(blobKey, decodeBase64(args.photo.dataBase64), { contentType: args.photo.mimeType });
    }
    const [story] = await ctx.db().insert(stories).values({ authorId: viewer.id, text: args.text || null, blobKey, expiresAt: new Date(Date.now() + 86400000), visibility: args.visibility, bgColor: args.bgColor }).returning({ id: stories.id });
    ctx.invalidateQueries();
    return { status: "ok", message: "Story shared for 24 hours.", id: story?.id ?? null };
  } }),
  deleteStory: defineAction({ request: object({ token: string2(), storyId: number2().int().positive() }), response: writeResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", id: null };
    const db = ctx.db();
    const [story] = await db.select().from(stories).where(eq(stories.id, args.storyId)).limit(1);
    if (!story || story.authorId !== viewer.id)
      return { status: "error", message: "You can only delete your own stories.", id: null };
    await db.delete(storyViews).where(eq(storyViews.storyId, args.storyId));
    await db.delete(storyReactions).where(eq(storyReactions.storyId, args.storyId));
    await db.delete(notifications).where(eq(notifications.storyId, args.storyId));
    await db.delete(stories).where(eq(stories.id, args.storyId));
    if (story.blobKey) {
      try {
        await ctx.blobs.delete(story.blobKey);
      } catch {}
    }
    ctx.invalidateQueries();
    return { status: "ok", message: "Story deleted.", id: args.storyId };
  } }),
  recordStoryView: defineAction({ request: object({ token: string2(), storyId: number2().int().positive() }), response: object({ ok: literal(true) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { ok: true };
    const db = ctx.db();
    const [story] = await db.select().from(stories).where(and(eq(stories.id, args.storyId), gt(stories.expiresAt, new Date))).limit(1);
    if (!story || story.authorId === viewer.id)
      return { ok: true };
    const [existing] = await db.select().from(storyViews).where(and(eq(storyViews.storyId, args.storyId), eq(storyViews.viewerId, viewer.id))).limit(1);
    if (existing)
      await db.update(storyViews).set({ viewedAt: new Date }).where(and(eq(storyViews.storyId, args.storyId), eq(storyViews.viewerId, viewer.id)));
    else
      await db.insert(storyViews).values({ storyId: args.storyId, viewerId: viewer.id });
    ctx.invalidateQueries();
    return { ok: true };
  } }),
  reactToStory: defineAction({ request: object({ token: string2(), storyId: number2().int().positive(), emoji: storyReactionSchema }), response: object({ status: _enum(["ok", "error"]), message: string2(), emoji: storyReactionSchema.nullable() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", emoji: null };
    const db = ctx.db();
    const [story] = await db.select().from(stories).where(and(eq(stories.id, args.storyId), gt(stories.expiresAt, new Date))).limit(1);
    if (!story || story.authorId === viewer.id)
      return { status: "error", message: "This story is not available for reactions.", emoji: null };
    const viewWhere = and(eq(storyViews.storyId, args.storyId), eq(storyViews.viewerId, viewer.id));
    if (!(await db.select().from(storyViews).where(viewWhere).limit(1))[0])
      await db.insert(storyViews).values({ storyId: args.storyId, viewerId: viewer.id });
    const reactionWhere = and(eq(storyReactions.storyId, args.storyId), eq(storyReactions.reactorId, viewer.id));
    const [existing] = await db.select().from(storyReactions).where(reactionWhere).limit(1);
    if (existing?.emoji === args.emoji) {
      await db.delete(storyReactions).where(reactionWhere);
      await db.delete(notifications).where(and(eq(notifications.actorId, viewer.id), eq(notifications.storyId, args.storyId), eq(notifications.type, "story_reaction")));
      ctx.invalidateQueries();
      return { status: "ok", message: "Reaction removed.", emoji: null };
    }
    if (existing)
      await db.update(storyReactions).set({ emoji: args.emoji, createdAt: new Date }).where(reactionWhere);
    else
      await db.insert(storyReactions).values({ storyId: args.storyId, reactorId: viewer.id, emoji: args.emoji });
    await db.delete(notifications).where(and(eq(notifications.actorId, viewer.id), eq(notifications.storyId, args.storyId), eq(notifications.type, "story_reaction")));
    await db.insert(notifications).values({ recipientId: story.authorId, actorId: viewer.id, type: "story_reaction", postId: null, storyId: args.storyId });
    const n = await pushName(ctx, viewer.id);
    sendPushNotification(ctx, story.authorId, `${n} reacted to your story`, args.emoji, { type: "story_reaction", profileId: String(viewer.id) });
    ctx.invalidateQueries();
    return { status: "ok", message: `Reacted ${args.emoji}`, emoji: args.emoji };
  } }),
  getStoryActivity: defineAction({ request: object({ token: string2(), storyId: number2().int().positive() }), response: object({ ownerOnly: boolean2(), views: array(object({ viewer: profileSchema, viewedAt: string2(), reaction: storyReactionSchema.nullable() })) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { ownerOnly: false, views: [] };
    const db = ctx.db();
    const [story] = await db.select().from(stories).where(eq(stories.id, args.storyId)).limit(1);
    if (!story || story.authorId !== viewer.id)
      return { ownerOnly: false, views: [] };
    const [viewRows, reactions] = await Promise.all([db.select({ view: storyViews, profile: profiles }).from(storyViews).innerJoin(profiles, eq(storyViews.viewerId, profiles.id)).where(eq(storyViews.storyId, args.storyId)).orderBy(desc(storyViews.viewedAt)), db.select().from(storyReactions).where(eq(storyReactions.storyId, args.storyId))]);
    return { ownerOnly: true, views: await Promise.all(viewRows.filter(({ profile }) => isActiveProfile(profile)).map(async ({ view, profile }) => ({ viewer: await publicProfile(ctx, profile, viewer.id), viewedAt: view.viewedAt.toISOString(), reaction: reactions.find((item) => item.reactorId === profile.id)?.emoji ?? null }))) };
  } }),
  listStories: defineAction({ request: object({ token: string2() }), response: object({ stories: array(storySchema) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { stories: [] };
    const db = ctx.db();
    const now = new Date;
    await db.delete(stories).where(lt(stories.expiresAt, now));
    const followed = await db.select({ id: follows.followingId }).from(follows).innerJoin(profiles, eq(follows.followingId, profiles.id)).where(and(eq(follows.followerId, viewer.id), eq(profiles.isPrivate, false)));
    const followedIds = new Set((await db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, viewer.id))).map((x) => x.id));
    const rows = (await db.select({ story: stories, author: profiles }).from(stories).innerJoin(profiles, eq(stories.authorId, profiles.id)).where(and(inArray(stories.authorId, [viewer.id, ...followed.map((x) => x.id)]), gt(stories.expiresAt, now))).orderBy(asc(stories.createdAt))).filter(({ author }) => isActiveProfile(author)).filter(({ story }) => story.visibility === "everyone" || story.authorId === viewer.id || story.visibility === "followers" && followedIds.has(story.authorId));
    const storyIds = rows.map(({ story }) => story.id);
    const reactions = storyIds.length > 0 ? await db.select().from(storyReactions).where(and(eq(storyReactions.reactorId, viewer.id), inArray(storyReactions.storyId, storyIds))) : [];
    return { stories: await Promise.all(rows.map(async ({ story, author }) => ({ id: story.id, text: story.text, imageUrl: story.blobKey ? await ctx.blobs.getUrl(story.blobKey) : null, createdAt: story.createdAt.toISOString(), expiresAt: story.expiresAt.toISOString(), author: await publicProfile(ctx, author, viewer.id), viewerReaction: reactions.find((item) => item.storyId === story.id)?.emoji ?? null, visibility: story.visibility, bgColor: story.bgColor }))) };
  } }),
  explore: defineAction({ request: object({ token: string2(), hashtag: string2().max(60).default("") }), response: object({ hashtags: array(object({ tag: string2(), count: number2() })), posts: array(postSchema) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { hashtags: [], posts: [] };
    const publicAuthors = (await ctx.db().select().from(profiles).where(eq(profiles.isPrivate, false))).filter(isActiveProfile).map((x) => x.id);
    const posts2 = await loadPosts(ctx, viewer.id, [...publicAuthors, viewer.id], 100);
    const counts = new Map;
    for (const post of posts2)
      for (const match of post.text.matchAll(/#([\p{L}\p{N}_]{2,40})/gu)) {
        const tag = (match[1] ?? "").toLowerCase();
        if (tag)
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    const needle = args.hashtag.trim().toLowerCase().replace(/^#/u, "");
    const filtered = needle ? posts2.filter((post) => Array.from(post.text.matchAll(/#([\p{L}\p{N}_]{2,40})/gu)).some((match) => (match[1] ?? "").toLowerCase().includes(needle))) : [...posts2].sort((a, b) => b.likeCount + b.commentCount + b.repostCount - (a.likeCount + a.commentCount + a.repostCount)).slice(0, 30);
    return { hashtags: [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count })), posts: filtered };
  } }),
  listPendingApprovals: defineAction({ request: object({ token: string2() }), response: object({ profiles: array(accountProfileSchema) }), async handler(ctx, args) {
    const viewer = await authenticatedProfile(ctx, args.token);
    if (!viewer?.isFounder)
      return { profiles: [] };
    const rows = await ctx.db().select().from(profiles).where(eq(profiles.approvalStatus, "pending")).orderBy(asc(profiles.createdAt));
    return { profiles: await Promise.all(rows.map((row) => accountProfile(ctx, row))) };
  } }),
  reviewApproval: defineAction({ request: object({ token: string2(), profileId: number2().int().positive(), decision: _enum(["approved", "declined"]) }), response: object({ status: _enum(["ok", "error"]), message: string2() }), async handler(ctx, args) {
    const viewer = await authenticatedProfile(ctx, args.token);
    if (!viewer?.isFounder)
      return { status: "error", message: "Only the Gola creator can review signups." };
    const db = ctx.db();
    const [target] = await db.select().from(profiles).where(eq(profiles.id, args.profileId)).limit(1);
    if (!target)
      return { status: "error", message: "That account could not be found." };
    if (target.approvalStatus === args.decision)
      return { status: "ok", message: "That decision was already recorded." };
    await db.update(profiles).set({ approvalStatus: args.decision }).where(eq(profiles.id, target.id));
    if (args.decision === "approved") {
      await db.insert(notifications).values({ recipientId: target.id, actorId: viewer.id, type: "approval", postId: null });
    } else {
      await db.delete(sessions).where(eq(sessions.profileId, target.id));
    }
    ctx.invalidateQueries();
    return { status: "ok", message: args.decision === "approved" ? `@${target.handle} was approved. Welcome to Gola!` : `@${target.handle} was declined.` };
  } }),
  setMentionPrivacy: defineAction({ request: object({ token: string2(), privacy: _enum(["everyone", "peopleIFollow", "off"]) }), response: preferenceResponse, async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { status: "error", message: "Please log in again.", profile: null };
    const [updated] = await ctx.db().update(profiles).set({ mentionPrivacy: args.privacy }).where(eq(profiles.id, viewer.id)).returning();
    if (!updated)
      return { status: "error", message: "Your mention setting could not be saved.", profile: await accountProfile(ctx, viewer) };
    ctx.invalidateQueries();
    return { status: "ok", message: "Mention privacy updated.", profile: await accountProfile(ctx, updated) };
  } }),
  checkMentions: defineAction({ request: object({ token: string2(), handles: array(string2().trim().max(30)).max(20) }), response: object({ results: array(object({ handle: string2(), linkable: boolean2(), notify: boolean2() })) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { results: [] };
    const db = ctx.db();
    const clean = [...new Set(args.handles.map((h) => h.toLowerCase().replace(/^@/u, "")).filter((h) => /^[a-z0-9_]{3,24}$/u.test(h)))];
    if (!clean.length)
      return { results: [] };
    const people = await db.select().from(profiles).where(inArray(profiles.handle, clean));
    return { results: await Promise.all(clean.map(async (handle) => {
      const person = people.find((row) => row.handle === handle);
      if (!person || person.id === viewer.id || !isActiveProfile(person))
        return { handle, linkable: false, notify: false };
      const allowed = await mentionAllowed(ctx, viewer.id, person) && !await blockedPair(ctx, viewer.id, person.id);
      return { handle, linkable: allowed, notify: allowed };
    })) };
  } }),
  listGlobalFeed: defineAction({ request: object({ token: string2(), limit: number2().int().positive().max(50).default(30), cursor: number2().int().positive().nullable().default(null) }), response: object({ posts: array(postSchema), nextCursor: number2().nullable() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { posts: [], nextCursor: null };
    const db = ctx.db();
    const publicIds = (await db.select().from(profiles).where(eq(profiles.isPrivate, false))).filter(isActiveProfile).map((x) => x.id);
    const authorIds = [...new Set([...publicIds, viewer.id])];
    let cursorFilter;
    if (args.cursor) {
      const [c] = await db.select({ createdAt: posts.createdAt }).from(posts).where(eq(posts.id, args.cursor)).limit(1);
      if (c?.createdAt)
        cursorFilter = or(lt(posts.createdAt, c.createdAt), and(eq(posts.createdAt, c.createdAt), lt(posts.id, args.cursor)));
    }
    const page = await db.select({ id: posts.id }).from(posts).where(cursorFilter ? and(inArray(posts.authorId, authorIds), cursorFilter) : inArray(posts.authorId, authorIds)).orderBy(desc(posts.createdAt), desc(posts.id)).limit(args.limit + 1);
    const ids = page.slice(0, args.limit).map((row) => row.id);
    return { posts: await loadPosts(ctx, viewer.id, authorIds, args.limit, ids), nextCursor: page.length > args.limit ? ids[ids.length - 1] ?? null : null };
  } }),
  startDiscordOAuth: defineAction({ request: object({ redirectUri: string2().url().max(500) }), response: object({ status: _enum(["ok", "error"]), message: string2().nullable(), url: string2().nullable() }), async handler(ctx, args) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId)
      return { status: "error", message: "Discord sign-in is not configured yet.", url: null };
    const url = `https://discord.com/oauth2/authorize?${new URLSearchParams({ client_id: clientId, redirect_uri: args.redirectUri, response_type: "code", scope: "identify email" }).toString()}`;
    return { status: "ok", message: null, url };
  } }),
  completeDiscordOAuth: defineAction({ request: object({ code: string2().min(1).max(500), redirectUri: string2().url().max(500) }), response: authResponse, async handler(ctx, args) {
    const fail = (message) => ({ status: "error", message, token: null, profile: null });
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      return fail("Discord sign-in is not configured yet.");
    let accessToken = null;
    try {
      const res = await fetch("https://discord.com/api/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code: args.code, redirect_uri: args.redirectUri }).toString() });
      if (!res.ok)
        return fail("Discord sign-in failed. Please try again.");
      const data = await res.json();
      accessToken = typeof data.access_token === "string" ? data.access_token : null;
    } catch {
      return fail("Discord could not be reached. Please try again.");
    }
    if (!accessToken)
      return fail("Discord sign-in failed. Please try again.");
    let discordId = "";
    let discordName = "discord_user";
    let discordEmail = null;
    try {
      const res = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok)
        return fail("Discord sign-in failed. Please try again.");
      const data = await res.json();
      if (typeof data.id !== "string" || !data.id)
        return fail("Discord sign-in failed. Please try again.");
      discordId = data.id;
      if (typeof data.username === "string" && data.username)
        discordName = data.username;
      if (typeof data.email === "string")
        discordEmail = data.email;
    } catch {
      return fail("Discord could not be reached. Please try again.");
    }
    const db = ctx.db();
    let [profile] = await db.select().from(profiles).where(eq(profiles.discordUserId, discordId)).limit(1);
    if (!profile && discordEmail) {
      const [byEmail] = await db.select().from(profiles).where(eq(profiles.email, discordEmail.toLowerCase())).limit(1);
      if (byEmail) {
        const [linked] = await db.update(profiles).set({ discordUserId: discordId }).where(eq(profiles.id, byEmail.id)).returning();
        if (linked)
          profile = linked;
      }
    }
    if (!profile) {
      const base = discordName.toLowerCase().replace(/[^a-z0-9_]/gu, "").slice(0, 20) || "discord_user";
      let handle = base;
      for (let attempt = 0;attempt < 10; attempt += 1) {
        const candidate = attempt === 0 ? base : `${base}${Math.floor(100 + Math.random() * 900)}`.slice(0, 24);
        const [taken] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.handle, candidate)).limit(1);
        if (!taken) {
          handle = candidate;
          break;
        }
      }
      const [created] = await db.insert(profiles).values({ email: discordEmail?.toLowerCase() ?? null, displayName: discordName.slice(0, 40), handle, discordUserId: discordId, approvalStatus: "approved", continent: "AS" }).returning();
      if (!created)
        return fail("The account could not be created.");
      profile = created;
    }
    if (profile.approvalStatus === "declined")
      return fail("This account request was not approved.");
    const token = await createSession(ctx, profile.id);
    ctx.invalidateQueries();
    return { status: "ok", message: null, token, profile: await accountProfile(ctx, profile) };
  } }),
  signInWithGoogle: defineAction({ request: object({ idToken: string2().min(1).max(5000) }), response: authResponse, async handler(ctx, args) {
    const fail = (message) => ({ status: "error", message, token: null, profile: null });
    let info;
    try {
      const res = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(args.idToken));
      if (!res.ok)
        return fail("Google sign-in failed. Please try again.");
      info = await res.json();
    } catch {
      return fail("Google could not be reached. Please try again.");
    }
    const iss = info?.iss;
    const sub = info?.sub;
    if (iss !== "https://accounts.google.com" && iss !== "accounts.google.com" || typeof sub !== "string" || !sub)
      return fail("Google sign-in failed. Please try again.");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && info?.aud !== clientId)
      return fail("Google sign-in failed. Please try again.");
    const googleEmail = typeof info?.email === "string" ? info.email.toLowerCase() : null;
    const googleName = typeof info?.name === "string" && info.name ? info.name : "google_user";
    const db = ctx.db();
    let [profile] = await db.select().from(profiles).where(eq(profiles.googleSub, sub)).limit(1);
    if (!profile && googleEmail) {
      const [byEmail] = await db.select().from(profiles).where(eq(profiles.email, googleEmail)).limit(1);
      if (byEmail) {
        const [linked] = await db.update(profiles).set({ googleSub: sub }).where(eq(profiles.id, byEmail.id)).returning();
        if (linked)
          profile = linked;
      }
    }
    if (!profile) {
      const base = googleName.toLowerCase().replace(/[^a-z0-9_]/gu, "").slice(0, 20) || "google_user";
      let handle = base;
      for (let attempt = 0;attempt < 10; attempt += 1) {
        const candidate = attempt === 0 ? base : `${base}${Math.floor(100 + Math.random() * 900)}`.slice(0, 24);
        const [taken] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.handle, candidate)).limit(1);
        if (!taken) {
          handle = candidate;
          break;
        }
      }
      const [created] = await db.insert(profiles).values({ email: googleEmail, displayName: googleName.slice(0, 40), handle, googleSub: sub, approvalStatus: "approved", continent: "AS" }).returning();
      if (!created)
        return fail("The account could not be created.");
      profile = created;
    }
    if (profile.approvalStatus === "declined")
      return fail("This account request was not approved.");
    const token = await createSession(ctx, profile.id);
    ctx.invalidateQueries();
    return { status: "ok", message: null, token, profile: await accountProfile(ctx, profile) };
  } }),
  registerPushToken: defineAction({ request: object({ token: string2(), pushToken: string2().min(1).max(500), platform: _enum(["android", "ios", "web"]).default("android") }), response: object({ ok: literal(true) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (viewer) {
      const db = ctx.db();
      const [existing] = await db.select({ id: pushTokens.id }).from(pushTokens).where(eq(pushTokens.pushToken, args.pushToken)).limit(1);
      if (existing)
        await db.update(pushTokens).set({ profileId: viewer.id, platform: args.platform, createdAt: new Date }).where(eq(pushTokens.id, existing.id));
      else
        await db.insert(pushTokens).values({ profileId: viewer.id, pushToken: args.pushToken, platform: args.platform });
    }
    ctx.invalidateQueries();
    return { ok: true };
  } }),
  unregisterPushToken: defineAction({ request: object({ token: string2(), pushToken: string2().min(1).max(500) }), response: object({ ok: literal(true) }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (viewer)
      await ctx.db().delete(pushTokens).where(and(eq(pushTokens.profileId, viewer.id), eq(pushTokens.pushToken, args.pushToken)));
    ctx.invalidateQueries();
    return { ok: true };
  } }),
  getPushStatus: defineAction({ request: object({ token: string2() }), response: object({ fcmConfigured: boolean2(), tokenCount: number2() }), async handler(ctx, args) {
    const viewer = await approvedProfile(ctx, args.token);
    if (!viewer)
      return { fcmConfigured: false, tokenCount: 0 };
    const sa = getFcmServiceAccount();
    const db = ctx.db();
    const tokens = await db.select({ id: pushTokens.id }).from(pushTokens).where(eq(pushTokens.profileId, viewer.id));
    return { fcmConfigured: !!sa, tokenCount: tokens.length };
  } })
};
export {
  Actions
};
