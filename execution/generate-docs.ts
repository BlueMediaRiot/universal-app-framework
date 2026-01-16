#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface CoreInfo {
    name: string;
    description: string;
    version: string;
    dependencies: string[];
    tags: string[];
}

function generateCoreDocs(coreName: string): string {
    const coreDir = path.join(process.cwd(), 'packages', 'cores', coreName);

    if (!fs.existsSync(coreDir)) {
        throw new Error(`Core not found: ${coreName}`);
    }

    const pkgPath = path.join(coreDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    const indexPath = path.join(coreDir, 'src', 'index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    // Extract metadata from code
    const metadataMatch = indexContent.match(/metadata:\s*{([^}]+)}/s);
    let description = pkg.description || 'No description';
    let dependencies: string[] = [];

    if (metadataMatch) {
        const metadataStr = metadataMatch[1];
        const descMatch = metadataStr.match(/description:\s*['"]([^'"]+)['"]/);
        if (descMatch) description = descMatch[1];

        const depsMatch = metadataStr.match(/dependencies:\s*\[([^\]]*)\]/);
        if (depsMatch) {
            dependencies = depsMatch[1]
                .split(',')
                .map(d => d.trim().replace(/['"]/g, ''))
                .filter(d => d);
        }
    }

    // Extract methods
    const methods = indexContent.match(/async (\w+)\([^)]*\):/g) || [];
    const methodList = methods.map(m => {
        const name = m.match(/async (\w+)/)?.[1];
        return name;
    }).filter(Boolean);

    // Generate markdown
    let doc = `# ${coreName}\n\n`;
    doc += `${description}\n\n`;
    doc += `**Version**: ${pkg.version}\n\n`;

    if (dependencies.length > 0) {
        doc += `## Dependencies\n\n`;
        dependencies.forEach(dep => {
            doc += `- \`${dep}\`\n`;
        });
        doc += `\n`;
    }

    if (methodList.length > 0) {
        doc += `## Methods\n\n`;
        methodList.forEach(method => {
            doc += `### \`${method}()\`\n\n`;
            doc += `TODO: Add method description\n\n`;
        });
    }

    doc += `## Usage\n\n`;
    doc += `\`\`\`typescript\n`;
    doc += `import ${coreName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')} from '@universal/${coreName}';\n`;
    doc += `\`\`\`\n`;

    return doc;
}

function generateAllDocs(): void {
    const coresDir = path.join(process.cwd(), 'packages', 'cores');
    const docsDir = path.join(process.cwd(), 'docs', 'cores');

    fs.mkdirSync(docsDir, { recursive: true });

    const cores = fs.readdirSync(coresDir)
        .filter(item => {
            const itemPath = path.join(coresDir, item);
            return fs.statSync(itemPath).isDirectory() && item.startsWith('core-');
        });

    console.log(`\n📝 Generating documentation for ${cores.length} cores...\n`);

    cores.forEach(coreName => {
        try {
            const doc = generateCoreDocs(coreName);
            const docPath = path.join(docsDir, `${coreName}.md`);
            fs.writeFileSync(docPath, doc);
            console.log(`✅ Generated: ${coreName}.md`);
        } catch (error) {
            console.error(`❌ Failed to generate docs for ${coreName}:`, error);
        }
    });

    console.log(`\n✅ Documentation generation complete!\n`);
}

// CLI
const coreName = process.argv[2];

if (coreName) {
    const doc = generateCoreDocs(coreName);
    const docsDir = path.join(process.cwd(), 'docs', 'cores');
    fs.mkdirSync(docsDir, { recursive: true });
    const docPath = path.join(docsDir, `${coreName}.md`);
    fs.writeFileSync(docPath, doc);
    console.log(`✅ Generated documentation for ${coreName}`);
} else {
    generateAllDocs();
}
