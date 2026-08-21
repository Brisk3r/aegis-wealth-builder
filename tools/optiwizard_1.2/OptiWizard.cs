// ==============================================================================
// OPTIWIZARD - MEDIA 1.2
// Standalone High-Density Media Library Optimization Wizard & Batch Engine
// Next-Gen AV1 10-Bit & HEVC Precision Encoders Integrated.
// Zero-Mojibake 7-Bit ASCII Standard Enforced.
// ==============================================================================

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

namespace OptiWizard
{
    #region Win32 Process Suspension & Interop
    public static class ProcessControl
    {
        [Flags]
        public enum ProcessAccess : uint
        {
            Terminate = 0x0001,
            SuspendResume = 0x0800,
            AllAccess = 0x001F0FFF
        }

        [DllImport("kernel32.dll")]
        public static extern IntPtr OpenThread(ProcessAccess dwDesiredAccess, bool bInheritHandle, uint dwThreadId);

        [DllImport("kernel32.dll")]
        public static extern uint SuspendThread(IntPtr hThread);

        [DllImport("kernel32.dll")]
        public static extern int ResumeThread(IntPtr hThread);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool CloseHandle(IntPtr hObject);

        public static void SuspendProcess(int pid)
        {
            try
            {
                Process proc = Process.GetProcessById(pid);
                foreach (ProcessThread pT in proc.Threads)
                {
                    IntPtr pOpenThread = OpenThread(ProcessAccess.SuspendResume, false, (uint)pT.Id);
                    if (pOpenThread != IntPtr.Zero)
                    {
                        SuspendThread(pOpenThread);
                        CloseHandle(pOpenThread);
                    }
                }
            }
            catch { }
        }

        public static void ResumeProcess(int pid)
        {
            try
            {
                Process proc = Process.GetProcessById(pid);
                foreach (ProcessThread pT in proc.Threads)
                {
                    IntPtr pOpenThread = OpenThread(ProcessAccess.SuspendResume, false, (uint)pT.Id);
                    if (pOpenThread != IntPtr.Zero)
                    {
                        ResumeThread(pOpenThread);
                        CloseHandle(pOpenThread);
                    }
                }
            }
            catch { }
        }
    }
    #endregion

    #region Data Models & Preset System
    public enum PresetType
    {
        BalancedTV,
        CinemaMaster,
        UltraDensity,
        AnimePro,
        Av1Balanced,
        Av1Anime,
        Av1Cinema,
        Av1Nvenc,
        Av1Qsv,
        NvencHardware,
        QsvHardware,
        Custom
    }

    public enum StorageMode
    {
        InPlaceAtomicSwap,
        CustomDestination
    }

    public enum FileStatus
    {
        Pending,
        Scanning,
        Encoding,
        Completed,
        Skipped,
        Failed
    }

    public class OptimizationPreset
    {
        public PresetType Type { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Badge { get; set; }
        public string Encoder { get; set; }
        public string TargetResolution { get; set; }
        public int QualityRF { get; set; }
        public string SpeedPreset { get; set; }
        public string EncoderTune { get; set; }
        public string AudioSetting { get; set; }
        public bool SubtitlePassthrough { get; set; }
        public double ExpectedSavingsRatio { get; set; }

        public string GetHandBrakeArgs(string inputPath, string outputPath)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("-i \"{0}\" -o \"{1}\" ", inputPath, outputPath);
            sb.AppendFormat("-e {0} ", Encoder);
            sb.AppendFormat("-q {0} ", QualityRF);

            if (!string.IsNullOrEmpty(SpeedPreset))
            {
                sb.AppendFormat("--encoder-preset {0} ", SpeedPreset);
            }

            if (!string.IsNullOrEmpty(EncoderTune))
            {
                sb.AppendFormat("--encoder-tune {0} ", EncoderTune);
            }

            if (TargetResolution == "720p")
            {
                sb.Append("-X 1280 -Y 720 --maxHeight 720 --maxWidth 1280 ");
            }
            else if (TargetResolution == "1080p")
            {
                sb.Append("-X 1920 -Y 1080 --maxHeight 1080 --maxWidth 1920 ");
            }
            else if (TargetResolution == "480p")
            {
                sb.Append("-X 854 -Y 480 --maxHeight 480 --maxWidth 854 ");
            }
            else
            {
                sb.Append("--auto-anamorphic ");
            }

            if (AudioSetting == "Passthrough")
            {
                sb.Append("--all-audio --aencoder copy ");
            }
            else if (AudioSetting == "AAC128")
            {
                sb.Append("--all-audio --aencoder av_aac -B 128 ");
            }
            else if (AudioSetting == "AC3_51")
            {
                sb.Append("--all-audio --aencoder ac3 -B 384 --mixdown 5point1 ");
            }
            else
            {
                sb.Append("--all-audio --aencoder av_aac -B 192 ");
            }

            if (SubtitlePassthrough)
            {
                sb.Append("--all-subtitles ");
            }

            sb.Append("--markers --optimize ");
            return sb.ToString().Trim();
        }
    }

    public class MediaFileInfo : INotifyPropertyChanged
    {
        public string FullPath { get; set; }
        public string FileName { get; set; }
        public string RelativePath { get; set; }
        public long OriginalSizeBytes { get; set; }

        private long _processedSizeBytes;
        public long ProcessedSizeBytes
        {
            get { return _processedSizeBytes; }
            set
            {
                if (_processedSizeBytes != value)
                {
                    _processedSizeBytes = value;
                    OnPropertyChanged("ProcessedSizeBytes");
                    OnPropertyChanged("ProcessedSizeDisplay");
                    OnPropertyChanged("SavedSizeDisplay");
                    OnPropertyChanged("StatusBadge");
                }
            }
        }

        public string Extension { get; set; }
        public string DetectedCodec { get; set; }
        public string ResolutionTag { get; set; }

        private bool _isSelected = true;
        public bool IsSelected
        {
            get { return _isSelected; }
            set { _isSelected = value; OnPropertyChanged("IsSelected"); }
        }

        private FileStatus _status;
        public FileStatus Status
        {
            get { return _status; }
            set
            {
                if (_status != value)
                {
                    _status = value;
                    OnPropertyChanged("Status");
                    OnPropertyChanged("StatusBadge");
                    OnPropertyChanged("ProcessedSizeDisplay");
                    OnPropertyChanged("SavedSizeDisplay");
                }
            }
        }

        private double _progressPercent;
        public double ProgressPercent
        {
            get { return _progressPercent; }
            set
            {
                _progressPercent = value;
                OnPropertyChanged("ProgressPercent");
                OnPropertyChanged("StatusBadge");
                if (Status == FileStatus.Encoding)
                {
                    OnPropertyChanged("SavedSizeDisplay");
                }
            }
        }

        private double _currentFps;
        public double CurrentFps
        {
            get { return _currentFps; }
            set { _currentFps = value; OnPropertyChanged("CurrentFps"); }
        }

        private string _etaString;
        public string EtaString
        {
            get { return _etaString; }
            set { _etaString = value; OnPropertyChanged("EtaString"); }
        }

        public string OriginalSizeDisplay
        {
            get { return FormatBytes(OriginalSizeBytes); }
        }

        public string ProcessedSizeDisplay
        {
            get
            {
                if (Status == FileStatus.Completed && ProcessedSizeBytes > 0)
                {
                    return FormatBytes(ProcessedSizeBytes);
                }
                if (Status == FileStatus.Skipped)
                {
                    return FormatBytes(OriginalSizeBytes) + " (Preserved)";
                }
                if (Status == FileStatus.Encoding)
                {
                    return "[Encoding...]";
                }
                if (Status == FileStatus.Failed)
                {
                    return "[Failed]";
                }
                return "--";
            }
        }

        public string SavedSizeDisplay
        {
            get
            {
                if (Status == FileStatus.Completed && ProcessedSizeBytes > 0)
                {
                    long saved = OriginalSizeBytes - ProcessedSizeBytes;
                    if (saved > 0)
                    {
                        double pct = ((double)saved / OriginalSizeBytes) * 100.0;
                        return string.Format("-{0} ({1:F1}%)", FormatBytes(saved), pct);
                    }
                    return "0.0 MB (0.0%)";
                }
                if (Status == FileStatus.Skipped)
                {
                    return "[SKIPPED: ALREADY OPTIMAL]";
                }
                if (Status == FileStatus.Encoding)
                {
                    return string.Format("[{0:F0}% Active]", ProgressPercent);
                }
                if (Status == FileStatus.Failed)
                {
                    return "[FAILED / REJECTED]";
                }
                return "--";
            }
        }

        public string StatusBadge
        {
            get
            {
                switch (Status)
                {
                    case FileStatus.Pending: return "[QUEUED]";
                    case FileStatus.Encoding: return string.Format("[ENCODING {0:F0}%]", ProgressPercent);
                    case FileStatus.Completed: return "[SAVED " + FormatBytes(Math.Max(0, OriginalSizeBytes - ProcessedSizeBytes)) + "]";
                    case FileStatus.Skipped: return "[SKIPPED (OPTIMAL)]";
                    case FileStatus.Failed: return "[FAILED]";
                    default: return "[READY]";
                }
            }
        }

        public static string FormatBytes(long bytes)
        {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return (bytes / 1024.0).ToString("F1") + " KB";
            if (bytes < 1024 * 1024 * 1024) return (bytes / (1024.0 * 1024.0)).ToString("F2") + " MB";
            return (bytes / (1024.0 * 1024.0 * 1024.0)).ToString("F2") + " GB";
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged(string name)
        {
            if (PropertyChanged != null) PropertyChanged(this, new PropertyChangedEventArgs(name));
        }
    }

    public class FolderJob : INotifyPropertyChanged
    {
        public string JobId { get; set; }
        public string SourceFolderPath { get; set; }
        public OptimizationPreset Preset { get; set; }
        public StorageMode StorageMode { get; set; }
        public string TargetFolderPath { get; set; }
        public bool StreamGuardEnabled { get; set; }
        public bool LowPriorityEnabled { get; set; }
        public bool SkipIfLarger { get; set; }
        public bool AutoReconnect { get; set; }

        public ObservableCollection<MediaFileInfo> Files { get; set; }

        public int TotalFilesCount { get { return Files != null ? Files.Count : 0; } }
        public long TotalSizeBytes { get { return Files != null ? Files.Sum(f => f.OriginalSizeBytes) : 0; } }
        public long EstimatedSavingsBytes
        {
            get
            {
                double ratio = Preset != null ? Preset.ExpectedSavingsRatio : 0.65;
                return (long)(TotalSizeBytes * ratio);
            }
        }

        public string FolderName
        {
            get
            {
                try { return new DirectoryInfo(SourceFolderPath).Name; }
                catch { return SourceFolderPath; }
            }
        }

        public string PresetSummary
        {
            get { return Preset != null ? string.Format("{0} ({1} {2} RF {3})", Preset.Name, Preset.TargetResolution, Preset.Encoder, Preset.QualityRF) : "Default"; }
        }

        public string StorageSummary
        {
            get { return StorageMode == StorageMode.InPlaceAtomicSwap ? "In-Place Atomic Swap" : "Mirror Tree -> " + TargetFolderPath; }
        }

        public FolderJob()
        {
            JobId = Guid.NewGuid().ToString("N").Substring(0, 8);
            Files = new ObservableCollection<MediaFileInfo>();
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged(string name)
        {
            if (PropertyChanged != null) PropertyChanged(this, new PropertyChangedEventArgs(name));
        }
    }
    #endregion

    #region Preset Repository
    public static class PresetRepository
    {
        public static List<OptimizationPreset> GetAllPresets()
        {
            return new List<OptimizationPreset>
            {
                new OptimizationPreset
                {
                    Type = PresetType.BalancedTV,
                    Name = "Balanced TV & Animation (Recommended)",
                    Description = "720p 10-bit HEVC (x265_10bit) RF 21. Standard for large multi-TB libraries, razor sharp text and gradients, zero color banding.",
                    Badge = "[65% SAVINGS] [RECOMMENDED]",
                    Encoder = "x265_10bit",
                    TargetResolution = "720p",
                    QualityRF = 21,
                    SpeedPreset = "medium",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.65
                },
                new OptimizationPreset
                {
                    Type = PresetType.CinemaMaster,
                    Name = "Cinema Archival Master",
                    Description = "1080p 10-bit HEVC (x265_10bit) RF 20, Slow preset, Lossless Audio Passthrough. Pristine BluRay/Master archival visual fidelity.",
                    Badge = "[45% SAVINGS] [ARCHIVAL 1080P]",
                    Encoder = "x265_10bit",
                    TargetResolution = "1080p",
                    QualityRF = 20,
                    SpeedPreset = "slow",
                    EncoderTune = "",
                    AudioSetting = "Passthrough",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.45
                },
                new OptimizationPreset
                {
                    Type = PresetType.UltraDensity,
                    Name = "Ultra Density Space Saver",
                    Description = "720p 10-bit HEVC (x265_10bit) RF 23, Fast preset, AAC 128k audio. Extreme storage reclamation for sitcoms, reality TV, and daily shows.",
                    Badge = "[75% SAVINGS] [MAX DENSITY]",
                    Encoder = "x265_10bit",
                    TargetResolution = "720p",
                    QualityRF = 23,
                    SpeedPreset = "fast",
                    EncoderTune = "",
                    AudioSetting = "AAC128",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.75
                },
                new OptimizationPreset
                {
                    Type = PresetType.AnimePro,
                    Name = "Anime & Cell Animation Pro (HEVC)",
                    Description = "1080p/720p 10-bit HEVC RF 19 with tune:animation. Special edge-preservation algorithms for zero color banding in flat dark scenes.",
                    Badge = "[55% SAVINGS] [ANIME TUNE]",
                    Encoder = "x265_10bit",
                    TargetResolution = "720p",
                    QualityRF = 19,
                    SpeedPreset = "medium",
                    EncoderTune = "animation",
                    AudioSetting = "Passthrough",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.55
                },
                new OptimizationPreset
                {
                    Type = PresetType.Av1Balanced,
                    Name = "AV1 10-Bit Next-Gen Balanced TV",
                    Description = "SVT-AV1 10-bit (svt_av1_10bit) 720p RF 26, Preset 6. Next-generation compression yielding 75-80% space reduction with pristine clarity.",
                    Badge = "[AV1 NEXT-GEN] [78% SAVINGS]",
                    Encoder = "svt_av1_10bit",
                    TargetResolution = "720p",
                    QualityRF = 26,
                    SpeedPreset = "6",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.78
                },
                new OptimizationPreset
                {
                    Type = PresetType.Av1Anime,
                    Name = "AV1 10-Bit Anime & Cartoon Master",
                    Description = "SVT-AV1 10-bit (svt_av1_10bit) 1080p RF 24, Preset 6. Superior edge preservation and flat gradient compression at micro bitrates.",
                    Badge = "[AV1 ANIME] [72% SAVINGS]",
                    Encoder = "svt_av1_10bit",
                    TargetResolution = "1080p",
                    QualityRF = 24,
                    SpeedPreset = "6",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.72
                },
                new OptimizationPreset
                {
                    Type = PresetType.Av1Cinema,
                    Name = "AV1 10-Bit Cinema & Archival Film",
                    Description = "SVT-AV1 10-bit (svt_av1_10bit) 1080p RF 22, Preset 5, Lossless Audio Passthrough. Unrivaled archival efficiency turning 30GB Remuxes to ~3GB.",
                    Badge = "[AV1 CINEMA] [68% SAVINGS]",
                    Encoder = "svt_av1_10bit",
                    TargetResolution = "1080p",
                    QualityRF = 22,
                    SpeedPreset = "5",
                    EncoderTune = "",
                    AudioSetting = "Passthrough",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.68
                },
                new OptimizationPreset
                {
                    Type = PresetType.Av1Nvenc,
                    Name = "NVIDIA NVENC AV1 Hardware Accelerated",
                    Description = "Hardware AV1 (nvenc_av1) CQ 26, p5 preset. Ultra-fast hardware encoding (200+ FPS) on modern NVIDIA RTX 40-series GPUs.",
                    Badge = "[RTX 40-SERIES] [70% SAVINGS]",
                    Encoder = "nvenc_av1",
                    TargetResolution = "720p",
                    QualityRF = 26,
                    SpeedPreset = "p5",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.70
                },
                new OptimizationPreset
                {
                    Type = PresetType.Av1Qsv,
                    Name = "Intel QuickSync (QSV) AV1 Hardware",
                    Description = "Hardware AV1 (qsv_av1) ICQ 25. Hardware accelerated transcoding via Intel Arc GPUs and Intel Core Ultra processors.",
                    Badge = "[INTEL ARC AV1] [70% SAVINGS]",
                    Encoder = "qsv_av1",
                    TargetResolution = "720p",
                    QualityRF = 25,
                    SpeedPreset = "balanced",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.70
                },
                new OptimizationPreset
                {
                    Type = PresetType.NvencHardware,
                    Name = "NVIDIA NVENC HEVC Hardware Accelerated",
                    Description = "HEVC NVENC (nvenc_h265) CQ 22, p5 preset. Ultra-fast hardware encoding (200+ FPS) on modern NVIDIA RTX and GTX graphics cards.",
                    Badge = "[GPU FAST] [50% SAVINGS]",
                    Encoder = "nvenc_h265",
                    TargetResolution = "720p",
                    QualityRF = 22,
                    SpeedPreset = "p5",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.50
                },
                new OptimizationPreset
                {
                    Type = PresetType.QsvHardware,
                    Name = "Intel QuickSync (QSV) HEVC Hardware",
                    Description = "HEVC QSV (qsv_h265) ICQ 21. Hardware accelerated transcoding via Intel Core iGPU with ultra-low power consumption.",
                    Badge = "[INTEL QSV] [50% SAVINGS]",
                    Encoder = "qsv_h265",
                    TargetResolution = "720p",
                    QualityRF = 21,
                    SpeedPreset = "balanced",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.50
                },
                new OptimizationPreset
                {
                    Type = PresetType.Custom,
                    Name = "Custom Power-User Tuning",
                    Description = "Fully customized resolution, codec, RF value, audio mixdowns, and subtitle controls for specialized audio/video pipelines.",
                    Badge = "[CUSTOM DIAL]",
                    Encoder = "x265_10bit",
                    TargetResolution = "720p",
                    QualityRF = 21,
                    SpeedPreset = "medium",
                    EncoderTune = "",
                    AudioSetting = "AAC192",
                    SubtitlePassthrough = true,
                    ExpectedSavingsRatio = 0.60
                }
            };
        }
    }
    #endregion

