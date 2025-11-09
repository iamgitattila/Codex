"""
Video Categorizer - AI-powered video transcription and categorization tool
Transcribes video audio and categorizes by audience type, angle, style, and psychology
"""

import os
import json
import re
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import subprocess

try:
    from openai import OpenAI
except ImportError:
    print("OpenAI library not installed. Run: pip install openai")
    exit(1)


class VideoCategorizerConfig:
    """Configuration management for the video categorizer"""

    def __init__(self, config_file: str = "config.json"):
        self.config_file = config_file
        self.config = self._load_config()

    def _load_config(self) -> Dict:
        """Load configuration from file or create default"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return json.load(f)
        else:
            default_config = {
                "openai_api_key": "YOUR_OPENAI_API_KEY_HERE",
                "video_extensions": [".mp4", ".mov"],
                "input_folder": "./videos",
                "output_folder": "./categorized_videos",
                "transcription_model": "whisper-1",
                "analysis_model": "gpt-4o-mini",
                "create_subfolders": True,
                "copy_instead_of_move": False
            }
            with open(self.config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
            print(f"Created default config file: {self.config_file}")
            print("Please edit it with your OpenAI API key and settings.")
            return default_config

    def get(self, key: str, default=None):
        """Get configuration value"""
        return self.config.get(key, default)


class VideoTranscriber:
    """Handles video transcription using OpenAI Whisper API"""

    def __init__(self, api_key: str, model: str = "whisper-1"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def extract_audio(self, video_path: str, output_audio_path: str) -> bool:
        """Extract audio from video using ffmpeg"""
        try:
            # Check if ffmpeg is available
            result = subprocess.run(
                ['ffmpeg', '-version'],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                print("FFmpeg not found. Please install FFmpeg.")
                return False

            # Extract audio
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-vn',  # No video
                '-acodec', 'libmp3lame',  # MP3 codec
                '-ar', '16000',  # 16kHz sample rate
                '-ac', '1',  # Mono
                '-b:a', '64k',  # Bitrate
                '-y',  # Overwrite output file
                output_audio_path
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True
            )

            return result.returncode == 0

        except Exception as e:
            print(f"Error extracting audio: {e}")
            return False

    def transcribe_video(self, video_path: str) -> Optional[str]:
        """Transcribe video audio to text"""
        print(f"Transcribing: {os.path.basename(video_path)}")

        # Create temp audio file
        temp_audio = "temp_audio.mp3"

        try:
            # Extract audio
            if not self.extract_audio(video_path, temp_audio):
                print(f"Failed to extract audio from {video_path}")
                return None

            # Transcribe using Whisper API
            with open(temp_audio, 'rb') as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    response_format="text"
                )

            return transcript

        except Exception as e:
            print(f"Error transcribing {video_path}: {e}")
            return None

        finally:
            # Clean up temp file
            if os.path.exists(temp_audio):
                os.remove(temp_audio)


class VideoAnalyzer:
    """Analyzes transcripts to categorize videos"""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def analyze_transcript(self, transcript: str, filename: str) -> Dict:
        """Analyze transcript and return categorization"""

        system_prompt = """You are an expert marketing analyst specializing in video content categorization.
Analyze the video transcript and provide detailed categorization.

Return a JSON object with the following structure:
{
    "audience_type": "cold" or "retargeting",
    "angle": "brief description of the marketing angle (e.g., 'pain-point-solution', 'social-proof', 'urgency-scarcity', 'educational', 'testimonial', 'problem-agitation', 'before-after', 'story-driven')",
    "style": "brief description of presentation style (e.g., 'casual', 'professional', 'energetic', 'calm', 'humorous', 'serious', 'conversational')",
    "psychology": "primary psychological trigger (e.g., 'fear-of-missing-out', 'authority', 'social-proof', 'reciprocity', 'scarcity', 'curiosity', 'pain-avoidance', 'desire-gain')",
    "summary": "one-sentence summary of the video content",
    "confidence": "high", "medium", or "low"
}

