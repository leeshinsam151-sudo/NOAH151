using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;

namespace WalkingFriend
{
    // 울트라 친구 검증 (--variation-test 안에서 이어서 실행)
    internal static class GuestChecks
    {
        private static List<string> results;
        private static void Check(bool condition, string name)
        { if (!condition) throw new InvalidOperationException("FAILED: " + name); results.Add("PASS " + name); Console.WriteLine("PASS " + name); }

        private sealed class Stage : IWorld
        {
            public List<Rectangle> Areas { get; private set; }
            public Random Rng { get; private set; }
            public double Now { get; set; }
            public readonly List<Pet> Pets = new List<Pet>();
            internal Stage(int seed) { Areas = new List<Rectangle> { new Rectangle(0, 0, 6000, 700) }; Rng = new Random(seed); Now = 100; }
            internal Pet Add(string skin, double x, PetState state)
            {
                var p = new Pet(this, x, Areas[0].Bottom); p.Y = Areas[0].Bottom;
                if (skin != null) p.Skin = GuestArt.Get(skin);
                p.SetState(state, this); Pets.Add(p); return p;
            }
            internal void Step(double secs, Action each = null)
            {
                for (int i = 0; i < (int)Math.Ceiling(secs / .02); i++)
                {
                    Now += .02; foreach (var p in Pets.ToList()) p.Update(this, .02, Pets, -5000);
                    if (each != null) each();
                }
            }
        }

        private static Bitmap Draw(Pet p, double now, out PointF origin)
        { var look = p.GetLook(now); look.AffinityLabel = null; return Pet.Render(look, out origin); }

        // 여러 친구를 한 장면으로 그려서 저장
        private static void Scene(Stage s, string path)
        {
            var frames = s.Pets.Select(p => { PointF o; var b = Draw(p, s.Now, out o); return new { p, b, o }; }).ToList();
            float minX = frames.Min(f => (float)f.p.X - f.o.X) - 20, maxX = frames.Max(f => (float)f.p.X - f.o.X + f.b.Width) + 20;
            float minY = frames.Min(f => (float)f.p.Y - f.o.Y) - 20, maxY = (float)s.Areas[0].Bottom + 16;
            using (var canvas = new Bitmap((int)(maxX - minX), (int)(maxY - minY)))
            using (var g = Graphics.FromImage(canvas))
            {
                g.Clear(Color.FromArgb(245, 240, 232));
                using (var pen = new Pen(Color.FromArgb(150, 130, 110), 2)) g.DrawLine(pen, 0, s.Areas[0].Bottom - minY, canvas.Width, s.Areas[0].Bottom - minY);
                foreach (var f in frames) g.DrawImage(f.b, (float)f.p.X - f.o.X - minX, (float)f.p.Y - f.o.Y - minY);
                canvas.Save(path, ImageFormat.Png);
            }
            foreach (var f in frames) f.b.Dispose();
        }

        private static double Stride(Stage s, Pet p)
        { double x = p.X; s.Step(.3); return Math.Abs(p.X - x); }

