using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace WalkingFriend
{
    // EXE --variation-test 출력폴더 : 커지기·작아지기·다다다 달리기 검증
    internal static class VariationChecks
    {
        private static readonly List<string> results = new List<string>();
        private static void Check(bool condition, string name)
        { if (!condition) throw new InvalidOperationException("FAILED: " + name); results.Add("PASS " + name); Console.WriteLine("PASS " + name); }

        private sealed class WideWorld : IWorld
        {
            public List<Rectangle> Areas { get; private set; }
            public Random Rng { get; private set; }
            public double Now { get; set; }
            internal WideWorld(int seed) { Areas = new List<Rectangle> { new Rectangle(0, 0, 6000, 700) }; Rng = new Random(seed); Now = 100; }
            internal void Step(Pet p, double secs)
            { for (int i = 0; i < (int)Math.Ceiling(secs / .02); i++) { Now += .02; p.Update(this, .02, new List<Pet> { p }, -5000); } }
        }

        private static Pet FloorPet(WideWorld w, PetState state)
        { var p = new Pet(w, 3000, w.Areas[0].Bottom); p.Y = w.Areas[0].Bottom; p.SetState(state, w); return p; }

        private static Size Rendered(Pet p, double now)
        { var look = p.GetLook(now); look.Bubble = null; look.AffinityLabel = null; PointF o; using (var b = Pet.Render(look, out o)) return b.Size; }

        private static void Capture(Pet p, double now, string dir, string name)
        { var look = p.GetLook(now); PointF o; using (var b = Pet.Render(look, out o)) b.Save(Path.Combine(dir, name + ".png"), ImageFormat.Png); }

        // 걷는 동안 0.3초 이동 거리
        private static double Stride(WideWorld w, Pet p)
        { double x = p.X; w.Step(p, .3); return Math.Abs(p.X - x); }

        internal static void Run(string dir)
        {
            Directory.CreateDirectory(dir);
            FriendData.StorageOverride = Path.Combine(dir, "data"); FriendData.Name = "variation-check.xml"; FriendData.Current = new FriendData();
            DesktopSurfaces.TestMouse = delegate { return new Point(-5000, -5000); };
            DesktopSurfaces.TestProvider = delegate { return new List<SurfaceWindow>(); };
            Func<PlayOptions> fresh = delegate { return new PlayOptions { Idle = false, Escape = false, Walls = false, Ceiling = false, Windows = false }; };
            PlayOptions.Current = fresh();
            Sprites.Load(1.25f);
            PointF o2;

            // 설정
            Check(new PlayOptions().Variations, "variations are on by default");
            string ini = Path.Combine(Settings.ExeDir, PlayOptions.Name);
            string backup = File.Exists(ini) ? File.ReadAllText(ini) : null;
            try
            {
                File.WriteAllText(ini, "Speed=1.00\r\n"); PlayOptions.Current = new PlayOptions(); PlayOptions.Load();
                Check(PlayOptions.Current.Variations, "older settings files without the key keep variations on");
                File.WriteAllText(ini, "Variations=0\r\n"); PlayOptions.Current = new PlayOptions(); PlayOptions.Load();
                Check(!PlayOptions.Current.Variations, "Variations=0 turns variations off");
                PlayOptions.Current.Variations = true; PlayOptions.Current.Save(); PlayOptions.Current = new PlayOptions { Variations = false }; PlayOptions.Load();
                Check(PlayOptions.Current.Variations && File.ReadAllText(ini).Contains("Variations=1"), "variations choice is saved and reloaded");
            }
            finally { if (backup != null) File.WriteAllText(ini, backup); else File.Delete(ini); }
            PlayOptions.Current = fresh();

            // 커지기
            var w = new WideWorld(7); var p = FloorPet(w, PetState.Pause);
            Size normal = Rendered(p, w.Now); Capture(p, w.Now, dir, "normal");
            Check(p.DemonstrateVariation(w, "big"), "big demo is accepted on the floor");
            double peak = 1; for (int i = 0; i < 60; i++) { w.Step(p, .02); peak = Math.Max(peak, p.SizeMul); }
            Check(p.SizeMul > 2.1 && p.SizeMul < 3.1, "big demo grows to roughly two and a half to three times");
            Check(peak > p.SizeMul + .01, "growth overshoots a little for a bouncy feel");
            Size big = Rendered(p, w.Now); Capture(p, w.Now, dir, "big");
            Check(big.Height > normal.Height * 2 && big.Width > normal.Width * 2, "big pet is drawn much larger");
            Check(Math.Abs(p.Y - w.Areas[0].Bottom) < .5, "big pet keeps its feet on the floor");
            w.Step(p, 20);
            Check(p.SizeMul == 1 && Rendered(p, w.Now) == normal, "big pet returns to the original size");

            // 작아지기
            p.SetState(PetState.Pause, w); p.DemonstrateVariation(w, "small"); w.Step(p, 1.2);
            Check(p.SizeMul > .3 && p.SizeMul < .55, "small demo shrinks to under half");
            Size small = Rendered(p, w.Now); Capture(p, w.Now, dir, "small");
            Check(small.Height < normal.Height * .65, "small pet is drawn much smaller");
            w.Step(p, 20); Check(p.SizeMul == 1, "small pet returns to the original size");

            // 붙어 있는 자세에서는 원래 크기
            p.SetState(PetState.Pause, w); p.DemonstrateVariation(w, "big"); w.Step(p, .6);
            p.SetState(PetState.Climb, w); for (int i = 0; i < 100; i++) { w.Now += .02; p.Update(w, .02, new List<Pet> { p }, -5000); if (p.State != PetState.Climb) p.SetState(PetState.Climb, w); }
            Check(Math.Abs(p.SizeMul - 1) < .02, "climbing returns to normal size so wall and window poses stay attached");

            // 다다다 달리기
            w = new WideWorld(11); p = FloorPet(w, PetState.Walk);
            double walk = Stride(w, p);
            p.SetState(PetState.Walk, w); p.DemonstrateVariation(w, "dash"); w.Step(p, .3);
            Check(p.State == PetState.Walk && p.DashMul > 4.3, "dash demo speeds walking up quickly");
            double dash = Stride(w, p);
            Check(dash > walk * 4.5, "dashing covers about five to eight times the distance");
            Capture(p, w.Now, dir, "dash");
            Check(Math.Abs(p.GetLook(w.Now).Angle) >= 10, "dashing pet leans well forward");
            w.Step(p, 4);
            Check(p.DashMul == 1, "dash calms back down to normal walking");
            p.SetState(PetState.Walk, w); double after = Stride(w, p);
            Check(Math.Abs(after - walk) < walk * .05, "walking speed after a dash matches the original");

            // 빙글 돌기
            w = new WideWorld(17); p = FloorPet(w, PetState.Pause);
            Check(p.DemonstrateVariation(w, "spin") && p.Spinning, "spin demo starts a jump spin");
            w.Step(p, .36); var spinLook = p.GetLook(w.Now);
            Check(Math.Abs(spinLook.Angle) > 120 && Math.Abs(spinLook.Angle) < 240, "jump spin is about halfway round at the midpoint");
            Check(spinLook.HopY < -30, "jump spin leaps into the air");
            Check(spinLook.Py < -10, "spin turns around the middle of the body");
            Capture(p, w.Now, dir, "spin");
            using (var b = Pet.Render(spinLook, out o2)) Check(b.Height > 10, "spinning pet renders");
            w.Step(p, .5); Check(!p.Spinning && p.GetLook(w.Now).Angle == 0, "pet lands upright after one turn");
            p.SetState(PetState.Walk, w); p.DemonstrateVariation(w, "twirl"); double maxTurn = 0;
            for (int i = 0; i < 80; i++) { w.Step(p, .02); maxTurn = Math.Max(maxTurn, Math.Abs(p.GetLook(w.Now).Angle)); }
            Check(maxTurn > 700, "twirl spins round three times");
            w.Step(p, 1); Check(!p.Spinning && p.GetLook(w.Now).Angle == 0, "twirl ends upright");
            p.SetState(PetState.Pause, w); p.DemonstrateVariation(w, "spin"); w.Step(p, .2); p.SetState(PetState.Climb, w); w.Step(p, .04);
            Check(!p.Spinning, "spin stops when the pet starts climbing");

            // 저절로 일어나는 변주
            w = new WideWorld(23); p = FloorPet(w, PetState.Walk);
            double maxSize = 1, minSize = 1, maxDash = 1;
            for (int i = 0; i < 300 / .02; i++)
            {
                w.Step(p, .02); maxSize = Math.Max(maxSize, p.SizeMul); minSize = Math.Min(minSize, p.SizeMul); maxDash = Math.Max(maxDash, p.DashMul);
                if (p.X < 600 || p.X > 5400) p.X = 3000;
            }
            Check(maxSize > 2 || minSize < .55, "big size changes happen on their own within five minutes");
            Check(maxDash > 4.5, "sudden sprints happen on their own within five minutes");
            w = new WideWorld(29); p = FloorPet(w, PetState.Walk); bool spun = false;
            for (int i = 0; i < 120 / .02; i++) { w.Step(p, .02); if (p.Spinning) spun = true; if (p.X < 600 || p.X > 5400) p.X = 3000; }
            Check(spun, "spins happen on their own within two minutes");

            PlayOptions.Current = fresh(); PlayOptions.Current.Variations = false;
            w = new WideWorld(23); p = FloorPet(w, PetState.Walk); maxSize = 1; minSize = 1; maxDash = 1;
            for (int i = 0; i < 300 / .02; i++)
            {
                w.Step(p, .02); maxSize = Math.Max(maxSize, p.SizeMul); minSize = Math.Min(minSize, p.SizeMul); maxDash = Math.Max(maxDash, p.DashMul);
                if (p.X < 600 || p.X > 5400) p.X = 3000;
            }
            Check(maxSize == 1 && minSize == 1 && maxDash == 1, "turning variations off keeps size and speed unchanged");
            w = new WideWorld(29); p = FloorPet(w, PetState.Walk); spun = false;
            for (int i = 0; i < 120 / .02; i++) { w.Step(p, .02); if (p.Spinning) spun = true; if (p.X < 600 || p.X > 5400) p.X = 3000; }
            Check(!spun, "turning variations off stops spins too");
            p.SetState(PetState.Pause, w); p.DemonstrateVariation(w, "big"); w.Step(p, 1);
            Check(p.SizeMul > 1.4, "right click demo still works when variations are off");

            PlayOptions.Current = fresh(); PlayOptions.Current.Focus = true;
            w = new WideWorld(23); p = FloorPet(w, PetState.Walk); maxSize = 1; maxDash = 1;
            for (int i = 0; i < 300 / .02; i++)
            { w.Step(p, .02); maxSize = Math.Max(maxSize, Math.Abs(p.SizeMul - 1) + 1); maxDash = Math.Max(maxDash, p.DashMul); if (p.Spinning) maxDash = 99; if (p.X < 600 || p.X > 5400) p.X = 3000; }
            Check(maxSize == 1 && maxDash == 1, "quiet mode suppresses automatic variations and spins");

            GuestChecks.Run(dir, results, fresh);
            File.WriteAllLines(Path.Combine(dir, "variation-checks.txt"), results);
            Console.WriteLine("All " + results.Count + " variation checks passed.");
        }
    }
}
