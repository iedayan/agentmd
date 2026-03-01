# Assets

This directory contains static assets for the AgentMD project.

## Demo GIF

To create the demo GIF:

### Recommended Tools
- **macOS**: Kap, GIPHY Capture, LICEcap
- **Windows**: ScreenToGif, LICEcap  
- **Linux**: Peek, byzanz

### Demo Script (30-60 seconds)
1. **Terminal**: `npm install -g @agentmd-dev/cli`
2. **Terminal**: `agentmd check . --score` (show validation results)
3. **VS Code**: Show AGENTS.md file with real-time diagnostics
4. **Terminal**: `agentmd run . --dry-run` (show execution plan)
5. **Browser**: Show dashboard (if available)

### Best Practices
- **Size**: Keep under 2MB for fast loading
- **Dimensions**: 1200x600 or similar widescreen
- **Frame rate**: 10-15 FPS (smooth but small)
- **Duration**: 30-60 seconds maximum
- **Content**: Focus on the "wow" moments
- **Text**: Use large, readable terminal font

### Once Created
1. Save as `demo.gif` in this directory
2. Test README rendering locally
3. Commit the GIF (keep under 2MB)

### Alternative: Video
If GIF becomes too large, consider:
- Upload to YouTube and embed
- Use `.mp4` with HTML5 video tag
- Link to external video platform
