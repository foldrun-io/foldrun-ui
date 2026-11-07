# shellcheck shell=bash
# What pre-push runs in this repo, after the gitleaks scans in pre-push.
# Mirror CI (.github/workflows) and the box deploy gate; keep it read only.
# .github/workflows/ci.yml runs the same list: check-native, astro check over
# demo/ (every component once), and a build of demo/ to a temp dir.
repo_checks() {
  step "no native browser controls" node scripts/check-native.mjs src demo
  step "astro check" npx --no-install astro check
  step "astro build (to a temp dir)" astro_build
}
astro_build() { local d rc; d=$(mktemp -d); npx --no-install astro build --outDir "$d/out"; rc=$?; rm -rf "$d"; return $rc; }
