# GitHub Setup Guide

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in:
   - **Repository name**: `chainpass-vai` (or your preferred name)
   - **Description**: "ChainPass VAI - Verified Identity Authentication Platform"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
cd "/Users/bmac/Desktop/chainpass code /chainpass-vai-main 2"

# Add all files to git
git add .

# Make your first commit
git commit -m "Initial commit: ChainPass VAI platform"

# Rename branch to main (if needed)
git branch -M main

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME with your actual values)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 3: Authentication

If you're prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)

### Creating a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "ChainPass Development"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when pushing

## Alternative: Using SSH (Recommended for frequent use)

If you prefer SSH:

1. Generate an SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add SSH key to GitHub:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub Settings → SSH and GPG keys → New SSH key
   - Paste your key and save

3. Use SSH URL instead:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
   ```

## Quick Commands Reference

```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View remote
git remote -v
```

## Troubleshooting

**If you get "remote origin already exists":**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**If you need to change the remote URL:**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**If you get authentication errors:**
- Make sure you're using a Personal Access Token (not password)
- Or set up SSH keys as described above






