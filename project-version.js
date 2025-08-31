#!/usr/bin/env node

/**
 * Project Version Management System
 * 
 * This tool allows you to:
 * - Save current project state as a version
 * - List all saved versions
 * - Restore to any previous version
 * - Delete unwanted versions
 * 
 * Usage:
 *   node project-version.js save "Description of changes"
 *   node project-version.js list
 *   node project-version.js restore <version-id>
 *   node project-version.js delete <version-id>
 *   node project-version.js current
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ProjectVersionManager {
  constructor() {
    this.versionsFile = '.project-versions.json';
    this.gitIgnoreEntries = [
      'node_modules/',
      '.next/',
      '.env.local',
      '*.log',
      '.DS_Store',
      '.project-versions.json'
    ];
  }

  // Initialize Git repository if not exists
  initGit() {
    try {
      execSync('git status', { stdio: 'ignore' });
      console.log('✓ Git repository already initialized');
    } catch {
      console.log('Initializing Git repository...');
      execSync('git init');
      this.createGitIgnore();
      console.log('✓ Git repository initialized');
    }
  }

  // Create .gitignore if not exists
  createGitIgnore() {
    const gitIgnorePath = '.gitignore';
    if (!fs.existsSync(gitIgnorePath)) {
      fs.writeFileSync(gitIgnorePath, this.gitIgnoreEntries.join('\n'));
      console.log('✓ Created .gitignore file');
    }
  }

  // Load versions metadata
  loadVersions() {
    if (fs.existsSync(this.versionsFile)) {
      return JSON.parse(fs.readFileSync(this.versionsFile, 'utf8'));
    }
    return { versions: [], currentVersion: null };
  }

  // Save versions metadata
  saveVersions(data) {
    fs.writeFileSync(this.versionsFile, JSON.stringify(data, null, 2));
  }

  // Generate version ID
  generateVersionId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `v_${timestamp}_${random}`;
  }

  // Save current state as a version
  async save(description) {
    this.initGit();
    
    const versionId = this.generateVersionId();
    const branchName = `version/${versionId}`;
    
    try {
      // Get current branch
      const currentBranch = execSync('git branch --show-current').toString().trim() || 'main';
      
      // Stage all changes
      execSync('git add -A');
      
      // Check if there are changes to commit
      try {
        const status = execSync('git status --porcelain').toString();
        if (status) {
          // Commit changes
          const commitMessage = `Version: ${versionId} - ${description}`;
          execSync(`git commit -m "${commitMessage}"`);
          console.log('✓ Changes committed');
        } else {
          console.log('✓ No changes to commit');
        }
      } catch (error) {
        console.log('✓ Working directory clean');
      }
      
      // Create version branch
      execSync(`git checkout -b ${branchName}`);
      console.log(`✓ Created version branch: ${branchName}`);
      
      // Go back to original branch
      execSync(`git checkout ${currentBranch}`);
      
      // Update versions metadata
      const data = this.loadVersions();
      const versionInfo = {
        id: versionId,
        branch: branchName,
        description: description || 'No description',
        date: new Date().toISOString(),
        files: this.getProjectStats()
      };
      
      data.versions.push(versionInfo);
      data.currentVersion = versionId;
      this.saveVersions(data);
      
      console.log(`\n✅ Version saved successfully!`);
      console.log(`Version ID: ${versionId}`);
      console.log(`Description: ${description}`);
      console.log(`Branch: ${branchName}`);
      
      return versionId;
    } catch (error) {
      console.error('Error saving version:', error.message);
      throw error;
    }
  }

  // Get project statistics
  getProjectStats() {
    try {
      const files = execSync('git ls-files').toString().split('\n').filter(Boolean);
      const totalSize = execSync('git ls-files -z | xargs -0 wc -c | tail -1').toString().trim().split(/\s+/)[0];
      return {
        count: files.length,
        totalSize: parseInt(totalSize) || 0
      };
    } catch {
      return { count: 0, totalSize: 0 };
    }
  }

  // List all versions
  list() {
    const data = this.loadVersions();
    
    if (data.versions.length === 0) {
      console.log('No versions saved yet.');
      console.log('Use "node project-version.js save <description>" to save your first version.');
      return;
    }
    
    console.log('\n📚 Saved Versions:\n');
    console.log('─'.repeat(80));
    
    data.versions.forEach((version, index) => {
      const isCurrent = version.id === data.currentVersion;
      const marker = isCurrent ? '→ ' : '  ';
      const date = new Date(version.date).toLocaleString();
      
      console.log(`${marker}${index + 1}. ${version.id}`);
      console.log(`   Description: ${version.description}`);
      console.log(`   Date: ${date}`);
      console.log(`   Files: ${version.files.count} files (${this.formatBytes(version.files.totalSize)})`);
      if (isCurrent) {
        console.log(`   ★ CURRENT VERSION`);
      }
      console.log('─'.repeat(80));
    });
    
    console.log(`\nTotal versions: ${data.versions.length}`);
  }

  // Restore to a specific version
  async restore(versionId) {
    const data = this.loadVersions();
    const version = data.versions.find(v => v.id === versionId || v.id.includes(versionId));
    
    if (!version) {
      console.error(`Version not found: ${versionId}`);
      console.log('Use "node project-version.js list" to see available versions.');
      return;
    }
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      console.log(`\n⚠️  WARNING: This will restore to version ${version.id}`);
      console.log(`Description: ${version.description}`);
      console.log(`Date: ${new Date(version.date).toLocaleString()}`);
      console.log('\nThis will OVERWRITE your current work!');
      
      rl.question('Are you sure? (yes/no): ', async (answer) => {
        rl.close();
        
        if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
          console.log('Restore cancelled.');
          resolve(false);
          return;
        }
        
        try {
          // Save current state as backup before restoring
          console.log('\nBacking up current state...');
          await this.save(`Backup before restoring to ${version.id}`);
          
          // Checkout the version branch
          console.log(`Restoring to version ${version.id}...`);
          execSync(`git checkout ${version.branch}`);
          
          // Update current version
          data.currentVersion = version.id;
          this.saveVersions(data);
          
          console.log(`\n✅ Successfully restored to version ${version.id}`);
          console.log('Your current work has been backed up as a new version.');
          
          // Restart development server if running
          console.log('\n💡 TIP: Restart your development server to see the changes.');
          
          resolve(true);
        } catch (error) {
          console.error('Error restoring version:', error.message);
          resolve(false);
        }
      });
    });
  }

  // Delete a version
  async delete(versionId) {
    const data = this.loadVersions();
    const versionIndex = data.versions.findIndex(v => v.id === versionId || v.id.includes(versionId));
    
    if (versionIndex === -1) {
      console.error(`Version not found: ${versionId}`);
      return;
    }
    
    const version = data.versions[versionIndex];
    
    if (version.id === data.currentVersion) {
      console.error('Cannot delete the current version. Switch to another version first.');
      return;
    }
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      console.log(`\n⚠️  WARNING: This will permanently delete version ${version.id}`);
      console.log(`Description: ${version.description}`);
      
      rl.question('Are you sure? (yes/no): ', (answer) => {
        rl.close();
        
        if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
          console.log('Deletion cancelled.');
          resolve(false);
          return;
        }
        
        try {
          // Delete the Git branch
          execSync(`git branch -D ${version.branch}`);
          
          // Remove from versions list
          data.versions.splice(versionIndex, 1);
          this.saveVersions(data);
          
          console.log(`✅ Version ${version.id} deleted successfully.`);
          resolve(true);
        } catch (error) {
          console.error('Error deleting version:', error.message);
          resolve(false);
        }
      });
    });
  }

  // Show current version info
  current() {
    const data = this.loadVersions();
    
    if (!data.currentVersion) {
      console.log('No current version set.');
      console.log('Use "node project-version.js save <description>" to save your first version.');
      return;
    }
    
    const version = data.versions.find(v => v.id === data.currentVersion);
    if (version) {
      console.log('\n📍 Current Version:\n');
      console.log(`ID: ${version.id}`);
      console.log(`Description: ${version.description}`);
      console.log(`Date: ${new Date(version.date).toLocaleString()}`);
      console.log(`Branch: ${version.branch}`);
      console.log(`Files: ${version.files.count} files (${this.formatBytes(version.files.totalSize)})`);
    }
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Show help
  help() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           PROJECT VERSION MANAGEMENT SYSTEM                       ║
╚════════════════════════════════════════════════════════════════╝

This tool helps you save, manage, and restore different versions of 
your project using Git branches behind the scenes.

COMMANDS:

  📦 SAVE a new version:
     node project-version.js save "Description of changes"
     
  📋 LIST all versions:
     node project-version.js list
     
  ⏪ RESTORE to a version:
     node project-version.js restore <version-id>
     
  🗑️  DELETE a version:
     node project-version.js delete <version-id>
     
  📍 Show CURRENT version:
     node project-version.js current
     
  ❓ Show this HELP:
     node project-version.js help

EXAMPLES:

  # Save current state with a description
  node project-version.js save "Added PWA support and fixed API routes"
  
  # List all saved versions
  node project-version.js list
  
  # Restore to a specific version (use partial ID)
  node project-version.js restore v_2025

FEATURES:

  ✓ Automatic Git initialization
  ✓ Backup before restore
  ✓ Version branching
  ✓ Metadata tracking
  ✓ Safe deletion with confirmation

NOTE: This tool uses Git branches to manage versions. Each version
      is saved as a separate branch, allowing easy switching between
      different states of your project.
`);
  }
}

// CLI Interface
async function main() {
  const manager = new ProjectVersionManager();
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'save':
      const description = args.join(' ') || 'No description provided';
      await manager.save(description);
      break;
      
    case 'list':
      manager.list();
      break;
      
    case 'restore':
      if (!args[0]) {
        console.error('Please provide a version ID to restore.');
        console.log('Use "node project-version.js list" to see available versions.');
      } else {
        await manager.restore(args[0]);
      }
      break;
      
    case 'delete':
      if (!args[0]) {
        console.error('Please provide a version ID to delete.');
      } else {
        await manager.delete(args[0]);
      }
      break;
      
    case 'current':
      manager.current();
      break;
      
    case 'help':
    default:
      manager.help();
      break;
  }
}

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProjectVersionManager;