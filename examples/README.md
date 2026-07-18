# Diting AI Skills Examples

Practical examples and usage patterns for Diting AI Skills.

## 📁 Examples Structure

### 📚 Basic Examples
- [Video Transcription](basic/video-transcription.md) - Transcribe videos from Bilibili
- [Audio Processing](basic/audio-processing.md) - Process audio files
- [Knowledge Search](basic/knowledge-search.md) - Search knowledge base
- [File Management](basic/file-management.md) - Manage files and folders

### 🚀 Advanced Examples
- [Batch Processing](advanced/batch-processing.md) - Process multiple files
- [API Integration](advanced/api-integration.md) - Integrate with other APIs
- [Custom Workflows](advanced/custom-workflows.md) - Create custom workflows
- [Performance Optimization](advanced/performance.md) - Optimize performance

### 🔄 Workflow Examples
- [Research Workflow](workflows/research.md) - Academic research workflow
- [Content Creation](workflows/content-creation.md) - Content creation workflow
- [Meeting Management](workflows/meeting-management.md) - Meeting recording workflow
- [Learning Assistant](workflows/learning.md) - Learning and education workflow

### 🤖 Integration Examples
- [XiaoLongXia Integration](integration/xiaolongxia.md) - XiaoLongXia assistant integration
- [Cursor Integration](integration/cursor.md) - Cursor AI integration
- [Claude Integration](integration/claude.md) - Claude AI integration
- [Codex Integration](integration/codex.md) - Codex integration
- [Shell Scripts](integration/shell-scripts.md) - Shell script integration

## 🎯 Quick Examples

### Example 1: Transcribe Bilibili Video
```bash
# Transcribe a single video
diting transcribe --url "https://www.bilibili.com/video/BV1f6HheYExS"

# Transcribe and get summary
diting transcribe --url "https://www.bilibili.com/video/BV1xxx" && \
diting asset-read --task-id tsk_xxx --type summary
```

### Example 2: Transcribe Bilibili Videos
```bash
# Transcribe a Bilibili video
diting transcribe --url "https://www.bilibili.com/video/BV1xxx"

# Process multiple videos
for url in "$@"; do
  echo "Processing $url..."
  diting transcribe --url "$url"
done
```

### Example 3: Search and Export
```bash
# Search and save results to file
diting search --query "artificial intelligence" --limit 20 > ai_results.json

# Search with date filter
diting search --query "machine learning" \
  --start-date "2024-01-01" \
  --end-date "2024-12-31" \
  --type video
```

### Example 4: AI Assistant Prompt
```bash
# XiaoLongXia prompt template
echo "请帮我转录这个B站视频：https://www.bilibili.com/video/BV1xxx"
echo "然后搜索相关的知识库内容"

# Automated workflow
diting transcribe --url "https://www.bilibili.com/video/BV1xxx" && \
sleep 10 && \
diting asset-read --task-id $(cat last_task.txt) --type summary
```

## 🔧 Example Scripts

### Batch Transcription Script
```bash
#!/bin/bash
# batch-transcribe.sh

# Set API key
export DITING_API_KEY="your_api_key_here"

# Process all Bilibili video URLs listed in urls.txt
while read -r url; do
  echo "Processing: $url"
  diting transcribe --url "$url"
  sleep 5
done < urls.txt
```

### Research Assistant Script
```bash
#!/bin/bash
# research-assistant.sh

# Search for papers and transcribe related videos
QUERY="deep learning"
LIMIT=10

echo "Searching for: $QUERY"
diting search --query "$QUERY" --limit $LIMIT > search_results.json

# Extract video URLs and transcribe
jq -r '.results[].url' search_results.json | while read url; do
  if [[ $url == *"bilibili.com"* ]]; then
    echo "Transcribing: $url"
    diting transcribe --url "$url"
  fi
done
```

### Meeting Summary Script
```bash
#!/bin/bash
# meeting-summary.sh

MEETING_FILE="$1"
OUTPUT_DIR="./meeting_summaries"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Transcribe meeting recording (提交 B 站会议录像链接)
echo "Processing meeting recording: $MEETING_FILE"
TASK_ID=$(diting transcribe --url "$MEETING_FILE" | grep -o "tsk_[a-zA-Z0-9_]*")

# Wait for transcription
echo "Waiting for transcription to complete..."
sleep 30

# Get all outputs
diting asset-read --task-id "$TASK_ID" --type original > "$OUTPUT_DIR/original.txt"
diting asset-read --task-id "$TASK_ID" --type summary > "$OUTPUT_DIR/summary.txt"
diting asset-read --task-id "$TASK_ID" --type mindmap > "$OUTPUT_DIR/mindmap.json"

echo "Meeting summary saved to: $OUTPUT_DIR"
```

## 🎨 Integration Examples

### Python Integration
```python
import subprocess
import json

def transcribe_video(url):
    """Transcribe a Bilibili video using Diting AI Skills"""
    result = subprocess.run(
        ["diting", "transcribe", "--url", url],
        capture_output=True,
        text=True
    )
    return result.stdout

def search_knowledge(query, limit=10):
    """Search knowledge base"""
    result = subprocess.run(
        ["diting", "search", "--query", query, "--limit", str(limit)],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)
```

### Node.js Integration
```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function transcribeVideo(url) {
  const { stdout } = await execPromise(`diting transcribe --url "${url}"`);
  return stdout;
}

async function searchKnowledge(query, limit = 10) {
  const { stdout } = await execPromise(
    `diting search --query "${query}" --limit ${limit}`
  );
  return JSON.parse(stdout);
}
```

## 📊 Real-World Use Cases

### 1. Educational Content Creation
```bash
# Transcribe educational videos
diting transcribe --url "https://www.bilibili.com/video/BV1xxx"

# Extract key points
diting asset-read --task-id tsk_xxx --type summary

# Search for related materials
diting search --query "educational topic"
```

### 2. Research Paper Analysis
```bash
# Transcribe research presentations
for url in $(cat research_videos.txt); do
  diting transcribe --url "$url"
done

# Analyze all transcripts
find . -name "*.txt" -exec grep -l "key term" {} \;
```

### 3. Team Meeting Management
```bash
# Process weekly meetings
MEETINGS=("meeting1.mp4" "meeting2.mp4" "meeting3.mp4")

for meeting in "${MEETINGS[@]}"; do
  echo "Processing: $meeting"
  diting transcribe --url "$meeting"
  # Generate summary and action items
done
```

## 🚀 Getting Started with Examples

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/diting-ai/diting-skills.git
   cd diting-skills/examples
   ```

2. **Set up your API key**:
   ```bash
   export DITING_API_KEY=your_api_key_here
   ```

3. **Run an example**:
   ```bash
   chmod +x examples/batch-transcribe.sh
   ./examples/batch-transcribe.sh
   ```

4. **Modify for your needs**:
   - Update file paths
   - Change search queries
   - Adjust workflow logic

## 📝 Contributing Examples

Have a great example? We'd love to include it! Please:

1. Create a new file in the appropriate directory
2. Include clear instructions
3. Add comments explaining the code
4. Test your example works
5. Submit a pull request

## 🔗 Related Resources
- [Documentation](../docs/)
- [CLI Reference](../docs/api/cli-commands.md)
- [API Documentation](https://api.diting.cc/docs)
- [GitHub Repository](https://github.com/diting-ai/diting-skills)

---

**Need Help?** Check out our [FAQ](../docs/faq/common-issues.md) or [open an issue](https://github.com/diting-ai/diting-skills/issues).