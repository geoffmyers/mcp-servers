// Tests for the sed_preview / sed_replace flag-appending and -i handling in
// ../src/tools/sed.ts. Runs against the BUILT output (`../dist/tools/sed.js`)
// with `node --test`, so `npm run build` must run first (see package.json's
// "test" script, or the workspace-root "build" then "test" scripts).
//
// The integration tests below shell out to the REAL local `sed` binary. In
// the published project's CI container (node:22-bookworm, Debian) that is
// GNU sed, which is the exact case the fix addresses: `sed_replace` used to
// pass `-i <suffix>` as two arguments (a BSD/macOS form) and silently
// mis-append the global/case_insensitive flags into the replacement text
// instead of after the pattern's final delimiter. Both bugs are covered by
// regression tests here.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execute } from "@geoffmyers/mcp-server-shared";
import {
  appendSedFlags,
  parseSedSubstitution,
  buildInPlaceArgs,
  isGnuSed,
} from "../dist/tools/sed.js";

function makeTempFile(content) {
  const dir = mkdtempSync(join(tmpdir(), "sed-mcp-test-"));
  const file = join(dir, "input.txt");
  writeFileSync(file, content);
  return { dir, file };
}

test("parseSedSubstitution splits a plain slash pattern", () => {
  const parsed = parseSedSubstitution("s/old/new/");
  assert.deepEqual(parsed, { delimiter: "/", regex: "old", replacement: "new", flags: "" });
});

test("parseSedSubstitution keeps existing trailing flags", () => {
  const parsed = parseSedSubstitution("s/old/new/g");
  assert.deepEqual(parsed, { delimiter: "/", regex: "old", replacement: "new", flags: "g" });
});

test("parseSedSubstitution supports a non-slash delimiter", () => {
  const parsed = parseSedSubstitution("s|a/b|c/d|");
  assert.deepEqual(parsed, { delimiter: "|", regex: "a/b", replacement: "c/d", flags: "" });
});

test("parseSedSubstitution respects an escaped delimiter", () => {
  const parsed = parseSedSubstitution("s/a\\/b/c/");
  assert.deepEqual(parsed, { delimiter: "/", regex: "a\\/b", replacement: "c", flags: "" });
});

test("parseSedSubstitution returns null for a malformed pattern", () => {
  assert.equal(parseSedSubstitution("s/only-one-delimiter"), null);
  assert.equal(parseSedSubstitution("not-a-substitution"), null);
  assert.equal(parseSedSubstitution(""), null);
});

test("appendSedFlags is a no-op when no flags are requested", () => {
  const result = appendSedFlags("s/old/new/", []);
  assert.deepEqual(result, { pattern: "s/old/new/" });
});

test("appendSedFlags appends after the trailing delimiter, not before it (regression)", () => {
  // The original bug spliced the flag into the replacement text:
  // "s/old/new/" + ["g"] -> "s/old/newg/" (wrong: replaces with "newg", no g flag).
  const result = appendSedFlags("s/old/new/", ["g"]);
  assert.deepEqual(result, { pattern: "s/old/new/g" });
});

test("appendSedFlags merges with and de-duplicates existing flags", () => {
  const result = appendSedFlags("s/old/new/g", ["g", "I"]);
  assert.deepEqual(result, { pattern: "s/old/new/gI" });
});

test("appendSedFlags works with a non-slash delimiter", () => {
  const result = appendSedFlags("s|a/b|c/d|", ["g"]);
  assert.deepEqual(result, { pattern: "s|a/b|c/d|g" });
});

test("appendSedFlags returns an explicit error instead of silently dropping flags", () => {
  const result = appendSedFlags("s/only-one-delimiter", ["g"]);
  assert.ok("error" in result, "expected an error, not a silently-unmodified pattern");
  assert.match(result.error, /not a recognised/);
});

test("buildInPlaceArgs: non-empty suffix is always attached (GNU and BSD)", () => {
  assert.deepEqual(buildInPlaceArgs(".bak", true), ["-i.bak"]);
  assert.deepEqual(buildInPlaceArgs(".bak", false), ["-i.bak"]);
  assert.deepEqual(buildInPlaceArgs("~", true), ["-i~"]);
});

test("buildInPlaceArgs: empty suffix differs between GNU (bare -i) and BSD (-i '')", () => {
  assert.deepEqual(buildInPlaceArgs("", true), ["-i"]);
  assert.deepEqual(buildInPlaceArgs("", false), ["-i", ""]);
});

test("isGnuSed detects the real local sed (GNU on the node:22-bookworm CI image)", async () => {
  const gnu = await isGnuSed();
  assert.equal(typeof gnu, "boolean");
  if (process.platform === "linux") {
    // Debian/Ubuntu (incl. the node:*-bookworm CI image) ship GNU sed.
    assert.equal(gnu, true, "expected GNU sed on Linux");
  }
});

test("integration: sed -i with the global flag actually replaces every match (regression)", async () => {
  const { dir, file } = makeTempFile("old old old\nold\n");
  try {
    const appended = appendSedFlags("s/old/new/", ["g"]);
    assert.ok("pattern" in appended);
    const gnu = await isGnuSed();
    const args = [...buildInPlaceArgs("", gnu), appended.pattern, file];
    const result = await execute("sed", args);
    assert.equal(result.exitCode, 0, result.stderr);
    const content = readFileSync(file, "utf8");
    // Before the fix this would have produced "newg old old\nnewg\n" (the
    // flag spliced into the replacement, only the first match on each line
    // touched) instead of every "old" becoming "new".
    assert.equal(content, "new new new\nnew\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("integration: empty backup_suffix leaves no backup file and edits in place", async () => {
  const { dir, file } = makeTempFile("hello world\n");
  try {
    const appended = appendSedFlags("s/hello/goodbye/", []);
    assert.ok("pattern" in appended);
    const gnu = await isGnuSed();
    const args = [...buildInPlaceArgs("", gnu), appended.pattern, file];
    const result = await execute("sed", args);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.equal(readFileSync(file, "utf8"), "goodbye world\n");
    assert.equal(existsSync(`${file}`), true);
    assert.equal(existsSync(`${file}.bak`), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("integration: non-empty backup_suffix creates a backup with the original content", async () => {
  const { dir, file } = makeTempFile("hello world\n");
  try {
    const appended = appendSedFlags("s/hello/goodbye/", []);
    assert.ok("pattern" in appended);
    const gnu = await isGnuSed();
    const args = [...buildInPlaceArgs(".bak", gnu), appended.pattern, file];
    const result = await execute("sed", args);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.equal(readFileSync(file, "utf8"), "goodbye world\n");
    assert.equal(readFileSync(`${file}.bak`, "utf8"), "hello world\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("integration: case_insensitive flag actually matches different case (regression)", async () => {
  const { dir, file } = makeTempFile("OLD text\n");
  try {
    const appended = appendSedFlags("s/old/new/", ["I"]);
    assert.ok("pattern" in appended);
    const gnu = await isGnuSed();
    const args = [...buildInPlaceArgs("", gnu), appended.pattern, file];
    const result = await execute("sed", args);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.equal(readFileSync(file, "utf8"), "new text\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
