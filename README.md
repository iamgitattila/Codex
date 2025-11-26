# VSL Video Editor

A Python video editor for creating mini VSLs (Video Sales Letters) with professional transition effects.

## Features

- **VSL Structure**: Create videos from Hook → Body → CTA clips
- **Top 3 Professional Effects**:
  1. **Cross Dissolve (Fade)** - The #1 most used transition, smooth and elegant
  2. **Zoom In (Push)** - Creates energy and viewer engagement
  3. **Slide (Wipe)** - Clean, professional directional transitions
- **Multi-clip Mode**: Combine any number of clips with custom transitions
- **Configurable Output**: Resolution, FPS, transition duration

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### VSL Mode (Hook → Body → CTA)

```bash
python video_editor.py --hook hook.mp4 --body body.mp4 --cta cta.mp4 --output final.mp4
```

With custom transitions:

```bash
python video_editor.py --hook hook.mp4 --body body.mp4 --cta cta.mp4 \
    --hook-effect zoom --cta-effect fade --output final.mp4
```

### Multi-clip Mode

```bash
python video_editor.py --clips clip1.mp4 clip2.mp4 clip3.mp4 --output final.mp4
```

With custom effects:

```bash
python video_editor.py --clips clip1.mp4 clip2.mp4 clip3.mp4 \
    --effects fade zoom --output final.mp4
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--resolution` | Output resolution (WIDTHxHEIGHT) | 1920x1080 |
| `--fps` | Frames per second | 30 |
| `--transition-duration` | Transition duration in seconds | 0.5 |

## Available Effects

| Effect | Aliases | Description |
|--------|---------|-------------|
| Cross Dissolve | `fade`, `dissolve`, `crossfade` | Smooth blend between clips |
| Zoom In | `zoom`, `push` | Creates energy and momentum |
| Slide | `slide`, `wipe` | Professional directional transition |

## VSL Structure

A typical mini VSL consists of:

1. **Hook** (3-10 seconds): Attention-grabbing opening to stop the scroll
2. **Body** (15-60 seconds): Main value proposition and content
3. **CTA** (5-15 seconds): Clear call to action

### Recommended Transitions

- **Hook → Body**: Use `zoom` for energy and momentum
- **Body → CTA**: Use `fade` for a smooth, professional finish

## Python API

```python
from video_editor import VSLVideoEditor, TransitionEffect

# Initialize editor
editor = VSLVideoEditor(
    output_resolution=(1920, 1080),
    default_transition_duration=0.5
)

# Create VSL
video = editor.create_vsl(
    hook_path="hook.mp4",
    body_path="body.mp4",
    cta_path="cta.mp4",
    hook_to_body_effect=TransitionEffect.ZOOM_IN,
    body_to_cta_effect=TransitionEffect.CROSS_DISSOLVE
)

# Export
editor.export(video, "final.mp4", fps=30)
```

## Requirements

- Python 3.8+
- moviepy
- numpy
- Pillow
- FFmpeg (system dependency)

## License

MIT
