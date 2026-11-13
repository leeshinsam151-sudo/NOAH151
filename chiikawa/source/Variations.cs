using System;

namespace WalkingFriend
{
    // 행동 변주: 몸이 확 커지거나 작아지고, 걷다가 갑자기 다다다 질주하고, 빙글 돈다.
    internal sealed partial class Pet
    {
        private double sizeMul = 1, sizeVel, sizeTarget = 1, sizeUntil, nextSizeAt = -1;
        private double dashMul = 1, dashPeak = 1, dashUntil, nextDashAt = -1, demoUntil = -1;
        private double spinStart = -1, spinDur, nextSpinAt = -1, spinJump;
        private int spinTurns, spinDir = 1;

        internal double SizeMul { get { return sizeMul; } }
        internal double DashMul { get { return dashMul; } }
        internal bool Spinning { get { return spinStart >= 0; } }

        private static readonly string[] BigWords = { "쑥쑥!", "커졌다!", "으랏차!", "거대해졌다!" };
        private static readonly string[] SmallWords = { "쪼그만!", "작아졌다…", "뾰롱" };
        private static readonly string[] DashWords = { "다다다다!", "후다닥!", "슝—!", "전력질주!" };
        private static readonly string[] SpinWords = { "빙글~!", "휘리릭!" };
        private static readonly string[] TwirlWords = { "빙글빙글빙글~", "회오리!" };

        // 바닥에서 지내는 상태에서만 크기를 바꾼다. 벽·천장·창 타기 같은 붙어 있는 자세는 원래 크기로 돌아간다.
        private bool SizeFriendlyState
        {
            get
            {
                switch (State)
                {
                    case PetState.Walk: case PetState.Pause: case PetState.Resting: case PetState.Squish:
                    case PetState.Hop: case PetState.IdleCry: case PetState.TouchCry: case PetState.Eating:
                    case PetState.Sleep: case PetState.Waking: case PetState.Cheer: case PetState.Sliding:
                    case PetState.Drag: case PetState.Falling: case PetState.Dizzy:
                        return true;
                    default:
                        return false;
                }
            }
        }

        // 빙글 돌기는 바닥에서 걷거나 서 있을 때만
        private bool SpinFriendlyState
        { get { return State == PetState.Walk || State == PetState.Pause || State == PetState.Resting || State == PetState.Cheer; } }

        private bool VariationsOn { get { return PlayOptions.Current.Variations && !PlayOptions.IsFocus(DateTime.Now); } }

        private void TickVariations(IWorld w, double dt)
        {
            dt = Math.Max(0, Math.Min(.05, dt));
            double now = w.Now;
            if (nextSizeAt < 0)
            {
                nextSizeAt = now + 15 + w.Rng.NextDouble() * 20;
                nextDashAt = now + 8 + w.Rng.NextDouble() * 10;
                nextSpinAt = now + 10 + w.Rng.NextDouble() * 15;
            }
            bool auto = VariationsOn, on = auto || now < demoUntil;

            // 크기
            if (auto && sizeTarget == 1 && now >= nextSizeAt && (State == PetState.Walk || State == PetState.Pause || State == PetState.Resting))
                StartSize(w, w.Rng.NextDouble() < .65);
            if (sizeTarget != 1 && (now >= sizeUntil || !on || !SizeFriendlyState))
            { sizeTarget = 1; sizeVel += sizeMul > 1 ? -1.5 : 1.5; nextSizeAt = now + 20 + w.Rng.NextDouble() * 20; }
            // 통통 튀는 스프링: 목표 크기를 확 지나쳤다가 출렁이며 자리를 잡는다.
            sizeVel += ((sizeTarget - sizeMul) * 85 - sizeVel * 8) * dt;
            sizeMul = Math.Max(.3, Math.Min(3.6, sizeMul + sizeVel * dt));
            if (sizeTarget == 1 && Math.Abs(sizeMul - 1) < .003 && Math.Abs(sizeVel) < .02) { sizeMul = 1; sizeVel = 0; }

            // 다다다 질주
            if (auto && State == PetState.Walk && now >= dashUntil && now >= nextDashAt)
                StartDash(w, false);
            double target = on && State == PetState.Walk && now < dashUntil ? dashPeak : 1;
            dashMul += (target - dashMul) * Math.Min(1, dt * (target > dashMul ? 12 : 5));
            if (Math.Abs(dashMul - 1) < .01 && target == 1) dashMul = 1;
            if (State == PetState.Walk && dashMul > 1) animT += dt * (dashMul - 1);

            // 빙글 돌기
            if (spinStart >= 0 && (now - spinStart >= spinDur || !SpinFriendlyState)) spinStart = -1;
            if (auto && spinStart < 0 && now >= nextSpinAt && SpinFriendlyState && !Specialing)
                StartSpin(w, w.Rng.NextDouble() < .6);
        }

