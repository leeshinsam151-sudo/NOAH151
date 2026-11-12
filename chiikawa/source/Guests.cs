using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Reflection;

namespace WalkingFriend
{
    // 울트라 친구: 울트라맨과 괴수. 그림은 assets/guest_*.png 로 넣는다(저장소에는 올리지 않음).
    internal sealed class GuestSkin
    {
        public string Key, Name;
        public Sprite Normal, Special;
        public double WalkMul = 1;
        public bool IsUltraman { get { return Key == "ultraman"; } }
        public bool IsKaiju { get { return Key == "kaiju"; } }
    }

    internal static class GuestArt
    {
        internal static readonly string[] Keys = { "ultraman", "kaiju" };
        private static readonly Dictionary<string, GuestSkin> cache = new Dictionary<string, GuestSkin>();

        internal static string NameOf(string key) { return key == "ultraman" ? "울트라맨" : key == "kaiju" ? "괴수" : key; }

        internal static bool Available(string key)
        {
            return Keys.Contains(key) && Assembly.GetExecutingAssembly().GetManifestResourceNames().Contains("guest_" + key + ".png");
        }

        internal static GuestSkin Get(string key)
        {
            GuestSkin skin;
            if (cache.TryGetValue(key, out skin)) return skin;
            if (!Available(key)) return null;
            // 원본 그림은 모두 화면 왼쪽을 보고 있다.
            if (key == "ultraman")
                skin = new GuestSkin { Key = key, Name = NameOf(key), Normal = Load("guest_ultraman.png", 1.7), Special = Load("guest_ultraman_beam.png", 3.0) };
            else
                skin = new GuestSkin { Key = key, Name = NameOf(key), Normal = Load("guest_kaiju.png", 2.8), WalkMul = .7 };
            if (skin.Special == null) skin.Special = skin.Normal;
            cache[key] = skin;
            return skin;
        }

