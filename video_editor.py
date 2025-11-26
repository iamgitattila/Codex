#!/usr/bin/env python3
"""
VSL Video Editor - Mini Video Sales Letter Creator

Creates professional mini VSLs from hook, body, and call-to-action clips
with the top 3 most used video editing transition effects:
1. Cross Dissolve (Fade) - Smooth blending between clips
2. Zoom/Push In - Creates energy and focus
3. Slide/Wipe - Professional sliding transitions

Usage:
    python video_editor.py --hook hook.mp4 --body body.mp4 --cta cta.mp4 --output final.mp4
    python video_editor.py --clips clip1.mp4 clip2.mp4 clip3.mp4 --effects fade zoom slide --output final.mp4
"""

import argparse
import os
import sys
from typing import List, Optional, Literal, Tuple
from dataclasses import dataclass
from enum import Enum

try:
    from moviepy.editor import (
        VideoFileClip,
        CompositeVideoClip,
        concatenate_videoclips,
        vfx,
        ColorClip
    )
    import numpy as np
except ImportError:
    print("Error: moviepy is required. Install with: pip install moviepy")
    print("You may also need: pip install numpy")
    sys.exit(1)


class TransitionEffect(Enum):
    """Top 3 most used video editing transition effects."""
    CROSS_DISSOLVE = "fade"      # #1 - The classic, most used transition
    ZOOM_IN = "zoom"             # #2 - Creates energy and emphasis
    SLIDE_LEFT = "slide"         # #3 - Professional wipe/slide effect


@dataclass
class VSLSegment:
    """Represents a segment of the VSL (hook, body, or CTA)."""
    clip_path: str
    segment_type: Literal["hook", "body", "cta"]
    transition_in: Optional[TransitionEffect] = None
    transition_out: Optional[TransitionEffect] = None


