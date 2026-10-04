import fs from "fs";
const dir = "archive/scripts/expansions/long-desc-review/";
const all = [];
for (let i = 1; i <= 15; i++) {
  const p = `${dir}batch-${String(i).padStart(2, "0")}-output.json`;
  if (!fs.existsSync(p)) continue;
  const out = JSON.parse(fs.readFileSync(p, "utf8"));
  all.push(...out);
}
const keep = all.filter(x => x.verdict === "keep");
const trim = all.filter(x => x.verdict === "trim");
const unat = all.filter(x => x.verdict === "unattested");
console.log("total verdicts:", all.length, "keep:", keep.length, "trim:", trim.length, "unattested:", unat.length);

const reasonCounts = {};
for (const x of keep) {
  const r = x.reason ? x.reason.trim() : "(no reason)";
  reasonCounts[r] = (reasonCounts[r] || 0) + 1;
}
const sorted = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
console.log("\n--- keep reasons (count) ---");
for (const [r, n] of sorted) console.log(`${n}\t${r}`);
