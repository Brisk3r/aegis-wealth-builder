# OptiWizard - Media 1.0

## High-Density Media Library Optimization Wizard & Batch Executable Engine

**OptiWizard - Media 1.0** is a native, hardware-accelerated Windows application (`OptiWizard.exe`) built to eliminate complex navigation panels and single-serve dead-ends. It introduces a guided, multi-step batch optimization workflow designed for massive multi-terabyte TV series, movies, anime, and home video libraries.

---

## Key Architecture & Workflow

```
[STEP 1: SELECT FOLDER]  --->  [STEP 2: PRESET & TUNE]  --->  [STEP 3: STORAGE STRATEGY]
  * Deep recursive scanner        * 720p 10-bit Balanced         * In-Place Local Atomic Swap
  * File count & size preview     * 1080p Archival Master        * Custom Target Directory
  * Quick drive selectors         * Anime Pro / NVENC / QSV      * Stream Guard & Failsafes
                                                                            |
                                                                            v
  [STEP 5: HERO EXECUTION] <---  [STEP 4: QUEUE MATRIX & LOOP] <------------+
  * Dual live progress tracks      * High-density staged jobs
  * FPS speedometer & live ETA     * [+] "Add Another Folder" (Loop back to Step 1)
  * Non-blocking chunked parser    * [>] "Start Batch Optimization"
            |
            v
  [STEP 6: SUMMARY & ACTION LOOP]
  * Total GB saved & reduction %
  * [+] "Start Another Queue" (Clean reset)
  * [@] Export CSV Audit Log
```

---

## 7 Core Optimization Presets

1. **Balanced TV & Animation (Recommended)**:
   - Profile: `720p 10-bit HEVC (x265_10bit) RF 21`, `medium` preset, `AAC 192k` audio.
   - Reduction: **~65% space reclaimed**. Standard for high-density multi-TB libraries with crystal-clear text and zero banding.
2. **Cinema Archival Master**:
   - Profile: `1080p 10-bit HEVC (x265_10bit) RF 20`, `slow` preset, `Lossless Passthrough` audio.
   - Reduction: **~45% space reclaimed**. Pristine visual quality for BluRay and 4K masters.
3. **Ultra Density Space Saver**:
   - Profile: `720p 10-bit HEVC (x265_10bit) RF 23`, `fast` preset, `AAC 128k` audio.
   - Reduction: **~75% space reclaimed**. Maximum compression for daily shows and sitcoms.
4. **Anime & Cell Animation Pro**:
   - Profile: `1080p/720p 10-bit HEVC RF 19` with `--encoder-tune animation`.
   - Reduction: **~55% space reclaimed**. Advanced edge preservation and dark scene de-banding.
5. **NVIDIA NVENC Hardware Fast**:
   - Profile: `HEVC NVENC (nvenc_h265) CQ 22`, `p5` preset.
   - Ultra-fast 200+ FPS encoding on RTX/GTX GPUs.
6. **Intel QuickSync (QSV) Hardware Fast**:
   - Profile: `HEVC QSV (qsv_h265) ICQ 21`, `balanced` preset.
   - Low-power hardware acceleration via Intel Core iGPUs.
7. **Custom Power-User Tuning**:
   - Interactive dials for Encoder (`x265_10bit`, `x265`, `x264`, `nvenc`, `qsv`, `svt_av1`), Resolution (`Source`, `1080p`, `720p`, `480p`), RF (15-30), Speeds (`ultrafast` to `veryslow`), Audio modes, and Subtitle passthrough.

---

## Advanced Storage & Safety Guards

- **In-Place Local Atomic Swap**: Encodes to `.tmp_optiwizard` on the same root volume, validates file integrity (> 1MB), and replaces the source file in-place while preserving original `CreationTime` and `LastWriteTime` timestamps.
- **Stream Guard Active Protection**: Background monitor polling port `32400` (Plex) and transcode processes. Auto-suspends HandBrake during active streaming and resumes seamlessly when idle.
- **Negative Compression Failsafe**: Automatically detects if an encoded file is larger than the original source file and skips replacement to preserve optimal storage.
- **Network SMB Auto-Reconnect**: Built-in 5-stage exponential retry for network drives and NAS shares.

---

## Launch Options

- **Standard GUI Executable**: Double-click `OptiWizard.exe` or `Launch_OptiWizard.bat`
- **Silent Windowless Launcher**: Double-click `Launch_OptiWizard.vbs`
- **Recompile from Source**: Run `powershell -ExecutionPolicy Bypass -File build_optiwizard.ps1`
