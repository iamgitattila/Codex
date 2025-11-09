# Video Categorizer - AI-Powered Video Organization Tool

Automatically transcribe, analyze, and organize your video files using AI. This tool uses OpenAI's Whisper for transcription and GPT-4 for intelligent categorization based on audience type, marketing angle, presentation style, and psychological triggers.

## Features

- **Automatic Transcription**: Transcribes audio from MP4 and MOV video files
- **AI-Powered Analysis**: Categorizes videos by:
  - **Audience Type**: Cold audience vs. Retargeting
  - **Marketing Angle**: Pain-point-solution, social proof, urgency, educational, etc.
  - **Presentation Style**: Casual, professional, energetic, humorous, etc.
  - **Psychology**: FOMO, authority, social proof, scarcity, curiosity, etc.
- **Intelligent Organization**: Automatically renames and organizes videos into folders
- **Descriptive Filenames**: Systematic naming like `COLD_pain-point-solution_energetic_urgency.mp4`
- **Detailed Results**: Exports JSON report with all analysis data

## Prerequisites

### 1. Python 3.8 or higher
Download from: https://www.python.org/downloads/

During installation, **make sure to check "Add Python to PATH"**

### 2. FFmpeg
FFmpeg is required for audio extraction from videos.

**Windows 11 Installation (easiest method):**
```bash
winget install ffmpeg
```

**Alternative method:**
1. Download FFmpeg from: https://ffmpeg.org/download.html
2. Extract the archive
3. Add the `bin` folder to your Windows PATH environment variable

**Verify installation:**
```bash
ffmpeg -version
```

### 3. OpenAI API Key
1. Sign up at: https://platform.openai.com/
2. Generate an API key from the API keys section
3. You'll need to add credits to your account for usage

## Installation

### Step 1: Clone or Download

Download all the files to a folder on your computer.

### Step 2: Install Python Dependencies

Open Command Prompt or PowerShell in the project folder and run:

```bash
pip install -r requirements.txt
```

### Step 3: Configure the Tool

1. Copy `config.json.example` to `config.json`:
   ```bash
   copy config.json.example config.json
   ```

2. Edit `config.json` and add your OpenAI API key:
   ```json
   {
     "openai_api_key": "sk-your-actual-api-key-here",
     "video_extensions": [".mp4", ".mov"],
     "input_folder": "./videos",
     "output_folder": "./categorized_videos",
     "transcription_model": "whisper-1",
     "analysis_model": "gpt-4o-mini",
     "create_subfolders": true,
     "copy_instead_of_move": false
   }
   ```

### Configuration Options

- **openai_api_key**: Your OpenAI API key (required)
- **video_extensions**: List of video file extensions to process
- **input_folder**: Folder containing videos to process
- **output_folder**: Folder where categorized videos will be saved
- **transcription_model**: OpenAI Whisper model (default: "whisper-1")
- **analysis_model**: OpenAI model for analysis (options: "gpt-4o-mini", "gpt-4o", "gpt-4-turbo")
- **create_subfolders**: Create separate folders for cold/retargeting (true/false)
- **copy_instead_of_move**: Copy files instead of moving them (true/false)

## Usage

### Step 1: Add Your Videos

Place your MP4 or MOV video files in the `videos` folder (or the folder specified in `input_folder`).

### Step 2: Run the Script

**Option A: Using Python directly**
```bash
python video_categorizer.py
```

**Option B: Using the batch file (Windows)**
```bash
run_categorizer.bat
```

### Step 3: Review Results

The script will:
1. Transcribe each video's audio
2. Analyze the content using AI
3. Rename and organize files into categories
4. Create a `categorization_results.json` file with detailed results

## Output Structure

### With Subfolders (default):
```
categorized_videos/
├── cold/
│   ├── COLD_pain-point-solution_energetic_urgency.mp4
│   └── COLD_educational_professional_curiosity.mp4
└── retargeting/
    ├── RETARGETING_social-proof_casual_fomo.mp4
    └── RETARGETING_testimonial_serious_authority.mp4
```