Definitions:
- COLD AUDIENCE: Content designed for people who don't know the brand/product. Focuses on awareness, education, problem introduction, broad appeal.
- RETARGETING: Content for people already familiar with brand/product. Assumes prior knowledge, addresses objections, pushes for conversion, references previous interactions.
"""

        user_prompt = f"""Analyze this video transcript and categorize it:

FILENAME: {filename}

TRANSCRIPT:
{transcript[:4000]}  # Limit to avoid token limits

Provide the categorization in valid JSON format."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )

            analysis = json.loads(response.choices[0].message.content)
            return analysis

        except Exception as e:
            print(f"Error analyzing transcript: {e}")
            return {
                "audience_type": "unknown",
                "angle": "unknown",
                "style": "unknown",
                "psychology": "unknown",
                "summary": "Analysis failed",
                "confidence": "low"
            }


class VideoOrganizer:
    """Organizes and renames videos based on analysis"""

    def __init__(self, output_folder: str, create_subfolders: bool = True, copy_mode: bool = False):
        self.output_folder = output_folder
        self.create_subfolders = create_subfolders
        self.copy_mode = copy_mode

        # Create output folder if it doesn't exist
        os.makedirs(output_folder, exist_ok=True)

    def sanitize_filename(self, text: str) -> str:
        """Sanitize text for use in filename"""
        # Remove invalid characters
        text = re.sub(r'[<>:"/\\|?*]', '', text)
        # Replace spaces and multiple dashes
        text = re.sub(r'\s+', '-', text)
        text = re.sub(r'-+', '-', text)
        # Limit length
        return text[:100].strip('-')

    def generate_filename(self, original_path: str, analysis: Dict) -> str:
        """Generate descriptive filename based on analysis"""

        # Extract original extension
        ext = os.path.splitext(original_path)[1]

        # Build filename components
        audience = analysis.get('audience_type', 'unknown').upper()
        angle = self.sanitize_filename(analysis.get('angle', 'unknown'))
        style = self.sanitize_filename(analysis.get('style', 'unknown'))
        psychology = self.sanitize_filename(analysis.get('psychology', 'unknown'))

        # Format: AUDIENCE_ANGLE_STYLE_PSYCH.ext
        new_filename = f"{audience}_{angle}_{style}_{psychology}{ext}"

        return new_filename

    def organize_video(self, video_path: str, analysis: Dict) -> str:
        """Move/copy video to organized location with new name"""

        audience_type = analysis.get('audience_type', 'unknown')

        # Determine destination folder
        if self.create_subfolders:
            dest_folder = os.path.join(self.output_folder, audience_type)
        else:
            dest_folder = self.output_folder

        os.makedirs(dest_folder, exist_ok=True)

        # Generate new filename
        new_filename = self.generate_filename(video_path, analysis)
        dest_path = os.path.join(dest_folder, new_filename)

        # Handle duplicate filenames
        counter = 1
        base_name, ext = os.path.splitext(dest_path)
        while os.path.exists(dest_path):
            dest_path = f"{base_name}_{counter}{ext}"
            counter += 1

        # Copy or move file
        try:
            if self.copy_mode:
                shutil.copy2(video_path, dest_path)
                print(f"Copied: {os.path.basename(video_path)}")
            else:
                shutil.move(video_path, dest_path)
                print(f"Moved: {os.path.basename(video_path)}")

            print(f"  -> {dest_path}")
            return dest_path

        except Exception as e:
            print(f"Error organizing {video_path}: {e}")
            return video_path


