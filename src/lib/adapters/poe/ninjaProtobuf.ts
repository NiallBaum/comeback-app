type FieldKind = "scalar" | "message" | "map";

interface FieldDef {
  name: string;
  kind: FieldKind;
  message?: string; // name of nested message type, when kind === "message"
  repeated?: boolean;
}

type MessageSchema = Record<number, FieldDef>; // field number -> definition


function readVarint(buf: Buffer, pos: number): [bigint, number] {
  let result = BigInt(0);
  let shift = BigInt(0);
  let byte: number;
  do {
    byte = buf[pos++];
    result |= BigInt(byte & 0x7f) << shift;
    shift += BigInt(7);
  } while (byte & 0x80);
  return [result, pos];
}

function decodeMessage(
  buf: Buffer,
  schema: MessageSchema,
  registry: Record<string, MessageSchema>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let pos = 0;

  while (pos < buf.length) {
    let tagBig: bigint;
    [tagBig, pos] = readVarint(buf, pos);
    const tag = Number(tagBig);
    const fieldNumber = tag >>> 3;
    const wireType = tag & 7;
    const fieldDef = schema[fieldNumber];

    let value: unknown;
    if (wireType === 0) {
      let v: bigint;
      [v, pos] = readVarint(buf, pos);
      value = Number(v);
    } else if (wireType === 1) {
      value = buf.readDoubleLE(pos);
      pos += 8;
    } else if (wireType === 2) {
      let lenBig: bigint;
      [lenBig, pos] = readVarint(buf, pos);
      const len = Number(lenBig);
      const slice = buf.subarray(pos, pos + len);
      pos += len;

      if (fieldDef?.kind === "message") {
        value = decodeMessage(slice, registry[fieldDef.message!], registry);
      } else if (fieldDef?.kind === "map") {
        value = decodeMessage(slice, MAP_ENTRY_SCHEMA, registry);
      } else {
        value = slice.toString("utf8");
      }
    } else {
      throw new Error(`unsupported wire type ${wireType} for field ${fieldNumber}`);
    }

    if (!fieldDef) continue; // unknown field, skip

    if (fieldDef.repeated || fieldDef.kind === "map") {
      const arr = (out[fieldDef.name] as unknown[]) ?? [];
      arr.push(value);
      out[fieldDef.name] = arr;
    } else {
      out[fieldDef.name] = value;
    }
  }

  return out;
}

const MAP_ENTRY_SCHEMA: MessageSchema = {
  1: { name: "key", kind: "scalar" },
  2: { name: "value", kind: "scalar" },
};

