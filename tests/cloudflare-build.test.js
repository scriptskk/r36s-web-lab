import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

test("Cloudflare output excludes private Python backend and user data",()=>{
  execFileSync(process.execPath,["scripts/build-cloudflare.mjs"],{cwd:process.cwd()});
  const root=path.join(process.cwd(),"dist");
  for(const name of ["index.html","styles.css","premium.css","src/site-theme.js","src/app.js","src/audit.js","src/rom-player.js"])
    assert.ok(fs.existsSync(path.join(root,name)));
  for(const name of ["README.md","render.yaml","requirements-private.txt","private_server","docs","migrations",".env"])
    assert.ok(!fs.existsSync(path.join(root,name)));
});
