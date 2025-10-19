/**
 * PWA Setup Verification Script
 * Run: npx tsx scripts/verify-pwa-setup.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string) {
  results.push({
    name,
    status: condition ? 'pass' : 'fail',
    message: condition ? passMsg : failMsg,
  });
}

function warn(name: string, message: string) {
  results.push({
    name,
    status: 'warn',
    message,
  });
}

console.log('🔍 Verifying PWA + Push Notifications Setup...\n');

// Check 1: Environment Variables
console.log('📝 Checking environment variables...');

const envVars = [
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'VAPID_CONTACT',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
];

envVars.forEach((varName) => {
  const value = process.env[varName];
  check(
    `ENV: ${varName}`,
    !!value,
    `✓ ${varName} is set`,
    `✗ ${varName} is missing`
  );
});

// Check VAPID keys match
if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PUBLIC_KEY !== process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
) {
  warn(
    'VAPID Keys',
    '⚠️  VAPID_PUBLIC_KEY and NEXT_PUBLIC_VAPID_PUBLIC_KEY do not match'
  );
}

// Check 2: Required Files
console.log('\n📁 Checking required files...');

const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/offline.html',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'src/models/Subscription.ts',
  'src/models/Notification.ts',
  'src/models/NotificationPreference.ts',
  'src/lib/webpush.ts',
  'src/lib/pwa.ts',
  'src/lib/notifications.ts',
  'src/app/api/push/subscribe/route.ts',
  'src/app/api/push/test/route.ts',
  'src/app/api/notifications/route.ts',
  'src/app/settings/notifications/page.tsx',
];

requiredFiles.forEach((file) => {
  const filePath = join(process.cwd(), file);
  const exists = existsSync(filePath);
  check(`File: ${file}`, exists, `✓ ${file} exists`, `✗ ${file} missing`);
});

// Check 3: Manifest JSON
console.log('\n📱 Validating manifest.json...');

try {
  const manifestPath = join(process.cwd(), 'public/manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    check('Manifest: name', !!manifest.name, '✓ Name is set', '✗ Name is missing');
    check(
      'Manifest: icons',
      manifest.icons && manifest.icons.length > 0,
      `✓ ${manifest.icons.length} icons defined`,
      '✗ No icons defined'
    );
    check(
      'Manifest: start_url',
      !!manifest.start_url,
      '✓ Start URL is set',
      '✗ Start URL is missing'
    );
    check(
      'Manifest: display',
      !!manifest.display,
      `✓ Display mode: ${manifest.display}`,
      '✗ Display mode not set'
    );
  }
} catch (error) {
  warn('Manifest', '⚠️  Failed to parse manifest.json: ' + error);
}

// Check 4: Service Worker
console.log('\n⚙️  Validating service worker...');

try {
  const swPath = join(process.cwd(), 'public/sw.js');
  if (existsSync(swPath)) {
    const swContent = readFileSync(swPath, 'utf-8');

    check(
      'SW: Install event',
      swContent.includes("addEventListener('install'"),
      '✓ Install event listener found',
      '✗ Install event listener missing'
    );

    check(
      'SW: Fetch event',
      swContent.includes("addEventListener('fetch'"),
      '✓ Fetch event listener found',
      '✗ Fetch event listener missing'
    );

    check(
      'SW: Push event',
      swContent.includes("addEventListener('push'"),
      '✓ Push event listener found',
      '✗ Push event listener missing'
    );

    check(
      'SW: Notification click',
      swContent.includes("addEventListener('notificationclick'"),
      '✓ Notification click handler found',
      '✗ Notification click handler missing'
    );
  }
} catch (error) {
  warn('Service Worker', '⚠️  Failed to read sw.js: ' + error);
}

// Check 5: Vercel Config
console.log('\n⏰ Checking cron configuration...');

try {
  const vercelPath = join(process.cwd(), 'vercel.json');
  if (existsSync(vercelPath)) {
    const vercel = JSON.parse(readFileSync(vercelPath, 'utf-8'));

    if (vercel.crons) {
      const dailyCron = vercel.crons.find((c: any) =>
        c.path.includes('notifications-daily')
      );
      const weeklyCron = vercel.crons.find((c: any) =>
        c.path.includes('notifications-weekly')
      );

      check(
        'Cron: Daily digest',
        !!dailyCron,
        `✓ Daily digest scheduled: ${dailyCron?.schedule}`,
        '✗ Daily digest cron not configured'
      );

      check(
        'Cron: Weekly digest',
        !!weeklyCron,
        `✓ Weekly digest scheduled: ${weeklyCron?.schedule}`,
        '✗ Weekly digest cron not configured'
      );
    } else {
      warn('Cron', '⚠️  No cron jobs configured in vercel.json');
    }
  }
} catch (error) {
  warn('Vercel', '⚠️  Failed to parse vercel.json: ' + error);
}

// Print Results
console.log('\n' + '='.repeat(60));
console.log('📊 Verification Results\n');

const passCount = results.filter((r) => r.status === 'pass').length;
const failCount = results.filter((r) => r.status === 'fail').length;
const warnCount = results.filter((r) => r.status === 'warn').length;

// Group by status
const pass = results.filter((r) => r.status === 'pass');
const fail = results.filter((r) => r.status === 'fail');
const warnings = results.filter((r) => r.status === 'warn');

if (pass.length > 0) {
  console.log('✅ Passed (' + pass.length + '):');
  pass.forEach((r) => console.log(`   ${r.message}`));
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings (' + warnings.length + '):');
  warnings.forEach((r) => console.log(`   ${r.message}`));
  console.log();
}

if (fail.length > 0) {
  console.log('❌ Failed (' + fail.length + '):');
  fail.forEach((r) => console.log(`   ${r.message}`));
  console.log();
}

console.log('='.repeat(60));

// Summary
console.log(
  `\n📈 Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings\n`
);

if (failCount === 0 && warnCount === 0) {
  console.log('🎉 All checks passed! Your PWA setup is complete.\n');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000/settings/notifications');
  console.log('3. Enable notifications and send a test');
} else if (failCount === 0) {
  console.log('✅ Setup is mostly complete, but review warnings above.\n');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above.\n');
  console.log('For help, see: PWA_PUSH_SETUP.md');
  process.exit(1);
}