### Without Subfolders:
```
categorized_videos/
├── COLD_pain-point-solution_energetic_urgency.mp4
├── COLD_educational_professional_curiosity.mp4
├── RETARGETING_social-proof_casual_fomo.mp4
└── RETARGETING_testimonial_serious_authority.mp4
```

## Filename Format

Files are renamed using this pattern:
```
{AUDIENCE}_{ANGLE}_{STYLE}_{PSYCHOLOGY}.{extension}
```

Example: `COLD_pain-point-solution_energetic_urgency.mp4`

## Results File

The `categorization_results.json` file contains detailed information:

```json
[
  {
    "original_path": "./videos/video1.mp4",
    "filename": "video1.mp4",
    "success": true,
    "transcript": "Hello everyone, today I want to talk about...",
    "analysis": {
      "audience_type": "cold",
      "angle": "pain-point-solution",
      "style": "energetic",
      "psychology": "urgency",
      "summary": "Introduces common problem and presents solution",
      "confidence": "high"
    },
    "new_path": "./categorized_videos/cold/COLD_pain-point-solution_energetic_urgency.mp4"
  }
]
```

## Cost Estimates

Using OpenAI API (approximate costs as of 2024):

- **Whisper Transcription**: ~$0.006 per minute of audio
- **GPT-4o-mini Analysis**: ~$0.001-0.002 per video

Example: Processing 10 videos (5 minutes each) ≈ $0.30-0.50

For cheaper costs, you can:
- Use `gpt-4o-mini` instead of `gpt-4o` (already set as default)
- Process videos in batches

## Troubleshooting

### FFmpeg Not Found
```
Error: FFmpeg not found
```
**Solution**: Install FFmpeg using `winget install ffmpeg` or add it to your PATH.

### OpenAI API Key Error
```
ERROR: Please set your OpenAI API key in config.json
```
**Solution**: Edit `config.json` and add your actual API key.

### No Videos Found
```
No videos found in ./videos
```
**Solution**: Make sure your video files are in the correct folder and have .mp4 or .mov extensions.

### Transcription Failed
**Possible causes**:
- Video has no audio track
- Audio format is incompatible
- File is corrupted

**Solution**: Try converting the video with a tool like VLC or HandBrake.

### Rate Limit Errors
```
Rate limit exceeded
```
**Solution**:
- Wait a few moments and try again
- Check your OpenAI account has available credits
- Reduce the number of videos processed at once

## Advanced Usage

### Processing Specific Videos

Modify the script to process specific videos:

```python
# In main(), before categorizer.process_all()
categorizer.process_video("path/to/specific/video.mp4")
```

### Customizing Categories

Edit the `system_prompt` in the `VideoAnalyzer.analyze_transcript()` method to customize:
- Category types
- Analysis criteria
- Output format

### Batch Processing

Process videos in batches by organizing them into different input folders and running the script multiple times.

## Tips for Best Results

1. **Clear Audio**: Videos with clear, audible speech produce better transcriptions
2. **Descriptive Content**: Videos with explicit mentions of audience type and intent are categorized more accurately
3. **Review Results**: Check the `categorization_results.json` file to verify accuracy
4. **Test First**: Process a few videos first to verify the setup before processing large batches
5. **Backup**: Keep backups of original files if using move mode instead of copy mode

## Privacy & Security

- All processing happens through OpenAI's API
- Video files are NOT uploaded - only extracted audio is sent for transcription
- Transcripts and analysis results are stored locally
- Keep your API key secure and never share it

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review OpenAI API documentation: https://platform.openai.com/docs
3. Ensure FFmpeg is properly installed: `ffmpeg -version`

## License

This tool is provided as-is for personal and commercial use.

## Changelog

### Version 1.0.0
- Initial release
- Whisper API transcription
- GPT-4 powered categorization
- Automatic file organization
- JSON results export
