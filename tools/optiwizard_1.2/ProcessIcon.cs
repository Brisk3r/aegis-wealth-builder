using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace IconProcessor
{
    class Program
    {
        static void Main(string[] args)
        {
            string srcPath = @"C:\Users\avram\.gemini\antigravity\brain\bbf26b38-6a0e-4614-a681-df721df63bca\optiwizard_icon_1787009695046.jpg";
            string targetPng = @"C:\Users\avram\OneDrive\Documents\OptiWizard_Media_1.0\app_icon.png";
            string targetIco = @"C:\Users\avram\OneDrive\Documents\OptiWizard_Media_1.0\app_icon.ico";
            string targetSmall = @"C:\Users\avram\OneDrive\Documents\OptiWizard_Media_1.0\app_icon_small.png";
            string targetBase64 = @"C:\Users\avram\OneDrive\Documents\OptiWizard_Media_1.0\small_base64.txt";

            using (Bitmap src = new Bitmap(srcPath))
            {
                int w = src.Width;
                int h = src.Height;

                Bitmap result = new Bitmap(w, h, PixelFormat.Format32bppArgb);
                bool[,] isBg = new bool[w, h];
                bool[,] visited = new bool[w, h];
                Queue<Point> q = new Queue<Point>();

                // Seed from outer border
                for (int x = 0; x < w; x++)
                {
                    q.Enqueue(new Point(x, 0));
                    q.Enqueue(new Point(x, h - 1));
                    visited[x, 0] = true;
                    visited[x, h - 1] = true;
                }
                for (int y = 0; y < h; y++)
                {
                    q.Enqueue(new Point(0, y));
                    q.Enqueue(new Point(w - 1, y));
                    visited[0, y] = true;
                    visited[w - 1, y] = true;
                }

                Point[] dirs = new Point[]
                {
                    new Point(1, 0), new Point(-1, 0),
                    new Point(0, 1), new Point(0, -1)
                };

                // Flood fill only outer black background
                while (q.Count > 0)
                {
                    Point pt = q.Dequeue();
                    Color c = src.GetPixel(pt.X, pt.Y);
                    int maxCh = Math.Max(c.R, Math.Max(c.G, c.B));

                    if (maxCh <= 16)
                    {
                        isBg[pt.X, pt.Y] = true;

                        foreach (Point d in dirs)
                        {
                            int nx = pt.X + d.X;
                            int ny = pt.Y + d.Y;

                            if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[nx, ny])
                            {
                                visited[nx, ny] = true;
                                Color nc = src.GetPixel(nx, ny);
                                int nMax = Math.Max(nc.R, Math.Max(nc.G, nc.B));
                                if (nMax <= 20)
                                {
                                    q.Enqueue(new Point(nx, ny));
                                }
                            }
                        }
                    }
                }

                // Render result: If isBg -> transparent; else full original opacity preserved!
                for (int x = 0; x < w; x++)
                {
                    for (int y = 0; y < h; y++)
                    {
                        if (isBg[x, y])
                        {
                            result.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        }
                        else
                        {
                            Color orig = src.GetPixel(x, y);
                            // Outer feather check
                            if (visited[x, y])
                            {
                                int maxCh = Math.Max(orig.R, Math.Max(orig.G, orig.B));
                                if (maxCh <= 28)
                                {
                                    int a = (int)((maxCh / 28.0) * 255.0);
                                    result.SetPixel(x, y, Color.FromArgb(a, orig.R, orig.G, orig.B));
                                    continue;
                                }
                            }

                            result.SetPixel(x, y, Color.FromArgb(255, orig.R, orig.G, orig.B));
                        }
                    }
                }

                result.Save(targetPng, ImageFormat.Png);
                Console.WriteLine("Saved: " + targetPng);

                // Save ICO
                using (Bitmap iconBmp = new Bitmap(result, 256, 256))
                {
                    IntPtr hIcon = iconBmp.GetHicon();
                    using (Icon ico = Icon.FromHandle(hIcon))
                    {
                        using (FileStream fs = new FileStream(targetIco, FileMode.Create))
                        {
                            ico.Save(fs);
                        }
                    }
                }
                Console.WriteLine("Saved: " + targetIco);

                // Save small 128x128
                using (Bitmap small = new Bitmap(result, 128, 128))
                {
                    small.Save(targetSmall, ImageFormat.Png);
                    byte[] bytes = File.ReadAllBytes(targetSmall);
                    File.WriteAllText(targetBase64, Convert.ToBase64String(bytes));
                    Console.WriteLine("Saved Base64: " + bytes.Length + " bytes");
                }
            }
        }
    }
}
