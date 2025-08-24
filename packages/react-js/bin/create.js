#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

async function main() {
  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'Project Name: ',
    initial: 'react-app',
    validate: (value) =>
      value.match(/^[a-z0-9-]+$/i)
        ? true
        : 'Project name may only include letters, numbers, and hyphens'
  })

  const { projectName } = response
  const targetDir = path.resolve(process.cwd(), projectName)
  const templateDir = path.join(__dirname, '../templates/react-js')

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${projectName} already exists.`)
    process.exit(1)
  }

  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src, { withFileTypes: true })
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyDir(templateDir, targetDir)

  const packageJsonPath = path.join(targetDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  packageJson.name = projectName
  delete packageJson.bin
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  console.log(`\nProject created in ${targetDir}...`);
  console.log('\nDone. Now run:\n');
  console.log(`  cd ${projectName}`);
  console.log('  npm install');
  console.log('  npm run dev\n')
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
})