        private void StartSize(IWorld w, bool big)
        {
            if (big)
            {
                // 아무리 커져도 화면 높이의 절반까지만
                double limit = Math.Max(1.3, Area.Height * .5 / Math.Max(1, BodySprite.H));
                sizeTarget = Math.Min(limit, 2.2 + w.Rng.NextDouble() * .8);
            }
            else sizeTarget = .35 + w.Rng.NextDouble() * .15;
            sizeUntil = w.Now + 6 + w.Rng.NextDouble() * 7;
            sizeVel += big ? 6 : -4;
            Say(w, big ? BigWords : SmallWords, 1.6);
        }

        private void StartDash(IWorld w, bool demo)
        {
            if (!demo && w.Rng.NextDouble() < .3) Dir = -Dir;
            dashPeak = 5 + w.Rng.NextDouble() * 3;
            dashUntil = w.Now + 1.5 + w.Rng.NextDouble() * 1.5;
            stateDur = Math.Max(stateDur, StateT + (dashUntil - w.Now) + .4);
            nextDashAt = dashUntil + 8 + w.Rng.NextDouble() * 14;
            Say(w, DashWords, 1.2);
        }

        // jump: 폴짝 뛰며 한 바퀴. 아니면 걸으면서 세 바퀴 회오리.
        private void StartSpin(IWorld w, bool jump)
        {
            spinStart = w.Now; spinDir = Dir >= 0 ? 1 : -1;
            if (jump) { spinTurns = 1; spinDur = .75; spinJump = 46; }
            else { spinTurns = 3; spinDur = 1.5; spinJump = 10; }
            nextSpinAt = w.Now + spinDur + 12 + w.Rng.NextDouble() * 18;
            Say(w, jump ? SpinWords : TwirlWords, Math.Max(1.2, spinDur));
        }

        private void Say(IWorld w, string[] words, double seconds)
        {
            if (Bubble != null && w.Now < BubbleUntil) return;
            Bubble = words[w.Rng.Next(words.Length)]; BubbleUntil = w.Now + seconds;
        }

        // 걷기 이동 속도에 곱해지는 값
        private double WalkBoost { get { return (State == PetState.Walk ? dashMul : 1) * (Skin != null ? Skin.WalkMul : 1); } }

        private void VariationLook(ref Look look, double now)
        {
            if (sizeMul != 1)
            {
                look.Sx *= (float)sizeMul; look.Sy *= (float)sizeMul; look.HopY *= (float)sizeMul;
            }
            if (spinStart >= 0 && look.Angle == 0 && SpinFriendlyState)
            {
                double t = Math.Max(0, Math.Min(1, (now - spinStart) / spinDur));
                double e = t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
                double deg = spinDir * 360.0 * spinTurns * e;
                if (Math.Abs(deg % 360) > .5)
                {
                    // 몸 한가운데를 축으로 돈다.
                    look.Angle = (float)deg; look.Px = 0; look.Py = -look.Sprite.H * look.Sy / 2;
                }
                look.HopY -= (float)(Math.Sin(Math.PI * t) * spinJump * S * Math.Max(1, sizeMul * .7));
                return;
            }
            if (State == PetState.Walk && dashMul > 1.05 && look.Angle == 0)
            {
                // 질주할 때는 앞으로 확 기울어진다.
                double k = Math.Min(1, (dashMul - 1) / Math.Max(.5, dashPeak - 1));
                look.Angle = (float)(Dir * 15 * k);
            }
        }

        // 우클릭 → 동작 바로 보기
        internal bool DemonstrateVariation(IWorld w, string kind)
        {
            if (kind != "big" && kind != "small" && kind != "dash" && kind != "spin" && kind != "twirl") return false;
            if (State == PetState.Falling || State == PetState.Drag || State == PetState.Thrown || State == PetState.PilotRise || !SizeFriendlyState)
            { Bubble = "바닥에 내려가면 보여줄게!"; BubbleUntil = w.Now + 3; return true; }
            Bubble = null; demoUntil = w.Now + 20;
            if (kind == "dash") { SetState(PetState.Walk, w); StartDash(w, true); }
            else if (kind == "spin" || kind == "twirl")
            {
                if (!SpinFriendlyState) SetState(PetState.Pause, w);
                StartSpin(w, kind == "spin");
            }
            else StartSize(w, kind == "big");
            return true;
        }
    }
}