class VideoEffects:
    """
    Implementation of the top 3 most used video editing effects.

    These effects are industry standards used by professional editors:
    1. Cross Dissolve (Fade) - Smooth opacity transition, timeless and elegant
    2. Zoom/Push In - Creates forward momentum and viewer engagement
    3. Slide/Wipe - Clean directional transition, very professional
    """

    @staticmethod
    def cross_dissolve(clip1: VideoFileClip, clip2: VideoFileClip,
                       duration: float = 0.5) -> CompositeVideoClip:
        """
        #1 Most Used Effect: Cross Dissolve / Fade

        The most popular transition in video editing. Creates a smooth
        blend between two clips by fading one out while fading the other in.

        Args:
            clip1: First video clip (fades out)
            clip2: Second video clip (fades in)
            duration: Transition duration in seconds

        Returns:
            CompositeVideoClip with the cross dissolve applied
        """
        # Ensure clips have the same size
        clip2 = clip2.resize(clip1.size)

        # Create fade out for clip1 (last 'duration' seconds)
        clip1_faded = clip1.crossfadeout(duration)

        # Create fade in for clip2 (first 'duration' seconds)
        clip2_faded = clip2.crossfadein(duration)

        # Overlap the clips
        clip2_delayed = clip2_faded.set_start(clip1.duration - duration)

        # Composite them together
        final = CompositeVideoClip([clip1_faded, clip2_delayed])
        final = final.set_duration(clip1.duration + clip2.duration - duration)

        return final

    @staticmethod
    def zoom_in_transition(clip1: VideoFileClip, clip2: VideoFileClip,
                           duration: float = 0.5, zoom_factor: float = 1.3) -> CompositeVideoClip:
        """
        #2 Most Used Effect: Zoom In / Push In

        Creates energy and draws viewer attention. The first clip zooms in
        while fading, then the second clip appears. Very popular in social
        media content, YouTube videos, and modern advertising.

        Args:
            clip1: First video clip (zooms in and fades)
            clip2: Second video clip (appears after zoom)
            duration: Transition duration in seconds
            zoom_factor: How much to zoom (1.3 = 130% of original size)

        Returns:
            CompositeVideoClip with zoom transition
        """
        clip2 = clip2.resize(clip1.size)

        def zoom_effect(get_frame, t):
            """Apply progressive zoom during transition."""
            frame = get_frame(t)

            # Calculate zoom progress (only during transition period)
            transition_start = clip1.duration - duration
            if t >= transition_start:
                progress = (t - transition_start) / duration
                current_zoom = 1 + (zoom_factor - 1) * progress

                # Calculate new dimensions
                h, w = frame.shape[:2]
                new_h, new_w = int(h * current_zoom), int(w * current_zoom)

                # Resize frame
                from PIL import Image
                img = Image.fromarray(frame)
                img = img.resize((new_w, new_h), Image.LANCZOS)

                # Crop to center
                left = (new_w - w) // 2
                top = (new_h - h) // 2
                img = img.crop((left, top, left + w, top + h))

                return np.array(img)
            return frame

        # Apply zoom to clip1 during transition
        clip1_zoomed = clip1.fl(zoom_effect, apply_to=['mask'])
        clip1_zoomed = clip1_zoomed.crossfadeout(duration)

        # Fade in clip2
        clip2_faded = clip2.crossfadein(duration)
        clip2_delayed = clip2_faded.set_start(clip1.duration - duration)

        final = CompositeVideoClip([clip1_zoomed, clip2_delayed])
        final = final.set_duration(clip1.duration + clip2.duration - duration)

        return final

    @staticmethod
    def slide_transition(clip1: VideoFileClip, clip2: VideoFileClip,
                         duration: float = 0.5,
                         direction: Literal["left", "right", "up", "down"] = "left") -> CompositeVideoClip:
        """
        #3 Most Used Effect: Slide / Wipe

        A clean, professional transition where one clip slides off screen
        while the next slides in. Very common in corporate videos, news
        broadcasts, and professional content.

        Args:
            clip1: First video clip (slides out)
            clip2: Second video clip (slides in)
            duration: Transition duration in seconds
            direction: Direction of slide (left, right, up, down)

        Returns:
            CompositeVideoClip with slide transition
        """
        clip2 = clip2.resize(clip1.size)
        w, h = clip1.size

        def slide_out_position(t):
            """Calculate position for clip sliding out."""
            transition_start = clip1.duration - duration
            if t >= transition_start:
                progress = (t - transition_start) / duration
                if direction == "left":
                    return (-w * progress, 0)
                elif direction == "right":
                    return (w * progress, 0)
                elif direction == "up":
                    return (0, -h * progress)
                else:  # down
                    return (0, h * progress)
            return (0, 0)

        def slide_in_position(t):
            """Calculate position for clip sliding in."""
            if t < duration:
                progress = 1 - (t / duration)
                if direction == "left":
                    return (w * progress, 0)
                elif direction == "right":
                    return (-w * progress, 0)
                elif direction == "up":
                    return (0, h * progress)
                else:  # down
                    return (0, -h * progress)
            return (0, 0)

        # Apply sliding positions
        clip1_sliding = clip1.set_position(slide_out_position)
        clip2_sliding = clip2.set_position(slide_in_position)
        clip2_delayed = clip2_sliding.set_start(clip1.duration - duration)

        # Create background
        bg = ColorClip(size=(w, h), color=(0, 0, 0))
        bg = bg.set_duration(clip1.duration + clip2.duration - duration)

        final = CompositeVideoClip([bg, clip1_sliding, clip2_delayed], size=(w, h))
        final = final.set_duration(clip1.duration + clip2.duration - duration)

        return final


