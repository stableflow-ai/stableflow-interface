import { motion, type TargetAndTransition, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useState } from "react";
import SectionTitle from "../components/section-title";
import { HOW_IT_WORKS_STEPS } from "../config";

const STEP_HOLD_SECONDS = 0.8;
const CONNECTOR_TRAVEL_SECONDS = 1.2;
const CYCLE_PAUSE_SECONDS = 0.8;
const ICON_ACTIVE_LEAD_SECONDS = 0.2;
const FIRST_CONNECTOR_START_SECONDS = STEP_HOLD_SECONDS;
const FIRST_CONNECTOR_END_SECONDS = FIRST_CONNECTOR_START_SECONDS + CONNECTOR_TRAVEL_SECONDS;
const SECOND_STEP_ACTIVE_SECONDS = FIRST_CONNECTOR_END_SECONDS - ICON_ACTIVE_LEAD_SECONDS;
const SECOND_CONNECTOR_START_SECONDS = FIRST_CONNECTOR_END_SECONDS + STEP_HOLD_SECONDS;
const SECOND_CONNECTOR_END_SECONDS = SECOND_CONNECTOR_START_SECONDS + CONNECTOR_TRAVEL_SECONDS;
const THIRD_STEP_ACTIVE_SECONDS = SECOND_CONNECTOR_END_SECONDS - ICON_ACTIVE_LEAD_SECONDS;
const CYCLE_SECONDS = SECOND_CONNECTOR_END_SECONDS + CYCLE_PAUSE_SECONDS;
const KEYFRAME_EDGE_OFFSET = 0.001;

const secondsToRatio = (seconds: number) => seconds / CYCLE_SECONDS;

const getConnectorMotion = (index: number): TargetAndTransition => {
  const startSeconds = index === 0 ? FIRST_CONNECTOR_START_SECONDS : SECOND_CONNECTOR_START_SECONDS;
  const endSeconds = startSeconds + CONNECTOR_TRAVEL_SECONDS;
  const startRatio = secondsToRatio(startSeconds);
  const visibleStartRatio = Math.min(startRatio + KEYFRAME_EDGE_OFFSET, 1);
  const endRatio = secondsToRatio(endSeconds);
  const visibleEndRatio = Math.min(endRatio + KEYFRAME_EDGE_OFFSET, 1);

  return {
    x: ["-10%", "-10%", "-10%", "100%", "100%", "100%"],
    opacity: [0, 0, 1, 1, 0, 0],
    transition: {
      duration: CYCLE_SECONDS,
      repeat: Infinity,
      ease: "linear",
      times: [0, startRatio, visibleStartRatio, endRatio, visibleEndRatio, 1],
    },
  };
};

const StepIcon = ({ index, active }: { index: number; active: boolean }) => {
  const color = active ? "#FFFFFF" : "#6A749A";

  return (
    <div className={clsx("flex size-13.5 bg-black items-center justify-center rounded-xl border transition-colors duration-500 relative z-3", active ? "border-white" : "border-[#444C59]")}>
      {index === 0 && (
        <svg className="size-8" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M8 8H24V24H8V8Z" stroke={color} strokeWidth="1.4" />
          <path d="M11 11L23 23" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M21 22L24 15L17 18L21 22Z" fill={color} />
        </svg>
      )}
      {index === 1 && (
        <svg className="size-8" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M7 9H21V23H7V9Z" stroke={color} strokeWidth="1.4" />
          <circle cx="20" cy="19" r="5" stroke={color} strokeWidth="1.4" />
          <path d="M24 23L27 26" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {index === 2 && (
        <svg className="size-8" viewBox="0 0 32 32" fill="none" aria-hidden>
          <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="1.4" />
          <path d="M11 16.5L14.5 20L22 12" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

const HowItWorks = () => {
  const reduceMotion = Boolean(useReducedMotion());
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setActiveStep(0);
      return;
    }

    let timeouts: number[] = [];

    const scheduleCycle = () => {
      timeouts.forEach(window.clearTimeout);
      timeouts = [];
      setActiveStep(0);
      timeouts.push(window.setTimeout(() => setActiveStep(1), SECOND_STEP_ACTIVE_SECONDS * 1000));
      timeouts.push(window.setTimeout(() => setActiveStep(2), THIRD_STEP_ACTIVE_SECONDS * 1000));
    };

    scheduleCycle();
    const timer = window.setInterval(scheduleCycle, CYCLE_SECONDS * 1000);

    return () => {
      window.clearInterval(timer);
      timeouts.forEach(window.clearTimeout);
    };
  }, [reduceMotion]);

  return (
    <section className="mt-24 w-full bg-black py-12 md:mt-30 md:py-14">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <SectionTitle dark>How it Works</SectionTitle>
        <div className="mt-13 grid text-white md:grid-cols-3 relative">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className={clsx(
                "relative flex-1 pl-25",
                index < HOW_IT_WORKS_STEPS.length - 1 ? "" : ""
              )}
            >
              <div className="">
                <StepIcon
                  index={index}
                  active={activeStep === index}
                />
                {
                  index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="absolute left-38.5 top-7 h-px w-full bg-[#2A2F3A] z-1">
                      <div className="absolute left-0 w-full -top-2 h-4 overflow-hidden">
                        <motion.div
                          className="absolute left-0 top-0 w-full h-3"
                          animate={reduceMotion ? { opacity: 0 } : getConnectorMotion(index)}
                        >
                          <svg
                            width="55"
                            height="11"
                            viewBox="0 0 55 11"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute z-1 left-0 top-0.5 h-3 w-13.5"
                          >
                            <circle cx="49.5" cy="5.5" r="5.5" fill="white" />
                            <path d="M50 6L0 6" stroke="url(#paint0_linear_41229_757)" strokeWidth="3" />
                            <defs>
                              <linearGradient id="paint0_linear_41229_757" x1="4.37114e-08" y1="6.5" x2="50" y2="6.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="white" stopOpacity="0" />
                                <stop offset="1" stopColor="white" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </motion.div>
                      </div>

                    </div>
                  )
                }
              </div>
              <h3 className="text-[26px] font-normal leading-none mt-7">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-5 text-base font-light leading-[120%] text-white/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section >
  );
};

export default HowItWorks;
