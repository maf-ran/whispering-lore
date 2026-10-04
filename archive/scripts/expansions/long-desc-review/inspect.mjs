import fs from "fs";

const dir = "archive/scripts/expansions/long-desc-review/";
const targets = [
  ["rewrite-03-output.json", "devi-india"],
  ["rewrite-04-output.json", "foxdeityofojibwe-usa"],
  ["rewrite-05-output.json", "keepermaya-mexico"],
  ["rewrite-05-output.json", "kitchimanitou-usa"],
  ["rewrite-06-output.json", "sacred-drum-luba"],
];
for (const [f, slug] of targets) {
  const out = JSON.parse(fs.readFileSync(dir + f, "utf8"));
  const x = out.find(e => e.slug === slug);
  console.log("=== " + slug + " (" + x.description.length + " chars) ===");
  console.log(x.description);
  console.log();
}
