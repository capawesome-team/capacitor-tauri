// Keeps the Rust crate version and the scaffold's crate dependency in sync
// with the npm package version (which changesets bumps). Run before
// publishing the crate.
import { readFileSync, writeFileSync } from 'fs';

const version = JSON.parse(readFileSync('package.json', 'utf8')).version;

// crate/Cargo.toml: the package version.
const cargoPath = 'crate/Cargo.toml';
const cargo = readFileSync(cargoPath, 'utf8').replace(
  /^version = ".*"$/m,
  `version = "${version}"`,
);
writeFileSync(cargoPath, cargo);

// Scaffold template: the dependency requirement (0.x caret is `"0.<minor>"`).
const [major, minor] = version.split('.');
const requirement = major === '0' ? `0.${minor}` : major;
const templatePath = 'templates/scaffold/Cargo.toml';
const template = readFileSync(templatePath, 'utf8').replace(
  /^capacitor-tauri = ".*"$/m,
  `capacitor-tauri = "${requirement}"`,
);
writeFileSync(templatePath, template);

console.log(
  `Synced crate version to ${version} (scaffold requirement "${requirement}").`,
);
