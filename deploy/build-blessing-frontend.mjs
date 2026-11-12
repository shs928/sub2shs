#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import {
  cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync,
  realpathSync, renameSync, rmSync, symlinkSync, unlinkSync, writeFileSync,
} from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_REF = 'ac1b8f1271be0d674fa6f074403c1410f30a3a81'
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = join(repoRoot, 'docs-local', 'production-frontend')
const modules = ['blessingHome', 'blessingAuth', 'blessingGuide', 'blessingShell', 'blessingRecharge']

// Explicitly scoped UI overlay: do not derive this from git diff. Added branding
// files were checked against the production baseline; patch the changed Settings
// view in place instead of copying its newer API contracts.
const overlayFiles = [
  'frontend/index.html',
  'frontend/public/logo.svg',
  'frontend/tailwind.config.js',
  'frontend/src/components/account/CreateAccountModal.vue',
  'frontend/src/components/account/EditAccountModal.vue',
  'frontend/src/components/layout/AppHeader.vue',
  'frontend/src/components/layout/AppLayout.vue',
  'frontend/src/components/layout/AppSidebar.vue',
  'frontend/src/components/layout/AuthLayout.vue',
  'frontend/src/components/modelPlaza/PlazaNavBar.vue',
  'frontend/src/components/common/CardRechargePanel.vue',
  'frontend/src/main.ts',
  'frontend/src/router/index.ts',
  'frontend/src/router/title.ts',
  'frontend/src/router/__tests__/title.spec.ts',
  'frontend/src/stores/app.ts',
  'frontend/src/style.css',
  'frontend/src/styles/onboarding.css',
  'frontend/src/styles/blessing.css',
  'frontend/src/views/HomeView.vue',
  'frontend/src/views/GuideView.vue',
  'frontend/src/views/KeyUsageView.vue',
  'frontend/src/views/admin/ProxiesView.vue',
  'frontend/src/views/auth/RegisterView.vue',
  'frontend/src/views/auth/EmailVerifyView.vue',
  'frontend/src/views/public/LegalDocumentView.vue',
  'frontend/src/views/__tests__/HomeView.compact.spec.ts',
  'frontend/src/views/user/DashboardView.vue',
  'frontend/src/views/user/RedeemView.vue',
  'frontend/src/utils/blessingGuide.ts',
  'frontend/src/utils/__tests__/blessingGuide.spec.ts',
  'frontend/src/utils/cardRecharge.ts',
  'frontend/src/utils/__tests__/cardRecharge.spec.ts',
  ...['zh', 'en'].flatMap(locale => [
    `frontend/src/i18n/locales/${locale}/landing.ts`,
    `frontend/src/i18n/locales/${locale}/common.ts`,
    `frontend/src/i18n/locales/${locale}/misc.ts`,
    `frontend/src/i18n/locales/${locale}/dashboard.ts`,
    `frontend/src/i18n/locales/${locale}/admin/resources.ts`,
    `frontend/src/i18n/locales/${locale}/admin/settings.ts`,
  ]),
  ...['zh', 'en'].flatMap(locale => modules.map(name => `frontend/src/i18n/locales/${locale}/${name}.ts`)),
]

const removedFiles = ['frontend/src/components/common/ProxyAdBanner.vue']
const patchedFiles = ['frontend/src/views/admin/SettingsView.vue']

function applyBrandingCleanup(sourceRoot) {
  for (const file of removedFiles) {
    const path = join(sourceRoot, file)
    if (existsSync(path)) unlinkSync(path)
  }
  // Keep the production admin view and its API contracts; only update branding.
  for (const file of patchedFiles) {
    const path = join(sourceRoot, file)
    const content = normalizedText(path).replaceAll('"Sub2API"', '"Blessing API"')
    writeFileSync(path, content)
  }
}

