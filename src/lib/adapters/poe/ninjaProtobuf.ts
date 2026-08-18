type FieldKind = "scalar" | "message" | "map" | "packedVarint";

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

function decodePackedVarints(buf: Buffer): number[] {
  const values: number[] = [];
  let pos = 0;
  while (pos < buf.length) {
    let v: bigint;
    [v, pos] = readVarint(buf, pos);
    values.push(Number(v));
  }
  return values;
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
      } else if (fieldDef?.kind === "packedVarint") {
        value = decodePackedVarints(slice);
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
    6: { name: "dictionaries", kind: "message", message: "SearchResultDictionaryReference", repeated: true },
    7: { name: "fields", kind: "message", message: "SearchResultField", repeated: true },
    8: { name: "sections", kind: "message", message: "SearchResultSection", repeated: true },
    9: { name: "fieldDescriptors", kind: "message", message: "SearchResultFieldDescriptor", repeated: true },
    10: { name: "defaultFieldIds", kind: "scalar", repeated: true },
    11: { name: "floatDimensions", kind: "message", message: "SearchResultFloatDimension", repeated: true },
    12: { name: "columns", kind: "message", message: "SearchResultColumn", repeated: true },
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
  // Replaces the old SearchResultValueList/SearchResultValue shape — poe.ninja moved from
  // named value-lists to a self-describing columnar layout (one SearchResultColumn per
  // field, values aligned by row index across columns). Fields 3/4/5/13 exist on the wire
  // (variant/type markers, row count) but aren't needed by anything we read today.
  SearchResultColumn: {
    1: { name: "id", kind: "scalar" },
    2: { name: "group", kind: "scalar" },
    6: { name: "intValues", kind: "packedVarint" },
    7: { name: "stringValues", kind: "scalar", repeated: true },
    9: { name: "listValues", kind: "message", message: "SearchResultIntList", repeated: true },
    11: { name: "dictionaryHash", kind: "scalar" },
  },
  SearchResultIntList: {
    1: { name: "values", kind: "packedVarint" },
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

// A column's payload lands in exactly one of these three, depending on the value type
// poe.ninja sent it as (string text, plain/dictionary-encoded ints, or a per-row list of
// ints — e.g. a character's equipped skill gems).
export interface DecodedColumn {
  id: string;
  group: string;
  dictionaryHash?: string;
  stringValues?: string[];
  intValues?: number[];
  listValues?: number[][];
}

export interface DecodedSearchResult {
  total: number;
  columns: Record<string, DecodedColumn>;
}

export function decodeSearchResult(buf: Buffer): DecodedSearchResult {
  const raw = decodeMessage(buf, REGISTRY.NinjaSearchResult, REGISTRY);
  const result = raw.result as Record<string, unknown>;

  const columns: Record<string, DecodedColumn> = {};
  for (const col of (result.columns as Record<string, unknown>[]) ?? []) {
    const id = col.id as string;
    columns[id] = {
      id,
      group: col.group as string,
      dictionaryHash: col.dictionaryHash as string | undefined,
      stringValues: col.stringValues as string[] | undefined,
      intValues: col.intValues as number[] | undefined,
      listValues: (col.listValues as { values?: number[] }[] | undefined)?.map((l) => l.values ?? []),
    };
  }

  return {
    total: result.total as number,
    columns,
  };
}

// The "dps" column group gets renamed to "dps-<Skill Name>" whenever a search is filtered
// by skill (poe.ninja's same dynamic-field-name behavior as before, just baked into the
// column id now instead of a separate fields[] lookup) — so match by prefix/suffix rather
// than a fixed id.
export function findDpsTotalColumn(result: DecodedSearchResult): DecodedColumn | undefined {
  return Object.values(result.columns).find(
    (c) => c.group.startsWith("dps") && c.id.endsWith(".total")
  );
}

export function parseDpsString(str: string | undefined) : number {
  if (!str) return 0
  const match = str.match(/^([\d.]+)([kMB]?)$/);
  if (!match) return 0
  const [, numStr, suffix] = match
  const multiplier: Record<string, number> = { k: 1e3, M: 1e6, B: 1e9 };

  return parseFloat(numStr) * (multiplier[suffix] ?? 1);
}
