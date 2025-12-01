#!/usr/bin/env node

/**
 * Local dead link checker script
 * Run with: node scripts/check-links.js
 * Or add to package.json scripts: "check-links": "node scripts/check-links.js"
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

async function checkForLychee() {
  try {
    await execAsync('which lychee');
    return true;
  } catch {
    return false;
  }
}

async function installLychee() {
  console.log(`${colors.yellow}Lychee not found. Installing...${colors.reset}`);
  
  const platform = process.platform;
  const arch = process.arch;
  
  try {
    if (platform === 'darwin') {
      // macOS - try homebrew
      console.log('Attempting to install via Homebrew...');
      await execAsync('brew install lycheeverse/tap/lychee');
    } else if (platform === 'linux') {
      // Linux - download binary
      console.log('Downloading Lychee binary for Linux...');
      const archMap = {
        'x64': 'x86_64',
        'arm64': 'aarch64'
      };
      const lycheeArch = archMap[arch] || 'x86_64';
      
      const downloadUrl = `https://github.com/lycheeverse/lychee/releases/latest/download/lychee-${lycheeArch}-unknown-linux-gnu.tar.gz`;
      
      await execAsync(`
        curl -L ${downloadUrl} -o /tmp/lychee.tar.gz &&
        tar -xzf /tmp/lychee.tar.gz -C /tmp &&
        sudo mv /tmp/lychee /usr/local/bin/ &&
        sudo chmod +x /usr/local/bin/lychee &&
        rm /tmp/lychee.tar.gz
      `);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    console.log(`${colors.green}Lychee installed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to install Lychee automatically.${colors.reset}`);
    console.log('\nPlease install Lychee manually:');
    console.log('  - macOS: brew install lycheeverse/tap/lychee');
    console.log('  - Linux: Download from https://github.com/lycheeverse/lychee/releases');
    console.log('  - Or use cargo: cargo install lychee');
    return false;
  }
}

async function checkLinks() {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  
  console.log(`${colors.cyan}🔍 Checking for dead links...${colors.reset}\n`);
  
  // Check if _site directory exists
  try {
    await fs.access('_site');
    if (verbose) {
      console.log(`${colors.green}✓${colors.reset} Found _site directory`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: _site directory not found.${colors.reset}`);
    console.log('Please build the site first with: npm run build\n');
    if (verbose) {
      console.error('Access error:', error);
    }
    process.exit(1);
  }
  
  // Check if lychee is installed
  const hasLychee = await checkForLychee();
  if (!hasLychee) {
    const installed = await installLychee();
    if (!installed) {
      process.exit(1);
    }
  } else if (verbose) {
    console.log(`${colors.green}✓${colors.reset} Lychee is installed`);
  }
  
  // Check if .lycheeignore file exists
  try {
    await fs.access('.lycheeignore');
    if (verbose) {
      console.log(`${colors.green}✓${colors.reset} Found .lycheeignore file`);
    }
  } catch {
    console.log(`${colors.yellow}Warning: .lycheeignore file not found. All URLs will be checked.${colors.reset}`);
  }
  
  // Run lychee (it automatically reads .lycheeignore file)
  const lycheeCmd = `lychee \
    --verbose \
    --no-progress \
    --accept 200,204,206,301,302,303,307,308,403 \
    --timeout 20 \
    --max-retries 3 \
    --user-agent "Mozilla/5.0 (compatible; link-checker/1.0)" \
    --format markdown \
    --output lychee-report.md \
    _site/**/*.html`;
  
  if (verbose) {
    console.log(`${colors.blue}Running command:${colors.reset}\n${lycheeCmd}\n`);
  }
  
  try {
    const { stdout, stderr } = await execAsync(lycheeCmd, {
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr && verbose) {
      console.log(`${colors.yellow}stderr output:${colors.reset}`, stderr);
    }
    
    // Read and display the report
    try {
      const report = await fs.readFile('lychee-report.md', 'utf8');
      console.log(`\n${colors.cyan}📋 Link Check Report:${colors.reset}\n`);
      console.log(report);
    } catch (readError) {
      // Report might not be created if all links are good
      if (verbose) {
        console.log('No report file created (this is normal when all links are valid)');
      }
    }
    
    console.log(`\n${colors.green}✅ Link check completed successfully!${colors.reset}`);
    console.log('All links are valid.\n');
    
  } catch (error) {
    // Check if this is actually an error or just dead links found
    if (error.code === 2 || error.message.includes('Command failed')) {
      // Lychee exits with code 2 when dead links are found
      console.error(`\n${colors.red}❌ Dead links found!${colors.reset}`);
      
      if (verbose) {
        console.log(`${colors.yellow}Error details:${colors.reset}`);
        console.log('Exit code:', error.code);
        if (error.stdout) console.log('stdout:', error.stdout);
        if (error.stderr) console.log('stderr:', error.stderr);
      }
      
      // Try to read and display the report
      try {
        const report = await fs.readFile('lychee-report.md', 'utf8');
        console.log(`\n${colors.cyan}📋 Link Check Report:${colors.reset}\n`);
        console.log(report);
      } catch (readError) {
        console.log('Could not read detailed report.');
        if (verbose) {
          console.error('Report read error:', readError);
        }
        
        // If we have output in the error object, display it
        if (error.stdout) {
          console.log(`\n${colors.cyan}Lychee output:${colors.reset}`);
          console.log(error.stdout);
        }
      }
      
      console.log(`\n${colors.yellow}Please fix the dead links listed above.${colors.reset}\n`);
      process.exit(1);
    } else {
      // This is an actual error
      console.error(`\n${colors.red}Error running lychee:${colors.reset}`, error.message);
      if (verbose) {
        console.error('Full error:', error);
      }
      console.log(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
      console.log('1. Make sure lychee is properly installed');
      console.log('2. Try running with --verbose flag for more details');
      console.log('3. Check that _site directory contains HTML files');
      console.log('4. Verify file permissions\n');
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  checkLinks().catch(error => {
    console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = { checkLinks };