const REGISTRY: Record<string, MessageSchema> = {
  NinjaSearchResult: {
    1: { name: "result", kind: "message", message: "SearchResult" },
  },
  SearchResult: {
    1: { name: "total", kind: "scalar" },
    2: { name: "dimensions", kind: "message", message: "SearchResultDimension", repeated: true },
    3: { name: "integerDimensions", kind: "message", message: "SearchResultIntegerDimension", repeated: true },
    4: { name: "performancePoints", kind: "message", message: "SearchResultPerformance", repeated: true },
    5: { name: "valueLists", kind: "message", message: "SearchResultValueList", repeated: true },
    6: { name: "dictionaries", kind: "message", message: "SearchResultDictionaryReference", repeated: true },
    7: { name: "fields", kind: "message", message: "SearchResultField", repeated: true },
    8: { name: "sections", kind: "message", message: "SearchResultSection", repeated: true },
    9: { name: "fieldDescriptors", kind: "message", message: "SearchResultFieldDescriptor", repeated: true },
    10: { name: "defaultFieldIds", kind: "scalar", repeated: true },
    11: { name: "floatDimensions", kind: "message", message: "SearchResultFloatDimension", repeated: true },
  },
  SearchResultField: {
    1: { name: "id", kind: "scalar" },
    2: { name: "type", kind: "scalar" },
    3: { name: "name", kind: "scalar" },
    4: { name: "valueListIds", kind: "scalar", repeated: true },
    5: { name: "sortId", kind: "scalar" },
    6: { name: "integerDimensionId", kind: "scalar" },
    7: { name: "properties", kind: "map" },
    8: { name: "mainFieldId", kind: "scalar" },
    9: { name: "description", kind: "scalar" },
    10: { name: "group", kind: "scalar" },
    11: { name: "pinned", kind: "scalar" },
  },
  SearchResultSection: {
    1: { name: "id", kind: "scalar" },
    2: { name: "type", kind: "scalar" },
    3: { name: "name", kind: "scalar" },
    4: { name: "dimensionId", kind: "scalar" },
    5: { name: "properties", kind: "map" },
  },
  SearchResultDimension: {
    1: { name: "id", kind: "scalar" },
    2: { name: "dictionaryId", kind: "scalar" },
    3: { name: "counts", kind: "message", message: "SearchResultDimensionCount", repeated: true },
  },
  SearchResultDimensionCount: {
    1: { name: "key", kind: "scalar" },
    2: { name: "count", kind: "scalar" },
  },
  SearchResultIntegerDimension: {
    1: { name: "id", kind: "scalar" },
    2: { name: "minValue", kind: "scalar" },
    3: { name: "maxValue", kind: "scalar" },
  },
  SearchResultFloatDimension: {
    1: { name: "id", kind: "scalar" },
    2: { name: "minValue", kind: "scalar" },
    3: { name: "maxValue", kind: "scalar" },
  },
  SearchResultPerformance: {
    1: { name: "name", kind: "scalar" },
    2: { name: "ms", kind: "scalar" },
  },
  SearchResultValueList: {
    1: { name: "id", kind: "scalar" },
    2: { name: "values", kind: "message", message: "SearchResultValue", repeated: true },
  },
  SearchResultValue: {
    1: { name: "str", kind: "scalar" },
    2: { name: "number", kind: "scalar" },
    3: { name: "numbers", kind: "scalar", repeated: true },
    4: { name: "strs", kind: "scalar", repeated: true },
    5: { name: "boolean", kind: "scalar" },
  },
  SearchResultDictionaryReference: {
    1: { name: "id", kind: "scalar" },
    2: { name: "hash", kind: "scalar" },
  },
  SearchResultFieldDescriptor: {
    1: { name: "id", kind: "scalar" },
    2: { name: "name", kind: "scalar" },
    3: { name: "optional", kind: "scalar" },
    4: { name: "description", kind: "scalar" },
    5: { name: "group", kind: "scalar" },
    6: { name: "pinned", kind: "scalar" },
  },
  SearchResultDictionary: {
    1: { name: "id", kind: "scalar" },
    2: { name: "values", kind: "scalar", repeated: true },
    3: { name: "properties", kind: "message", message: "SearchResultDictionaryProperty", repeated: true },
  },
  SearchResultDictionaryProperty: {
    1: { name: "id", kind: "scalar" },
    2: { name: "values", kind: "scalar", repeated: true },
  },
};

export interface NinjaDictionary {
  id: string;
  values: string[];
}

export function decodeDictionary(buf: Buffer): NinjaDictionary {
  const raw = decodeMessage(buf, REGISTRY.SearchResultDictionary, REGISTRY);
  return {
    id: raw.id as string,
    values: (raw.values as string[]) ?? [],
  };
}

export interface SearchValue {
  str?: string;
  number?: number;
  numbers?: number[];
  strs?: string[];
  boolean?: boolean;
}

export interface SearchField {
  id: string;
  type: string;
  name: string;
  valueListIds: string[];
}

export interface DictionaryRef {
  id: string;
  hash: string;
}

export interface DecodedSearchResult {
  total: number;
  fields: SearchField[];
  valueLists: Record<string, SearchValue[]>;
  dictionaryRefs: DictionaryRef[];
}

export function decodeSearchResult(buf: Buffer): DecodedSearchResult {
  const raw = decodeMessage(buf, REGISTRY.NinjaSearchResult, REGISTRY);
  const result = raw.result as Record<string, unknown>;

  const fields = ((result.fields as Record<string, unknown>[]) ?? []).map((f) => ({
    id: f.id as string,
    type: f.type as string,
    name: f.name as string,
    valueListIds: (f.valueListIds as string[]) ?? [],
  }));

  const valueLists: Record<string, SearchValue[]> = {};
  for (const vl of (result.valueLists as Record<string, unknown>[]) ?? []) {
    valueLists[vl.id as string] = (vl.values as SearchValue[]) ?? [];
  }

  const dictionaryRefs = ((result.dictionaries as Record<string, unknown>[]) ?? []).map((d) => ({
    id: d.id as string,
    hash: d.hash as string,
  }));

  return {
    total: result.total as number,
    fields,
    valueLists,
    dictionaryRefs,
  };
}

export function parseDpsString(str: string | undefined) : number {
  if (!str) return 0
  const match = str.match(/^([\d.]+)([kMB]?)$/);
  if (!match) return 0
  const [, numStr, suffix] = match
  const multiplier: Record<string, number> = { k: 1e3, M: 1e6, B: 1e9 };

  return parseFloat(numStr) * (multiplier[suffix] ?? 1);
}
