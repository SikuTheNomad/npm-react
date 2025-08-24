#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

async function main() {
  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'Nombre del proyecto: ',
    initial: 'react-app',
    validate: (value) =>
      value.match(/^[a-z0-9-]+$/i)
        ? true
        : 'El nombre del proyecto solo puede incluir letras, números y guiones.'
  })

  const { projectName } = response
  const targetDir = path.resolve(process.cwd(), projectName)
  const templateDir = path.join(__dirname, '../templates/react-js')

  if (fs.existsSync(targetDir)) {
    console.error(`Error: El directorio ${projectName} ya existe.`)
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

  console.log(`\nProyecto creado en ${targetDir}...`);
  console.log('\nHecho. Ahora ejecuta:\n');
  console.log(`  cd ${projectName}`);
  console.log('  npm install');
  console.log('  npm run dev\n')
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
})
