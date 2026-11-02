#!/usr/bin/env node
/**
 * ==============================================================================
 * MEW CONTENT OS — UX Copy & Forbidden Terms Linter (Topic T32)
 * Ensures 100% adherence to Negative Constraints and Approved UX Copy.
 * 
 * Rules Enforced (Spec Rule 7 & Founder UX Constraints):
 * - Clone Clip is strictly forbidden (must use "Analyze Clip" or "Remix")
 * - Added to Library before explicit save commit is forbidden (must use "Analyzed · Not saved")
 * - AI Auto Save is strictly forbidden (AI must never save without human decision)
 * - Export in place of Save is forbidden (must use "Save to Library" or "Save Remix Draft")
 * - Publish Now is forbidden (system stops at Director Brief handoff)
 * - Stitch Source Videos is forbidden (must synthesize Original Concepts + source trace)
 * - Save Research is forbidden (must use "Save to Library" or "Save Remix Draft")
 * - Fake statistics like "12 สัปดาห์", "+12 สัปดาห์นี้" or fake badges are forbidden
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

// Forbidden terms that must NEVER appear in client-facing UI
const FORBIDDEN_PATTERNS = [
  {
    pattern: /Clone\s+Clip/i,
    reason: 'Must use "Analyze Clip" or "Remix", never "Clone Clip" (Spec Rule 6 / Founder UX)'
  },
  {
    pattern: /\bAdded\s+to\s+Library\b/i,
    reason: 'Must indicate "Analyzed · Not saved" until founder commits save (Spec Rule 1)'
  },
  {
    pattern: /AI\s*Auto\s*Save/i,
    reason: 'AI must not auto-save without founder decision (Spec Rule 1 & Rule 8)'
  },
  {
    pattern: /\bExport\s+(?:to\s+Library|Remix\s+Draft|Draft|Reference|Research)\b/i,
    reason: 'Cannot use "Export" in place of Save/Draft; use "Save to Library" or "Save Remix Draft"'
  },
  {
    pattern: /(?:id=["']btn-save["'][^>]*>[\s\S]*?\bExport\b)/i,
    reason: 'Save button must not be labeled Export'
  },
  {
    pattern: /Publish\s*Now/i,
    reason: 'System must never have Publish Now buttons (Spec Rule 7)'
  },
  {
    pattern: /Stitch\s*Source\s*Videos/i,
    reason: 'Must not stitch source videos directly; synthesize Original Concepts (Spec Rule 6)'
  },
  {
    pattern: /\bSave\s+Research\b/i,
    reason: 'Must use "Save to Library" for references or "Save Remix Draft" for scripts (Spec Rule 7)'
  },
  {
    pattern: /\b\d+\s*สัปดาห์/,
    reason: 'Strict Negative Constraint: No fake week statistics ("12 สัปดาห์", "+12 สัปดาห์นี้")'
  },
  {
    pattern: /(?:คะแนน\s*AI\s*\d+%|AI\s*Score\s*\d+%)/i,
    reason: 'Strict Negative Constraint: No fake percentage/scoring badges'
  }
];

function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (
      (entry.name.endsWith('.html') || entry.name.endsWith('.js') || entry.name.endsWith('.css')) &&
      !entry.name.endsWith('.test.js') // Skip test assertion files that cite prohibited patterns
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function runLint() {
  const files = scanDirectory(SRC_DIR);
  let violationCount = 0;

  console.log(`[LINT-COPY] Scanning ${files.length} UI files in src/...`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relPath = path.relative(path.resolve(__dirname, '..'), file);

    for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
      const match = pattern.exec(content);
      if (match) {
        console.error(`[FAIL] ${relPath}: Found prohibited term "${match[0]}" -> ${reason}`);
        violationCount++;
      }
    }
  }

  if (violationCount > 0) {
    console.error(`\n[LINT-COPY FAILED] Found ${violationCount} copy violations!`);
    process.exit(1);
  }

  console.log(`[LINT-COPY PASSED] 100% clean! Zero forbidden terms found across all UI files.`);
  process.exit(0);
}

runLint();
