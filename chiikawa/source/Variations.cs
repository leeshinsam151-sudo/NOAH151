using System;

namespace WalkingFriend
{
    // 행동 변주: 가끔 몸이 쑥 커지거나 작아지고, 걷다가 갑자기 다다다 빠르게 달린다.
    internal sealed partial class Pet
    {
        private double sizeMul = 1, sizeVel, sizeTarget = 1, sizeUntil, nextSizeAt = -1;
        private double dashMul = 1, dashPeak = 1, dashUntil, nextDashAt = -1, demoUntil = -1;

        internal double SizeMul { get { return sizeMul; } }
        internal double DashMul { get { return dashMul; } }

        private static readonly string[] BigWords = { "쑥쑥!", "커졌다!", "으랏차!" };
        private static readonly string[] SmallWords = { "쪼그만!", "작아졌다…", "뾰롱" };
        private static readonly string[] DashWords = { "다다다다!", "후다닥!", "슝—!" };

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

        private bool VariationsOn { get { return PlayOptions.Current.Variations && !PlayOptions.IsFocus(DateTime.Now); } }

        private void TickVariations(IWorld w, double dt)
        {
            dt = Math.Max(0, Math.Min(.05, dt));
            double now = w.Now;
            if (nextSizeAt < 0) { nextSizeAt = now + 25 + w.Rng.NextDouble() * 35; nextDashAt = now + 12 + w.Rng.NextDouble() * 18; }
            bool auto = VariationsOn, on = auto || now < demoUntil;

            // 크기
            if (auto && sizeTarget == 1 && now >= nextSizeAt && (State == PetState.Walk || State == PetState.Pause || State == PetState.Resting))
                StartSize(w, w.Rng.NextDouble() < .6);
            if (sizeTarget != 1 && (now >= sizeUntil || !on || !SizeFriendlyState))
            { sizeTarget = 1; nextSizeAt = now + 35 + w.Rng.NextDouble() * 55; }
            // 살짝 통통 튀는 스프링: 목표 크기를 조금 지나쳤다가 자리를 잡는다.
            sizeVel += ((sizeTarget - sizeMul) * 70 - sizeVel * 10) * dt;
            sizeMul = Math.Max(.4, Math.Min(2.2, sizeMul + sizeVel * dt));
            if (sizeTarget == 1 && Math.Abs(sizeMul - 1) < .003 && Math.Abs(sizeVel) < .02) { sizeMul = 1; sizeVel = 0; }

            // 다다다 달리기
            if (auto && State == PetState.Walk && now >= dashUntil && now >= nextDashAt)
                StartDash(w, false);
            double target = on && State == PetState.Walk && now < dashUntil ? dashPeak : 1;
            dashMul += (target - dashMul) * Math.Min(1, dt * (target > dashMul ? 10 : 5));
            if (Math.Abs(dashMul - 1) < .01 && target == 1) dashMul = 1;
            if (State == PetState.Walk && dashMul > 1) animT += dt * (dashMul - 1);
        }

        private void StartSize(IWorld w, bool big)
        {
            sizeTarget = big ? 1.45 + w.Rng.NextDouble() * .35 : .55 + w.Rng.NextDouble() * .15;
            sizeUntil = w.Now + 6 + w.Rng.NextDouble() * 8;
            sizeVel += big ? 2.5 : -2;
            Say(w, big ? BigWords : SmallWords, 1.6);
        }

        private void StartDash(IWorld w, bool demo)
        {
            if (!demo && w.Rng.NextDouble() < .3) Dir = -Dir;
            dashPeak = 3.2 + w.Rng.NextDouble() * 1.6;
            dashUntil = w.Now + 1.1 + w.Rng.NextDouble() * 1.4;
            stateDur = Math.Max(stateDur, StateT + (dashUntil - w.Now) + .4);
            nextDashAt = dashUntil + 18 + w.Rng.NextDouble() * 30;
            Say(w, DashWords, 1.2);
        }

        private void Say(IWorld w, string[] words, double seconds)
        {
            if (Bubble != null && w.Now < BubbleUntil) return;
            Bubble = words[w.Rng.Next(words.Length)]; BubbleUntil = w.Now + seconds;
        }

        // 걷기 이동 속도에 곱해지는 값
        private double WalkBoost { get { return State == PetState.Walk ? dashMul : 1; } }

        private void VariationLook(ref Look look)
        {
            if (sizeMul != 1)
            {
                look.Sx *= (float)sizeMul; look.Sy *= (float)sizeMul; look.HopY *= (float)sizeMul;
            }
            if (State == PetState.Walk && dashMul > 1.05 && look.Angle == 0)
            {
                // 달릴 때는 앞으로 살짝 기울어진다.
                double k = Math.Min(1, (dashMul - 1) / Math.Max(.5, dashPeak - 1));
                look.Angle = (float)(Dir * 9 * k);
            }
        }

        // 우클릭 → 동작 바로 보기
        internal bool DemonstrateVariation(IWorld w, string kind)
        {
            if (kind != "big" && kind != "small" && kind != "dash") return false;
            if (State == PetState.Falling || State == PetState.Drag || State == PetState.Thrown || State == PetState.PilotRise || !SizeFriendlyState)
            { Bubble = "바닥에 내려가면 보여줄게!"; BubbleUntil = w.Now + 3; return true; }
            Bubble = null; demoUntil = w.Now + 20;
            if (kind == "dash") { SetState(PetState.Walk, w); StartDash(w, true); }
            else StartSize(w, kind == "big");
            return true;
        }
    }
}
