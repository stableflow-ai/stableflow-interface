import { motion, useReducedMotion } from "framer-motion";
import SectionTitle from "../components/section-title";
import { getAboutAsset } from "../utils";

type OrbitDotProps = {
  dotClassName: string;
  duration: number;
  delay?: number;
  initialRotate?: number;
  reduceMotion: boolean;
};

const OrbitDot = ({ dotClassName, duration, delay = 0, initialRotate = 0, reduceMotion }: OrbitDotProps) => {
  return (
    <div className="absolute left-[6%] top-[-37%] size-116 rounded-[50%] transform-3d transform-[rotateX(75deg)_rotateY(-14deg)]">
      <motion.div
        className="relative size-full rounded-[50%] origin-[50%_50%]"
        initial={{ rotate: initialRotate }}
        animate={reduceMotion ? { rotate: initialRotate } : { rotate: initialRotate + 360 }}
        transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
      >
        <span
          className={`absolute left-1/2 top-0 rounded-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.25)] transform-[translate(-50%,-50%)_rotateY(14deg)_rotateX(-75deg)] ${dotClassName}`}
        />
      </motion.div>
    </div>
  );
};

const SecureDesign = () => {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-24 grid w-full max-w-[1060px] gap-12 md:mt-30 md:grid-cols-[540px_1fr] md:items-center">
        <div className="relative w-135 h-77.5 mx-auto perspective-[900px] scale-60 md:scale-100 origin-left">
          <img
            src={getAboutAsset("banner-near-intents.png")}
            alt="NEAR Intents security"
            className="absolute left-0 top-0 size-full object-contain"
          />
          <OrbitDot
            dotClassName="size-3"
            duration={5.6}
            initialRotate={12}
            reduceMotion={reduceMotion}
          />
          <OrbitDot
            dotClassName="size-2"
            duration={7.2}
            delay={0.8}
            initialRotate={128}
            reduceMotion={reduceMotion}
          />
        </div>
        <div>
          <SectionTitle align="left">Secure by design</SectionTitle>
          <p className="mt-8 text-lg font-light leading-[150%] text-[#444C59]">
            Transfers routing through NEAR Intents settle atomically via NEAR Protocol’s Verifier Smart Contract. Cryptographic proofs and signed intents ensure only authorised actions execute. For native rails like CCTP and USDT0, settlement is guaranteed by the underlying protocols. Either your transfer completes entirely, or your funds come back.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecureDesign;