    #region HandBrake Async Engine & Stream Guard
    public class HandBrakeEngine
    {
        private Process _currentProcess;
        private int _currentPid;
        private bool _isPaused;
        private readonly object _lockObj = new object();

        public event Action<double, double, string> ProgressUpdated;
        public event Action<string> LogEmitted;

        public bool IsRunning { get { return _currentProcess != null && !_currentProcess.HasExited; } }
        public bool IsPaused { get { return _isPaused; } }

        public static string ResolveHandBrakePath()
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string p1 = Path.Combine(appDir, "HandBrakeCLI.exe");
            if (File.Exists(p1)) return p1;

            string p00 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "OptiWizard_Media_1.2\\HandBrakeCLI.exe");
            if (File.Exists(p00)) return p00;

            string p0 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "OptiWizard_Media_1.1\\HandBrakeCLI.exe");
            if (File.Exists(p0)) return p0;

            string p2 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "OptiWizard_Media_1.0\\HandBrakeCLI.exe");
            if (File.Exists(p2)) return p2;

            string p3 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "MediaStorageOptimizer_v4.0.6_Ultimate_Edition\\HandBrakeCLI.exe");
            if (File.Exists(p3)) return p3;

            string p4 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "Media_Storage_Optimizer\\v4\\v4.0.6_Ultimate_Edition\\HandBrakeCLI.exe");
            if (File.Exists(p4)) return p4;

            return "HandBrakeCLI.exe";
        }

        public int ExecuteTranscode(string handBrakeCli, string arguments, bool lowPriority, CancellationToken ct)
        {
            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = handBrakeCli,
                Arguments = arguments,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (Process proc = new Process { StartInfo = psi })
            {
                lock (_lockObj)
                {
                    _currentProcess = proc;
                    _isPaused = false;
                }

                proc.Start();
                _currentPid = proc.Id;

                if (lowPriority)
                {
                    try { proc.PriorityClass = ProcessPriorityClass.BelowNormal; } catch { }
                }

                Thread errThread = new Thread(new ThreadStart(delegate
                {
                    try
                    {
                        using (StreamReader errReader = proc.StandardError)
                        {
                            char[] errBuf = new char[4096];
                            while (errReader.Read(errBuf, 0, errBuf.Length) > 0) { }
                        }
                    }
                    catch { }
                }));
                errThread.IsBackground = true;
                errThread.Start();

                StringBuilder sb = new StringBuilder();
                char[] buffer = new char[1024];
                Regex regexPercent = new Regex(@"Encoding:\s*task\s*1\s*of\s*1,\s*([\d\.]+)\s*%", RegexOptions.Compiled);
                Regex regexFps = new Regex(@"([\d\.]+)\s*fps", RegexOptions.Compiled);
                Regex regexEta = new Regex(@"ETA\s*([\dhms]+)", RegexOptions.Compiled);

                using (StreamReader outReader = proc.StandardOutput)
                {
                    int count;
                    while ((count = outReader.Read(buffer, 0, buffer.Length)) > 0)
                    {
                        if (ct.IsCancellationRequested)
                        {
                            try { proc.Kill(); } catch { }
                            return -999;
                        }

                        sb.Append(buffer, 0, count);
                        string current = sb.ToString();
                        int lastDelim = current.LastIndexOfAny(new char[] { '\r', '\n' });
                        if (lastDelim >= 0)
                        {
                            string complete = current.Substring(0, lastDelim);
                            sb.Remove(0, lastDelim + 1);

                            string[] lines = complete.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                            foreach (string line in lines)
                            {
                                if (LogEmitted != null) LogEmitted(line);

                                Match mPct = regexPercent.Match(line);
                                if (mPct.Success)
                                {
                                    double pct = double.Parse(mPct.Groups[1].Value, CultureInfo.InvariantCulture);
                                    double fps = 0;
                                    string eta = "--";

                                    Match mFps = regexFps.Match(line);
                                    if (mFps.Success) fps = double.Parse(mFps.Groups[1].Value, CultureInfo.InvariantCulture);

                                    Match mEta = regexEta.Match(line);
                                    if (mEta.Success) eta = mEta.Groups[1].Value;

                                    if (ProgressUpdated != null)
                                    {
                                        ProgressUpdated(pct, fps, eta);
                                    }
                                }
                            }
                        }
                    }
                }

                proc.WaitForExit();
                int exitCode = proc.ExitCode;

                lock (_lockObj)
                {
                    _currentProcess = null;
                    _currentPid = 0;
                }

                return exitCode;
            }
        }

        public void Pause()
        {
            lock (_lockObj)
            {
                if (_currentPid > 0 && !_isPaused)
                {
                    ProcessControl.SuspendProcess(_currentPid);
                    _isPaused = true;
                }
            }
        }

        public void Resume()
        {
            lock (_lockObj)
            {
                if (_currentPid > 0 && _isPaused)
                {
                    ProcessControl.ResumeProcess(_currentPid);
                    _isPaused = false;
                }
            }
        }

        public void Kill()
        {
            lock (_lockObj)
            {
                if (_currentProcess != null && !_currentProcess.HasExited)
                {
                    try { _currentProcess.Kill(); } catch { }
                }
            }
        }
    }

    public class StreamGuardMonitor
    {
        private readonly DispatcherTimer _timer;
        private readonly HandBrakeEngine _engine;
        private bool _isStreamActive;

        public event Action<bool> StreamStateChanged;

        public bool IsStreamActive { get { return _isStreamActive; } }

        public StreamGuardMonitor(HandBrakeEngine engine)
        {
            _engine = engine;
            _timer = new DispatcherTimer();
            _timer.Interval = TimeSpan.FromSeconds(2.5);
            _timer.Tick += CheckStreamStatus;
        }

        public void Start() { _timer.Start(); }
        public void Stop() { _timer.Stop(); }

        private void CheckStreamStatus(object sender, EventArgs e)
        {
            bool plexActive = IsPortInUse(32400);
            if (plexActive != _isStreamActive)
            {
                _isStreamActive = plexActive;
                if (_isStreamActive)
                {
                    if (_engine.IsRunning && !_engine.IsPaused)
                    {
                        _engine.Pause();
                    }
                }
                else
                {
                    if (_engine.IsRunning && _engine.IsPaused)
                    {
                        _engine.Resume();
                    }
                }

                if (StreamStateChanged != null) StreamStateChanged(_isStreamActive);
            }
        }

        private bool IsPortInUse(int port)
        {
            try
            {
                IPGlobalProperties ipProperties = IPGlobalProperties.GetIPGlobalProperties();
                TcpConnectionInformation[] tcpConnections = ipProperties.GetActiveTcpConnections();
                foreach (TcpConnectionInformation info in tcpConnections)
                {
                    if (info.LocalEndPoint.Port == port && info.State == TcpState.Established)
                    {
                        return true;
                    }
                }
            }
            catch { }
            return false;
        }
    }
    #endregion

    #region Main WPF Wizard Window UI
    public class MainWindow : Window
    {
        private int _currentStep = 1;
        private readonly List<OptimizationPreset> _presetList;
        private OptimizationPreset _selectedPreset;
        private StorageMode _selectedStorageMode = StorageMode.InPlaceAtomicSwap;
        private string _customTargetDirectory = "";
        private readonly ObservableCollection<FolderJob> _queuedJobs;
        private readonly ObservableCollection<MediaFileInfo> _currentScannedFiles;
        private readonly HandBrakeEngine _handbrakeEngine;
        private readonly StreamGuardMonitor _streamGuard;
        private CancellationTokenSource _cts;

        private long _totalBatchOriginalBytes = 0;
        private long _totalBatchProcessedBytes = 0;
        private int _totalBatchFilesCount = 0;
        private int _completedBatchFilesCount = 0;
        private Stopwatch _batchStopwatch;

        private Border[] _stepIndicators;
        private Grid _viewStep1_Folder;
        private Grid _viewStep2_Presets;
        private Grid _viewStep3_Storage;
        private Grid _viewStep4_Queue;
        private Grid _viewStep5_Execution;
        private Grid _viewStep6_Summary;

        private TextBox _txtSourceFolder;
        private TextBlock _lblScanCount;
        private TextBlock _lblScanSize;
        private TextBlock _lblSelectedCount;
        private TextBlock _lblScanCodecs;
        private ListView _lstPreviewFiles;
        private Button _btnStep1Next;
        private CheckBox _chkRecursive;

        private ListBox _lstPresetCards;
        private TextBlock _lblPresetSpaceSavingsPreview;
        private ComboBox _cmbCustomEncoder;
        private ComboBox _cmbCustomRes;
        private Slider _sldCustomRF;
        private TextBlock _lblCustomRFVal;
        private ComboBox _cmbCustomPreset;
        private ComboBox _cmbCustomAudio;
        private CheckBox _chkCustomSubs;
        private Border _customTuningCard;

        private Border _presetTelemetryCard;
        private TextBlock _lblTeleTitle;
        private TextBlock _lblTeleBadge;
        private TextBlock _lblTeleDescription;
        private TextBlock _lblTeleCodec;
        private TextBlock _lblTeleResolution;
        private TextBlock _lblTeleQuality;
        private TextBlock _lblTeleAudio;
        private TextBlock _lblTeleSubtitles;
        private TextBlock _lblTeleReclaim;
        private TextBlock _lblTeleDirectPlay;
        private TextBlock _lblTeleThroughput;

        private RadioButton _rbAtomicSwap;
        private RadioButton _rbCustomTarget;
        private TextBox _txtTargetFolder;
        private Button _btnBrowseTarget;
        private CheckBox _chkStreamGuard;
        private CheckBox _chkLowPriority;
        private CheckBox _chkSkipIfLarger;
        private CheckBox _chkAutoReconnect;

        private ListView _lstQueuedJobs;
        private TextBlock _lblQueueTotalFolders;
        private TextBlock _lblQueueTotalFiles;
        private TextBlock _lblQueueTotalSize;
        private TextBlock _lblQueueEstimatedReclaim;

        private TextBlock _lblExecCurrentFile;
        private TextBlock _lblExecCurrentFolder;
        private TextBlock _lblExecProgressPct;
        private ProgressBar _pbCurrentFile;
        private TextBlock _lblExecSpeedFps;
        private TextBlock _lblExecEta;
        private TextBlock _lblExecSizeReduction;
        private ProgressBar _pbTotalBatch;
        private TextBlock _lblExecBatchProgress;
        private TextBlock _lblExecBatchSaved;
        private TextBlock _lblStreamGuardBadge;
        private ListView _lstExecFiles;
        private TextBox _txtConsoleLogs;
        private Button _btnPauseResume;
        private Button _btnSkipCurrent;
        private Button _btnCancelBatch;

        private TextBlock _lblSumTotalFiles;
        private TextBlock _lblSumTotalDuration;
        private TextBlock _lblSumOrigSize;
        private TextBlock _lblSumFinalSize;
        private TextBlock _lblSumReclaimed;
        private TextBlock _lblSumCompressionRatio;

        public MainWindow()
        {
            Title = "OptiWizard - Media 1.2 // Next-Gen AV1 & HEVC Optimization Studio";
            Width = 1180;
            Height = 780;
            MinWidth = 1000;
            MinHeight = 650;
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
            Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0A0B10"));
            Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#F1F5F9"));
            FontFamily = new FontFamily("Segoe UI, Inter, Outfit, Arial");
            Icon = AppIconHelper.GetAppIconImageSource();

            _presetList = PresetRepository.GetAllPresets();
            _selectedPreset = _presetList[0];
            _queuedJobs = new ObservableCollection<FolderJob>();
            _currentScannedFiles = new ObservableCollection<MediaFileInfo>();

            _handbrakeEngine = new HandBrakeEngine();
            _handbrakeEngine.ProgressUpdated += OnHandBrakeProgress;
            _handbrakeEngine.LogEmitted += OnHandBrakeLog;

            _streamGuard = new StreamGuardMonitor(_handbrakeEngine);
            _streamGuard.StreamStateChanged += OnStreamGuardStateChanged;
            _streamGuard.Start();

            BuildModernUI();
            NavigateToStep(1);
        }

        private void BuildModernUI()
        {
            Grid mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(68) });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });

            Border headerBorder = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#12141F")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#222638")),
                BorderThickness = new Thickness(0, 0, 0, 1),
                Padding = new Thickness(20, 10, 20, 10)
            };

            Grid headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(320) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            StackPanel brandPanel = new StackPanel { Orientation = Orientation.Horizontal, VerticalAlignment = VerticalAlignment.Center };
            Image headerIcon = new Image
            {
                Width = 36,
                Height = 36,
                Source = AppIconHelper.GetAppIconImageSource(),
                Margin = new Thickness(0, 0, 10, 0),
                VerticalAlignment = VerticalAlignment.Center
            };
            brandPanel.Children.Add(headerIcon);

            StackPanel textPanel = new StackPanel { Orientation = Orientation.Vertical, VerticalAlignment = VerticalAlignment.Center };
            TextBlock brandTitle = new TextBlock
            {
                Text = "OPTIWIZARD MEDIA 1.2",
                FontSize = 15,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B82F6"))
            };
            TextBlock brandSub = new TextBlock
            {
                Text = "High-Density Batch Storage Optimization",
                FontSize = 10,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8"))
            };
            textPanel.Children.Add(brandTitle);
            textPanel.Children.Add(brandSub);
            brandPanel.Children.Add(textPanel);
            Grid.SetColumn(brandPanel, 0);
            headerGrid.Children.Add(brandPanel);

            StackPanel stepperPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };

            string[] stepNames = new string[] { "1. Select Folder", "2. Preset & Tune", "3. Storage & Swap", "4. Queue Matrix", "5. Execution", "6. Summary" };
            _stepIndicators = new Border[6];

            for (int i = 0; i < 6; i++)
            {
                Border stepBadge = new Border
                {
                    CornerRadius = new CornerRadius(14),
                    Padding = new Thickness(12, 5, 12, 5),
                    Margin = new Thickness(3, 0, 3, 0),
                    Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1A1D2D")),
                    BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2C324B")),
                    BorderThickness = new Thickness(1)
                };
                TextBlock stepTxt = new TextBlock
                {
                    Text = stepNames[i],
                    FontSize = 11,
                    FontWeight = FontWeights.SemiBold,
                    Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8"))
                };
                stepBadge.Child = stepTxt;
                _stepIndicators[i] = stepBadge;
                stepperPanel.Children.Add(stepBadge);
            }
            Grid.SetColumn(stepperPanel, 1);
            headerGrid.Children.Add(stepperPanel);

            StackPanel globalStatus = new StackPanel { Orientation = Orientation.Horizontal, VerticalAlignment = VerticalAlignment.Center };
            Border readyBadge = new Border
            {
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(8, 3, 8, 3),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#064E3B")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#059669")),
                BorderThickness = new Thickness(1)
            };
            TextBlock readyTxt = new TextBlock { Text = "[ENGINE READY]", FontSize = 10, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")) };
            readyBadge.Child = readyTxt;
            globalStatus.Children.Add(readyBadge);
            Grid.SetColumn(globalStatus, 2);
            headerGrid.Children.Add(globalStatus);

            headerBorder.Child = headerGrid;
            Grid.SetRow(headerBorder, 0);
            mainGrid.Children.Add(headerBorder);

            Grid contentArea = new Grid();
            Grid.SetRow(contentArea, 1);

            _viewStep1_Folder = CreateStep1View();
            _viewStep2_Presets = CreateStep2View();
            _viewStep3_Storage = CreateStep3View();
            _viewStep4_Queue = CreateStep4View();
            _viewStep5_Execution = CreateStep5View();
            _viewStep6_Summary = CreateStep6View();

            contentArea.Children.Add(_viewStep1_Folder);
            contentArea.Children.Add(_viewStep2_Presets);
            contentArea.Children.Add(_viewStep3_Storage);
            contentArea.Children.Add(_viewStep4_Queue);
            contentArea.Children.Add(_viewStep5_Execution);
            contentArea.Children.Add(_viewStep6_Summary);

            mainGrid.Children.Add(contentArea);
            Content = mainGrid;
        }

        #region Step Navigation
        private void NavigateToStep(int step)
        {
            _currentStep = step;

            for (int i = 0; i < 6; i++)
            {
                if (i + 1 == step)
                {
                    _stepIndicators[i].Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E3A8A"));
                    _stepIndicators[i].BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B82F6"));
                    ((TextBlock)_stepIndicators[i].Child).Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#60A5FA"));
                }
                else if (i + 1 < step)
                {
                    _stepIndicators[i].Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#064E3B"));
                    _stepIndicators[i].BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#059669"));
                    ((TextBlock)_stepIndicators[i].Child).Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399"));
                }
                else
                {
                    _stepIndicators[i].Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#141724"));
                    _stepIndicators[i].BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#222638"));
                    ((TextBlock)_stepIndicators[i].Child).Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#64748B"));
                }
            }

            _viewStep1_Folder.Visibility = step == 1 ? Visibility.Visible : Visibility.Collapsed;
            _viewStep2_Presets.Visibility = step == 2 ? Visibility.Visible : Visibility.Collapsed;
            _viewStep3_Storage.Visibility = step == 3 ? Visibility.Visible : Visibility.Collapsed;
            _viewStep4_Queue.Visibility = step == 4 ? Visibility.Visible : Visibility.Collapsed;
            _viewStep5_Execution.Visibility = step == 5 ? Visibility.Visible : Visibility.Collapsed;
            _viewStep6_Summary.Visibility = step == 6 ? Visibility.Visible : Visibility.Collapsed;

            if (step == 2)
            {
                UpdateSavingsProjection();
            }
            else if (step == 4)
            {
                UpdateQueueOverview();
            }
        }
        #endregion

        #region View Builders
        private Grid CreateStep1View()
        {
            Grid grid = new Grid { Margin = new Thickness(24) };
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(60) });

            StackPanel head = new StackPanel { Margin = new Thickness(0, 0, 0, 16) };
            head.Children.Add(new TextBlock { Text = "STEP 1: SELECT SOURCE MEDIA DIRECTORY", FontSize = 18, FontWeight = FontWeights.Bold, Foreground = Brushes.White });
            head.Children.Add(new TextBlock { Text = "Pick a movie, TV show, anime, or video folder to analyze and prepare for compression.", FontSize = 12, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")), Margin = new Thickness(0, 3, 0, 0) });
            Grid.SetRow(head, 0);
            grid.Children.Add(head);

            Border folderCard = CreateGlassCard();
            folderCard.Padding = new Thickness(16);
            folderCard.Margin = new Thickness(0, 0, 0, 14);

            StackPanel folderContent = new StackPanel();
            TextBlock lblPrompt = new TextBlock { Text = "Media Folder Path:", FontSize = 11, FontWeight = FontWeights.SemiBold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")), Margin = new Thickness(0, 0, 0, 6) };
            folderContent.Children.Add(lblPrompt);

            Grid inputRow = new Grid();
            inputRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            inputRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            inputRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            _txtSourceFolder = new TextBox
            {
                Height = 36,
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0D0E17")),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2D334D")),
                BorderThickness = new Thickness(1),
                Padding = new Thickness(10, 8, 10, 8),
                FontSize = 12
            };
            Grid.SetColumn(_txtSourceFolder, 0);
            inputRow.Children.Add(_txtSourceFolder);

            Button btnBrowse = CreateActionButton("[ Browse Folder... ]", "#2563EB", "#1D4ED8");
            btnBrowse.Height = 36;
            btnBrowse.Margin = new Thickness(8, 0, 0, 0);
            btnBrowse.Padding = new Thickness(16, 0, 16, 0);
            btnBrowse.Click += (s, e) =>
            {
                var dialog = new System.Windows.Forms.FolderBrowserDialog();
                dialog.Description = "Select Media Folder to Optimize";
                if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
                {
                    _txtSourceFolder.Text = dialog.SelectedPath;
                    ScanFolderAsync(dialog.SelectedPath);
                }
            };
            Grid.SetColumn(btnBrowse, 1);
            inputRow.Children.Add(btnBrowse);

            Button btnScan = CreateActionButton("[ Rescan Now ]", "#059669", "#047857");
            btnScan.Height = 36;
            btnScan.Margin = new Thickness(8, 0, 0, 0);
            btnScan.Padding = new Thickness(16, 0, 16, 0);
            btnScan.Click += (s, e) =>
            {
                if (!string.IsNullOrEmpty(_txtSourceFolder.Text) && Directory.Exists(_txtSourceFolder.Text))
                {
                    ScanFolderAsync(_txtSourceFolder.Text);
                }
            };
            Grid.SetColumn(btnScan, 2);
            inputRow.Children.Add(btnScan);

            folderContent.Children.Add(inputRow);

            StackPanel optionsPanel = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 10, 0, 0) };
            _chkRecursive = new CheckBox
            {
                Content = "Include All Nested Subdirectories (Recursive Deep Scan)",
                IsChecked = true,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")),
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 20, 0)
            };
            optionsPanel.Children.Add(_chkRecursive);

            folderContent.Children.Add(optionsPanel);
            folderCard.Child = folderContent;
            Grid.SetRow(folderCard, 1);
            grid.Children.Add(folderCard);

            Loaded += (s, e) => LoadQuickDrivesAsync(optionsPanel);

            Border metricsCard = CreateGlassCard();
            metricsCard.Padding = new Thickness(14);
            metricsCard.Margin = new Thickness(0, 0, 0, 10);

            Grid metricsGrid = new Grid();
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            Grid statsRow = new Grid();
            statsRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.1, GridUnitType.Star) });
            statsRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            statsRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.3, GridUnitType.Star) });
            statsRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.4, GridUnitType.Star) });

            _lblScanCount = new TextBlock { Text = "Media Files: 0 detected", FontSize = 12, FontWeight = FontWeights.SemiBold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")) };
            _lblScanSize = new TextBlock { Text = "Total Size: 0.00 GB", FontSize = 12, FontWeight = FontWeights.SemiBold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")) };
            _lblSelectedCount = new TextBlock { Text = "Selected: 0 files (0.00 GB)", FontSize = 13, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")) };
            _lblScanCodecs = new TextBlock { Text = "Codecs: None scanned", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")), TextTrimming = TextTrimming.CharacterEllipsis };

            Grid.SetColumn(_lblScanCount, 0);
            Grid.SetColumn(_lblScanSize, 1);
            Grid.SetColumn(_lblSelectedCount, 2);
            Grid.SetColumn(_lblScanCodecs, 3);

            statsRow.Children.Add(_lblScanCount);
            statsRow.Children.Add(_lblScanSize);
            statsRow.Children.Add(_lblSelectedCount);
            statsRow.Children.Add(_lblScanCodecs);

            Grid.SetRow(statsRow, 0);
            metricsGrid.Children.Add(statsRow);

            // Selection & Quick Filter Toolbar
            WrapPanel selTools = new WrapPanel { Margin = new Thickness(0, 10, 0, 0) };

            Button btnSelectAll = CreateMiniButton("[ + Select All ]", "#059669");
            btnSelectAll.Click += (s, e) => { SetAllSelected(true); };
            selTools.Children.Add(btnSelectAll);

            Button btnDeselectAll = CreateMiniButton("[ - Deselect All ]", "#475569");
            btnDeselectAll.Click += (s, e) => { SetAllSelected(false); };
            selTools.Children.Add(btnDeselectAll);

            Button btnInvert = CreateMiniButton("[ ~ Invert Selection ]", "#1E293B");
            btnInvert.Click += (s, e) => { InvertSelection(); };
            selTools.Children.Add(btnInvert);

            Button btnFilterH264 = CreateMiniButton("[ Target: H.264 Only ]", "#2563EB");
            btnFilterH264.Click += (s, e) => { FilterSelection(f => f.DetectedCodec.Contains("H.264") || f.DetectedCodec.Contains("AVC")); };
            selTools.Children.Add(btnFilterH264);

            Button btnFilterHevc = CreateMiniButton("[ Target: HEVC Only ]", "#7C3AED");
            btnFilterHevc.Click += (s, e) => { FilterSelection(f => f.DetectedCodec.Contains("HEVC") || f.DetectedCodec.Contains("x265")); };
            selTools.Children.Add(btnFilterHevc);

            Button btnFilterLarge = CreateMiniButton("[ Target: > 1 GB ]", "#D97706");
            btnFilterLarge.Click += (s, e) => { FilterSelection(f => f.OriginalSizeBytes >= 1024L * 1024L * 1024L); };
            selTools.Children.Add(btnFilterLarge);

            Button btnFilterMovies = CreateMiniButton("[ Target: > 4 GB Movies ]", "#DC2626");
            btnFilterMovies.Click += (s, e) => { FilterSelection(f => f.OriginalSizeBytes >= 4096L * 1024L * 1024L); };
            selTools.Children.Add(btnFilterMovies);

            Grid.SetRow(selTools, 1);
            metricsGrid.Children.Add(selTools);

            metricsCard.Child = metricsGrid;
            Grid.SetRow(metricsCard, 2);
            grid.Children.Add(metricsCard);

            _lstPreviewFiles = new ListView
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0F111A")),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#222638")),
                BorderThickness = new Thickness(1),
                ItemsSource = _currentScannedFiles
            };

            GridView gv = new GridView();

            // Checkbox column
            GridViewColumn colCheck = new GridViewColumn { Header = "Select", Width = 55 };
            DataTemplate dtCheck = new DataTemplate();
            FrameworkElementFactory chkFactory = new FrameworkElementFactory(typeof(CheckBox));
            chkFactory.SetBinding(CheckBox.IsCheckedProperty, new Binding("IsSelected") { Mode = BindingMode.TwoWay });
            chkFactory.SetValue(CheckBox.HorizontalAlignmentProperty, HorizontalAlignment.Center);
            chkFactory.SetValue(CheckBox.VerticalAlignmentProperty, VerticalAlignment.Center);
            chkFactory.SetValue(CheckBox.MarginProperty, new Thickness(2, 0, 2, 0));
            dtCheck.VisualTree = chkFactory;
            colCheck.CellTemplate = dtCheck;
            gv.Columns.Add(colCheck);

            gv.Columns.Add(new GridViewColumn { Header = "Status", DisplayMemberBinding = new Binding("StatusBadge"), Width = 100 });
            gv.Columns.Add(new GridViewColumn { Header = "File Name", DisplayMemberBinding = new Binding("FileName"), Width = 360 });
            gv.Columns.Add(new GridViewColumn { Header = "Relative Directory", DisplayMemberBinding = new Binding("RelativePath"), Width = 230 });
            gv.Columns.Add(new GridViewColumn { Header = "Original Size", DisplayMemberBinding = new Binding("OriginalSizeDisplay"), Width = 105 });
            gv.Columns.Add(new GridViewColumn { Header = "Codec", DisplayMemberBinding = new Binding("DetectedCodec"), Width = 110 });
            gv.Columns.Add(new GridViewColumn { Header = "Ext", DisplayMemberBinding = new Binding("Extension"), Width = 60 });
            _lstPreviewFiles.View = gv;
            _lstPreviewFiles.AddHandler(GridViewColumnHeader.ClickEvent, new RoutedEventHandler(OnPreviewFilesHeaderClick));

            Grid.SetRow(_lstPreviewFiles, 3);
            grid.Children.Add(_lstPreviewFiles);

            Grid footer = new Grid { Margin = new Thickness(0, 14, 0, 0) };
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            TextBlock hint = new TextBlock { Text = "Click column headers to sort by Name, Size, Codec, or Selection status.", Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#64748B")), VerticalAlignment = VerticalAlignment.Center };
            Grid.SetColumn(hint, 0);
            footer.Children.Add(hint);

            _btnStep1Next = CreateActionButton("Next: Choose Preset & Tune ->", "#2563EB", "#1D4ED8");
            _btnStep1Next.IsEnabled = false;
            _btnStep1Next.Click += (s, e) => NavigateToStep(2);
            Grid.SetColumn(_btnStep1Next, 1);
            footer.Children.Add(_btnStep1Next);

            Grid.SetRow(footer, 4);
            grid.Children.Add(footer);

            return grid;
        }

        private string _lastSortColumn = "FileName";
        private ListSortDirection _lastSortDirection = ListSortDirection.Ascending;

        private void OnPreviewFilesHeaderClick(object sender, RoutedEventArgs e)
        {
            GridViewColumnHeader header = e.OriginalSource as GridViewColumnHeader;
            if (header == null || header.Column == null) return;

            string headerText = header.Column.Header as string;
            if (string.IsNullOrEmpty(headerText)) return;

            string cleanHeader = headerText.Replace(" [ASC]", "").Replace(" [DESC]", "").Trim();

            string sortBy = "FileName";
            if (cleanHeader.Equals("Select", StringComparison.OrdinalIgnoreCase)) sortBy = "IsSelected";
            else if (cleanHeader.Equals("Status", StringComparison.OrdinalIgnoreCase)) sortBy = "Status";
            else if (cleanHeader.Equals("File Name", StringComparison.OrdinalIgnoreCase)) sortBy = "FileName";
            else if (cleanHeader.Equals("Relative Directory", StringComparison.OrdinalIgnoreCase)) sortBy = "RelativePath";
            else if (cleanHeader.Equals("Original Size", StringComparison.OrdinalIgnoreCase)) sortBy = "OriginalSizeBytes";
            else if (cleanHeader.Equals("Codec", StringComparison.OrdinalIgnoreCase)) sortBy = "DetectedCodec";
            else if (cleanHeader.Equals("Ext", StringComparison.OrdinalIgnoreCase)) sortBy = "Extension";

            ListSortDirection direction = ListSortDirection.Ascending;
            if (_lastSortColumn == sortBy && _lastSortDirection == ListSortDirection.Ascending)
            {
                direction = ListSortDirection.Descending;
            }

            _lastSortColumn = sortBy;
            _lastSortDirection = direction;

            if (_lstPreviewFiles != null)
            {
                GridView gv = _lstPreviewFiles.View as GridView;
                if (gv != null)
                {
                    foreach (var col in gv.Columns)
                    {
                        string strHeader = col.Header as string;
                        if (strHeader != null)
                        {
                            string baseHeader = strHeader.Replace(" [ASC]", "").Replace(" [DESC]", "").Trim();
                            if (col == header.Column)
                            {
                                col.Header = baseHeader + (direction == ListSortDirection.Ascending ? " [ASC]" : " [DESC]");
                            }
                            else
                            {
                                col.Header = baseHeader;
                            }
                        }
                    }
                }
            }

            ICollectionView dataView = CollectionViewSource.GetDefaultView(_lstPreviewFiles.ItemsSource);
            if (dataView != null)
            {
                dataView.SortDescriptions.Clear();
                dataView.SortDescriptions.Add(new SortDescription(sortBy, direction));
                dataView.Refresh();
            }
        }

        private Button CreateMiniButton(string text, string bgHex)
        {
            Button btn = new Button
            {
                Content = text,
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bgHex)),
                Foreground = Brushes.White,
                FontSize = 10,
                FontWeight = FontWeights.SemiBold,
                Padding = new Thickness(10, 4, 10, 4),
                Margin = new Thickness(0, 0, 6, 4),
                BorderThickness = new Thickness(0),
                Cursor = Cursors.Hand
            };
            return btn;
        }

        private void SetAllSelected(bool selected)
        {
            foreach (var f in _currentScannedFiles)
            {
                f.IsSelected = selected;
            }
            UpdateStep1SelectionMetrics();
        }

        private void InvertSelection()
        {
            foreach (var f in _currentScannedFiles)
            {
                f.IsSelected = !f.IsSelected;
            }
            UpdateStep1SelectionMetrics();
        }

        private void FilterSelection(Func<MediaFileInfo, bool> predicate)
        {
            foreach (var f in _currentScannedFiles)
            {
                f.IsSelected = predicate(f);
            }
            UpdateStep1SelectionMetrics();
        }

        private void UpdateStep1SelectionMetrics()
        {
            int selectedCount = _currentScannedFiles.Count(f => f.IsSelected);
            long selectedBytes = _currentScannedFiles.Where(f => f.IsSelected).Sum(f => f.OriginalSizeBytes);
            int totalCount = _currentScannedFiles.Count;

            _lblSelectedCount.Text = string.Format("Selected: {0} / {1} files ({2})", selectedCount, totalCount, MediaFileInfo.FormatBytes(selectedBytes));
            _btnStep1Next.IsEnabled = selectedCount > 0;
        }

        private Grid CreateStep2View()
        {
            Grid grid = new Grid { Margin = new Thickness(24) };
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(60) });

            StackPanel head = new StackPanel { Margin = new Thickness(0, 0, 0, 14) };
            head.Children.Add(new TextBlock { Text = "STEP 2: CHOOSE ENCODING PRESET & QUALITY TUNING", FontSize = 18, FontWeight = FontWeights.Bold, Foreground = Brushes.White });
            head.Children.Add(new TextBlock { Text = "Select an engineered optimization profile tailored for TV series, 4K/1080p archival cinema, anime, or hardware acceleration.", FontSize = 12, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")), Margin = new Thickness(0, 3, 0, 0) });
            
            // Preset Category Filter Toolbar
            WrapPanel filterBar = new WrapPanel { Margin = new Thickness(0, 8, 0, 0) };
            Button btnFilterAll = CreateMiniButton("[ALL PRESETS]", "#2563EB");
            Button btnFilterAv1 = CreateMiniButton("[AV1 NEXT-GEN]", "#7C3AED");
            Button btnFilterHevc = CreateMiniButton("[HEVC 10-BIT]", "#059669");
            Button btnFilterGpu = CreateMiniButton("[GPU HARDWARE]", "#D97706");
            Button btnFilterCustom = CreateMiniButton("[CUSTOM TUNING]", "#475569");

            btnFilterAll.Click += (s, e) => { _lstPresetCards.ItemsSource = _presetList; _lstPresetCards.SelectedIndex = 0; };
            btnFilterAv1.Click += (s, e) => { _lstPresetCards.ItemsSource = _presetList.Where(p => p.Type == PresetType.Av1Balanced || p.Type == PresetType.Av1Anime || p.Type == PresetType.Av1Cinema || p.Type == PresetType.Av1Nvenc || p.Type == PresetType.Av1Qsv).ToList(); _lstPresetCards.SelectedIndex = 0; };
            btnFilterHevc.Click += (s, e) => { _lstPresetCards.ItemsSource = _presetList.Where(p => p.Type == PresetType.BalancedTV || p.Type == PresetType.CinemaMaster || p.Type == PresetType.UltraDensity || p.Type == PresetType.AnimePro).ToList(); _lstPresetCards.SelectedIndex = 0; };
            btnFilterGpu.Click += (s, e) => { _lstPresetCards.ItemsSource = _presetList.Where(p => p.Type == PresetType.NvencHardware || p.Type == PresetType.QsvHardware || p.Type == PresetType.Av1Nvenc || p.Type == PresetType.Av1Qsv).ToList(); _lstPresetCards.SelectedIndex = 0; };
            btnFilterCustom.Click += (s, e) => { _lstPresetCards.ItemsSource = _presetList.Where(p => p.Type == PresetType.Custom).ToList(); _lstPresetCards.SelectedIndex = 0; };

            filterBar.Children.Add(btnFilterAll);
            filterBar.Children.Add(btnFilterAv1);
            filterBar.Children.Add(btnFilterHevc);
            filterBar.Children.Add(btnFilterGpu);
            filterBar.Children.Add(btnFilterCustom);
            head.Children.Add(filterBar);

            Grid.SetRow(head, 0);
            grid.Children.Add(head);

            Grid splitGrid = new Grid();
            splitGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.35, GridUnitType.Star) });
            splitGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.0, GridUnitType.Star) });

            _lstPresetCards = new ListBox
            {
                Background = Brushes.Transparent,
                BorderThickness = new Thickness(0),
                ItemsSource = _presetList,
                SelectedIndex = 0,
                Margin = new Thickness(0, 0, 12, 0)
            };
            _lstPresetCards.SelectionChanged += (s, e) =>
            {
                OptimizationPreset preset = _lstPresetCards.SelectedItem as OptimizationPreset;
                if (preset != null)
                {
                    _selectedPreset = preset;
                    bool isCustom = preset.Type == PresetType.Custom;
                    _customTuningCard.Visibility = isCustom ? Visibility.Visible : Visibility.Collapsed;
                    _presetTelemetryCard.Visibility = isCustom ? Visibility.Collapsed : Visibility.Visible;
                    if (!isCustom) UpdatePresetTelemetryCard(preset);
                    UpdateSavingsProjection();
                }
            };

            _lstPresetCards.ItemTemplate = CreatePresetDataTemplate();
            Grid.SetColumn(_lstPresetCards, 0);
            splitGrid.Children.Add(_lstPresetCards);

            // Right Column 1: Preset Telemetry Card (when standard preset is chosen)
            _presetTelemetryCard = CreateGlassCard();
            _presetTelemetryCard.Padding = new Thickness(16);
            _presetTelemetryCard.Margin = new Thickness(12, 0, 0, 0);

            StackPanel teleStack = new StackPanel();
            
            _lblTeleTitle = new TextBlock { Text = "Preset Telemetry", FontSize = 14, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")), Margin = new Thickness(0, 0, 0, 4) };
            _lblTeleBadge = new TextBlock { Text = "[RECOMMENDED]", FontSize = 10, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")), Margin = new Thickness(0, 0, 0, 8) };
            _lblTeleDescription = new TextBlock { Text = "", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")), TextWrapping = TextWrapping.Wrap, Margin = new Thickness(0, 0, 0, 12) };

            teleStack.Children.Add(_lblTeleTitle);
            teleStack.Children.Add(_lblTeleBadge);
            teleStack.Children.Add(_lblTeleDescription);

            Border specBox = new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0F111A")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#23283B")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(6),
                Padding = new Thickness(12),
                Margin = new Thickness(0, 0, 0, 12)
            };

            StackPanel specList = new StackPanel();
            _lblTeleCodec = new TextBlock { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#E2E8F0")), Margin = new Thickness(0, 2, 0, 2) };
            _lblTeleResolution = new TextBlock { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#E2E8F0")), Margin = new Thickness(0, 2, 0, 2) };
            _lblTeleQuality = new TextBlock { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#E2E8F0")), Margin = new Thickness(0, 2, 0, 2) };
            _lblTeleAudio = new TextBlock { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#E2E8F0")), Margin = new Thickness(0, 2, 0, 2) };
            _lblTeleSubtitles = new TextBlock { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#E2E8F0")), Margin = new Thickness(0, 2, 0, 2) };
            _lblTeleDirectPlay = new TextBlock { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")), FontWeight = FontWeights.SemiBold, Margin = new Thickness(0, 4, 0, 2) };
            _lblTeleThroughput = new TextBlock { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#F59E0B")), Margin = new Thickness(0, 2, 0, 2) };

            specList.Children.Add(_lblTeleCodec);
            specList.Children.Add(_lblTeleResolution);
            specList.Children.Add(_lblTeleQuality);
            specList.Children.Add(_lblTeleAudio);
            specList.Children.Add(_lblTeleSubtitles);
            specList.Children.Add(_lblTeleDirectPlay);
            specList.Children.Add(_lblTeleThroughput);
            specBox.Child = specList;
            teleStack.Children.Add(specBox);

            _lblTeleReclaim = new TextBlock { FontSize = 12, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#10B981")), TextWrapping = TextWrapping.Wrap };
            teleStack.Children.Add(_lblTeleReclaim);

            _presetTelemetryCard.Child = teleStack;
            Grid.SetColumn(_presetTelemetryCard, 1);
            splitGrid.Children.Add(_presetTelemetryCard);

            // Right Column 2: Custom Tuning Card (when Custom preset is chosen)
            _customTuningCard = CreateGlassCard();
            _customTuningCard.Padding = new Thickness(16);
            _customTuningCard.Margin = new Thickness(12, 0, 0, 0);
            _customTuningCard.Visibility = Visibility.Collapsed;

            StackPanel customPanel = new StackPanel();
            customPanel.Children.Add(new TextBlock { Text = "POWER-USER CUSTOM TUNING", FontSize = 14, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#F59E0B")), Margin = new Thickness(0, 0, 0, 10) });

            customPanel.Children.Add(new TextBlock { Text = "Target Encoder Codec:", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")) });
            _cmbCustomEncoder = new ComboBox { Margin = new Thickness(0, 2, 0, 10), Height = 28 };
            _cmbCustomEncoder.Items.Add("x265_10bit (HEVC 10-Bit Software - Recommended)");
            _cmbCustomEncoder.Items.Add("svt_av1_10bit (AV1 10-Bit Next-Gen Software)");
            _cmbCustomEncoder.Items.Add("nvenc_av1 (NVIDIA RTX 40-Series AV1 Hardware)");
            _cmbCustomEncoder.Items.Add("qsv_av1 (Intel Arc / Core Ultra AV1 Hardware)");
            _cmbCustomEncoder.Items.Add("nvenc_h265 (NVIDIA HEVC GPU Accelerated)");
            _cmbCustomEncoder.Items.Add("qsv_h265 (Intel QuickSync HEVC GPU Accelerated)");
            _cmbCustomEncoder.Items.Add("x265 (HEVC 8-Bit Software)");
            _cmbCustomEncoder.Items.Add("x264 (H.264 Software)");
            _cmbCustomEncoder.SelectedIndex = 0;
            _cmbCustomEncoder.SelectionChanged += OnCustomSettingChanged;
            customPanel.Children.Add(_cmbCustomEncoder);

            customPanel.Children.Add(new TextBlock { Text = "Target Video Resolution:", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")) });
            _cmbCustomRes = new ComboBox { Margin = new Thickness(0, 2, 0, 10), Height = 28 };
            _cmbCustomRes.Items.Add("Source (Keep Original Resolution)");
            _cmbCustomRes.Items.Add("1080p Full HD (Max 1920x1080)");
            _cmbCustomRes.Items.Add("720p HD (Max 1280x720)");
            _cmbCustomRes.Items.Add("480p SD (Max 854x480)");
            _cmbCustomRes.SelectedIndex = 2;
            _cmbCustomRes.SelectionChanged += OnCustomSettingChanged;
            customPanel.Children.Add(_cmbCustomRes);

            Grid rfRow = new Grid { Margin = new Thickness(0, 0, 0, 4) };
            rfRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            rfRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            rfRow.Children.Add(new TextBlock { Text = "Constant Rate Factor (RF Quality):", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")) });
            _lblCustomRFVal = new TextBlock { Text = "RF 21 (Balanced)", FontSize = 11, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")) };
            Grid.SetColumn(_lblCustomRFVal, 1);
            rfRow.Children.Add(_lblCustomRFVal);
            customPanel.Children.Add(rfRow);

            _sldCustomRF = new Slider { Minimum = 15, Maximum = 30, Value = 21, IsSnapToTickEnabled = true, TickFrequency = 1, Margin = new Thickness(0, 0, 0, 10) };
            _sldCustomRF.ValueChanged += (s, e) =>
            {
                int val = (int)_sldCustomRF.Value;
                _lblCustomRFVal.Text = string.Format("RF {0} ({1})", val, val <= 18 ? "Near Lossless" : (val <= 22 ? "Optimal" : "High Compression"));
                OnCustomSettingChanged(s, null);
            };
            customPanel.Children.Add(_sldCustomRF);

            customPanel.Children.Add(new TextBlock { Text = "Encoder Speed Preset:", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")) });
            _cmbCustomPreset = new ComboBox { Margin = new Thickness(0, 2, 0, 10), Height = 28 };
            string[] speeds = new string[] { "ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow" };
            foreach (string sp in speeds) _cmbCustomPreset.Items.Add(sp);
            _cmbCustomPreset.SelectedItem = "medium";
            _cmbCustomPreset.SelectionChanged += OnCustomSettingChanged;
            customPanel.Children.Add(_cmbCustomPreset);

            customPanel.Children.Add(new TextBlock { Text = "Audio Strategy:", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")) });
            _cmbCustomAudio = new ComboBox { Margin = new Thickness(0, 2, 0, 10), Height = 28 };
            _cmbCustomAudio.Items.Add("Stereo AAC 192k (Clean & Compatible)");
            _cmbCustomAudio.Items.Add("Stereo AAC 128k (Max Space Saver)");
            _cmbCustomAudio.Items.Add("5.1 Surround AC3 384k");
            _cmbCustomAudio.Items.Add("Passthrough / Copy Original Audio (Lossless)");
            _cmbCustomAudio.SelectedIndex = 0;
            _cmbCustomAudio.SelectionChanged += OnCustomSettingChanged;
            customPanel.Children.Add(_cmbCustomAudio);

            _chkCustomSubs = new CheckBox
            {
                Content = "Passthrough All Subtitle Tracks",
                IsChecked = true,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")),
                Margin = new Thickness(0, 4, 0, 0)
            };
            _chkCustomSubs.Checked += (s, e) => OnCustomSettingChanged(s, null);
            _chkCustomSubs.Unchecked += (s, e) => OnCustomSettingChanged(s, null);
            customPanel.Children.Add(_chkCustomSubs);

            _customTuningCard.Child = customPanel;
            Grid.SetColumn(_customTuningCard, 1);
            splitGrid.Children.Add(_customTuningCard);

            Grid.SetRow(splitGrid, 1);
            grid.Children.Add(splitGrid);

            Border savingsCard = CreateGlassCard();
            savingsCard.Padding = new Thickness(14);
            savingsCard.Margin = new Thickness(0, 12, 0, 0);

            _lblPresetSpaceSavingsPreview = new TextBlock
            {
                Text = "Projected Reclaimed Space: ~0.00 GB (0%)",
                FontSize = 13,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")),
                HorizontalAlignment = HorizontalAlignment.Center
            };
            savingsCard.Child = _lblPresetSpaceSavingsPreview;
            Grid.SetRow(savingsCard, 2);
            grid.Children.Add(savingsCard);

            Grid footer = new Grid { Margin = new Thickness(0, 14, 0, 0) };
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            Button btnBack = CreateActionButton("<- Back to Folder", "#1E2336", "#2C324B");
            btnBack.Click += (s, e) => NavigateToStep(1);
            Grid.SetColumn(btnBack, 0);
            footer.Children.Add(btnBack);

            Button btnNext = CreateActionButton("Next: Storage & Swap ->", "#2563EB", "#1D4ED8");
            btnNext.Click += (s, e) => NavigateToStep(3);
            Grid.SetColumn(btnNext, 2);
            footer.Children.Add(btnNext);

            Grid.SetRow(footer, 3);
            grid.Children.Add(footer);

            return grid;
        }

        private void UpdatePresetTelemetryCard(OptimizationPreset preset)
        {
            if (preset == null || _lblTeleTitle == null) return;

            _lblTeleTitle.Text = preset.Name;
            _lblTeleBadge.Text = preset.Badge;
            _lblTeleDescription.Text = preset.Description;

            _lblTeleCodec.Text = "Video Codec: " + preset.Encoder + " (10-bit Depth)";
            _lblTeleResolution.Text = "Resolution Target: " + preset.TargetResolution;
            _lblTeleQuality.Text = string.Format("Quality Index: RF {0} (Speed: {1})", preset.QualityRF, preset.SpeedPreset);
            _lblTeleAudio.Text = "Audio Strategy: " + (preset.AudioSetting == "Passthrough" ? "Lossless Copy Passthrough" : preset.AudioSetting);
            _lblTeleSubtitles.Text = "Subtitles: " + (preset.SubtitlePassthrough ? "Preserve All SSA/ASS/SRT Streams" : "Default Track Only");

            bool isAv1 = preset.Encoder.Contains("av1");
            bool isGpu = preset.Encoder.Contains("nvenc") || preset.Encoder.Contains("qsv");

            _lblTeleDirectPlay.Text = isAv1 
                ? "Plex Playback: Direct Play on Google TV, Apple TV, PC & Mobile" 
                : "Plex Playback: 99% Universal Direct Play Across All Hardware";

            _lblTeleThroughput.Text = isGpu 
                ? "Throughput: Ultra-Fast Hardware Transcoding (~200+ FPS)" 
                : (isAv1 ? "Throughput: High-Efficiency AV1 Compute (~45-65 FPS)" : "Throughput: Balanced Multithreaded (~120-150 FPS)");

            var selected = _currentScannedFiles.Where(f => f.IsSelected).ToList();
            long totalBytes = selected.Sum(f => f.OriginalSizeBytes);
            long estReclaim = (long)(totalBytes * preset.ExpectedSavingsRatio);
            long estOutput = totalBytes - estReclaim;

            _lblTeleReclaim.Text = string.Format(
                "Projected Batch Reclaim: {0} -> ~{1} (Saves ~{2} / {3:F0}%)",
                MediaFileInfo.FormatBytes(totalBytes),
                MediaFileInfo.FormatBytes(estOutput),
                MediaFileInfo.FormatBytes(estReclaim),
                preset.ExpectedSavingsRatio * 100.0
            );
        }

        private DataTemplate CreatePresetDataTemplate()
        {
            DataTemplate dt = new DataTemplate(typeof(OptimizationPreset));
            FrameworkElementFactory border = new FrameworkElementFactory(typeof(Border));
            border.SetValue(Border.CornerRadiusProperty, new CornerRadius(6));
            border.SetValue(Border.MarginProperty, new Thickness(0, 0, 0, 8));
            border.SetValue(Border.PaddingProperty, new Thickness(14));
            border.SetValue(Border.BackgroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#141724")));
            border.SetValue(Border.BorderBrushProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#23283B")));
            border.SetValue(Border.BorderThicknessProperty, new Thickness(1));

            FrameworkElementFactory sp = new FrameworkElementFactory(typeof(StackPanel));

            FrameworkElementFactory titleRow = new FrameworkElementFactory(typeof(Grid));
            FrameworkElementFactory col1 = new FrameworkElementFactory(typeof(ColumnDefinition));
            col1.SetValue(ColumnDefinition.WidthProperty, new GridLength(1, GridUnitType.Star));
            FrameworkElementFactory col2 = new FrameworkElementFactory(typeof(ColumnDefinition));
            col2.SetValue(ColumnDefinition.WidthProperty, GridLength.Auto);
            titleRow.AppendChild(col1);
            titleRow.AppendChild(col2);

            FrameworkElementFactory txtName = new FrameworkElementFactory(typeof(TextBlock));
            txtName.SetBinding(TextBlock.TextProperty, new Binding("Name"));
            txtName.SetValue(TextBlock.FontSizeProperty, 13.0);
            txtName.SetValue(TextBlock.FontWeightProperty, FontWeights.Bold);
            txtName.SetValue(TextBlock.ForegroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")));
            txtName.SetValue(Grid.ColumnProperty, 0);
            titleRow.AppendChild(txtName);

            FrameworkElementFactory badgeBorder = new FrameworkElementFactory(typeof(Border));
            badgeBorder.SetValue(Border.CornerRadiusProperty, new CornerRadius(4));
            badgeBorder.SetValue(Border.PaddingProperty, new Thickness(6, 2, 6, 2));
            badgeBorder.SetValue(Border.BackgroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#064E3B")));
            badgeBorder.SetValue(Grid.ColumnProperty, 1);

            FrameworkElementFactory txtBadge = new FrameworkElementFactory(typeof(TextBlock));
            txtBadge.SetBinding(TextBlock.TextProperty, new Binding("Badge"));
            txtBadge.SetValue(TextBlock.FontSizeProperty, 10.0);
            txtBadge.SetValue(TextBlock.FontWeightProperty, FontWeights.Bold);
            txtBadge.SetValue(TextBlock.ForegroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")));
            badgeBorder.AppendChild(txtBadge);
            titleRow.AppendChild(badgeBorder);

            sp.AppendChild(titleRow);

            FrameworkElementFactory txtDesc = new FrameworkElementFactory(typeof(TextBlock));
            txtDesc.SetBinding(TextBlock.TextProperty, new Binding("Description"));
            txtDesc.SetValue(TextBlock.FontSizeProperty, 11.0);
            txtDesc.SetValue(TextBlock.ForegroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")));
            txtDesc.SetValue(TextBlock.TextWrappingProperty, TextWrapping.Wrap);
            txtDesc.SetValue(TextBlock.MarginProperty, new Thickness(0, 4, 0, 0));
            sp.AppendChild(txtDesc);

            border.AppendChild(sp);
            dt.VisualTree = border;
            return dt;
        }

        private void OnCustomSettingChanged(object sender, SelectionChangedEventArgs e)
        {
            if (_selectedPreset != null && _selectedPreset.Type == PresetType.Custom)
            {
                if (_cmbCustomEncoder.SelectedIndex == 0) _selectedPreset.Encoder = "x265_10bit";
                else if (_cmbCustomEncoder.SelectedIndex == 1) _selectedPreset.Encoder = "svt_av1_10bit";
                else if (_cmbCustomEncoder.SelectedIndex == 2) _selectedPreset.Encoder = "nvenc_av1";
                else if (_cmbCustomEncoder.SelectedIndex == 3) _selectedPreset.Encoder = "qsv_av1";
                else if (_cmbCustomEncoder.SelectedIndex == 4) _selectedPreset.Encoder = "nvenc_h265";
                else if (_cmbCustomEncoder.SelectedIndex == 5) _selectedPreset.Encoder = "qsv_h265";
                else if (_cmbCustomEncoder.SelectedIndex == 6) _selectedPreset.Encoder = "x265";
                else if (_cmbCustomEncoder.SelectedIndex == 7) _selectedPreset.Encoder = "x264";

                if (_cmbCustomRes.SelectedIndex == 0) _selectedPreset.TargetResolution = "Source";
                else if (_cmbCustomRes.SelectedIndex == 1) _selectedPreset.TargetResolution = "1080p";
                else if (_cmbCustomRes.SelectedIndex == 2) _selectedPreset.TargetResolution = "720p";
                else if (_cmbCustomRes.SelectedIndex == 3) _selectedPreset.TargetResolution = "480p";

                _selectedPreset.QualityRF = (int)_sldCustomRF.Value;
                _selectedPreset.SpeedPreset = _cmbCustomPreset.SelectedItem as string ?? "medium";

                if (_cmbCustomAudio.SelectedIndex == 0) _selectedPreset.AudioSetting = "AAC192";
                else if (_cmbCustomAudio.SelectedIndex == 1) _selectedPreset.AudioSetting = "AAC128";
                else if (_cmbCustomAudio.SelectedIndex == 2) _selectedPreset.AudioSetting = "AC3_51";
                else if (_cmbCustomAudio.SelectedIndex == 3) _selectedPreset.AudioSetting = "Passthrough";

                _selectedPreset.SubtitlePassthrough = _chkCustomSubs.IsChecked == true;

                UpdateSavingsProjection();
            }
        }

        private void UpdateSavingsProjection()
        {
            if (_lblPresetSpaceSavingsPreview == null) return;

            var selectedFiles = _currentScannedFiles.Where(f => f.IsSelected).ToList();
            long totalBytes = selectedFiles.Sum(f => f.OriginalSizeBytes);
            double ratio = _selectedPreset != null ? _selectedPreset.ExpectedSavingsRatio : 0.65;
            long estimatedReclaim = (long)(totalBytes * ratio);
            long estimatedTarget = totalBytes - estimatedReclaim;

            _lblPresetSpaceSavingsPreview.Text = string.Format(
                "Selected Preset: {0}  |  Target Files: {1} ({2})  ->  Projected Target: {3}  |  Estimated Reclaimed Space: ~{4} ({5:F0}% Reduction)",
                _selectedPreset != null ? _selectedPreset.Name : "Default",
                selectedFiles.Count,
                MediaFileInfo.FormatBytes(totalBytes),
                MediaFileInfo.FormatBytes(estimatedTarget),
                MediaFileInfo.FormatBytes(estimatedReclaim),
                ratio * 100.0
            );
        }

        private Grid CreateStep3View()
        {
            Grid grid = new Grid { Margin = new Thickness(24) };
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(60) });

            StackPanel head = new StackPanel { Margin = new Thickness(0, 0, 0, 16) };
            head.Children.Add(new TextBlock { Text = "STEP 3: STORAGE STRATEGY & ATOMIC REPLACEMENT", FontSize = 18, FontWeight = FontWeights.Bold, Foreground = Brushes.White });
            head.Children.Add(new TextBlock { Text = "Select how completed encodes replace your source files or output to designated backup locations.", FontSize = 12, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")), Margin = new Thickness(0, 3, 0, 0) });
            Grid.SetRow(head, 0);
            grid.Children.Add(head);

            StackPanel optionsStack = new StackPanel();

            Border opt1Card = CreateGlassCard();
            opt1Card.Padding = new Thickness(16);
            opt1Card.Margin = new Thickness(0, 0, 0, 12);

            StackPanel opt1Panel = new StackPanel();
            _rbAtomicSwap = new RadioButton
            {
                Content = "In-Place Local Atomic Swap (Recommended)",
                IsChecked = true,
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")),
                GroupName = "StorageStrategy"
            };
            _rbAtomicSwap.Checked += (s, e) =>
            {
                _selectedStorageMode = StorageMode.InPlaceAtomicSwap;
                _txtTargetFolder.IsEnabled = false;
                _btnBrowseTarget.IsEnabled = false;
            };
            opt1Panel.Children.Add(_rbAtomicSwap);

            TextBlock opt1Desc = new TextBlock
            {
                Text = "Transcodes into a temporary staging folder (.tmp_optiwizard) located on the same drive root volume. When transcode finishes and verifies target file integrity (> 1MB), atomically replaces the source file in-place, preserving original timestamps with zero network transfer lag.",
                FontSize = 11,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")),
                TextWrapping = TextWrapping.Wrap,
                Margin = new Thickness(24, 6, 0, 0)
            };
            opt1Panel.Children.Add(opt1Desc);
            opt1Card.Child = opt1Panel;
            optionsStack.Children.Add(opt1Card);

            Border opt2Card = CreateGlassCard();
            opt2Card.Padding = new Thickness(16);
            opt2Card.Margin = new Thickness(0, 0, 0, 16);

            StackPanel opt2Panel = new StackPanel();
            _rbCustomTarget = new RadioButton
            {
                Content = "Custom Output Folder (Mirror Directory Structure)",
                IsChecked = false,
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")),
                GroupName = "StorageStrategy"
            };
            _rbCustomTarget.Checked += (s, e) =>
            {
                _selectedStorageMode = StorageMode.CustomDestination;
                _txtTargetFolder.IsEnabled = true;
                _btnBrowseTarget.IsEnabled = true;
            };
            opt2Panel.Children.Add(_rbCustomTarget);

            TextBlock opt2Desc = new TextBlock
            {
                Text = "Preserves original media files untouched and writes optimized videos into a custom target directory, mirroring the source subfolder directory tree.",
                FontSize = 11,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")),
                TextWrapping = TextWrapping.Wrap,
                Margin = new Thickness(24, 6, 0, 10)
            };
            opt2Panel.Children.Add(opt2Desc);

            Grid targetInput = new Grid { Margin = new Thickness(24, 0, 0, 0) };
            targetInput.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            targetInput.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            _txtTargetFolder = new TextBox
            {
                Height = 32,
                IsEnabled = false,
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0D0E17")),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2D334D")),
                BorderThickness = new Thickness(1),
                Padding = new Thickness(8, 6, 8, 6),
                FontSize = 11
            };
            Grid.SetColumn(_txtTargetFolder, 0);
            targetInput.Children.Add(_txtTargetFolder);

            _btnBrowseTarget = CreateActionButton("[ Browse Target... ]", "#2563EB", "#1D4ED8");
            _btnBrowseTarget.Height = 32;
            _btnBrowseTarget.IsEnabled = false;
            _btnBrowseTarget.Margin = new Thickness(8, 0, 0, 0);
            _btnBrowseTarget.Click += (s, e) =>
            {
                var dialog = new System.Windows.Forms.FolderBrowserDialog();
                dialog.Description = "Select Destination Output Folder";
                if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
                {
                    _txtTargetFolder.Text = dialog.SelectedPath;
                    _customTargetDirectory = dialog.SelectedPath;
                }
            };
            Grid.SetColumn(_btnBrowseTarget, 1);
            targetInput.Children.Add(_btnBrowseTarget);

            opt2Panel.Children.Add(targetInput);
            opt2Card.Child = opt2Panel;
            optionsStack.Children.Add(opt2Card);

            Border guardCard = CreateGlassCard();
            guardCard.Padding = new Thickness(16);

            StackPanel guardPanel = new StackPanel();
            guardPanel.Children.Add(new TextBlock { Text = "STREAM GUARD & PROCESS PROTECTION", FontSize = 13, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")), Margin = new Thickness(0, 0, 0, 8) });

            _chkStreamGuard = new CheckBox
            {
                Content = "Stream Guard Active Protection (Auto-pause HandBrake when Plex port 32400 is streaming)",
                IsChecked = true,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")),
                Margin = new Thickness(0, 2, 0, 6)
            };
            guardPanel.Children.Add(_chkStreamGuard);

            _chkLowPriority = new CheckBox
            {
                Content = "Run HandBrake in Below-Normal Priority (Keeps PC 100% responsive during 4K transcodes)",
                IsChecked = true,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")),
                Margin = new Thickness(0, 2, 0, 6)
            };
            guardPanel.Children.Add(_chkLowPriority);

            _chkSkipIfLarger = new CheckBox
            {
                Content = "Safety Guard: Skip swap if output file size exceeds source file size (Zero negative compression)",
                IsChecked = true,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")),
                Margin = new Thickness(0, 2, 0, 6)
            };
            guardPanel.Children.Add(_chkSkipIfLarger);

            _chkAutoReconnect = new CheckBox
            {
                Content = "Auto-Reconnect Network Drives (5-stage exponential backoff for SMB / NAS connections)",
                IsChecked = true,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")),
                Margin = new Thickness(0, 2, 0, 0)
            };
            guardPanel.Children.Add(_chkAutoReconnect);

            guardCard.Child = guardPanel;
            optionsStack.Children.Add(guardCard);

            Grid.SetRow(optionsStack, 1);
            grid.Children.Add(optionsStack);

            Grid footer = new Grid { Margin = new Thickness(0, 14, 0, 0) };
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            Button btnBack = CreateActionButton("<- Back to Presets", "#1E2336", "#2C324B");
            btnBack.Click += (s, e) => NavigateToStep(2);
            Grid.SetColumn(btnBack, 0);
            footer.Children.Add(btnBack);

            Button btnNext = CreateActionButton("Next: Review Queue Matrix ->", "#2563EB", "#1D4ED8");
            btnNext.Click += (s, e) =>
            {
                StageCurrentFolderIntoQueue();
                NavigateToStep(4);
            };
            Grid.SetColumn(btnNext, 2);
            footer.Children.Add(btnNext);

            Grid.SetRow(footer, 2);
            grid.Children.Add(footer);

            return grid;
        }

        private Grid CreateStep4View()
        {
            Grid grid = new Grid { Margin = new Thickness(24) };
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(65) });

            StackPanel head = new StackPanel { Margin = new Thickness(0, 0, 0, 16) };
            head.Children.Add(new TextBlock { Text = "STEP 4: BATCH QUEUE MATRIX & MULTI-FOLDER STAGING", FontSize = 18, FontWeight = FontWeights.Bold, Foreground = Brushes.White });
            head.Children.Add(new TextBlock { Text = "Review all staged media folder jobs. You can add another folder to this batch or proceed to live execution.", FontSize = 12, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")), Margin = new Thickness(0, 3, 0, 0) });
            Grid.SetRow(head, 0);
            grid.Children.Add(head);

            Border summaryCard = CreateGlassCard();
            summaryCard.Padding = new Thickness(14);
            summaryCard.Margin = new Thickness(0, 0, 0, 14);

            Grid sumGrid = new Grid();
            sumGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            sumGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            sumGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            sumGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.3, GridUnitType.Star) });

            _lblQueueTotalFolders = new TextBlock { Text = "Folders: 0", FontSize = 13, FontWeight = FontWeights.SemiBold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")) };
            _lblQueueTotalFiles = new TextBlock { Text = "Total Media Files: 0", FontSize = 13, FontWeight = FontWeights.SemiBold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#A78BFA")) };
            _lblQueueTotalSize = new TextBlock { Text = "Staged Size: 0.00 GB", FontSize = 13, FontWeight = FontWeights.SemiBold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")) };
            _lblQueueEstimatedReclaim = new TextBlock { Text = "Est. Reclaim: ~0.00 GB", FontSize = 13, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#F59E0B")) };

            Grid.SetColumn(_lblQueueTotalFolders, 0);
            Grid.SetColumn(_lblQueueTotalFiles, 1);
            Grid.SetColumn(_lblQueueTotalSize, 2);
            Grid.SetColumn(_lblQueueEstimatedReclaim, 3);

            sumGrid.Children.Add(_lblQueueTotalFolders);
            sumGrid.Children.Add(_lblQueueTotalFiles);
            sumGrid.Children.Add(_lblQueueTotalSize);
            sumGrid.Children.Add(_lblQueueEstimatedReclaim);

            summaryCard.Child = sumGrid;
            Grid.SetRow(summaryCard, 1);
            grid.Children.Add(summaryCard);

            _lstQueuedJobs = new ListView
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0F111A")),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#222638")),
                BorderThickness = new Thickness(1),
                ItemsSource = _queuedJobs
            };

            GridView gv = new GridView();
            gv.Columns.Add(new GridViewColumn { Header = "Folder Name", DisplayMemberBinding = new Binding("FolderName"), Width = 220 });
            gv.Columns.Add(new GridViewColumn { Header = "Source Path", DisplayMemberBinding = new Binding("SourceFolderPath"), Width = 300 });
            gv.Columns.Add(new GridViewColumn { Header = "Files", DisplayMemberBinding = new Binding("TotalFilesCount"), Width = 70 });
            gv.Columns.Add(new GridViewColumn { Header = "Preset", DisplayMemberBinding = new Binding("PresetSummary"), Width = 200 });
            gv.Columns.Add(new GridViewColumn { Header = "Storage Mode", DisplayMemberBinding = new Binding("StorageSummary"), Width = 170 });
            gv.Columns.Add(new GridViewColumn { Header = "Est. Space Saved", DisplayMemberBinding = new Binding("EstimatedSavingsBytes") { Converter = new BytesToStringConverter() }, Width = 120 });
            _lstQueuedJobs.View = gv;

            Grid.SetRow(_lstQueuedJobs, 2);
            grid.Children.Add(_lstQueuedJobs);

            Grid footer = new Grid { Margin = new Thickness(0, 14, 0, 0) };
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            Button btnAddAnother = CreateActionButton("[ + Add Another Folder to Queue ]", "#059669", "#047857");
            btnAddAnother.Padding = new Thickness(18, 0, 18, 0);
            btnAddAnother.Click += (s, e) =>
            {
                _txtSourceFolder.Text = "";
                _currentScannedFiles.Clear();
                _btnStep1Next.IsEnabled = false;
                _lblScanCount.Text = "Media Files: 0 detected";
                _lblScanSize.Text = "Total Size: 0.00 GB";
                _lblScanCodecs.Text = "Codecs: None scanned";
                NavigateToStep(1);
            };
            Grid.SetColumn(btnAddAnother, 0);
            footer.Children.Add(btnAddAnother);

            Button btnClearQueue = CreateActionButton("[ Clear Queue ]", "#DC2626", "#B91C1C");
            btnClearQueue.Margin = new Thickness(10, 0, 0, 0);
            btnClearQueue.Click += (s, e) =>
            {
                _queuedJobs.Clear();
                UpdateQueueOverview();
            };
            Grid.SetColumn(btnClearQueue, 1);
            footer.Children.Add(btnClearQueue);

            Button btnStartBatch = CreateActionButton("[ > START BATCH OPTIMIZATION ]", "#2563EB", "#1D4ED8");
            btnStartBatch.FontWeight = FontWeights.Bold;
            btnStartBatch.FontSize = 13;
            btnStartBatch.Padding = new Thickness(24, 0, 24, 0);
            btnStartBatch.Click += (s, e) =>
            {
                if (_queuedJobs.Count == 0)
                {
                    MessageBox.Show("Please stage at least one folder before starting optimization.", "Queue Empty", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }
                StartBatchOptimization();
            };
            Grid.SetColumn(btnStartBatch, 3);
            footer.Children.Add(btnStartBatch);

            Grid.SetRow(footer, 3);
            grid.Children.Add(footer);

            return grid;
        }

        private Grid CreateStep5View()
        {
            Grid grid = new Grid { Margin = new Thickness(24) };
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1.3, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(60) });

            Border heroCard = CreateGlassCard();
            heroCard.Padding = new Thickness(16);
            heroCard.Margin = new Thickness(0, 0, 0, 12);
            heroCard.Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#131625"));
            heroCard.BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B82F6"));

            StackPanel heroStack = new StackPanel();

            Grid heroTopRow = new Grid();
            heroTopRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            heroTopRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            _lblExecCurrentFile = new TextBlock
            {
                Text = "[NOW OPTIMIZING] Waiting to start...",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#60A5FA")),
                TextTrimming = TextTrimming.CharacterEllipsis
            };
            Grid.SetColumn(_lblExecCurrentFile, 0);
            heroTopRow.Children.Add(_lblExecCurrentFile);

            _lblStreamGuardBadge = new TextBlock
            {
                Text = "[STREAM GUARD: ACTIVE]",
                FontSize = 10,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")),
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(_lblStreamGuardBadge, 1);
            heroTopRow.Children.Add(_lblStreamGuardBadge);

            heroStack.Children.Add(heroTopRow);

            _lblExecCurrentFolder = new TextBlock
            {
                Text = "Source Directory: --",
                FontSize = 11,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")),
                Margin = new Thickness(0, 2, 0, 8)
            };
            heroStack.Children.Add(_lblExecCurrentFolder);

            Grid pbRow = new Grid();
            pbRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            pbRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(60) });

            _pbCurrentFile = new ProgressBar
            {
                Height = 12,
                Minimum = 0,
                Maximum = 100,
                Value = 0,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B82F6")),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E2338")),
                BorderThickness = new Thickness(0)
            };
            Grid.SetColumn(_pbCurrentFile, 0);
            pbRow.Children.Add(_pbCurrentFile);

            _lblExecProgressPct = new TextBlock
            {
                Text = "0.0%",
                FontSize = 12,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                HorizontalAlignment = HorizontalAlignment.Right,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(_lblExecProgressPct, 1);
            pbRow.Children.Add(_lblExecProgressPct);

            heroStack.Children.Add(pbRow);

            Grid heroStats = new Grid { Margin = new Thickness(0, 8, 0, 0) };
            heroStats.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            heroStats.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            heroStats.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            _lblExecSpeedFps = new TextBlock { Text = "Encoding Speed: 0.0 FPS", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")) };
            _lblExecEta = new TextBlock { Text = "ETA: --:--:--", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FBBF24")) };
            _lblExecSizeReduction = new TextBlock { Text = "Size: -- -> --", FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")) };

            Grid.SetColumn(_lblExecSpeedFps, 0);
            Grid.SetColumn(_lblExecEta, 1);
            Grid.SetColumn(_lblExecSizeReduction, 2);

            heroStats.Children.Add(_lblExecSpeedFps);
            heroStats.Children.Add(_lblExecEta);
            heroStats.Children.Add(_lblExecSizeReduction);

            heroStack.Children.Add(heroStats);
            heroCard.Child = heroStack;
            Grid.SetRow(heroCard, 0);
            grid.Children.Add(heroCard);

            Border batchPbCard = CreateGlassCard();
            batchPbCard.Padding = new Thickness(12);
            batchPbCard.Margin = new Thickness(0, 0, 0, 10);

            StackPanel batchPbStack = new StackPanel();
            Grid batchHead = new Grid();
            batchHead.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            batchHead.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            _lblExecBatchProgress = new TextBlock { Text = "Batch Progress: 0 of 0 files completed (0.0%)", FontSize = 11, FontWeight = FontWeights.SemiBold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")) };
            _lblExecBatchSaved = new TextBlock { Text = "Total Reclaimed: 0.00 GB", FontSize = 11, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")) };

            Grid.SetColumn(_lblExecBatchProgress, 0);
            Grid.SetColumn(_lblExecBatchSaved, 1);
            batchHead.Children.Add(_lblExecBatchProgress);
            batchHead.Children.Add(_lblExecBatchSaved);
            batchPbStack.Children.Add(batchHead);

            _pbTotalBatch = new ProgressBar
            {
                Height = 8,
                Minimum = 0,
                Maximum = 100,
                Value = 0,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#10B981")),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E2338")),
                BorderThickness = new Thickness(0),
                Margin = new Thickness(0, 6, 0, 0)
            };
            batchPbStack.Children.Add(_pbTotalBatch);

            batchPbCard.Child = batchPbStack;
            Grid.SetRow(batchPbCard, 1);
            grid.Children.Add(batchPbCard);

            _lstExecFiles = new ListView
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0F111A")),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#222638")),
                BorderThickness = new Thickness(1),
                Margin = new Thickness(0, 0, 0, 10)
            };

            GridView gvExec = new GridView();
            gvExec.Columns.Add(new GridViewColumn { Header = "Status", DisplayMemberBinding = new Binding("StatusBadge"), Width = 110 });
            gvExec.Columns.Add(new GridViewColumn { Header = "File Name", DisplayMemberBinding = new Binding("FileName"), Width = 340 });
            gvExec.Columns.Add(new GridViewColumn { Header = "Original", DisplayMemberBinding = new Binding("OriginalSizeDisplay"), Width = 90 });
            gvExec.Columns.Add(new GridViewColumn { Header = "Optimized", DisplayMemberBinding = new Binding("ProcessedSizeDisplay"), Width = 90 });
            gvExec.Columns.Add(new GridViewColumn { Header = "Space Saved", DisplayMemberBinding = new Binding("SavedSizeDisplay"), Width = 120 });
            gvExec.Columns.Add(new GridViewColumn { Header = "Speed", DisplayMemberBinding = new Binding("CurrentFps") { StringFormat = "{0:F1} FPS" }, Width = 80 });
            gvExec.Columns.Add(new GridViewColumn { Header = "ETA", DisplayMemberBinding = new Binding("EtaString"), Width = 80 });
            _lstExecFiles.View = gvExec;

            Grid.SetRow(_lstExecFiles, 2);
            grid.Children.Add(_lstExecFiles);

            _txtConsoleLogs = new TextBox
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#08090D")),
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")),
                FontFamily = new FontFamily("Consolas, Courier New"),
                FontSize = 10,
                IsReadOnly = true,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E2338")),
                Padding = new Thickness(8)
            };
            Grid.SetRow(_txtConsoleLogs, 3);
            grid.Children.Add(_txtConsoleLogs);

            Grid controlsGrid = new Grid { Margin = new Thickness(0, 10, 0, 0) };
            controlsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            controlsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            controlsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            controlsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            _btnPauseResume = CreateActionButton("[ || PAUSE QUEUE ]", "#F59E0B", "#D97706");
            _btnPauseResume.Click += (s, e) =>
            {
                if (_handbrakeEngine.IsPaused)
                {
                    _handbrakeEngine.Resume();
                    _btnPauseResume.Content = "[ || PAUSE QUEUE ]";
                }
                else
                {
                    _handbrakeEngine.Pause();
                    _btnPauseResume.Content = "[ > RESUME QUEUE ]";
                }
            };
            Grid.SetColumn(_btnPauseResume, 0);
            controlsGrid.Children.Add(_btnPauseResume);

            _btnSkipCurrent = CreateActionButton("[ >> SKIP FILE ]", "#6366F1", "#4F46E5");
            _btnSkipCurrent.Margin = new Thickness(10, 0, 0, 0);
            _btnSkipCurrent.Click += (s, e) =>
            {
                if (_handbrakeEngine.IsRunning)
                {
                    _handbrakeEngine.Kill();
                }
            };
            Grid.SetColumn(_btnSkipCurrent, 1);
            controlsGrid.Children.Add(_btnSkipCurrent);

            _btnCancelBatch = CreateActionButton("[ X CANCEL / ABORT BATCH ]", "#DC2626", "#B91C1C");
            _btnCancelBatch.Click += (s, e) =>
            {
                if (_cts != null)
                {
                    _cts.Cancel();
                    _handbrakeEngine.Kill();
                }
            };
            Grid.SetColumn(_btnCancelBatch, 3);
            controlsGrid.Children.Add(_btnCancelBatch);

            Grid.SetRow(controlsGrid, 4);
            grid.Children.Add(controlsGrid);

            return grid;
        }

        private Grid CreateStep6View()
        {
            Grid grid = new Grid { Margin = new Thickness(24) };
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(70) });

            StackPanel head = new StackPanel { Margin = new Thickness(0, 0, 0, 20), HorizontalAlignment = HorizontalAlignment.Center };
            TextBlock congrats = new TextBlock
            {
                Text = "[ BATCH OPTIMIZATION COMPLETE ]",
                FontSize = 22,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")),
                HorizontalAlignment = HorizontalAlignment.Center
            };
            TextBlock sub = new TextBlock
            {
                Text = "All media batches have been processed, verified, and safely integrated into your storage.",
                FontSize = 13,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 6, 0, 0)
            };
            head.Children.Add(congrats);
            head.Children.Add(sub);
            Grid.SetRow(head, 0);
            grid.Children.Add(head);

            Border sumCard = CreateGlassCard();
            sumCard.Padding = new Thickness(30);
            sumCard.HorizontalAlignment = HorizontalAlignment.Center;
            sumCard.VerticalAlignment = VerticalAlignment.Center;
            sumCard.Width = 800;

            Grid sumGrid = new Grid();
            sumGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            sumGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            sumGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            sumGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            sumGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            _lblSumTotalFiles = CreateMetricItem("Total Media Files Optimized", "0 Files", "#38BDF8");
            Grid.SetRow(_lblSumTotalFiles, 0);
            Grid.SetColumn(_lblSumTotalFiles, 0);
            sumGrid.Children.Add(_lblSumTotalFiles);

            _lblSumTotalDuration = CreateMetricItem("Total Batch Time Elapsed", "00:00:00", "#A78BFA");
            Grid.SetRow(_lblSumTotalDuration, 0);
            Grid.SetColumn(_lblSumTotalDuration, 1);
            sumGrid.Children.Add(_lblSumTotalDuration);

            _lblSumOrigSize = CreateMetricItem("Original Library Size", "0.00 GB", "#94A3B8");
            Grid.SetRow(_lblSumOrigSize, 1);
            Grid.SetColumn(_lblSumOrigSize, 0);
            sumGrid.Children.Add(_lblSumOrigSize);

            _lblSumFinalSize = CreateMetricItem("Optimized Library Size", "0.00 GB", "#60A5FA");
            Grid.SetRow(_lblSumFinalSize, 1);
            Grid.SetColumn(_lblSumFinalSize, 1);
            sumGrid.Children.Add(_lblSumFinalSize);

            _lblSumReclaimed = CreateMetricItem("Total Hard Drive Space Saved", "0.00 GB", "#34D399");
            Grid.SetRow(_lblSumReclaimed, 2);
            Grid.SetColumn(_lblSumReclaimed, 0);
            sumGrid.Children.Add(_lblSumReclaimed);

            _lblSumCompressionRatio = CreateMetricItem("Overall Library Storage Reduction", "0.0%", "#F59E0B");
            Grid.SetRow(_lblSumCompressionRatio, 2);
            Grid.SetColumn(_lblSumCompressionRatio, 1);
            sumGrid.Children.Add(_lblSumCompressionRatio);

            sumCard.Child = sumGrid;
            Grid.SetRow(sumCard, 1);
            grid.Children.Add(sumCard);

            StackPanel loopStack = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };

            Button btnStartAnother = CreateActionButton("[ + Start Another Optimization Queue ]", "#059669", "#047857");
            btnStartAnother.FontWeight = FontWeights.Bold;
            btnStartAnother.Padding = new Thickness(20, 10, 20, 10);
            btnStartAnother.Click += (s, e) =>
            {
                _queuedJobs.Clear();
                _currentScannedFiles.Clear();
                _txtSourceFolder.Text = "";
                _btnStep1Next.IsEnabled = false;
                NavigateToStep(1);
            };
            loopStack.Children.Add(btnStartAnother);

            Button btnExportCsv = CreateActionButton("[ @ Export CSV Audit Log ]", "#2563EB", "#1D4ED8");
            btnExportCsv.Margin = new Thickness(14, 0, 14, 0);
            btnExportCsv.Padding = new Thickness(18, 10, 18, 10);
            btnExportCsv.Click += (s, e) => ExportAuditLog();
            loopStack.Children.Add(btnExportCsv);

            Button btnClose = CreateActionButton("[ X Exit OptiWizard ]", "#374151", "#1F2937");
            btnClose.Padding = new Thickness(18, 10, 18, 10);
            btnClose.Click += (s, e) => Close();
            loopStack.Children.Add(btnClose);

            Grid.SetRow(loopStack, 2);
            grid.Children.Add(loopStack);

            return grid;
        }

        private TextBlock CreateMetricItem(string label, string val, string colorHex)
        {
            TextBlock tb = new TextBlock
            {
                Margin = new Thickness(0, 10, 0, 10)
            };
            tb.Inlines.Add(new Run(label + "\r\n") { FontSize = 11, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")) });
            tb.Inlines.Add(new Run(val) { FontSize = 18, FontWeight = FontWeights.Bold, Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString(colorHex)) });
            return tb;
        }
        #endregion

        #region Scanning & Staging Engine
        private void LoadQuickDrivesAsync(StackPanel optionsPanel)
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                List<DriveInfo> readyDrives = new List<DriveInfo>();
                try
                {
                    foreach (DriveInfo d in DriveInfo.GetDrives())
                    {
                        try
                        {
                            if (d.IsReady) readyDrives.Add(d);
                        }
                        catch { }
                    }
                }
                catch { }

                Dispatcher.Invoke(new Action(delegate
                {
                    try
                    {
                        optionsPanel.Children.Add(new TextBlock { Text = "Quick Drives: ", Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#64748B")), VerticalAlignment = VerticalAlignment.Center });
                        foreach (DriveInfo d in readyDrives)
                        {
                            Button btnDrive = new Button
                            {
                                Content = string.Format("[ {0} ]", d.Name),
                                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1E2336")),
                                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#93C5FD")),
                                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2D334D")),
                                BorderThickness = new Thickness(1),
                                Margin = new Thickness(4, 0, 4, 0),
                                Padding = new Thickness(6, 2, 6, 2),
                                FontSize = 10,
                                Tag = d.RootDirectory.FullName
                            };
                            btnDrive.Click += (s, e) =>
                            {
                                string drivePath = (string)((Button)s).Tag;
                                _txtSourceFolder.Text = drivePath;
                                ScanFolderAsync(drivePath);
                            };
                            optionsPanel.Children.Add(btnDrive);
                        }
                    }
                    catch { }
                }));
            });
        }
        private void ScanFolderAsync(string folderPath)
        {
            if (string.IsNullOrEmpty(folderPath) || !Directory.Exists(folderPath)) return;

            _lblScanCount.Text = "Scanning directory hierarchy...";
            _btnStep1Next.IsEnabled = false;
            _currentScannedFiles.Clear();

            bool recursive = _chkRecursive.IsChecked == true;

            ThreadPool.QueueUserWorkItem(delegate
            {
                List<MediaFileInfo> discovered = new List<MediaFileInfo>();
                string[] validExts = new string[] { ".mkv", ".mp4", ".m4v", ".avi", ".mov", ".wmv", ".flv", ".ts", ".m2ts", ".webm" };

                try
                {
                    SearchOption opt = recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
                    DirectoryInfo rootDir = new DirectoryInfo(folderPath);
                    FileInfo[] files = rootDir.GetFiles("*.*", opt);

                    foreach (FileInfo f in files)
                    {
                        string ext = f.Extension.ToLowerInvariant();
                        if (validExts.Contains(ext))
                        {
                            string relPath = f.FullName.Substring(folderPath.Length).TrimStart('\\', '/');
                            string codecTag = "H.264 / AVC";
                            if (f.Name.ToLowerInvariant().Contains("x265") || f.Name.ToLowerInvariant().Contains("hevc"))
                            {
                                codecTag = "HEVC / x265";
                            }
                            else if (f.Name.ToLowerInvariant().Contains("av1"))
                            {
                                codecTag = "AV1";
                            }

                            discovered.Add(new MediaFileInfo
                            {
                                FullPath = f.FullName,
                                FileName = f.Name,
                                RelativePath = relPath,
                                OriginalSizeBytes = f.Length,
                                Extension = ext,
                                DetectedCodec = codecTag,
                                Status = FileStatus.Pending
                            });
                        }
                    }
                }
                catch { }

                Dispatcher.Invoke(new Action(delegate
                {
                    foreach (var m in discovered)
                    {
                        m.PropertyChanged += (s, e) =>
                        {
                            if (e.PropertyName == "IsSelected")
                            {
                                UpdateStep1SelectionMetrics();
                            }
                        };
                        _currentScannedFiles.Add(m);
                    }

                    long totalBytes = discovered.Sum(f => f.OriginalSizeBytes);
                    _lblScanCount.Text = string.Format("Media Files: {0} files detected", discovered.Count);
                    _lblScanSize.Text = string.Format("Total Size: {0}", MediaFileInfo.FormatBytes(totalBytes));

                    int hevcCount = discovered.Count(f => f.DetectedCodec.Contains("HEVC"));
                    int h264Count = discovered.Count - hevcCount;
                    _lblScanCodecs.Text = string.Format("Codecs: {0} H.264/AVC | {1} HEVC/x265", h264Count, hevcCount);

                    UpdateStep1SelectionMetrics();
                }));
            });
        }

        private void StageCurrentFolderIntoQueue()
        {
            if (string.IsNullOrEmpty(_txtSourceFolder.Text) || _currentScannedFiles.Count == 0) return;

            var selectedFiles = _currentScannedFiles.Where(f => f.IsSelected).ToList();
            if (selectedFiles.Count == 0)
            {
                MessageBox.Show("Please select at least one media file from the list to optimize.", "No Files Selected", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            string src = _txtSourceFolder.Text;
            FolderJob existing = _queuedJobs.FirstOrDefault(j => j.SourceFolderPath.Equals(src, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
            {
                _queuedJobs.Remove(existing);
            }

            FolderJob job = new FolderJob
            {
                SourceFolderPath = src,
                Preset = _selectedPreset,
                StorageMode = _selectedStorageMode,
                TargetFolderPath = _customTargetDirectory,
                StreamGuardEnabled = _chkStreamGuard.IsChecked == true,
                LowPriorityEnabled = _chkLowPriority.IsChecked == true,
                SkipIfLarger = _chkSkipIfLarger.IsChecked == true,
                AutoReconnect = _chkAutoReconnect.IsChecked == true
            };

            foreach (var f in selectedFiles)
            {
                job.Files.Add(new MediaFileInfo
                {
                    FullPath = f.FullPath,
                    FileName = f.FileName,
                    RelativePath = f.RelativePath,
                    OriginalSizeBytes = f.OriginalSizeBytes,
                    Extension = f.Extension,
                    DetectedCodec = f.DetectedCodec,
                    Status = FileStatus.Pending,
                    IsSelected = true
                });
            }

            _queuedJobs.Add(job);
        }

        private void UpdateQueueOverview()
        {
            int totalFolders = _queuedJobs.Count;
            int totalFiles = _queuedJobs.Sum(j => j.TotalFilesCount);
            long totalSize = _queuedJobs.Sum(j => j.TotalSizeBytes);
            long totalReclaim = _queuedJobs.Sum(j => j.EstimatedSavingsBytes);

            _lblQueueTotalFolders.Text = string.Format("Folders: {0}", totalFolders);
            _lblQueueTotalFiles.Text = string.Format("Total Media Files: {0}", totalFiles);
            _lblQueueTotalSize.Text = string.Format("Staged Size: {0}", MediaFileInfo.FormatBytes(totalSize));
            _lblQueueEstimatedReclaim.Text = string.Format("Est. Reclaim: ~{0}", MediaFileInfo.FormatBytes(totalReclaim));
        }
        #endregion

        #region Live Batch Optimization Execution
        private void StartBatchOptimization()
        {
            NavigateToStep(5);

            ObservableCollection<MediaFileInfo> allExecFiles = new ObservableCollection<MediaFileInfo>();
            foreach (var job in _queuedJobs)
            {
                foreach (var f in job.Files)
                {
                    f.Status = FileStatus.Pending;
                    f.ProgressPercent = 0;
                    f.ProcessedSizeBytes = 0;
                    allExecFiles.Add(f);
                }
            }
            _lstExecFiles.ItemsSource = allExecFiles;

            _totalBatchFilesCount = allExecFiles.Count;
            _completedBatchFilesCount = 0;
            _totalBatchOriginalBytes = allExecFiles.Sum(f => f.OriginalSizeBytes);
            _totalBatchProcessedBytes = 0;

            _batchStopwatch = Stopwatch.StartNew();
            _cts = new CancellationTokenSource();

            ThreadPool.QueueUserWorkItem(delegate { RunBatchWorker(allExecFiles, _cts.Token); });
        }

        private void RunBatchWorker(ObservableCollection<MediaFileInfo> allFiles, CancellationToken ct)
        {
            string handbrakeCli = HandBrakeEngine.ResolveHandBrakePath();
            AppendLog("[ENGINE] Resolved HandBrakeCLI Path: " + handbrakeCli);

            if (!File.Exists(handbrakeCli))
            {
                AppendLog("[ERROR] HandBrakeCLI.exe not found! Please place HandBrakeCLI.exe in application directory.");
                Dispatcher.Invoke(new Action(delegate
                {
                    MessageBox.Show("HandBrakeCLI.exe not found at:\n" + handbrakeCli, "Missing Binary", MessageBoxButton.OK, MessageBoxImage.Error);
                }));
                return;
            }

            long cumulativeSavedBytes = 0;

            foreach (var job in _queuedJobs)
            {
                if (ct.IsCancellationRequested) break;

                string driveRoot = Path.GetPathRoot(job.SourceFolderPath);
                string tempStagingDir = Path.Combine(driveRoot, ".tmp_optiwizard");

                if (job.StorageMode == StorageMode.InPlaceAtomicSwap)
                {
                    try
                    {
                        if (!Directory.Exists(tempStagingDir))
                        {
                            DirectoryInfo di = Directory.CreateDirectory(tempStagingDir);
                            di.Attributes = FileAttributes.Directory | FileAttributes.Hidden;
                        }
                    }
                    catch { }
                }

                foreach (var file in job.Files)
                {
                    if (ct.IsCancellationRequested) break;

                    Dispatcher.Invoke(new Action(delegate
                    {
                        file.Status = FileStatus.Encoding;
                        _lblExecCurrentFile.Text = string.Format("[NOW OPTIMIZING] {0}", file.FileName);
                        _lblExecCurrentFolder.Text = string.Format("Job Folder: {0} ({1})", job.FolderName, job.PresetSummary);
                        _pbCurrentFile.Value = 0;
                        _lblExecProgressPct.Text = "0.0%";
                    }));

                    AppendLog(string.Format("[FILE START] Processing: {0} ({1})", file.FileName, file.OriginalSizeDisplay));

                    string outputPath;
                    bool isAtomic = job.StorageMode == StorageMode.InPlaceAtomicSwap;

                    if (isAtomic)
                    {
                        outputPath = Path.Combine(tempStagingDir, "opti_" + Guid.NewGuid().ToString("N").Substring(0, 10) + ".mkv");
                    }
                    else
                    {
                        string destDir = Path.Combine(job.TargetFolderPath, Path.GetDirectoryName(file.RelativePath));
                        if (!Directory.Exists(destDir)) Directory.CreateDirectory(destDir);
                        string outName = Path.GetFileNameWithoutExtension(file.FileName) + ".mkv";
                        outputPath = Path.Combine(destDir, outName);
                    }

                    string hbArgs = job.Preset.GetHandBrakeArgs(file.FullPath, outputPath);

                    DateTime startFile = DateTime.Now;
                    int exitCode = _handbrakeEngine.ExecuteTranscode(handbrakeCli, hbArgs, job.LowPriorityEnabled, ct);

                    if (ct.IsCancellationRequested)
                    {
                        try { if (File.Exists(outputPath)) File.Delete(outputPath); } catch { }
                        break;
                    }

                    if (exitCode == 0 && File.Exists(outputPath))
                    {
                        long outSize = new FileInfo(outputPath).Length;

                        if (outSize > 1024 * 1024)
                        {
                            if (job.SkipIfLarger && outSize >= file.OriginalSizeBytes)
                            {
                                AppendLog(string.Format("[SKIP] Target file ({0}) is larger than or equal to source ({1}). Preserving original.", MediaFileInfo.FormatBytes(outSize), file.OriginalSizeDisplay));
                                try { File.Delete(outputPath); } catch { }
                                Dispatcher.Invoke(new Action(delegate
                                {
                                    file.Status = FileStatus.Skipped;
                                    file.ProcessedSizeBytes = file.OriginalSizeBytes;
                                    file.ProgressPercent = 100.0;
                                    _completedBatchFilesCount++;
                                    _totalBatchProcessedBytes += file.OriginalSizeBytes;

                                    double batchPct = ((double)_completedBatchFilesCount / _totalBatchFilesCount) * 100.0;
                                    _pbTotalBatch.Value = batchPct;
                                    _lblExecBatchProgress.Text = string.Format("Batch Progress: {0} of {1} files processed ({2:F1}%)", _completedBatchFilesCount, _totalBatchFilesCount, batchPct);
                                    _lblExecBatchSaved.Text = string.Format("Total Reclaimed: {0}", MediaFileInfo.FormatBytes(cumulativeSavedBytes));
                                }));
                            }
                            else
                            {
                                if (isAtomic)
                                {
                                    DateTime creationTime = File.GetCreationTimeUtc(file.FullPath);
                                    DateTime lastWriteTime = File.GetLastWriteTimeUtc(file.FullPath);

                                    string backupPath = file.FullPath + ".optibak";
                                    try
                                    {
                                        if (File.Exists(backupPath)) File.Delete(backupPath);
                                        File.Move(file.FullPath, backupPath);
                                        File.Move(outputPath, file.FullPath);
                                        File.SetCreationTimeUtc(file.FullPath, creationTime);
                                        File.SetLastWriteTimeUtc(file.FullPath, lastWriteTime);
                                        File.Delete(backupPath);
                                    }
                                    catch (Exception ex)
                                    {
                                        AppendLog("[ERROR] Atomic swap failed: " + ex.Message);
                                        if (File.Exists(backupPath) && !File.Exists(file.FullPath))
                                        {
                                            File.Move(backupPath, file.FullPath);
                                        }
                                    }
                                }

                                long saved = Math.Max(0, file.OriginalSizeBytes - outSize);
                                cumulativeSavedBytes += saved;

                                Dispatcher.Invoke(new Action(delegate
                                {
                                    file.ProcessedSizeBytes = outSize;
                                    file.Status = FileStatus.Completed;
                                    file.ProgressPercent = 100.0;
                                    _completedBatchFilesCount++;
                                    _totalBatchProcessedBytes += outSize;

                                    double batchPct = ((double)_completedBatchFilesCount / _totalBatchFilesCount) * 100.0;
                                    _pbTotalBatch.Value = batchPct;
                                    _lblExecBatchProgress.Text = string.Format("Batch Progress: {0} of {1} files completed ({2:F1}%)", _completedBatchFilesCount, _totalBatchFilesCount, batchPct);
                                    _lblExecBatchSaved.Text = string.Format("Total Reclaimed: {0}", MediaFileInfo.FormatBytes(cumulativeSavedBytes));
                                }));

                                AppendLog(string.Format("[SUCCESS] Completed: {0} | Saved: {1}", file.FileName, MediaFileInfo.FormatBytes(saved)));
                            }
                        }
                        else
                        {
                            AppendLog(string.Format("[FAIL] Output file too small ({0} bytes). Encoding rejected.", outSize));
                            try { File.Delete(outputPath); } catch { }
                            Dispatcher.Invoke(new Action(delegate
                            {
                                file.Status = FileStatus.Failed;
                                file.ProcessedSizeBytes = file.OriginalSizeBytes;
                                file.ProgressPercent = 100.0;
                                _completedBatchFilesCount++;
                                _totalBatchProcessedBytes += file.OriginalSizeBytes;

                                double batchPct = ((double)_completedBatchFilesCount / _totalBatchFilesCount) * 100.0;
                                _pbTotalBatch.Value = batchPct;
                                _lblExecBatchProgress.Text = string.Format("Batch Progress: {0} of {1} files processed ({2:F1}%)", _completedBatchFilesCount, _totalBatchFilesCount, batchPct);
                            }));
                        }
                    }
                    else
                    {
                        AppendLog(string.Format("[FAIL] HandBrake exited with code {0}", exitCode));
                        try { if (File.Exists(outputPath)) File.Delete(outputPath); } catch { }
                        Dispatcher.Invoke(new Action(delegate
                        {
                            file.Status = FileStatus.Failed;
                            file.ProcessedSizeBytes = file.OriginalSizeBytes;
                            file.ProgressPercent = 100.0;
                            _completedBatchFilesCount++;
                            _totalBatchProcessedBytes += file.OriginalSizeBytes;

                            double batchPct = ((double)_completedBatchFilesCount / _totalBatchFilesCount) * 100.0;
                            _pbTotalBatch.Value = batchPct;
                            _lblExecBatchProgress.Text = string.Format("Batch Progress: {0} of {1} files processed ({2:F1}%)", _completedBatchFilesCount, _totalBatchFilesCount, batchPct);
                        }));
                    }
                }
            }

            _batchStopwatch.Stop();

            Dispatcher.Invoke(new Action(delegate
            {
                _lblSumTotalFiles.Text = string.Format("{0} Files", _completedBatchFilesCount);
                _lblSumTotalDuration.Text = _batchStopwatch.Elapsed.ToString(@"hh\:mm\:ss");
                _lblSumOrigSize.Text = MediaFileInfo.FormatBytes(_totalBatchOriginalBytes);
                _lblSumFinalSize.Text = MediaFileInfo.FormatBytes(_totalBatchProcessedBytes);
                _lblSumReclaimed.Text = MediaFileInfo.FormatBytes(cumulativeSavedBytes);

                double reductionPct = _totalBatchOriginalBytes > 0 ? ((double)cumulativeSavedBytes / _totalBatchOriginalBytes) * 100.0 : 0;
                _lblSumCompressionRatio.Text = string.Format("{0:F1}% Reclaimed", reductionPct);

                NavigateToStep(6);
            }));
        }

        private void OnHandBrakeProgress(double pct, double fps, string eta)
        {
            Dispatcher.Invoke(new Action(delegate
            {
                _pbCurrentFile.Value = pct;
                _lblExecProgressPct.Text = string.Format("{0:F1}%", pct);
                _lblExecSpeedFps.Text = string.Format("Encoding Speed: {0:F1} FPS", fps);
                _lblExecEta.Text = string.Format("ETA: {0}", eta);

                ObservableCollection<MediaFileInfo> files = _lstExecFiles.ItemsSource as ObservableCollection<MediaFileInfo>;
                if (files != null)
                {
                    var active = files.FirstOrDefault(f => f.Status == FileStatus.Encoding);
                    if (active != null)
                    {
                        active.ProgressPercent = pct;
                        active.CurrentFps = fps;
                        active.EtaString = eta;
                    }
                }
            }));
        }

        private void OnHandBrakeLog(string line)
        {
            if (line.Contains("Encoding:") || line.Contains("task 1 of 1")) return;
            Dispatcher.Invoke(new Action(delegate
            {
                _txtConsoleLogs.AppendText(line + "\r\n");
                if (_txtConsoleLogs.LineCount > 300)
                {
                    _txtConsoleLogs.Text = _txtConsoleLogs.Text.Substring(_txtConsoleLogs.Text.IndexOf('\n') + 1);
                }
                _txtConsoleLogs.ScrollToEnd();
            }));
        }

        private void AppendLog(string message)
        {
            Dispatcher.Invoke(new Action(delegate
            {
                string entry = string.Format("[{0}] {1}\r\n", DateTime.Now.ToString("HH:mm:ss"), message);
                _txtConsoleLogs.AppendText(entry);
                _txtConsoleLogs.ScrollToEnd();
            }));
        }

        private void OnStreamGuardStateChanged(bool active)
        {
            Dispatcher.Invoke(new Action(delegate
            {
                if (active)
                {
                    _lblStreamGuardBadge.Text = "[STREAM GUARD: PLEX PLAYING - PAUSED]";
                    _lblStreamGuardBadge.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#EF4444"));
                    AppendLog("[STREAM GUARD] Plex streaming detected. HandBrake suspended to protect playback.");
                }
                else
                {
                    _lblStreamGuardBadge.Text = "[STREAM GUARD: ACTIVE]";
                    _lblStreamGuardBadge.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399"));
                    AppendLog("[STREAM GUARD] Plex streaming idle. Transcoder active.");
                }
            }));
        }

        private void ExportAuditLog()
        {
            var dialog = new System.Windows.Forms.SaveFileDialog
            {
                Filter = "CSV File (*.csv)|*.csv|Text Log (*.txt)|*.txt",
                FileName = string.Format("OptiWizard_Audit_{0}.csv", DateTime.Now.ToString("yyyyMMdd_HHmmss"))
            };

            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                StringBuilder sb = new StringBuilder();
                sb.AppendLine("FileName,OriginalSizeBytes,ProcessedSizeBytes,SpaceSavedBytes,ReductionPercent,Status,RelativePath");

                ObservableCollection<MediaFileInfo> files = _lstExecFiles.ItemsSource as ObservableCollection<MediaFileInfo>;
                if (files != null)
                {
                    foreach (var f in files)
                    {
                        long saved = Math.Max(0, f.OriginalSizeBytes - f.ProcessedSizeBytes);
                        double pct = f.OriginalSizeBytes > 0 ? ((double)saved / f.OriginalSizeBytes) * 100.0 : 0;
                        sb.AppendLine(string.Format("\"{0}\",{1},{2},{3},{4:F2},\"{5}\",\"{6}\"",
                            f.FileName.Replace("\"", "\"\""),
                            f.OriginalSizeBytes,
                            f.ProcessedSizeBytes,
                            saved,
                            pct,
                            f.Status,
                            f.RelativePath.Replace("\"", "\"\"")));
                    }
                }

                File.WriteAllText(dialog.FileName, sb.ToString(), Encoding.UTF8);
                MessageBox.Show("Audit report successfully exported to:\n" + dialog.FileName, "Export Successful", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }
        #endregion

        #region Helpers & UI Factories
        private Border CreateGlassCard()
        {
            return new Border
            {
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#141724")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#23283B")),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(6)
            };
        }

        private Button CreateActionButton(string text, string bgHex, string hoverHex)
        {
            Button btn = new Button
            {
                Content = text,
                Height = 36,
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bgHex)),
                Foreground = Brushes.White,
                FontWeight = FontWeights.SemiBold,
                FontSize = 12,
                Padding = new Thickness(16, 6, 16, 6),
                BorderThickness = new Thickness(0),
                Cursor = Cursors.Hand
            };

            Style style = new Style(typeof(Button));
            ControlTemplate template = new ControlTemplate(typeof(Button));
            FrameworkElementFactory border = new FrameworkElementFactory(typeof(Border));
            border.Name = "btnBorder";
            border.SetValue(Border.CornerRadiusProperty, new CornerRadius(4));
            border.SetValue(Border.BackgroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString(bgHex)));
            border.SetValue(Border.PaddingProperty, new Thickness(14, 6, 14, 6));

            FrameworkElementFactory content = new FrameworkElementFactory(typeof(ContentPresenter));
            content.SetValue(ContentPresenter.HorizontalAlignmentProperty, HorizontalAlignment.Center);
            content.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
            border.AppendChild(content);
            template.VisualTree = border;

            Trigger triggerHover = new Trigger { Property = Button.IsMouseOverProperty, Value = true };
            triggerHover.Setters.Add(new Setter(Border.BackgroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString(hoverHex)), "btnBorder"));
            template.Triggers.Add(triggerHover);

            Trigger triggerDisabled = new Trigger { Property = Button.IsEnabledProperty, Value = false };
            triggerDisabled.Setters.Add(new Setter(Border.BackgroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#1F2438")), "btnBorder"));
            triggerDisabled.Setters.Add(new Setter(Button.ForegroundProperty, new SolidColorBrush((Color)ColorConverter.ConvertFromString("#64748B"))));
            template.Triggers.Add(triggerDisabled);

            style.Setters.Add(new Setter(Button.TemplateProperty, template));
            btn.Style = style;

            return btn;
        }
        #endregion
    }
    #endregion

    #region Splash Screen Window
    public class SplashScreenWindow : Window
    {
        private ProgressBar _pbProgress;
        private TextBlock _lblStatus;
        private TextBlock _lblPct;
        private DispatcherTimer _timer;
        private double _currentProgress = 0;
        private Action _onCompleted;

        private readonly string[] _loadingStages = new string[]
        {
            "Initializing Video Optimization Subsystems...",
            "Loading High-Density 10-Bit HEVC Presets...",
            "Configuring Local Atomic Swap & Verification...",
            "Binding Stream Guard & Network Telemetry...",
            "Verifying HandBrakeCLI Transcode Bridging...",
            "OptiWizard Studio Ready."
        };

        public SplashScreenWindow()
        {
            WindowStyle = WindowStyle.None;
            AllowsTransparency = true;
            Background = Brushes.Transparent;
            Width = 500;
            Height = 330;
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
            ShowInTaskbar = true;
            Topmost = true;
            Icon = AppIconHelper.GetAppIconImageSource();

            Border outer = new Border
            {
                CornerRadius = new CornerRadius(14),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#0B0D16")),
                BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#2563EB")),
                BorderThickness = new Thickness(1.5),
                Padding = new Thickness(24)
            };

            Grid mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(110) });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            Image iconImg = new Image
            {
                Width = 96,
                Height = 96,
                Source = AppIconHelper.GetAppIconImageSource(),
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetRow(iconImg, 0);
            mainGrid.Children.Add(iconImg);

            StackPanel titleStack = new StackPanel { HorizontalAlignment = HorizontalAlignment.Center, Margin = new Thickness(0, 6, 0, 0) };
            TextBlock txtTitle = new TextBlock
            {
                Text = "OPTIWIZARD MEDIA 1.0",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#38BDF8")),
                HorizontalAlignment = HorizontalAlignment.Center
            };
            TextBlock txtSub = new TextBlock
            {
                Text = "High-Density Media Optimization Studio",
                FontSize = 11,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#94A3B8")),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 3, 0, 0)
            };
            titleStack.Children.Add(txtTitle);
            titleStack.Children.Add(txtSub);
            Grid.SetRow(titleStack, 1);
            mainGrid.Children.Add(titleStack);

            Grid statusGrid = new Grid { Margin = new Thickness(6, 16, 6, 6) };
            statusGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            statusGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            _lblStatus = new TextBlock
            {
                Text = "Initializing OptiWizard Engine...",
                FontSize = 10.5,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#CBD5E1")),
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(_lblStatus, 0);
            statusGrid.Children.Add(_lblStatus);

            _lblPct = new TextBlock
            {
                Text = "0%",
                FontSize = 11,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#34D399")),
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(_lblPct, 1);
            statusGrid.Children.Add(_lblPct);

            Grid.SetRow(statusGrid, 2);
            mainGrid.Children.Add(statusGrid);

            Border pbBorder = new Border
            {
                Height = 6,
                CornerRadius = new CornerRadius(3),
                Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#171B2B")),
                Margin = new Thickness(6, 0, 6, 0),
                ClipToBounds = true
            };
            _pbProgress = new ProgressBar
            {
                Height = 6,
                Minimum = 0,
                Maximum = 100,
                Value = 0,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#3B82F6")),
                Background = Brushes.Transparent,
                BorderThickness = new Thickness(0)
            };
            pbBorder.Child = _pbProgress;
            Grid.SetRow(pbBorder, 3);
            mainGrid.Children.Add(pbBorder);

            TextBlock txtFooter = new TextBlock
            {
                Text = "v1.0.0 Pro Suite -- Stream Guard Integrated -- 10-Bit HEVC Ready",
                FontSize = 9.5,
                Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#475569")),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 12, 0, 0)
            };
            Grid.SetRow(txtFooter, 4);
            mainGrid.Children.Add(txtFooter);

            outer.Child = mainGrid;
            Content = outer;
        }

        public void StartLoading(Action onCompleted)
        {
            _onCompleted = onCompleted;
            _timer = new DispatcherTimer();
            _timer.Interval = TimeSpan.FromMilliseconds(22);
            _timer.Tick += (s, e) =>
            {
                _currentProgress += 1.8;
                if (_currentProgress > 100) _currentProgress = 100;

                _pbProgress.Value = _currentProgress;
                _lblPct.Text = string.Format("{0:F0}%", _currentProgress);

                int stage = (int)((_currentProgress / 100.0) * _loadingStages.Length);
                if (stage >= _loadingStages.Length) stage = _loadingStages.Length - 1;
                _lblStatus.Text = _loadingStages[stage];

                if (_currentProgress >= 100)
                {
                    _timer.Stop();
                    DispatcherTimer delayTimer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(200) };
                    delayTimer.Tick += (ds, de) =>
                    {
                        delayTimer.Stop();
                        if (_onCompleted != null) _onCompleted();
                    };
                    delayTimer.Start();
                }
            };
            _timer.Start();
        }
    }
    #endregion

    #region App Icon Helper
    public static class AppIconHelper
    {
        private static ImageSource _cachedIcon;

        public static ImageSource GetAppIconImageSource()
        {
            if (_cachedIcon != null) return _cachedIcon;

            try
            {
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string[] candidates = new string[] { "app_icon.png", "app_icon.ico", "Resources\\app_icon.png" };
                foreach (string name in candidates)
                {
                    string path = System.IO.Path.Combine(appDir, name);
                    if (System.IO.File.Exists(path))
                    {
                        BitmapImage bi = new BitmapImage();
                        bi.BeginInit();
                        bi.UriSource = new Uri(path, UriKind.Absolute);
                        bi.CacheOption = BitmapCacheOption.OnLoad;
                        bi.EndInit();
                        _cachedIcon = bi;
                        return _cachedIcon;
                    }
                }
            }
            catch { }
            return null;
        }
    }
    #endregion

    public class BytesToStringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is long)
            {
                long bytes = (long)value;
                return MediaFileInfo.FormatBytes(bytes);
            }
            return "--";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public static class Program
    {
        [STAThread]
        public static void Main()
        {
            try
            {
                Application app = new Application();
                app.ShutdownMode = ShutdownMode.OnMainWindowClose;

                SplashScreenWindow splash = new SplashScreenWindow();
                splash.Show();

                splash.StartLoading(delegate
                {
                    MainWindow win = new MainWindow();
                    app.MainWindow = win;
                    win.Show();
                    splash.Close();
                });

                app.Run();
            }
            catch (Exception ex)
            {
                MessageBox.Show("OptiWizard failed to initialize:\r\n\r\n" + ex.ToString(), "OptiWizard Fatal Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
