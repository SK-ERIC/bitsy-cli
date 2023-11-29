import versionBump from 'bumpp';

export async function release() {
  await versionBump({
    files: ['**/package.json', '!**/node_modules'],
    execute: 'npx bt changelog',
    all: true,
    tag: true,
    commit: 'chore(projects): release v%s',
    push: true
  });
}