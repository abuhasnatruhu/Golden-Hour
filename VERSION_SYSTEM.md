# 📦 Project Version Management System

A powerful versioning system for your Golden Hour Calculator project that allows you to save, restore, and manage different states of your project.

## 🚀 Features

- **Save Project States**: Capture the current state of your project as a version
- **Restore Previous Versions**: Go back to any saved version instantly
- **List All Versions**: View all saved versions with metadata
- **Automatic Backup**: Creates a backup before restoring to prevent data loss
- **Git-Based**: Uses Git branches internally for reliable version control
- **Simple CLI**: Easy-to-use command-line interface

## 📋 Installation

The versioning system is already installed in your project. No additional setup required!

## 🎯 Quick Start

### Using NPM Scripts (Recommended)

```bash
# Save current state
npm run version:save "Description of changes"

# List all versions
npm run version:list

# Restore to a version
npm run version:restore <version-id>

# Show current version
npm run version:current

# Get help
npm run version:help
```

### Using Direct Commands

```bash
# Save current state
node project-version.js save "Description of changes"

# List all versions
node project-version.js list

# Restore to a version
node project-version.js restore <version-id>

# Delete a version
node project-version.js delete <version-id>

# Show current version
node project-version.js current
```

## 📖 Common Use Cases

### 1. Before Major Changes
Save a version before making significant modifications:
```bash
npm run version:save "Before adding new authentication system"
```

### 2. Experiment Safely
Try new features without fear:
```bash
npm run version:save "Stable version before experiments"
# ... make experimental changes ...
# If things go wrong:
npm run version:restore v_2025-08-31
```

### 3. Regular Checkpoints
Create regular snapshots of your progress:
```bash
npm run version:save "Completed user dashboard"
npm run version:save "Fixed all API bugs"
npm run version:save "Added dark mode support"
```

## 🔍 Understanding Version IDs

Version IDs follow this format:
```
v_YYYY-MM-DD-HH-MM-SS-MS_random
```

Example: `v_2025-08-31T17-54-27-373Z_bc8cyx`

You can use partial IDs when restoring:
```bash
npm run version:restore v_2025-08-31
```

## ⚙️ How It Works

1. **Git Branches**: Each version is saved as a separate Git branch
2. **Metadata Tracking**: Version information stored in `.project-versions.json`
3. **Smart Restoration**: Backs up current state before restoring
4. **Clean Management**: Unused branches can be deleted to save space

## 🛡️ Safety Features

- **Confirmation Prompts**: Asks for confirmation before destructive actions
- **Automatic Backup**: Creates backup before restore operations
- **Current Version Protection**: Prevents deletion of the current version
- **Git Integration**: Leverages Git's reliability and recovery features

## 📊 Version Information

Each version stores:
- Unique ID
- Description
- Creation date
- Number of files
- Total project size
- Git branch name

## 🔧 Troubleshooting

### "Version not found"
- Run `npm run version:list` to see available versions
- Check if you're using the correct version ID

### "Cannot delete current version"
- Switch to another version first
- Then delete the desired version

### Development server issues after restore
- Stop the dev server (Ctrl+C)
- Run `npm run dev` again

## 💡 Best Practices

1. **Descriptive Messages**: Use clear descriptions when saving versions
   ```bash
   npm run version:save "Fixed authentication bug and added OAuth support"
   ```

2. **Regular Saves**: Save versions at logical checkpoints
   - After completing features
   - Before major refactoring
   - At the end of work sessions

3. **Clean Up**: Delete old, unnecessary versions to save space
   ```bash
   node project-version.js delete <old-version-id>
   ```

4. **Document Changes**: Keep track of what each version contains

## 🎉 Examples

### Complete Workflow Example

```bash
# 1. Start your day by checking current version
npm run version:current

# 2. Save before starting work
npm run version:save "Morning checkpoint - starting new feature"

# 3. Work on your feature...
# ... code changes ...

# 4. Save after completing feature
npm run version:save "Completed user profile feature"

# 5. If something breaks, check versions
npm run version:list

# 6. Restore to working version
npm run version:restore v_2025-08-31T09
```

## 📝 Notes

- The `.project-versions.json` file tracks version metadata
- Each version creates a Git branch named `version/<version-id>`
- The system respects `.gitignore` rules
- Works seamlessly with your existing Git workflow

## 🤝 Integration with Claude

This versioning system works perfectly with Claude Code, allowing you to:
- Save states before Claude makes changes
- Restore if automated changes cause issues
- Track the evolution of your project
- Collaborate more effectively

---

**Remember**: This system is your safety net. Use it liberally to save your work and experiment fearlessly!