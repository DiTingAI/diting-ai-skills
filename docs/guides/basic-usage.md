---
layout: guide
title: Basic Usage
description: Learn the basics of using Diting AI Skills - commands, workflows, and best practices
permalink: /guides/basic-usage
---

# Basic Usage Guide

This guide covers the fundamental usage of Diting AI Skills, including common commands, workflows, and best practices.

## 📋 Command Overview

### Core Commands

```bash
# View all available commands
diting --help

# Get version information
diting --version

# Configure settings
diting config
```

### Transcription Commands

```bash
# Transcribe from Bilibili URL
diting transcribe --url "https://www.bilibili.com/video/BV1xxx"

# Check task status
diting transcribe --task-id tsk_xxx --poll
```

### Knowledge Base Commands

```bash
# Search knowledge base
diting search --query "search keywords"

# Read asset details
diting asset-read --task-id tsk_xxx

# Update file content
diting update --task-id tsk_xxx --content "new content"
```

## 🎯 Getting Started

### 1. Configure Your Environment

```bash
# Set API key (replace with your actual key)
export DITING_API_KEY=sk-diting-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# For permanent setup, add to shell profile
echo 'export DITING_API_KEY=sk-diting-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' >> ~/.bashrc
source ~/.bashrc
```

### 2. Test Your Setup

```bash
# Verify installation
diting --version

# Test API connection with a simple search
diting search --query "test" --limit 1
```

### 3. First Transcription

```bash
# Try a Bilibili video transcription
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# Note the task ID from the output
# Example: Task created: tsk_20260706_abc123def456
```

## 📊 Understanding Task IDs

Every operation in Diting AI Skills returns a Task ID. This is important for tracking and retrieving results.

### Task ID Format
```
tsk_YYYYMMDD_randomstring
```
- `tsk_` - Task prefix
- `YYYYMMDD` - Date when task was created
- `randomstring` - Unique identifier

### Working with Task IDs

```bash
# Store task ID in variable for easy reference
TASK_ID="tsk_20260706_abc123def456"

# Use the variable in commands
diting asset-read --task-id $TASK_ID
diting transcribe --task-id $TASK_ID --poll
```

## 🔄 Workflow Patterns

### Pattern 1: Simple Transcription

```bash
# 1. Submit transcription task
TASK_ID=$(diting transcribe --url "B站链接" | grep -o "tsk_[^ ]*")

# 2. Wait for completion
diting transcribe --task-id $TASK_ID --poll

# 3. Get results
diting asset-read --task-id $TASK_ID --type original
diting asset-read --task-id $TASK_ID --type summary
```

### Pattern 2: Batch Processing

```bash
#!/bin/bash
# Process multiple videos

VIDEOS=(
  "https://www.bilibili.com/video/BV1xxx"
  "https://www.bilibili.com/video/BV1yyy"
  "https://www.bilibili.com/video/BV1zzz"
)

for VIDEO_URL in "${VIDEOS[@]}"; do
  echo "Processing: $VIDEO_URL"
  TASK_ID=$(diting transcribe --url "$VIDEO_URL" | grep -o "tsk_[^ ]*")
  echo "Task ID: $TASK_ID"
  
  # Wait a moment before next request
  sleep 2
done
```

### Pattern 3: Search and Analyze

```bash
# 1. Search for content
diting search --query "machine learning" --limit 10

# 2. Note interesting task IDs from results

# 3. Get detailed information for specific tasks
diting asset-read --task-id tsk_xxx --type summary
diting asset-read --task-id tsk_yyy --type mindmap
```

## 🎨 Output Formats

### Text Output

```bash
# Default output (formatted text)
diting asset-read --task-id tsk_xxx

# Raw text (no formatting)
diting asset-read --task-id tsk_xxx --raw

# JSON output (for scripting)
diting asset-read --task-id tsk_xxx --json
```

### File Output

```bash
# Save output to file
diting asset-read --task-id tsk_xxx --type original > transcription.txt

# Append to existing file
diting asset-read --task-id tsk_xxx --type summary >> summaries.txt
```

## ⚙️ Configuration Options

### Environment Variables

```bash
# API Key (required)
export DITING_API_KEY=your_key_here

# API endpoint (optional, defaults to production)
export DITING_API_BASE=https://api.diting.cc

# Verbose mode (optional)
export DITING_VERBOSE=true

# Timeout settings (optional)
export DITING_TIMEOUT=30
```

### Command Line Options

```bash
# Set API key per command
diting --api-key your_key_here search --query "test"

# Enable verbose output
diting --verbose transcribe --url "https://..."

# Set custom timeout
diting --timeout 60 upload --file "large_video.mp4"
```

## 🔍 Advanced Usage

### Filtering Search Results

```bash
# Search with date filters
diting search --query "python" \
  --start-date "2024-01-01" \
  --end-date "2024-12-31"

# Search with type filter
diting search --query "tutorial" --type video

# Search with pagination
diting search --query "ai" --limit 20 --offset 0
```