class VSLVideoEditor:
    """
    Video editor specialized for creating mini VSLs (Video Sales Letters).

    Structure:
    - Hook: Attention-grabbing opening (first few seconds)
    - Body: Main content/value proposition
    - CTA: Call to action (final segment)

    Automatically applies professional transitions between segments.
    """

    def __init__(self, output_resolution: Tuple[int, int] = (1920, 1080),
                 default_transition_duration: float = 0.5):
        """
        Initialize the VSL Video Editor.

        Args:
            output_resolution: Output video resolution (width, height)
            default_transition_duration: Default transition duration in seconds
        """
        self.output_resolution = output_resolution
        self.transition_duration = default_transition_duration
        self.effects = VideoEffects()
        self.clips: List[VideoFileClip] = []

    def load_clip(self, path: str) -> VideoFileClip:
        """Load and resize a video clip."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"Video file not found: {path}")

        clip = VideoFileClip(path)
        return clip.resize(self.output_resolution)

    def apply_transition(self, clip1: VideoFileClip, clip2: VideoFileClip,
                         effect: TransitionEffect) -> CompositeVideoClip:
        """Apply a transition effect between two clips."""
        if effect == TransitionEffect.CROSS_DISSOLVE:
            return self.effects.cross_dissolve(clip1, clip2, self.transition_duration)
        elif effect == TransitionEffect.ZOOM_IN:
            return self.effects.zoom_in_transition(clip1, clip2, self.transition_duration)
        elif effect == TransitionEffect.SLIDE_LEFT:
            return self.effects.slide_transition(clip1, clip2, self.transition_duration)
        else:
            # Default to cross dissolve
            return self.effects.cross_dissolve(clip1, clip2, self.transition_duration)

    def create_vsl(self, hook_path: str, body_path: str, cta_path: str,
                   hook_to_body_effect: TransitionEffect = TransitionEffect.ZOOM_IN,
                   body_to_cta_effect: TransitionEffect = TransitionEffect.CROSS_DISSOLVE) -> CompositeVideoClip:
        """
        Create a complete mini VSL from hook, body, and CTA clips.

        Recommended effect combinations:
        - Hook → Body: Zoom (creates energy and momentum)
        - Body → CTA: Cross Dissolve (smooth, professional ending)

        Args:
            hook_path: Path to hook video clip
            body_path: Path to body video clip
            cta_path: Path to CTA video clip
            hook_to_body_effect: Transition from hook to body
            body_to_cta_effect: Transition from body to CTA

        Returns:
            Complete VSL as CompositeVideoClip
        """
        print("Loading clips...")
        hook = self.load_clip(hook_path)
        body = self.load_clip(body_path)
        cta = self.load_clip(cta_path)

        print(f"Applying {hook_to_body_effect.value} transition (Hook → Body)...")
        hook_body = self.apply_transition(hook, body, hook_to_body_effect)

        print(f"Applying {body_to_cta_effect.value} transition (Body → CTA)...")
        # For the second transition, we need to handle the composite clip
        # Create a temporary clip from hook_body and then apply transition to CTA
        final = self.apply_transition(hook_body, cta, body_to_cta_effect)

        return final

    def create_from_clips(self, clip_paths: List[str],
                          effects: Optional[List[TransitionEffect]] = None) -> CompositeVideoClip:
        """
        Create a video from multiple clips with transitions.

        Args:
            clip_paths: List of paths to video clips
            effects: List of transition effects (one less than clips)
                     If None, alternates between the top 3 effects

        Returns:
            Final video with all clips and transitions
        """
        if len(clip_paths) < 2:
            raise ValueError("At least 2 clips are required")

        # Default effects: alternate between top 3
        if effects is None:
            default_effects = [
                TransitionEffect.CROSS_DISSOLVE,
                TransitionEffect.ZOOM_IN,
                TransitionEffect.SLIDE_LEFT
            ]
            effects = [default_effects[i % 3] for i in range(len(clip_paths) - 1)]

        if len(effects) != len(clip_paths) - 1:
            raise ValueError(f"Expected {len(clip_paths) - 1} effects, got {len(effects)}")

        # Load first clip
        print(f"Loading {clip_paths[0]}...")
        current = self.load_clip(clip_paths[0])

        # Apply transitions one by one
        for i, (clip_path, effect) in enumerate(zip(clip_paths[1:], effects)):
            print(f"Loading {clip_path}...")
            next_clip = self.load_clip(clip_path)

            print(f"Applying {effect.value} transition ({i + 1}/{len(effects)})...")
            current = self.apply_transition(current, next_clip, effect)

        return current

    def export(self, video: CompositeVideoClip, output_path: str,
               fps: int = 30, codec: str = "libx264",
               audio_codec: str = "aac") -> str:
        """
        Export the final video to a file.

        Args:
            video: The composed video to export
            output_path: Output file path
            fps: Frames per second
            codec: Video codec
            audio_codec: Audio codec

        Returns:
            Path to the exported video
        """
        print(f"Exporting to {output_path}...")
        video.write_videofile(
            output_path,
            fps=fps,
            codec=codec,
            audio_codec=audio_codec,
            preset="medium",
            threads=4
        )
        print(f"Successfully exported: {output_path}")
        return output_path


def parse_effect(effect_str: str) -> TransitionEffect:
    """Parse effect string to TransitionEffect enum."""
    effect_map = {
        "fade": TransitionEffect.CROSS_DISSOLVE,
        "dissolve": TransitionEffect.CROSS_DISSOLVE,
        "crossfade": TransitionEffect.CROSS_DISSOLVE,
        "zoom": TransitionEffect.ZOOM_IN,
        "push": TransitionEffect.ZOOM_IN,
        "slide": TransitionEffect.SLIDE_LEFT,
        "wipe": TransitionEffect.SLIDE_LEFT,
    }
    effect_lower = effect_str.lower()
    if effect_lower in effect_map:
        return effect_map[effect_lower]
    raise ValueError(f"Unknown effect: {effect_str}. Valid options: {list(effect_map.keys())}")


def main():
    parser = argparse.ArgumentParser(
        description="VSL Video Editor - Create mini Video Sales Letters with professional transitions",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create VSL from hook, body, CTA:
  python video_editor.py --hook hook.mp4 --body body.mp4 --cta cta.mp4 --output final.mp4

  # Create video from multiple clips with custom effects:
  python video_editor.py --clips clip1.mp4 clip2.mp4 clip3.mp4 --effects fade zoom --output final.mp4

  # Use specific transitions for VSL:
  python video_editor.py --hook hook.mp4 --body body.mp4 --cta cta.mp4 \\
                         --hook-effect zoom --cta-effect fade --output final.mp4

Top 3 Effects:
  fade/dissolve  - Cross Dissolve: Smooth blend between clips (most popular)
  zoom/push      - Zoom In: Creates energy and momentum
  slide/wipe     - Slide: Professional directional transition
        """
    )

    # VSL mode arguments
    vsl_group = parser.add_argument_group("VSL Mode (Hook → Body → CTA)")
    vsl_group.add_argument("--hook", type=str, help="Path to hook video clip")
    vsl_group.add_argument("--body", type=str, help="Path to body video clip")
    vsl_group.add_argument("--cta", type=str, help="Path to CTA video clip")
    vsl_group.add_argument("--hook-effect", type=str, default="zoom",
                           help="Transition effect from hook to body (default: zoom)")
    vsl_group.add_argument("--cta-effect", type=str, default="fade",
                           help="Transition effect from body to CTA (default: fade)")

    # Multi-clip mode arguments
    multi_group = parser.add_argument_group("Multi-clip Mode")
    multi_group.add_argument("--clips", nargs="+", type=str,
                             help="List of video clip paths")
    multi_group.add_argument("--effects", nargs="+", type=str,
                             help="List of transition effects between clips")

    # Output arguments
    output_group = parser.add_argument_group("Output Options")
    output_group.add_argument("--output", "-o", type=str, required=True,
                              help="Output video file path")
    output_group.add_argument("--resolution", type=str, default="1920x1080",
                              help="Output resolution (default: 1920x1080)")
    output_group.add_argument("--fps", type=int, default=30,
                              help="Output FPS (default: 30)")
    output_group.add_argument("--transition-duration", type=float, default=0.5,
                              help="Transition duration in seconds (default: 0.5)")

    args = parser.parse_args()

    # Parse resolution
    try:
        width, height = map(int, args.resolution.split("x"))
        resolution = (width, height)
    except ValueError:
        print(f"Error: Invalid resolution format: {args.resolution}")
        print("Use format: WIDTHxHEIGHT (e.g., 1920x1080)")
        sys.exit(1)

    # Initialize editor
    editor = VSLVideoEditor(
        output_resolution=resolution,
        default_transition_duration=args.transition_duration
    )

    try:
        # Determine mode
        if args.hook and args.body and args.cta:
            # VSL mode
            print("=" * 50)
            print("VSL Video Editor - Creating Mini Video Sales Letter")
            print("=" * 50)
            print(f"Hook: {args.hook}")
            print(f"Body: {args.body}")
            print(f"CTA:  {args.cta}")
            print(f"Transitions: {args.hook_effect} (Hook→Body), {args.cta_effect} (Body→CTA)")
            print("=" * 50)

            video = editor.create_vsl(
                hook_path=args.hook,
                body_path=args.body,
                cta_path=args.cta,
                hook_to_body_effect=parse_effect(args.hook_effect),
                body_to_cta_effect=parse_effect(args.cta_effect)
            )

        elif args.clips:
            # Multi-clip mode
            print("=" * 50)
            print("VSL Video Editor - Multi-clip Mode")
            print("=" * 50)
            print(f"Clips: {len(args.clips)}")
            for i, clip in enumerate(args.clips):
                print(f"  {i + 1}. {clip}")
            print("=" * 50)

            effects = None
            if args.effects:
                effects = [parse_effect(e) for e in args.effects]

            video = editor.create_from_clips(args.clips, effects)

        else:
            print("Error: Specify either --hook/--body/--cta for VSL mode or --clips for multi-clip mode")
            parser.print_help()
            sys.exit(1)

        # Export
        editor.export(video, args.output, fps=args.fps)

        print("\n" + "=" * 50)
        print("SUCCESS! Your video has been created.")
        print(f"Output: {args.output}")
        print("=" * 50)

    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error during video processing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
