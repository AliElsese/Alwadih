import crypto from 'node:crypto';

const targetUrl = process.argv[2] || 'https://fonts.alwadih.org/quran/fonts/v2';
const baseUrl = targetUrl.replace(/\/+$/, '');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function pass(msg) {
  totalTests++;
  passedTests++;
  console.log(`\x1b[32m [PASS]\x1b[0m ${msg}`);
}

function fail(msg) {
  totalTests++;
  failedTests++;
  console.log(`\x1b[31m [FAIL]\x1b[0m ${msg}`);
}

console.log('\x1b[36m==========================================================\x1b[0m');
console.log(` Quran Fonts V2 - Production Verification Suite`);
console.log(` Target URL: ${baseUrl}`);
console.log('\x1b[36m==========================================================\x1b[0m\n');

async function runVerification() {
  // -------------------------------------------------------------------------
  // 1. Verify manifest.json
  // -------------------------------------------------------------------------
  console.log('\x1b[33m[1/4] Verifying manifest.json...\x1b[0m');
  try {
    const manifestRes = await fetch(`${baseUrl}/manifest.json`);
    if (manifestRes.status === 200) {
      pass('manifest.json returned HTTP 200');
    } else {
      fail(`manifest.json returned HTTP status ${manifestRes.status}`);
    }

    const ct = manifestRes.headers.get('content-type') || '';
    if (ct.toLowerCase().includes('application/json')) {
      pass(`manifest.json Content-Type is application/json (${ct})`);
    } else {
      fail(`manifest.json Content-Type is '${ct}' (expected application/json)`);
    }

    const cc = manifestRes.headers.get('cache-control') || '';
    if (cc.toLowerCase().includes('max-age=3600')) {
      pass(`manifest.json Cache-Control includes max-age=3600 (${cc})`);
    } else {
      fail(`manifest.json Cache-Control is '${cc}' (expected public, max-age=3600)`);
    }

    const json = await manifestRes.json();
    let entryCount = 0;
    if (json.files && typeof json.files === 'object') {
      entryCount = Object.keys(json.files).length;
    } else if (typeof json.count === 'number') {
      entryCount = json.count;
    } else if (Array.isArray(json)) {
      entryCount = json.length;
    } else {
      entryCount = Object.keys(json).length;
    }

    if (entryCount === 604) {
      pass(`manifest.json contains exactly 604 font entries (count: ${entryCount})`);
    } else {
      fail(`manifest.json contains ${entryCount} entries (expected 604)`);
    }
  } catch (err) {
    fail(`Failed to fetch manifest.json: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 2. Verify p587.ttf SHA-256
  // -------------------------------------------------------------------------
  console.log('\n\x1b[33m[2/4] Verifying SHA-256 of p587.ttf...\x1b[0m');
  const expectedHash = '5fcb3b47363dc46bb3442cb0e2fad2154cb450d413fdd6f6870fb7ca8562fc1d';
  try {
    const p587Res = await fetch(`${baseUrl}/p587.ttf`);
    if (p587Res.status === 200) {
      const buffer = Buffer.from(await p587Res.arrayBuffer());
      const hash = crypto.createHash('sha256').update(buffer).digest('hex').toLowerCase();
      if (hash === expectedHash) {
        pass(`p587.ttf SHA-256 matches: ${hash}`);
      } else {
        fail(`p587.ttf SHA-256 mismatch! Got: ${hash}, Expected: ${expectedHash}`);
      }
    } else {
      fail(`p587.ttf returned HTTP status ${p587Res.status}`);
    }
  } catch (err) {
    fail(`Failed to verify p587.ttf: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 3. Verify all 604 font files return 200 and correct headers
  // -------------------------------------------------------------------------
  console.log('\n\x1b[33m[3/4] Verifying all 604 font files (p1.ttf to p604.ttf)...\x1b[0m');
  const fontFailures = [];
  const headerFailures = [];

  const concurrency = 15;
  for (let i = 1; i <= 604; i += concurrency) {
    const batch = [];
    const max = Math.min(i + concurrency - 1, 604);
    for (let j = i; j <= max; j++) {
      batch.push(j);
    }

    if (i % 100 === 1 || i === 1) {
      process.stdout.write(` Checking fonts p${i}.ttf to p${max}.ttf...\n`);
    }

    await Promise.all(
      batch.map(async (num) => {
        const file = `p${num}.ttf`;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const res = await fetch(`${baseUrl}/${file}`, { method: 'HEAD' });
            if (res.status !== 200) {
              fontFailures.push(`${file} (status ${res.status})`);
              return;
            }
            const ct = (res.headers.get('content-type') || '').toLowerCase();
            const cc = (res.headers.get('cache-control') || '').toLowerCase();
            if (!ct.includes('font/ttf') || !cc.includes('31536000') || !cc.includes('immutable')) {
              headerFailures.push(`${file} (ct: ${ct}, cc: ${cc})`);
            }
            return;
          } catch (e) {
            if (attempt === 2) {
              fontFailures.push(`${file} (${e.message})`);
            } else {
              await new Promise((r) => setTimeout(r, 150));
            }
          }
        }
      })
    );
  }

  if (fontFailures.length === 0) {
    pass('All 604 font files returned HTTP 200');
  } else {
    fail(`${fontFailures.length} fonts failed: ${fontFailures.slice(0, 5).join(', ')}...`);
  }

  if (headerFailures.length === 0) {
    pass('All 604 font files have Content-Type: font/ttf and Cache-Control: public, max-age=31536000, immutable');
  } else {
    fail(`${headerFailures.length} fonts had incorrect headers: ${headerFailures.slice(0, 5).join(', ')}...`);
  }

  // -------------------------------------------------------------------------
  // 4. Verify missing font returns plain HTTP 404 (not HTML error page)
  // -------------------------------------------------------------------------
  console.log('\n\x1b[33m[4/4] Verifying missing file returns plain HTTP 404 (not HTML)...\x1b[0m');
  try {
    const res404 = await fetch(`${baseUrl}/p999.ttf`);
    if (res404.status === 404) {
      pass('Missing file returned HTTP 404');
    } else {
      fail(`Missing file returned HTTP status ${res404.status} (expected 404)`);
    }

    const ct404 = (res404.headers.get('content-type') || '').toLowerCase();
    if (ct404.includes('text/plain')) {
      pass(`Missing file Content-Type is text/plain (${ct404})`);
    } else {
      fail(`Missing file Content-Type is '${ct404}' (expected text/plain)`);
    }

    const body404 = await res404.text();
    const hasHtml = body404.includes('<html') || body404.includes('<!DOCTYPE') || body404.includes('<head');
    if (!hasHtml) {
      pass('Missing file response body is plain text (no HTML error page)');
    } else {
      fail('Missing file returned an HTML error page instead of plain text!');
    }
  } catch (err) {
    fail(`Failed to test 404 behavior: ${err.message}`);
  }

  console.log('\n\x1b[36m==========================================================\x1b[0m');
  console.log(` Summary: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  console.log('\x1b[36m==========================================================\x1b[0m');
}

runVerification();