### Task Management

```bash
# Monitor multiple tasks
for TASK_ID in tsk_xxx tsk_yyy tsk_zzz; do
  diting transcribe --task-id $TASK_ID --poll
done

# Get task status without polling
diting asset-read --task-id tsk_xxx --status-only
```

### Error Handling

```bash
# Check for errors
if ! diting transcribe --url "invalid_url"; then
  echo "Transcription failed. Check the URL and try again."
fi

# Retry logic
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if diting transcribe --url "https://www.bilibili.com/video/BV1xxx"; then
    echo "Success!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 5
done
```

## 🛠️ Integration Examples

### Shell Script Integration

```bash
#!/bin/bash
# transcribe.sh - Automated transcription script

VIDEO_URL="$1"
OUTPUT_DIR="${2:-./transcriptions}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Submit transcription
echo "Submitting transcription for: $VIDEO_URL"
TASK_ID=$(diting transcribe --url "$VIDEO_URL" | grep -o "tsk_[^ ]*")

if [ -z "$TASK_ID" ]; then
  echo "Error: Failed to get task ID"
  exit 1
fi

echo "Task ID: $TASK_ID"

# Wait for completion
echo "Waiting for transcription to complete..."
diting transcribe --task-id "$TASK_ID" --poll

# Save results
echo "Saving results..."
diting asset-read --task-id "$TASK_ID" --type original > "$OUTPUT_DIR/${TASK_ID}_original.txt"
diting asset-read --task-id "$TASK_ID" --type summary > "$OUTPUT_DIR/${TASK_ID}_summary.txt"

echo "Done! Files saved in: $OUTPUT_DIR"
```

### Python Integration

```python
#!/usr/bin/env python3
import subprocess
import json
import time

def transcribe_video(url):
    """Transcribe a video and return results"""
    
    # Submit transcription task
    cmd = ["diting", "transcribe", "--url", url]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        raise Exception(f"Transcription failed: {result.stderr}")
    
    # Extract task ID
    output = result.stdout
    task_id = None
    for line in output.split('\n'):
        if line.startswith('Task created:'):
            task_id = line.split()[-1]
            break
    
    if not task_id:
        raise Exception("Could not find task ID in output")
    
    # Poll for completion
    while True:
        cmd = ["diting", "transcribe", "--task-id", task_id, "--poll"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if "completed" in result.stdout.lower():
            break
        
        time.sleep(5)
    
    # Get results in JSON format
    cmd = ["diting", "asset-read", "--task-id", task_id, "--json"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    return json.loads(result.stdout)

# Example usage
if __name__ == "__main__":
    try:
        results = transcribe_video("https://www.bilibili.com/video/BV1xxx")
        print(json.dumps(results, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")
```

## 📝 Best Practices

### 1. Organize Your Work

```bash
# Create project directories
mkdir -p projects/{raw,transcripts,summaries}

# Use consistent naming
diting transcribe --url "$URL" > "projects/raw/$(date +%Y%m%d_%H%M%S).log"
```

### 2. Monitor Resource Usage

```bash
# Check task status regularly
watch -n 10 'diting transcribe --task-id tsk_xxx --poll'

# Log all operations
diting transcribe --url "$URL" --verbose 2>&1 | tee transcription.log
```

### 3. Handle Large Files

```bash
# Split large videos before processing
ffmpeg -i large_video.mp4 -c copy -map 0 -segment_time 1800 -f segment output_%03d.mp4

# 注意：本地分段文件暂不支持上传，请改为提交 B 站视频链接：
# for segment in output_*.mp4; do
#   diting transcribe --url "https://www.bilibili.com/video/BV1xxx"
# done
```

## 🆘 Troubleshooting

### Common Issues

**Issue**: "API Key not configured"
```bash
# Solution: Set API key
export DITING_API_KEY=your_key_here
```

**Issue**: "Network error"
```bash
# Solution: Check connectivity
ping api.diting.cc

# Solution: Use verbose mode for details
diting --verbose transcribe --url "$URL"
```

**Issue**: "Task not found"
```bash
# Solution: Verify task ID
echo "Last task ID: $TASK_ID"

# Solution: Check task status
diting asset-read --task-id "$TASK_ID" --status-only
```

### Debug Mode

```bash
# Enable debug output
export DITING_DEBUG=true

# Run command with full trace
diting --debug transcribe --url "$URL"
```

## 📚 Next Steps

- Explore [Video Transcription Guide](video-transcription.md) for detailed video processing
- Learn about [Knowledge Base Search](knowledge-base-search.md) for advanced search techniques
- Check [AI Assistant Integration](ai-assistant-integration.md) for working with AI assistants
- Visit [Examples](../examples/) for real-world usage patterns

---

**Pro Tip**: Use aliases for common commands:
```bash
# Add to ~/.bashrc or ~/.zshrc
alias dtranscribe='diting transcribe'
alias dsearch='diting search'
alias dstatus='diting transcribe --task-id'
```

**Last Updated**: 2026-07-06