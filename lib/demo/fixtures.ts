/**
 * Fixtures for the interactive demos under /demo/.
 *
 * Every file under lib/data/demo/fixtures/ is a byte-for-byte copy of the
 * NovaFabric repository's showcase fixtures at the v0.104.0 release
 * (`web/src/data/fixtures/`, commit 13bb078), except lineage.json, which is
 * lineage.jsonl rewritten as one JSON array so it can be imported without a
 * raw-text loader. They are bundled at build time; nothing is fetched at runtime.
 *
 * The fixtures were produced by the product, but this page does not re-run it:
 * refresh the copies when the formats change (see README "Demo fixtures").
 */
import registryJson from "@/lib/data/demo/fixtures/registry.json";
import diffJson from "@/lib/data/demo/fixtures/diff-A-vs-B.json";
import dsseStatement from "@/lib/data/demo/fixtures/evidence-bundle/dsse-statement.json";
import predicate from "@/lib/data/demo/fixtures/evidence-bundle/predicate.json";
import manifest from "@/lib/data/demo/fixtures/evidence-bundle/manifest.json";
import publicKey from "@/lib/data/demo/fixtures/evidence-bundle/public-key.json";
import lineageJson from "@/lib/data/demo/fixtures/lineage.json";

export interface AssetRecord {
  name: string;
  version: string;
  asset_type: "model" | "prompt" | "tool" | "dataset" | "agent" | "evaluation" | "deployment";
  status: "development" | "promoted";
  description: string;
  spec: Record<string, unknown>;
}

export interface EvalResult {
  asset: string;
  suite: string;
  passed: boolean;
  score: number | null;
}

export interface RegistryFixture {
  schema_version: string;
  assets: AssetRecord[];
  eval_results: EvalResult[];
}

export interface LineageEdgeRecord {
  edge_id: string;
  edge_type:
    | "consumed"
    | "produced_by"
    | "replayed_from"
    | "evaluated_by"
    | "derived_from"
    | "attested_by"
    | "contains"
    | "delegated_to"
    | "spawned";
  source: string;
  target: string;
  capsule_run_id: string;
  confidence: string;
  created_at: string;
  direction: string;
}

export interface DiffReport {
  schema_version: string;
  run_a_id: string;
  run_b_id: string;
  summary: { changed: number; added: number; removed: number };
  sections: {
    environment: { changes: Array<{ field: string; before: unknown; after: unknown; severity: string }> };
    model_calls: {
      aligned: number;
      changed: number;
      added: number;
      removed: number;
      pairs: Array<{
        index: number;
        a_call_id: string;
        b_call_id: string;
        changes: Array<{ field: string; before: string; after: string; severity: string }>;
      }>;
    };
    tool_calls: {
      aligned: number;
      changed?: number;
      added?: number;
      removed?: number;
      pairs: Array<{
        tool_name?: string;
        tool_call_id_a?: string;
        tool_call_id_b?: string;
        changed?: boolean;
        added?: boolean;
        removed?: boolean;
        result_changed?: boolean;
        mutation_class?: string;
      }>;
    };
    outputs: { changes: Array<{ path: string; before_hash: string | null; after_hash: string | null; severity?: string }> };
  };
}

export const registry = registryJson as RegistryFixture;
export const lineageEdges = lineageJson as LineageEdgeRecord[];
export const diffReport = diffJson as unknown as DiffReport;

export const evidenceBundle = {
  dsse: dsseStatement,
  predicate,
  manifest,
  publicKeyPem: publicKey.pubPem,
};
