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
    // 손님 친구: 울트라 친구(울트라맨·괴수), 포켓몬 친구(피카츄·팬텀·꼬부기·파이리), 메이플 친구(히어로·팔라딘·주황버섯·흑발 소녀).
    // 그림은 assets/guest_*.png 로 넣는다(저작권 때문에 저장소에는 올리지 않음).
    internal enum MoveKind { Specium, Thunder, Shadow, Water, Fire, Slash, Holy }

    internal sealed class GuestSkin
    {
        public string Key, Name, MoveName, HitWord = "으앗!";
        public string[] Cries = new string[0];
        public Sprite Normal, Special;
        public double WalkMul = 1;
        public bool Floats, Bouncy;
        // 노리는 상대(null이면 다른 손님 친구 누구나). 치이카와는 언제나 제외.
        public string[] Prey;
        public MoveKind? Move;
        // 기술이 나가는 곳: 왼쪽을 볼 때 그림 가운데에서의 가로 비율, 발밑에서의 높이 비율
        public float MoveX, MoveY;
        public bool IsUltraman { get { return Key == "ultraman"; } }
        public bool IsKaiju { get { return Key == "kaiju"; } }
    }

    internal sealed class GuestGroup
    {
        public string Title, DemoTitle; public string[] Keys;
    }

    internal static class GuestArt
    {
        internal static readonly GuestGroup[] Groups =
        {
            new GuestGroup { Title = "울트라 친구 부르기", DemoTitle = "스페시움 광선 보기", Keys = new[] { "ultraman", "kaiju" } },
            new GuestGroup { Title = "포켓몬 친구 부르기", DemoTitle = "기술 보기", Keys = new[] { "pikachu", "gengar", "squirtle", "charmander" } },
            new GuestGroup { Title = "메이플 친구 부르기", DemoTitle = "스킬 보기", Keys = new[] { "hero", "paladin", "mushroom", "girl" } },
        };
        internal static readonly string[] Keys = Groups.SelectMany(g => g.Keys).ToArray();
        private static readonly Dictionary<string, GuestSkin> cache = new Dictionary<string, GuestSkin>();

        internal static string NameOf(string key)
        {
            switch (key)
            {
                case "ultraman": return "울트라맨";
                case "kaiju": return "괴수";
                case "pikachu": return "피카츄";
                case "gengar": return "팬텀";
                case "squirtle": return "꼬부기";
                case "charmander": return "파이리";
                case "hero": return "히어로";
                case "paladin": return "팔라딘";
                case "mushroom": return "주황버섯";
                case "girl": return "흑발 소녀";
                default: return key;
            }
        }

        internal static bool Available(string key)
        {
            return Keys.Contains(key) && Assembly.GetExecutingAssembly().GetManifestResourceNames().Contains("guest_" + key + ".png");
        }

        internal static GuestSkin Get(string key)
        {
            GuestSkin skin;
            if (cache.TryGetValue(key, out skin)) return skin;
            if (!Available(key)) return null;
            // fx, fy: 원본 그림에서 기술이 나가는 곳(왼쪽 위 기준 비율). facesLeft: 원본이 왼쪽을 보는지.
            switch (key)
            {
                case "ultraman":
                    skin = Make(key, "guest_ultraman.png", 1.7, true, .266f, .178f);
                    skin.Special = Load("guest_ultraman_beam.png", 3.0, true);
                    skin.Move = MoveKind.Specium; skin.MoveName = "스페시움 광선!"; skin.Cries = new[] { "슈왓!", "헤악!" }; skin.Prey = new[] { "kaiju" };
                    break;
                case "kaiju":
                    skin = Make(key, "guest_kaiju.png", 2.8, true, .5f, .5f);
                    skin.WalkMul = .7; skin.HitWord = "크아앙…!"; skin.Cries = new[] { "크아아앙!" };
                    break;
                case "pikachu":
                    skin = Make(key, "guest_pikachu.png", 1.25, true, .1f, .43f);
                    skin.WalkMul = 1.2; skin.Move = MoveKind.Thunder; skin.MoveName = "백만볼트!"; skin.HitWord = "피카?!"; skin.Cries = new[] { "피카피카!", "피카츄!" };
                    break;
                case "gengar":
                    skin = Make(key, "guest_gengar.png", 1.35, true, .22f, .55f);
                    skin.WalkMul = .9; skin.Floats = true; skin.Move = MoveKind.Shadow; skin.MoveName = "섀도볼!"; skin.HitWord = "케엑?!"; skin.Cries = new[] { "케케케…", "팬텀~" };
                    break;
                case "squirtle":
                    skin = Make(key, "guest_squirtle.png", 1.2, false, .82f, .33f);
                    skin.WalkMul = .9; skin.Move = MoveKind.Water; skin.MoveName = "물대포!"; skin.HitWord = "꼬북?!"; skin.Cries = new[] { "꼬북꼬북!", "꼬부기!" };
                    break;
                case "charmander":
                    skin = Make(key, "guest_charmander.png", 1.25, true, .12f, .33f);
                    skin.Move = MoveKind.Fire; skin.MoveName = "불꽃세례!"; skin.HitWord = "파이?!"; skin.Cries = new[] { "파이리!", "파이파이!" };
                    break;
                case "hero":
                    skin = Make(key, "guest_hero.png", 1.6, true, .12f, .42f);
                    skin.Move = MoveKind.Slash; skin.MoveName = "레이징 블로우!"; skin.HitWord = "윽!"; skin.Cries = new[] { "덤벼라!", "가자!" }; skin.Prey = new[] { "mushroom" };
                    break;
                case "paladin":
                    // 스킬을 쓸 때는 황금빛 수호자 그림으로 바뀐다. 두 그림의 머리 크기가 같도록 1.73배.
                    skin = Make(key, "guest_paladin.png", 1.6, true, .5f, .5f);
                    skin.Special = Load("guest_paladin_aura.png", 1.6 * 1.73, true);
                    skin.MoveX = .47f - .5f; skin.MoveY = 1 - .9f;
                    skin.WalkMul = .85; skin.Move = MoveKind.Holy; skin.MoveName = "블래스트!"; skin.HitWord = "윽!"; skin.Cries = new[] { "빛이 함께하길.", "물러서지 않겠다!" }; skin.Prey = new[] { "mushroom" };
                    break;
                case "mushroom":
                    skin = Make(key, "guest_mushroom.png", 1.1, true, .5f, .5f);
                    skin.WalkMul = .6; skin.Bouncy = true; skin.HitWord = "꾸엑!"; skin.Cries = new[] { "버섯버섯!", "뿅!" };
                    break;
                case "girl":
                    skin = Make(key, "guest_girl.png", 1.6, true, .5f, .5f);
                    skin.HitWord = "꺅!"; skin.Cries = new[] { "안녕!", "♪", "오늘도 화이팅!" };
                    break;
                default: return null;
            }
            if (skin.Normal == null) return null;
            if (skin.Special == null) skin.Special = skin.Normal;
            cache[key] = skin;
            return skin;
        }

        private static GuestSkin Make(string key, string resource, double height, bool facesLeft, float fx, float fy)
        {
            float leftX = (facesLeft ? fx : 1 - fx) - .5f;
            return new GuestSkin { Key = key, Name = NameOf(key), Normal = Load(resource, height, facesLeft), MoveX = leftX, MoveY = 1 - fy };
        }

        // 치이카와 키를 기준으로 몇 배 높이로 그릴지
        private static Sprite Load(string resource, double heightOfFriend, bool facesLeft)
        {
            try
            {
                using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resource))
                using (var src = new Bitmap(stream))
                {
                    int h = Math.Max(8, (int)Math.Round(Sprites.Walk1.H * heightOfFriend));
                    int wdt = Math.Max(8, (int)Math.Round(src.Width * (double)h / src.Height));
                    var original = new Bitmap(wdt, h, PixelFormat.Format32bppArgb);
                    using (var g = Graphics.FromImage(original))
                    {
                        g.Clear(Color.Transparent);
                        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                        g.CompositingQuality = CompositingQuality.HighQuality;
                        g.DrawImage(src, new Rectangle(0, 0, wdt, h), 0, 0, src.Width, src.Height, GraphicsUnit.Pixel);
                    }
                    var mirrored = (Bitmap)original.Clone(); mirrored.RotateFlip(RotateFlipType.RotateNoneFlipX);
                    return facesLeft ? new Sprite { Left = original, Right = mirrored } : new Sprite { Left = mirrored, Right = original };
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

        // 기술 시간표(초)
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
                if (!beamHit && t >= HitTime)
                {
                    beamHit = true;
                    if (beamTarget != null) beamTarget.TakeBeam(w, beamTarget.X < X ? -1 : 1);
                }
                if (t >= SpecialEnd) { EndSpecial(); SetState(PetState.Walk, w); }
                return;
            }
            if (Skin == null || PlayOptions.IsFocus(DateTime.Now) || all == null) return;
            if (nextBeamAt < 0)
            {
                nextBeamAt = now + (Skin.IsUltraman ? 6 + w.Rng.NextDouble() * 6 : 12 + w.Rng.NextDouble() * 15);
                nextShoutAt = now + 30 + w.Rng.NextDouble() * 30;
            }
            bool calm = State == PetState.Walk || State == PetState.Pause;
            if (Skin.Move.HasValue && calm && now >= nextBeamAt)
            {
                var foe = FindTarget(all);
                if (foe != null) StartSpecial(w, foe);
                else if (!Skin.IsUltraman && w.Rng.NextDouble() < .35) StartSpecial(w, null);
                else nextBeamAt = now + (Skin.IsUltraman ? 3 : 20 + w.Rng.NextDouble() * 20);
            }
            if (calm && now >= nextShoutAt && Skin.Cries.Length > 0)
            {
                nextShoutAt = now + 45 + w.Rng.NextDouble() * 45;
                Bubble = Skin.Cries[w.Rng.Next(Skin.Cries.Length)]; BubbleUntil = now + 1.8;
                if (Skin.IsKaiju) StartSquish(w, .35, .12, State, false);
            }
        }

        // 울트라맨은 괴수만, 히어로·팔라딘은 주황버섯만, 포켓몬은 같은 바닥의 다른 손님 친구를 노린다. 치이카와는 노리지 않는다.
        private Pet FindTarget(List<Pet> all)
        {
            Pet best = null; double bestD = double.MaxValue;
            double max = (Skin.Prey != null ? 900 : 750) * S;
            foreach (var p in all)
            {
                if (p == this || p.Skin == null || p.Hidden) continue;
                if (Skin.Prey != null && !Skin.Prey.Contains(p.Skin.Key)) continue;
                if (Math.Abs(p.Y - Y) > 6 || !(p.State == PetState.Walk || p.State == PetState.Pause || p.State == PetState.Resting)) continue;
                double d = Math.Abs(p.X - X);
                if (d < 130 * S || d > max) continue;
                if (d < bestD) { bestD = d; best = p; }
            }
            return best;
        }

        internal void StartSpecial(IWorld w, Pet target)
        {
            beamTarget = target; beamHit = false; specialStart = w.Now;
            if (target != null) Dir = target.X < X ? -1 : 1;
            SetState(PetState.Pause, w); stateDur = 99; DelayIdle(w);
            Bubble = Skin.MoveName; BubbleUntil = w.Now + 1.6;
            nextBeamAt = w.Now + (Skin.IsUltraman ? 25 + w.Rng.NextDouble() * 35 : 30 + w.Rng.NextDouble() * 35);
        }

        internal void DemoBeam(IWorld w, List<Pet> all)
        {
            if (Skin == null || !Skin.Move.HasValue) return;
            if (State == PetState.Falling || State == PetState.Drag || State == PetState.Thrown || !SizeFriendlyState)
            { Bubble = "바닥에 내려가면 보여줄게!"; BubbleUntil = w.Now + 3; return; }
            StartSpecial(w, FindTarget(all));
        }

        private void EndSpecial() { specialStart = -1; beamTarget = null; }

        internal void TakeBeam(IWorld w, int awayDir)
        {
            if (State == PetState.Drag || State == PetState.Falling || State == PetState.Thrown) return;
            if (specialStart >= 0) EndSpecial();
            ClearAttachments(); Dir = awayDir;
            StartSquish(w, .5, .3, PetState.Walk, false);
            Bubble = Skin != null ? Skin.HitWord : "으앗!"; BubbleUntil = w.Now + 2.2;
            // 맞으면 다다다 도망간다
            dashPeak = 6; dashUntil = w.Now + 2.4; demoUntil = Math.Max(demoUntil, w.Now + 4);
            nextDashAt = Math.Max(nextDashAt, w.Now + 20);
        }

        // 섀도볼은 천천히 날아가서 맞는다.
        private double GrowTime { get { return Skin == null ? .22 : Skin.Move == MoveKind.Shadow ? .55 : Skin.Move == MoveKind.Slash ? .4 : .22; } }
        private double HitTime { get { return Math.Max(BeamHitAt, BeamCharge + GrowTime + .03); } }

        // 기술 길이(px). 목표가 없으면 허공에 쏜다.
        private float BeamLength(double now)
        {
            double t = now - specialStart;
            if (specialStart < 0 || t < BeamCharge || t > BeamEnd) return 0;
            double full = 300 * S;
            if (beamTarget != null)
                full = Math.Max(40 * S, Math.Abs(beamTarget.X - X) - Skin.Special.W * sizeMul * Math.Abs(Skin.MoveX) - beamTarget.HalfW * .35);
            return (float)(full * Math.Min(1, (t - BeamCharge) / GrowTime));
        }

        private void GuestLook(ref Look look, double now)
        {
            if (Skin == null) return;
            look.Secret = 0; look.ZPhase = State == PetState.Sleep ? look.ZPhase : -1;
            if (specialStart >= 0)
            {
                double t = now - specialStart;
                look.Sprite = Skin.Special; look.Angle = 0; look.Sx = 1; look.Sy = 1; look.HopY = 0;
                if (Skin.Special == Skin.Normal && t < BeamCharge)
                {
                    // 기술 쓰기 전에 꾹 힘주기
                    double k = Math.Sin(Math.PI * t / BeamCharge);
                    look.Sy = (float)(1 - .07 * k); look.Sx = (float)(1 + .05 * k);
                }
                look.Left = Dir < 0;
                look.Beam = BeamLength(now);
                look.BeamPhase = (int)(t * 14) % 3;
                look.BeamKind = (int)Skin.Move.GetValueOrDefault();
                look.BeamOx = Skin.MoveX; look.BeamOy = Skin.MoveY;
            }
            else look.Sprite = Skin.Normal;
            // 주황버섯은 통통 튀며 걷는다.
            if (Skin.Bouncy && State == PetState.Walk && specialStart < 0)
                look.HopY -= (float)(Math.Abs(Math.Sin(animT * 7)) * 8 * S);
            // 팬텀은 둥실둥실 떠다닌다.
            if (Skin.Floats && State != PetState.Drag)
                look.HopY += (float)((-12 + Math.Sin(now * 2.4) * 4) * S);
        }

        // 기술 시작점(그림 좌표, 발밑 가운데가 원점).
        internal static PointF BeamStart(Look L, Matrix m)
        {
            float w = L.Sprite.W, h = L.Sprite.H;
            var p = new[] { new PointF((L.Left ? L.BeamOx : -L.BeamOx) * w, -L.BeamOy * h) };
            m.TransformPoints(p); return p[0];
        }

        private static float BeamRadius(Look L, float scale)
        {
            switch ((MoveKind)L.BeamKind)
            {
                case MoveKind.Fire: case MoveKind.Shadow: return 28 * scale;
                case MoveKind.Slash: return 34 * scale;
                case MoveKind.Holy: return 22 * scale;
                default: return 14 * scale;
            }
        }

        internal static void BeamBounds(Look L, Matrix m, float scale, ref float minX, ref float minY, ref float maxX, ref float maxY)
        {
            if (L.Beam <= 0) return;
            PointF a = BeamStart(L, m); float side = L.Left ? -1 : 1, r = BeamRadius(L, scale);
            float bx = a.X + side * L.Beam;
            minX = Math.Min(minX, Math.Min(a.X, bx) - r); maxX = Math.Max(maxX, Math.Max(a.X, bx) + r);
            minY = Math.Min(minY, a.Y - r); maxY = Math.Max(maxY, a.Y + r);
        }

        private static Pen RoundPen(Color c, float width)
        { return new Pen(c, width) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round }; }

        internal static void DrawBeam(Graphics g, Look L, Matrix m, float scale)
        {
            if (L.Beam <= 0) return;
            PointF a = BeamStart(L, m); float side = L.Left ? -1 : 1;
            var b = new PointF(a.X + side * L.Beam, a.Y);
            float flick = 1 + .18f * (L.BeamPhase - 1);
            var old = g.SmoothingMode; g.SmoothingMode = SmoothingMode.AntiAlias;
            switch ((MoveKind)L.BeamKind)
            {
                case MoveKind.Thunder: DrawThunder(g, a, b, L.BeamPhase, scale); break;
                case MoveKind.Shadow: DrawShadow(g, a, b, flick, scale); break;
                case MoveKind.Water: DrawWater(g, a, b, side, L.BeamPhase, flick, scale); break;
                case MoveKind.Fire: DrawFire(g, a, b, flick, scale); break;
                case MoveKind.Slash: DrawSlash(g, a, b, side, scale); break;
                case MoveKind.Holy: DrawHoly(g, a, b, L.BeamPhase, flick, scale); break;
                default: DrawSpecium(g, a, b, flick, scale); break;
            }
            g.SmoothingMode = old;
        }

        private static void DrawSpecium(Graphics g, PointF a, PointF b, float flick, float scale)
        {
            using (var glow = RoundPen(Color.FromArgb(70, 90, 200, 255), 22 * scale * flick))
            using (var mid = RoundPen(Color.FromArgb(170, 120, 225, 255), 11 * scale * flick))
            using (var core = RoundPen(Color.FromArgb(245, 245, 255, 255), 4.5f * scale))
            { g.DrawLine(glow, a, b); g.DrawLine(mid, a, b); g.DrawLine(core, a, b); }
            float s = 9 * scale * flick;
            using (var spark = new SolidBrush(Color.FromArgb(220, 255, 255, 255))) g.FillEllipse(spark, a.X - s / 2, a.Y - s / 2, s, s);
        }

        // 백만볼트: 지그재그 번개
        private static void DrawThunder(Graphics g, PointF a, PointF b, int phase, float scale)
        {
            float len = Math.Abs(b.X - a.X); int n = Math.Max(4, (int)(len / (16 * scale)));
            var pts = new PointF[n + 1]; uint seed = (uint)(phase * 7919 + 17);
            for (int i = 0; i <= n; i++)
            {
                seed = seed * 1103515245 + 12345;
                float jitter = (i == 0 || i == n) ? 0 : (((seed >> 16) & 0xff) / 255f - .5f) * 20 * scale;
                pts[i] = new PointF(a.X + (b.X - a.X) * i / n, a.Y + jitter);
            }
            using (var glow = RoundPen(Color.FromArgb(80, 255, 230, 60), 14 * scale))
            using (var mid = RoundPen(Color.FromArgb(230, 255, 220, 40), 5 * scale))
            using (var core = RoundPen(Color.FromArgb(255, 255, 255, 230), 2 * scale))
            { g.DrawLines(glow, pts); g.DrawLines(mid, pts); g.DrawLines(core, pts); }
            float s = 12 * scale;
            using (var spark = new SolidBrush(Color.FromArgb(200, 255, 245, 150))) g.FillEllipse(spark, a.X - s / 2, a.Y - s / 2, s, s);
        }

        // 섀도볼: 보라색 구슬이 날아간다
        private static void DrawShadow(Graphics g, PointF a, PointF b, float flick, float scale)
        {
            using (var trail = RoundPen(Color.FromArgb(50, 120, 60, 170), 10 * scale)) g.DrawLine(trail, a, b);
            float r = 15 * scale * flick, aura = r * 1.7f;
            using (var halo = new SolidBrush(Color.FromArgb(70, 110, 40, 160))) g.FillEllipse(halo, b.X - aura, b.Y - aura, aura * 2, aura * 2);
            using (var path = new GraphicsPath())
            {
                path.AddEllipse(b.X - r, b.Y - r, r * 2, r * 2);
                using (var ball = new PathGradientBrush(path) { CenterColor = Color.FromArgb(255, 220, 160, 255), SurroundColors = new[] { Color.FromArgb(255, 60, 10, 90) } })
                    g.FillPath(ball, path);
            }
        }

        // 물대포: 굵은 물줄기와 물방울
        private static void DrawWater(Graphics g, PointF a, PointF b, float side, int phase, float flick, float scale)
        {
            using (var glow = RoundPen(Color.FromArgb(80, 70, 150, 255), 18 * scale * flick))
            using (var mid = RoundPen(Color.FromArgb(200, 80, 170, 250), 10 * scale))
            using (var core = RoundPen(Color.FromArgb(230, 225, 245, 255), 3.5f * scale))
            { g.DrawLine(glow, a, b); g.DrawLine(mid, a, b); g.DrawLine(core, a, b); }
            using (var drop = new SolidBrush(Color.FromArgb(210, 120, 190, 255)))
                for (int i = 0; i < 3; i++)
                {
                    float d = (4 + 5 * ((i + phase) % 3)) * scale, s = (5 - i) * scale;
                    g.FillEllipse(drop, b.X + side * d - s / 2, b.Y + (i - 1) * 7 * scale - s / 2, s, s);
                }
        }

        // 레이징 블로우: 초승달 검기가 날아간다
        private static void DrawSlash(Graphics g, PointF a, PointF b, float side, float scale)
        {
            using (var trail = RoundPen(Color.FromArgb(110, 90, 170, 255), 5 * scale)) g.DrawLine(trail, a, b);
            float R = 30 * scale;
            for (int i = 2; i >= 0; i--)
            {
                float cx = b.X - side * (R * .55f + i * 14 * scale);
                var rect = new RectangleF(cx - R, b.Y - R, R * 2, R * 2);
                float start = side > 0 ? -65 : 115;
                int alpha = 255 - i * 75;
                using (var glow = new Pen(Color.FromArgb(alpha / 2, 40, 120, 255), 16 * scale) { StartCap = LineCap.Round, EndCap = LineCap.Round })
                using (var edge = new Pen(Color.FromArgb(alpha, 90, 190, 255), 7 * scale) { StartCap = LineCap.Round, EndCap = LineCap.Round })
                using (var shine = new Pen(Color.FromArgb(alpha, 255, 255, 255), 2.5f * scale) { StartCap = LineCap.Round, EndCap = LineCap.Round })
                { g.DrawArc(glow, rect, start, 130); g.DrawArc(edge, rect, start, 130); g.DrawArc(shine, rect, start + 10, 110); }
            }
        }

        // 블래스트: 망치에서 뻗는 황금빛 충격파와 반짝임
        private static void DrawHoly(Graphics g, PointF a, PointF b, int phase, float flick, float scale)
        {
            using (var glow = RoundPen(Color.FromArgb(80, 255, 210, 80), 26 * scale * flick))
            using (var mid = RoundPen(Color.FromArgb(200, 255, 220, 110), 12 * scale))
            using (var core = RoundPen(Color.FromArgb(240, 255, 252, 225), 4 * scale))
            { g.DrawLine(glow, a, b); g.DrawLine(mid, a, b); g.DrawLine(core, a, b); }
            using (var star = new SolidBrush(Color.FromArgb(235, 255, 250, 200)))
            {
                int n = Math.Max(3, (int)(Math.Abs(b.X - a.X) / (40 * scale)));
                for (int i = 0; i < n; i++)
                {
                    float t = (i + .5f + phase * .33f) / n; if (t > 1) t -= 1;
                    float x = a.X + (b.X - a.X) * t, y = a.Y + ((i % 2) * 2 - 1) * 16 * scale, s = (i % 3 == 0 ? 6 : 4) * scale;
                    g.FillPolygon(star, new[] { new PointF(x, y - s * 2), new PointF(x + s * .5f, y - s * .5f), new PointF(x + s * 2, y), new PointF(x + s * .5f, y + s * .5f), new PointF(x, y + s * 2), new PointF(x - s * .5f, y + s * .5f), new PointF(x - s * 2, y), new PointF(x - s * .5f, y - s * .5f) });
                }
            }
        }

        // 불꽃세례: 입에서 점점 커지는 불덩이
        private static void DrawFire(Graphics g, PointF a, PointF b, float flick, float scale)
        {
            int n = Math.Max(6, (int)(Math.Abs(b.X - a.X) / (10 * scale)));
            for (int i = n; i >= 0; i--)
            {
                float t = (float)i / n, r = (4 + 18 * t) * scale * (i % 2 == 0 ? flick : 1);
                float x = a.X + (b.X - a.X) * t, y = a.Y - (float)Math.Sin(t * 9 + flick * 3) * 3 * scale;
                int red = 255, green = (int)(230 - 170 * t), blue = (int)(90 * (1 - t)), alpha = (int)(200 - 90 * t);
                using (var brush = new SolidBrush(Color.FromArgb(alpha, red, Math.Max(0, green), Math.Max(0, blue))))
                    g.FillEllipse(brush, x - r, y - r, r * 2, r * 2);
            }
            using (var core = new SolidBrush(Color.FromArgb(230, 255, 250, 200))) g.FillEllipse(core, a.X - 5 * scale, a.Y - 5 * scale, 10 * scale, 10 * scale);
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
            foreach (string key in (PlayOptions.Current.Guests ?? "").Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Take(15))
            {
                var skin = GuestArt.Get(key.Trim()); if (skin == null) continue;
                Spawn(); if (windows.Count > 0) windows[windows.Count - 1].Pet.Skin = skin;
            }
        }

        internal System.Windows.Forms.ToolStripMenuItem[] BuildGuestMenus()
        {
            return GuestArt.Groups.Select(group =>
            {
                var menu = new System.Windows.Forms.ToolStripMenuItem(group.Title);
                foreach (string key in group.Keys)
                {
                    string k = key;
                    var item = menu.DropDownItems.Add(GuestArt.NameOf(k), null, delegate { if (hidden) ToggleHidden(); SpawnGuest(k); });
                    item.Enabled = GuestArt.Available(k) && windows.Count < 16;
                }
                var keys = group.Keys;
                Func<Pet, bool> mover = p => p.Skin != null && p.Skin.Move.HasValue && keys.Contains(p.Skin.Key);
                var demo = menu.DropDownItems.Add(group.DemoTitle, null, delegate
                {
                    var pets = windows.Select(a => a.Pet).ToList();
                    foreach (var p in pets.Where(mover)) p.DemoBeam(this, pets);
                });
                demo.Enabled = windows.Any(a => mover(a.Pet));
                return menu;
            }).ToArray();
        }
    }
}
