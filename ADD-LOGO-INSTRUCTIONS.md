# Add OpAlly Logo - Quick Instructions

## You need to manually add the logo file!

The code is ready, but you need to save the logo image file.

### Option 1: Using VS Code File Upload
1. In VS Code, navigate to: `floally-mvp/frontend/public/`
2. Right-click in the file explorer → "Upload..."
3. Select your OpAlly logo image
4. Rename it to: `opally-logo.png`

### Option 2: Using Terminal/Command Line
If you have the logo file locally, you can use:
```bash
# From your local machine, copy to Codespaces:
# (Replace with your actual file path and Codespace name)
scp /path/to/your/opally-logo.png <codespace>:/workspaces/codespaces-react/floally-mvp/frontend/public/opally-logo.png
```

### Option 3: Download from URL (if hosted)
```bash
cd /workspaces/codespaces-react/floally-mvp/frontend/public
curl -o opally-logo.png "YOUR_LOGO_URL_HERE"
```

### After Adding the Logo:
1. Commit the file:
   ```bash
   cd /workspaces/codespaces-react
   git add floally-mvp/frontend/public/opally-logo.png
   git commit -m "Add OpAlly logo image"
   git push origin main
   ```

2. The logo will appear in:
   - Browser favicon/tab
   - Login screen
   - Dashboard header

### Logo Specifications:
- Format: PNG (with transparent background preferred)
- Recommended size: 512x512px or larger
- The current OpAlly logo has a mint green circular element