class VideoCategorizer:
    """Main class orchestrating the video categorization process"""

    def __init__(self, config_file: str = "config.json"):
        self.config = VideoCategorizerConfig(config_file)

        # Initialize components
        api_key = self.config.get('openai_api_key')
        if api_key == "YOUR_OPENAI_API_KEY_HERE":
            print("ERROR: Please set your OpenAI API key in config.json")
            exit(1)

        self.transcriber = VideoTranscriber(
            api_key=api_key,
            model=self.config.get('transcription_model', 'whisper-1')
        )

        self.analyzer = VideoAnalyzer(
            api_key=api_key,
            model=self.config.get('analysis_model', 'gpt-4o-mini')
        )

        self.organizer = VideoOrganizer(
            output_folder=self.config.get('output_folder', './categorized_videos'),
            create_subfolders=self.config.get('create_subfolders', True),
            copy_mode=self.config.get('copy_instead_of_move', False)
        )

        # Results tracking
        self.results = []

    def find_videos(self, folder: str) -> List[str]:
        """Find all video files in folder"""
        video_extensions = self.config.get('video_extensions', ['.mp4', '.mov'])
        videos = []

        for ext in video_extensions:
            videos.extend(Path(folder).glob(f'*{ext}'))
            videos.extend(Path(folder).glob(f'*{ext.upper()}'))

        return [str(v) for v in videos]

    def process_video(self, video_path: str) -> Dict:
        """Process a single video: transcribe, analyze, organize"""

        print(f"\n{'='*60}")
        print(f"Processing: {os.path.basename(video_path)}")
        print(f"{'='*60}")

        result = {
            'original_path': video_path,
            'filename': os.path.basename(video_path),
            'success': False
        }

        # Step 1: Transcribe
        transcript = self.transcriber.transcribe_video(video_path)
        if not transcript:
            result['error'] = 'Transcription failed'
            return result

        result['transcript'] = transcript[:500] + "..." if len(transcript) > 500 else transcript
        print(f"Transcript preview: {result['transcript']}\n")

        # Step 2: Analyze
        analysis = self.analyzer.analyze_transcript(transcript, os.path.basename(video_path))
        result['analysis'] = analysis

        print(f"Analysis Results:")
        print(f"  Audience Type: {analysis.get('audience_type', 'unknown').upper()}")
        print(f"  Angle: {analysis.get('angle', 'unknown')}")
        print(f"  Style: {analysis.get('style', 'unknown')}")
        print(f"  Psychology: {analysis.get('psychology', 'unknown')}")
        print(f"  Summary: {analysis.get('summary', 'N/A')}")
        print(f"  Confidence: {analysis.get('confidence', 'unknown')}")

        # Step 3: Organize
        new_path = self.organizer.organize_video(video_path, analysis)
        result['new_path'] = new_path
        result['success'] = True

        return result

    def process_all(self):
        """Process all videos in input folder"""
        input_folder = self.config.get('input_folder', './videos')

        if not os.path.exists(input_folder):
            print(f"Creating input folder: {input_folder}")
            os.makedirs(input_folder)
            print(f"Please place your video files in {input_folder} and run again.")
            return

        videos = self.find_videos(input_folder)

        if not videos:
            print(f"No videos found in {input_folder}")
            print(f"Looking for extensions: {self.config.get('video_extensions')}")
            return

        print(f"Found {len(videos)} video(s) to process\n")

        for video in videos:
            result = self.process_video(video)
            self.results.append(result)

        # Save results
        self.save_results()

        # Print summary
        self.print_summary()

    def save_results(self):
        """Save processing results to JSON file"""
        output_file = "categorization_results.json"
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\nResults saved to: {output_file}")

    def print_summary(self):
        """Print processing summary"""
        print(f"\n{'='*60}")
        print("PROCESSING SUMMARY")
        print(f"{'='*60}")

        successful = sum(1 for r in self.results if r.get('success'))
        failed = len(self.results) - successful

        print(f"Total videos processed: {len(self.results)}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")

        # Category breakdown
        cold = sum(1 for r in self.results
                  if r.get('analysis', {}).get('audience_type') == 'cold')
        retargeting = sum(1 for r in self.results
                         if r.get('analysis', {}).get('audience_type') == 'retargeting')

        print(f"\nAudience Breakdown:")
        print(f"  Cold Audience: {cold}")
        print(f"  Retargeting: {retargeting}")

        print(f"\nOutput folder: {self.config.get('output_folder')}")


def main():
    """Main entry point"""
    print("="*60)
    print("VIDEO CATEGORIZER - AI-Powered Video Organization")
    print("="*60)
    print()

    # Initialize and run
    categorizer = VideoCategorizer()
    categorizer.process_all()

    print("\n" + "="*60)
    print("Processing complete!")
    print("="*60)


if __name__ == "__main__":
    main()