        // 치이카와 키를 기준으로 몇 배 높이로 그릴지
        private static Sprite Load(string resource, double heightOfFriend)
        {
            try
            {
                using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resource))
                using (var src = new Bitmap(stream))
                {
                    int h = Math.Max(8, (int)Math.Round(Sprites.Walk1.H * heightOfFriend));
                    int wdt = Math.Max(8, (int)Math.Round(src.Width * (double)h / src.Height));
                    var left = new Bitmap(wdt, h, PixelFormat.Format32bppArgb);
                    using (var g = Graphics.FromImage(left))
                    {
                        g.Clear(Color.Transparent);
                        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        g.CompositingQuality = CompositingQuality.HighQuality;
                        g.DrawImage(src, new Rectangle(0, 0, wdt, h), 0, 0, src.Width, src.Height, GraphicsUnit.Pixel);
                    }
                    var right = (Bitmap)left.Clone(); right.RotateFlip(RotateFlipType.RotateNoneFlipX);
                    return new Sprite { Left = left, Right = right };
                }
            }
            catch { return null; }
        }
    }

    internal sealed partial class Pet
    {
        internal GuestSkin Skin;
        private double specialStart = -1, nextBeamAt = -1, nextShoutAt = -1;
        private Pet beamTarget;
        private bool beamHit;

        // 광선 시간표(초)
        private const double BeamCharge = .7, BeamEnd = 2.3, SpecialEnd = 2.7, BeamHitAt = .95;

        internal bool IsGuest { get { return Skin != null; } }
        internal bool Specialing { get { return specialStart >= 0; } }
        private Sprite BodySprite { get { return Skin != null ? Skin.Normal : Sprites.Walk1; } }

        // 손님 친구는 치이카와 전용 그림이 필요한 동작(벽·천장·창 타기, 비밀 조종사, 군무)을 하지 않는다.
        private PetState GuestState(PetState s)
        {
            if (Skin == null) return s;
            switch (s)
            {
                case PetState.Wall: case PetState.WindowClimb: case PetState.SecretDance:
                    ClearAttachments(); return PetState.Walk;
                case PetState.Ceiling: case PetState.PilotRise:
                    ClearAttachments(); Vy = 0; return PetState.Falling;
                default: return s;
            }
        }

        private void TickGuest(IWorld w, double dt, List<Pet> all)
        {
            double now = w.Now;
            if (specialStart >= 0)
            {
                if (State != PetState.Pause) { EndSpecial(); return; }
                StateT = 0; mouseGrace = Math.Max(mouseGrace, now + 1);
                double t = now - specialStart;
                if (!beamHit && t >= BeamHitAt)
                {
                    beamHit = true;
                    if (beamTarget != null) beamTarget.TakeBeam(w, beamTarget.X < X ? -1 : 1);
                }
                if (t >= SpecialEnd) { EndSpecial(); SetState(PetState.Walk, w); }
                return;
            }
            if (Skin == null || PlayOptions.IsFocus(DateTime.Now) || all == null) return;
            if (nextBeamAt < 0) { nextBeamAt = now + 6 + w.Rng.NextDouble() * 6; nextShoutAt = now + 30 + w.Rng.NextDouble() * 30; }
            bool calm = State == PetState.Walk || State == PetState.Pause;
            if (Skin.IsUltraman && calm && now >= nextBeamAt)
            {
                var foe = FindKaiju(all);
                if (foe != null) StartSpecial(w, foe);
                else nextBeamAt = now + 3;
            }
            if (calm && now >= nextShoutAt)
            {
                nextShoutAt = now + 45 + w.Rng.NextDouble() * 45;
                if (Skin.IsKaiju) { Bubble = "크아아앙!"; BubbleUntil = now + 2; StartSquish(w, .35, .12, State, false); }
                else { Bubble = w.Rng.NextDouble() < .5 ? "슈왓!" : "헤악!"; BubbleUntil = now + 1.6; }
            }
        }

        private Pet FindKaiju(List<Pet> all)
        {
            Pet best = null; double bestD = double.MaxValue;
            foreach (var p in all)
            {
                if (p == this || p.Skin == null || !p.Skin.IsKaiju || p.Hidden) continue;
                if (Math.Abs(p.Y - Y) > 6 || !(p.State == PetState.Walk || p.State == PetState.Pause || p.State == PetState.Resting)) continue;
                double d = Math.Abs(p.X - X);
                if (d < 130 * S || d > 900 * S) continue;
                if (d < bestD) { bestD = d; best = p; }
            }
            return best;
        }

        internal void StartSpecial(IWorld w, Pet target)
        {
            beamTarget = target; beamHit = false; specialStart = w.Now;
            if (target != null) Dir = target.X < X ? -1 : 1;
            SetState(PetState.Pause, w); stateDur = 99; DelayIdle(w);
            Bubble = "스페시움 광선!"; BubbleUntil = w.Now + 1.6;
            nextBeamAt = w.Now + 25 + w.Rng.NextDouble() * 35;
        }

        internal void DemoBeam(IWorld w, List<Pet> all)
        {
            if (State == PetState.Falling || State == PetState.Drag || State == PetState.Thrown || !SizeFriendlyState)
            { Bubble = "바닥에 내려가면 보여줄게!"; BubbleUntil = w.Now + 3; return; }
            StartSpecial(w, FindKaiju(all));
        }

        private void EndSpecial() { specialStart = -1; beamTarget = null; }

        internal void TakeBeam(IWorld w, int awayDir)
        {
            if (State == PetState.Drag || State == PetState.Falling || State == PetState.Thrown) return;
            ClearAttachments(); Dir = awayDir;
            StartSquish(w, .5, .3, PetState.Walk, false);
            Bubble = Skin != null && Skin.IsKaiju ? "크아앙…!" : "으앗!"; BubbleUntil = w.Now + 2.2;
            // 맞으면 다다다 도망간다
            dashPeak = 4.2; dashUntil = w.Now + 2.4; demoUntil = Math.Max(demoUntil, w.Now + 4);
            nextDashAt = Math.Max(nextDashAt, w.Now + 20);
        }

        // 광선 길이(px). 목표가 없으면 허공에 쏜다.
        private float BeamLength(double now)
        {
            double t = now - specialStart;
            if (specialStart < 0 || t < BeamCharge || t > BeamEnd) return 0;
            double full = 300 * S;
            if (beamTarget != null)
                full = Math.Max(40 * S, Math.Abs(beamTarget.X - X) - Skin.Special.W * sizeMul * .23 - beamTarget.HalfW * .35);
            return (float)(full * Math.Min(1, (t - BeamCharge) / .22));
        }

        private void GuestLook(ref Look look, double now)
        {
            if (Skin == null) return;
            look.Secret = 0; look.ZPhase = State == PetState.Sleep ? look.ZPhase : -1;
            if (specialStart >= 0)
            {
                look.Sprite = Skin.Special; look.Angle = 0; look.Sx = 1; look.Sy = 1; look.HopY = 0;
                look.Left = Dir < 0;
                look.Beam = BeamLength(now);
                look.BeamPhase = (int)((now - specialStart) * 14) % 3;
            }
            else look.Sprite = Skin.Normal;
        }

        // 광선 시작점(그림 좌표, 발밑 가운데가 원점). 손바닥 바깥쪽 가장자리.
        internal static PointF BeamStart(Look L, Matrix m)
        {
            float w = L.Sprite.W, h = L.Sprite.H, side = L.Left ? -1 : 1;
            var p = new[] { new PointF(side * .234f * w, -.822f * h) };
            m.TransformPoints(p); return p[0];
        }

        internal static void BeamBounds(Look L, Matrix m, float scale, ref float minX, ref float minY, ref float maxX, ref float maxY)
        {
            if (L.Beam <= 0) return;
            PointF a = BeamStart(L, m); float side = L.Left ? -1 : 1, r = 13 * scale;
            float bx = a.X + side * L.Beam;
            minX = Math.Min(minX, Math.Min(a.X, bx) - r); maxX = Math.Max(maxX, Math.Max(a.X, bx) + r);
            minY = Math.Min(minY, a.Y - r); maxY = Math.Max(maxY, a.Y + r);
        }

        internal static void DrawBeam(Graphics g, Look L, Matrix m, float scale)
        {
            if (L.Beam <= 0) return;
            PointF a = BeamStart(L, m); float side = L.Left ? -1 : 1;
            var b = new PointF(a.X + side * L.Beam, a.Y);
            float flick = 1 + .18f * (L.BeamPhase - 1);
            var old = g.SmoothingMode; g.SmoothingMode = SmoothingMode.AntiAlias;
            using (var glow = new Pen(Color.FromArgb(70, 90, 200, 255), 22 * scale * flick) { StartCap = LineCap.Round, EndCap = LineCap.Round })
            using (var mid = new Pen(Color.FromArgb(170, 120, 225, 255), 11 * scale * flick) { StartCap = LineCap.Round, EndCap = LineCap.Round })
            using (var core = new Pen(Color.FromArgb(245, 245, 255, 255), 4.5f * scale) { StartCap = LineCap.Round, EndCap = LineCap.Round })
            {
                g.DrawLine(glow, a, b); g.DrawLine(mid, a, b); g.DrawLine(core, a, b);
            }
            // 손끝 반짝임
            float s = 9 * scale * flick;
            using (var spark = new SolidBrush(Color.FromArgb(220, 255, 255, 255))) g.FillEllipse(spark, a.X - s / 2, a.Y - s / 2, s, s);
            g.SmoothingMode = old;
        }
    }

    internal sealed partial class App
    {
        internal void SpawnGuest(string key)
        {
            var skin = GuestArt.Get(key);
            if (skin == null) return;
            Spawn(); if (windows.Count == 0) return;
            var pet = windows[windows.Count - 1].Pet; pet.Skin = skin;
            SaveGuests();
        }

        internal void SaveGuests()
        {
            PlayOptions.Current.Guests = string.Join(",", windows.Where(a => a.Pet.Skin != null).Select(a => a.Pet.Skin.Key).ToArray());
            PlayOptions.Current.Save();
        }

        internal void RestoreGuests()
        {
            foreach (string key in (PlayOptions.Current.Guests ?? "").Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Take(8))
            {
                var skin = GuestArt.Get(key.Trim()); if (skin == null) continue;
                Spawn(); if (windows.Count > 0) windows[windows.Count - 1].Pet.Skin = skin;
            }
        }

        internal System.Windows.Forms.ToolStripMenuItem BuildGuestMenu()
        {
            var menu = new System.Windows.Forms.ToolStripMenuItem("울트라 친구 부르기");
            foreach (string key in GuestArt.Keys)
            {
                string k = key;
                var item = menu.DropDownItems.Add(GuestArt.NameOf(k), null, delegate { if (hidden) ToggleHidden(); SpawnGuest(k); });
                item.Enabled = GuestArt.Available(k) && windows.Count < 16;
            }
            var beam = menu.DropDownItems.Add("스페시움 광선 보기", null, delegate
            {
                var pets = windows.Select(a => a.Pet).ToList();
                var ultra = pets.FirstOrDefault(p => p.Skin != null && p.Skin.IsUltraman);
                if (ultra != null) ultra.DemoBeam(this, pets);
            });
            beam.Enabled = windows.Any(a => a.Pet.Skin != null && a.Pet.Skin.IsUltraman);
            return menu;
        }
    }
}