        internal static void Run(string dir, List<string> sink, Func<PlayOptions> fresh)
        {
            results = sink;
            PlayOptions.Current = fresh();
            foreach (var key in GuestArt.Keys) Check(GuestArt.Available(key) && GuestArt.Get(key) != null, key + " artwork is built into the program");
            var ultra = GuestArt.Get("ultraman"); var kaiju = GuestArt.Get("kaiju");
            Check(Math.Abs(ultra.Normal.H - Sprites.Walk1.H * 1.7) < 2 && kaiju.Normal.H > Sprites.Walk1.H * 2.5, "guests are drawn bigger than the small friend");
            Check(ultra.Special.H > ultra.Normal.H * 1.6, "standing beam pose keeps the same body scale as the fighting stance");

            // 기본 움직임
            var s = new Stage(5); var friend = s.Add(null, 1000, PetState.Walk); var k = s.Add("kaiju", 3000, PetState.Walk); var u = s.Add("ultraman", 5000, PetState.Walk);
            PointF o; using (var b = Draw(u, s.Now, out o)) Check(b.Height >= ultra.Normal.H, "ultraman uses its own artwork");
            using (var b = Draw(friend, s.Now, out o)) Check(b.Height < ultra.Normal.H, "the original friend keeps its own artwork");
            s.Pets.Clear(); s.Pets.Add(friend); double small = Stride(s, friend);
            s.Pets.Clear(); s.Pets.Add(k); k.SetState(PetState.Walk, s); double big = Stride(s, k);
            Check(big > small * .55 && big < small * .85, "kaiju lumbers a little slower than the others");

            // 치이카와 전용 동작은 하지 않기
            PlayOptions.Current = fresh(); PlayOptions.Current.Walls = true; PlayOptions.Current.Ceiling = true; PlayOptions.Current.Windows = true; PlayOptions.Current.Variations = false;
            s = new Stage(9); u = s.Add("ultraman", 5900, PetState.Walk);
            bool attached = false; s.Step(40, delegate { if (u.State == PetState.Wall || u.State == PetState.Ceiling || u.State == PetState.WindowClimb) attached = true; if (u.X > 5950 || u.X < 50) u.X = 5900; });
            Check(!attached, "guests turn around at the screen edge instead of climbing walls");
            u.SetState(PetState.Wall, s); Check(u.State == PetState.Walk, "wall poses are redirected to walking for guests");
            u.SetState(PetState.Ceiling, s); Check(u.State == PetState.Falling, "ceiling poses are redirected to a safe fall for guests");

            // 스페시움 광선
            PlayOptions.Current = fresh(); PlayOptions.Current.Variations = false;
            s = new Stage(3); u = s.Add("ultraman", 2600, PetState.Pause); k = s.Add("kaiju", 3100, PetState.Pause); friend = s.Add(null, 2300, PetState.Pause);
            double started = -1; s.Step(20, delegate { if (started < 0 && u.Specialing) started = s.Now; if (u.X < 2400 || u.X > 2800) u.X = 2600; if (k.X < 2950 || k.X > 3250) k.X = 3100; if (u.Specialing) return; if (k.State == PetState.Walk) k.SetState(PetState.Pause, s); });
            Check(started > 0, "ultraman fires on its own when a kaiju is on the same floor");
            s = new Stage(3); u = s.Add("ultraman", 2600, PetState.Pause); k = s.Add("kaiju", 3100, PetState.Pause); friend = s.Add(null, 2250, PetState.Pause);
            u.DemoBeam(s, s.Pets);
            Check(u.Specialing && u.Dir == 1, "ultraman turns to face the kaiju");
            s.Step(.3); Check(u.GetLook(s.Now).Sprite == ultra.Special && u.GetLook(s.Now).Beam == 0, "charging shows the cross-arm pose before the beam");
            s.Step(.75); var look = u.GetLook(s.Now);
            Check(look.Beam > 200, "beam stretches across to the kaiju");
            using (var b = Pet.Render(look, out o)) Check(b.Width > ultra.Special.W + 200, "beam is drawn beyond the body");
            Scene(s, Path.Combine(dir, "guest-beam.png"));
            Check(k.State == PetState.Squish, "kaiju flinches when the beam lands");
            double kx = k.X; s.Step(1.2);
            Check(k.X > kx + 60 && k.DashMul > 2, "kaiju dashes away from ultraman after the hit");
            s.Step(2); Check(!u.Specialing && u.State != PetState.Pause, "ultraman goes back to walking after the beam");

            // 괴수 없을 때·얌전 모드
            PlayOptions.Current = fresh(); PlayOptions.Current.Variations = false;
            s = new Stage(4); u = s.Add("ultraman", 3000, PetState.Walk); s.Add(null, 3300, PetState.Walk);
            bool fired = false; s.Step(90, delegate { if (u.Specialing) fired = true; });
            Check(!fired, "no beam without a kaiju around");
            u.DemoBeam(s, s.Pets); s.Step(1.1); Check(u.GetLook(s.Now).Beam > 0, "beam demo fires into the air without a kaiju");
            PlayOptions.Current.Focus = true;
            s = new Stage(3); u = s.Add("ultraman", 2600, PetState.Pause); k = s.Add("kaiju", 3100, PetState.Pause); fired = false;
            s.Step(60, delegate { if (u.Specialing) fired = true; if (u.X < 2400 || u.X > 2800) u.X = 2600; if (k.X < 2950 || k.X > 3250) k.X = 3100; });
            Check(!fired, "quiet mode keeps ultraman from firing on its own");

            // 커지기와 함께
            PlayOptions.Current = fresh();
            s = new Stage(8); u = s.Add("ultraman", 3000, PetState.Pause); u.DemonstrateVariation(s, "big"); s.Step(1);
            using (var b = Draw(u, s.Now, out o)) Check(b.Height > ultra.Normal.H * 1.35, "ultraman can grow giant too");

            // 저장
            PlayOptions.Current = new PlayOptions { Guests = "ultraman,kaiju" };
            string ini = Path.Combine(Settings.ExeDir, PlayOptions.Name); string backup = File.Exists(ini) ? File.ReadAllText(ini) : null;
            try
            {
                PlayOptions.Current.Save(); PlayOptions.Current = new PlayOptions(); PlayOptions.Load();
                Check(PlayOptions.Current.Guests == "ultraman,kaiju", "summoned guests are remembered for next launch");
            }
            finally { if (backup != null) File.WriteAllText(ini, backup); else File.Delete(ini); }

            // 포켓몬 친구
            PlayOptions.Current = fresh(); PlayOptions.Current.Variations = false;
            foreach (var key in new[] { "pikachu", "gengar", "squirtle", "charmander" })
            {
                var skin = GuestArt.Get(key);
                Check(skin.Normal.H > Sprites.Walk1.H * 1.1 && skin.Normal.H < ultra.Normal.H, key + " is a little bigger than the small friend and smaller than ultraman");
                s = new Stage(13); var att = s.Add(key, 2600, PetState.Pause); var tgt = s.Add(key == "squirtle" ? "charmander" : "squirtle", 3050, PetState.Pause);
                att.DemoBeam(s, s.Pets);
                Check(att.Specialing && att.Dir == 1 && att.Bubble == skin.MoveName, key + " calls out " + skin.MoveName + " and faces the target");
                double hit = key == "gengar" ? 1.35 : 1.05; s.Step(hit - .02);
                var lk = att.GetLook(s.Now);
                Check(lk.Beam > 250 && lk.BeamKind == (int)skin.Move.Value, key + " move reaches across to the target");
                PointF origin2; using (var b = Pet.Render(lk, out origin2)) Check(b.Width > skin.Normal.W + 250, key + " move is drawn beyond the body");
                Scene(s, Path.Combine(dir, "move-" + key + ".png"));
                s.Step(.06);
                Check(tgt.State == PetState.Squish && tgt.Bubble == tgt.Skin.HitWord, key + " move makes the target flinch with its own cry");
                s.Step(3); Check(!att.Specialing, key + " goes back to normal after the move");
            }
            s = new Stage(21); var gengar = s.Add("gengar", 3000, PetState.Walk);
            Check(gengar.GetLook(s.Now).HopY < -6, "gengar floats above the floor");
            s = new Stage(31); var pika = s.Add("pikachu", 3000, PetState.Walk); friend = s.Add(null, 3300, PetState.Walk);
            bool friendHit = false, pikaUsed = false;
            s.Step(150, delegate { if (pika.Specialing) pikaUsed = true; if (friend.Bubble == "으앗!") friendHit = true; foreach (var q in s.Pets) if (q.X < 2600 || q.X > 3700) q.X = 3150; });
            Check(!friendHit, "pokemon never aim at the small friend");
            s = new Stage(32); pika = s.Add("pikachu", 2800, PetState.Walk); var squirt = s.Add("squirtle", 3250, PetState.Walk);
            bool squirtHit = false;
            s.Step(150, delegate { if (squirt.Bubble == squirt.Skin.HitWord) squirtHit = true; foreach (var q in s.Pets) { if (q.X < 2500 || q.X > 3600) q.X = 3050; if (q.State == PetState.Walk && q.StateT > 1.5) q.SetState(PetState.Pause, s); } });
            Check(squirtHit, "pokemon battle each other on their own");
            s = new Stage(33); u = s.Add("ultraman", 2800, PetState.Walk); s.Add("pikachu", 3250, PetState.Walk);
            fired = false; s.Step(60, delegate { if (u.Specialing) fired = true; foreach (var q in s.Pets) if (q.X < 2500 || q.X > 3600) q.X = 3050; });
            Check(!fired, "ultraman saves the beam for the kaiju");

            // 메이플 친구
            PlayOptions.Current = fresh(); PlayOptions.Current.Variations = false;
            var paladinSkin = GuestArt.Get("paladin");
            Check(paladinSkin.Special != paladinSkin.Normal && paladinSkin.Special.H > paladinSkin.Normal.H * 1.6, "paladin switches to the golden guardian artwork at the same body scale");
            foreach (var key in new[] { "hero", "paladin" })
            {
                var skin = GuestArt.Get(key);
                s = new Stage(41); var att = s.Add(key, 2600, PetState.Pause); var mush = s.Add("mushroom", 3050, PetState.Pause);
                att.DemoBeam(s, s.Pets);
                Check(att.Specialing && att.Dir == 1 && att.Bubble == skin.MoveName, key + " shouts its skill and faces the mushroom");
                s.Step(key == "hero" ? 1.18 : 1.03);
                var lk = att.GetLook(s.Now);
                Check(lk.Beam > 250 && lk.Sprite == skin.Special, key + " skill reaches the mushroom");
                Scene(s, Path.Combine(dir, "skill-" + key + ".png"));
                s.Step(.08);
                Check(mush.State == PetState.Squish && mush.Bubble == "꾸엑!", key + " skill makes the mushroom flinch");
                s.Step(3); Check(!att.Specialing && att.GetLook(s.Now).Sprite == skin.Normal, key + " returns to its usual pose");
            }
            s = new Stage(42); var hero = s.Add("hero", 2800, PetState.Walk); var pal = s.Add("paladin", 3300, PetState.Walk);
            fired = false; s.Step(80, delegate { if (hero.Specialing || pal.Specialing) fired = true; foreach (var q in s.Pets) if (q.X < 2500 || q.X > 3600) q.X = 3050; });
            Check(hero.Bubble != "윽!" && pal.Bubble != "윽!", "warriors never hit each other");
            s = new Stage(43); var shroom = s.Add("mushroom", 3000, PetState.Walk); float lowest = 0;
            s.Step(3, delegate { if (shroom.State == PetState.Walk) lowest = Math.Min(lowest, shroom.GetLook(s.Now).HopY); });
            Check(lowest < -5, "orange mushroom bounces while walking");
            s = new Stage(44); var girl = s.Add("girl", 3000, PetState.Pause); girl.DemoBeam(s, s.Pets);
            Check(!girl.Specialing, "the girl has no attack skill");
            s = new Stage(45); hero = s.Add("hero", 2800, PetState.Walk); var buddy = s.Add(null, 3200, PetState.Walk); var lady = s.Add("girl", 3400, PetState.Walk);
            bool wrongHit = false; s.Step(150, delegate { if (buddy.Bubble == "으앗!" || lady.Bubble == "꺅!") wrongHit = true; foreach (var q in s.Pets) if (q.X < 2500 || q.X > 3700) q.X = 3100; });
            Check(!wrongHit, "warriors leave the small friend and the girl alone");

            // 장면 그림
            PlayOptions.Current = fresh();
            s = new Stage(2); s.Add(null, 2850, PetState.Pause); s.Add("ultraman", 3000, PetState.Pause); s.Add("kaiju", 3250, PetState.Pause);
            s.Add("pikachu", 3450, PetState.Pause); s.Add("gengar", 3600, PetState.Pause); s.Add("squirtle", 3750, PetState.Pause); s.Add("charmander", 3900, PetState.Pause);
            s.Add("hero", 4080, PetState.Pause); s.Add("paladin", 4260, PetState.Pause); s.Add("mushroom", 4420, PetState.Pause); s.Add("girl", 4560, PetState.Pause);
            Scene(s, Path.Combine(dir, "guest-lineup.png"));
        }
    }
}
