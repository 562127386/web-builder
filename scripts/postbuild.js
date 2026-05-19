const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { PurgeCSS } = require('purgecss');

const projectRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(projectRoot, 'dist/browser');

function getContentFiles() {
  const patterns = [
    'src/**/*.html',
    'src/**/*.ts',
    'src/**/*.svg',
    'src/**/*.json'
  ];

  let files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, { cwd: projectRoot, absolute: true });
    files = files.concat(matches);
  });

  console.log(`Found ${files.length} content files`);
  return files;
}

async function optimizeCSS() {
  console.log('Optimizing CSS files...');

  const contentFiles = getContentFiles();

  if (contentFiles.length === 0) {
    console.error('No content files found!');
    return;
  }

  const files = fs.readdirSync(distPath);

  for (const file of files) {
    if (file.endsWith('.css')) {
      const cssPath = path.join(distPath, file);
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      try {
        const purgecss = new PurgeCSS();
        const result = await purgecss.purge({
          content: contentFiles,
          css: [{ raw: cssContent }],
          safelist: {
            standard: [
              /mat-/, /cdk-/, /ng-/, /app-/, /router-link/, /ql-/,
              /^bg-/, /^text-/, /^border-/, /^hover:/, /^focus:/, /^active:/,
              /^px-/, /^py-/, /^mx-/, /^my-/, /^w-/, /^h-/, /^flex-/, /^grid-/,
              /^rounded-/, /^shadow-/, /^transition-/, /^duration-/, /^ease-/,
              /^scale-/, /^opacity-/, /^inline-/, /^block/, /^font-/, /^leading-/,
              /^overflow-/, /^cursor-/, /^pointer-events/, /^select-none/,
              /^align-/, /^justify-/, /^items-/, /^content-/, /^self-/, /^gap-/,
              /^col-span-/, /^row-span-/, /^order-/, /^z-/, /^sticky/, /^fixed/,
              /^absolute/, /^relative/, /^static/, /^hidden/, /^visible/,
              /^transform/, /^rotate-/, /^translate-/, /^skew-/, /^origin-/,
              /^bg-gradient-to-/, /^from-/, /^to-/, /^via-/, /^animate-/,
              // 响应式断点变体
              /^sm\:/, /^md\:/, /^lg\:/, /^xl\:/, /^2xl\:/,
              // 响应式网格类
              /grid-cols-/, /sm\:grid-cols-/, /md\:grid-cols-/, /lg\:grid-cols-/,
              /sm\:h-/, /md\:h-/, /lg\:h-/,
              // group-hover 变体
              /group-hover:/,
              // 负边距和负定位
              /^-/,
              // 基础布局类
              /^inset-/, /^object-/, /^whitespace-/, /^line-clamp-/
            ],
            deep: [
              /\.mat-/, /\.cdk-/, /\.ng-/, /\.app-/, /\.ql-/,
              /\.bg-/, /\.text-/, /\.border-/
            ],
            greedy: [/mat/, /cdk/, /ng/, /app/, /ql/]
          }
        });

        const optimizedCSS = result[0].css;
        fs.writeFileSync(cssPath, optimizedCSS);
        const reduction = Math.round((1 - optimizedCSS.length / cssContent.length) * 100);
        console.log(`Optimized: ${file} (${reduction}% reduction)`);
      } catch (error) {
        console.error(`Error optimizing ${file}:`, error);
      }
    }
  }

  console.log('CSS optimization completed!');
}

optimizeCSS();