function run(command, args, cwd = repoRoot, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    windowsHide: true,
    // Production panels remain on the existing origin. Do not inherit a local
    // development API URL from the caller's shell.
    env: { ...process.env, VITE_API_BASE_URL: '/api/v1' },
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed (${result.status}).${capture ? `\n${result.stderr}` : ''}`)
  }
  return (result.stdout || '').trim()
}

function normalizedText(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function assertInsideOutput(path) {
  const child = relative(outputRoot, resolve(path))
  if (!child || child === '..' || child.startsWith(`..${sep}`) || isAbsolute(child)) {
    throw new Error(`Refusing filesystem operation outside the build directory: ${path}`)
  }
}

function removeGeneratedDirectory(path) {
  assertInsideOutput(path)
  if (!existsSync(path)) return
  // Explicitly unlink dependency junctions before recursive cleanup on Windows.
  for (const candidate of [
    join(path, 'frontend', 'node_modules'),
    join(path, 'source', 'frontend', 'node_modules'),
  ]) {
    if (existsSync(candidate) && lstatSync(candidate).isSymbolicLink()) unlinkSync(candidate)
  }
  if (lstatSync(path).isSymbolicLink()) unlinkSync(path)
  else rmSync(path, { recursive: true })
}

function injectLocales(sourceRoot) {
  for (const locale of ['zh', 'en']) {
    const path = join(sourceRoot, 'frontend', 'src', 'i18n', 'locales', locale, 'index.ts')
    let content = normalizedText(path)
    for (const name of modules) {
      if (!content.includes(`import ${name} from './${name}'`)) {
        content = `import ${name} from './${name}'\n${content}`
      }
    }
    if (!/export default\s*\{/.test(content)) throw new Error(`Unexpected locale index: ${path}`)
    const additions = modules.filter(name => !content.includes(`...${name}`))
    content = content.replace(/export default\s*\{/, `export default {\n${additions.map(name => `  ...${name},`).join('\n')}`)
    writeFileSync(path, content)
  }
}

function main() {
  const args = process.argv.slice(2)
  if (args.includes('--help')) {
    console.log('Usage: node deploy/build-blessing-frontend.mjs [--ref <production-commit>]')
    console.log(`Default baseline: ${DEFAULT_REF}\nOutput: ${outputRoot}`)
    return
  }
  if (args.length !== 0 && (args.length !== 2 || args[0] !== '--ref' || args[1].startsWith('-'))) {
    throw new Error('Expected no arguments or --ref <production-commit>. Use --help for details.')
  }
  const ref = args[1] || DEFAULT_REF
  const commit = run('git', ['rev-parse', '--verify', `${ref}^{commit}`], repoRoot, true)
  const currentNodeModules = join(repoRoot, 'frontend', 'node_modules')
  if (!existsSync(currentNodeModules)) throw new Error('Install frontend dependencies with pnpm 9 first.')
  for (const file of overlayFiles) {
    if (!existsSync(join(repoRoot, file))) throw new Error(`Missing customization file: ${file}`)
  }

  mkdirSync(outputRoot, { recursive: true })
  if (realpathSync(outputRoot) !== resolve(outputRoot)) {
    throw new Error('The output directory must not redirect through a symlink or junction.')
  }
  const marker = join(outputRoot, '.blessing-frontend-build')
  if (!existsSync(marker) && ['source', 'dist', 'build-manifest.json'].some(name => existsSync(join(outputRoot, name)))) {
    throw new Error('The output directory contains unrecognized files; choose an empty generated output directory.')
  }
  writeFileSync(marker, 'Generated by deploy/build-blessing-frontend.mjs\n')
  const stagingRoot = mkdtempSync(join(outputRoot, '.building-'))
  const sourceRoot = join(stagingRoot, 'source')
  const frontendRoot = join(sourceRoot, 'frontend')
  const distRoot = join(stagingRoot, 'dist')
  const archivePath = join(stagingRoot, 'baseline.tar')
  const replaced = []
  const published = []
  try {
    console.log(`Building Blessing frontend against production baseline ${commit}`)
    mkdirSync(sourceRoot)
    run('git', ['archive', '--format=tar', `--output=${archivePath}`, commit, 'frontend', 'docs/legal'])
    run('tar', ['-xf', archivePath, '-C', sourceRoot])
    unlinkSync(archivePath)

    for (const name of ['package.json', 'pnpm-lock.yaml']) {
      if (normalizedText(join(frontendRoot, name)) !== normalizedText(join(repoRoot, 'frontend', name))) {
        throw new Error(`Baseline/current frontend ${name} differ; refusing to reuse current node_modules.`)
      }
    }
    for (const file of overlayFiles) {
      const destination = join(sourceRoot, file)
      mkdirSync(dirname(destination), { recursive: true })
      cpSync(join(repoRoot, file), destination)
    }
    injectLocales(sourceRoot)
    applyBrandingCleanup(sourceRoot)
    symlinkSync(currentNodeModules, join(frontendRoot, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')

    const nodeTool = (entry, args) => run(process.execPath, [join(frontendRoot, 'node_modules', entry), ...args], frontendRoot)
    nodeTool('vitest/vitest.mjs', ['run',
      'src/i18n/__tests__/localeKeyCompleteness.spec.ts',
      'src/utils/__tests__/blessingGuide.spec.ts',
      'src/utils/__tests__/cardRecharge.spec.ts',
      'src/views/user/__tests__/RedeemView.spec.ts',
      'src/utils/__tests__/branding.spec.ts',
      'src/router/__tests__/title.spec.ts',
      'src/views/__tests__/HomeView.compact.spec.ts',
      'src/views/auth/__tests__/RegisterView.spec.ts',
      'src/views/auth/__tests__/EmailVerifyView.spec.ts',
    ])
    nodeTool('vue-tsc/bin/vue-tsc.js', ['-b'])
    nodeTool('vite/bin/vite.js', ['build', '--outDir', distRoot, '--emptyOutDir'])
    if (!existsSync(join(distRoot, 'index.html'))) throw new Error('Vite did not produce index.html.')

    const manifest = {
      baselineCommit: commit,
      worktreeCommit: run('git', ['rev-parse', 'HEAD'], repoRoot, true),
      builtAt: new Date().toISOString(),
      nodeVersion: process.version,
      apiBaseUrl: '/api/v1',
      files: Object.fromEntries([...overlayFiles, ...patchedFiles].map(file => [file, sha256(join(sourceRoot, file))])),
      removedFiles,
      localeIndexes: ['zh', 'en'].map(locale => `frontend/src/i18n/locales/${locale}/index.ts`),
      indexSha256: sha256(join(distRoot, 'index.html')),
    }
    writeFileSync(join(stagingRoot, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

    // Preserve the last successful output until every validation has passed.
    // Roll back the small set of renames if publication itself fails.
    for (const name of ['source', 'dist', 'build-manifest.json']) {
      const destination = join(outputRoot, name)
      const previous = join(stagingRoot, `previous-${name}`)
      assertInsideOutput(destination)
      if (existsSync(destination)) {
        renameSync(destination, previous)
        replaced.push([previous, destination])
      }
      renameSync(join(stagingRoot, name), destination)
      published.push(destination)
    }
    // Cleanup is best effort after publication: a locked old artifact must not
    // roll back a successful release once its backup has begun to be removed.
    try {
      const oldModules = join(stagingRoot, 'previous-source', 'frontend', 'node_modules')
      if (existsSync(oldModules) && lstatSync(oldModules).isSymbolicLink()) unlinkSync(oldModules)
      removeGeneratedDirectory(stagingRoot)
    } catch (error) {
      console.warn(`Release is ready; old staging cleanup needs attention: ${error.message}`)
    }
    console.log(`\nVerified source: ${join(outputRoot, 'source')}\nStatic release: ${join(outputRoot, 'dist')}\nManifest: ${join(outputRoot, 'build-manifest.json')}`)
  } catch (error) {
    for (const destination of published.reverse()) removeGeneratedDirectory(destination)
    for (const [previous, destination] of replaced.reverse()) {
      if (existsSync(previous)) renameSync(previous, destination)
    }
    removeGeneratedDirectory(stagingRoot)
    throw error
  }
}

try {
  main()
} catch (error) {
  console.error(`\nBuild failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
