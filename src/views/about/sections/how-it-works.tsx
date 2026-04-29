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
  const color = active ? "#FFFFFF" : "#787A7B";
  const opacity = active ? 1 : 0.3;

  return (
    <div className={clsx("flex size-13.5 bg-black items-center justify-center rounded-xl transition-colors duration-500 relative z-3")}>
      {index === 0 && (
        <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            opacity={opacity}
            x="0.5"
            y="0.5"
            width="54"
            height="54"
            rx="12"
            stroke={color}
            strokeLinecap="round"
          />
          <circle
            cx="28"
            cy="26"
            r="14.5"
            stroke={color}
          />
          <path
            d="M28 35.5C22.7533 35.5 18.5 31.2467 18.5 26M28 16.5C33.2467 16.5 37.5 20.7533 37.5 26"
            stroke={color}
          />
          <path
            d="M28.1159 25.048C28.4534 24.7745 28.9892 24.6082 29.5233 24.8255L29.6293 24.874L40.0119 30.1204L50.0645 35.1995C50.7337 35.5379 50.8915 36.2418 50.75 36.7618C50.612 37.2689 50.1711 37.7369 49.5235 37.8063L39.3387 38.8974L36.1608 48.6347C35.9586 49.2541 35.4088 49.5877 34.8844 49.6177C34.3466 49.6485 33.6902 49.3487 33.4978 48.6234L30.613 37.7364L27.6333 26.4916C27.4703 25.8763 27.7564 25.3396 28.1159 25.048Z"
            fill={color}
            stroke="black"
            stroke-width="2"
          />
        </svg>
      )}
      {index === 1 && (
        <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="0.5"
            y="0.5"
            width="54"
            height="54"
            rx="12"
            stroke={color}
            stroke-linecap="round"
          />
          <path
            d="M11.5 16.5L41.5 16.5"
            stroke={color}
            stroke-linecap="round"
          />
          <path
            d="M11.5 24.5L28.5 24.5"
            stroke={color}
            stroke-linecap="round"
          />
          <path
            d="M11.5 32.5L36.5 32.5"
            stroke={color}
            stroke-linecap="round"
          />
          <mask
            id="path-5-outside-1_41234_761"
            maskUnits="userSpaceOnUse"
            x="16.5"
            y="17.5"
            width="31"
            height="31"
            fill="black"
          >
            <rect
              fill={color}
              x="16.5"
              y="17.5"
              width="31"
              height="31"
            />
            <path
              d="M30.041 19.5C36.4146 19.5001 41.5811 24.6674 41.5811 31.041C41.581 33.7659 40.6341 36.2679 39.0547 38.2422L44.082 43.2686L42.2676 45.082L37.2412 40.0557C35.2671 41.6345 32.7654 42.581 30.041 42.5811C23.6674 42.5811 18.5001 37.4146 18.5 31.041C18.5 24.6673 23.6673 19.5 30.041 19.5Z"
            />
          </mask>
          <path
            d="M30.041 19.5C36.4146 19.5001 41.5811 24.6674 41.5811 31.041C41.581 33.7659 40.6341 36.2679 39.0547 38.2422L44.082 43.2686L42.2676 45.082L37.2412 40.0557C35.2671 41.6345 32.7654 42.581 30.041 42.5811C23.6674 42.5811 18.5001 37.4146 18.5 31.041C18.5 24.6673 23.6673 19.5 30.041 19.5Z"
            fill={color}
          />
          <path
            d="M30.041 19.5L30.0411 17.5H30.041V19.5ZM41.5811 31.041L43.5811 31.0411V31.041H41.5811ZM39.0547 38.2422L37.4929 36.9928L36.3746 38.3908L37.6406 39.6565L39.0547 38.2422ZM44.082 43.2686L45.4959 44.6831L46.911 43.2688L45.4961 41.8542L44.082 43.2686ZM42.2676 45.082L40.8534 46.4962L42.2672 47.9101L43.6814 46.4966L42.2676 45.082ZM37.2412 40.0557L38.6554 38.6415L37.3898 37.3758L35.992 38.4938L37.2412 40.0557ZM30.041 42.5811V44.5811H30.0411L30.041 42.5811ZM18.5 31.041H16.5V31.0411L18.5 31.041ZM30.041 19.5L30.041 21.5C35.3099 21.5001 39.5811 25.7718 39.5811 31.041H41.5811H43.5811C43.5811 23.563 37.5194 17.5002 30.0411 17.5L30.041 19.5ZM41.5811 31.041L39.5811 31.041C39.581 33.2939 38.8 35.3589 37.4929 36.9928L39.0547 38.2422L40.6164 39.4915C42.4682 37.1768 43.581 34.2379 43.5811 31.0411L41.5811 31.041ZM39.0547 38.2422L37.6406 39.6565L42.668 44.6829L44.082 43.2686L45.4961 41.8542L40.4688 36.8278L39.0547 38.2422ZM44.082 43.2686L42.6682 41.854L40.8537 43.6674L42.2676 45.082L43.6814 46.4966L45.4959 44.6831L44.082 43.2686ZM42.2676 45.082L43.6818 43.6678L38.6554 38.6415L37.2412 40.0557L35.827 41.4699L40.8534 46.4962L42.2676 45.082ZM37.2412 40.0557L35.992 38.4938C34.3583 39.8003 32.2936 40.581 30.041 40.5811L30.041 42.5811L30.0411 44.5811C33.2372 44.581 36.1758 43.4687 38.4904 41.6176L37.2412 40.0557ZM30.041 42.5811V40.5811C24.7718 40.5811 20.5001 36.3099 20.5 31.041L18.5 31.041L16.5 31.0411C16.5002 38.5194 22.563 44.5811 30.041 44.5811V42.5811ZM18.5 31.041H20.5C20.5 25.7719 24.7719 21.5 30.041 21.5V19.5V17.5C22.5627 17.5 16.5 23.5627 16.5 31.041H18.5Z"
            fill="black"
            mask="url(#path-5-outside-1_41234_761)"
          />
          <path
            d="M21.5 31C21.5 26.3056 25.3056 22.5 30 22.5C34.6944 22.5 38.5 26.3056 38.5 31C38.5 35.6944 34.6944 39.5 30 39.5C25.3056 39.5 21.5 35.6944 21.5 31Z"
            fill="black"
          />
        </svg>
      )}
      {index === 2 && (
        <svg
          width="55"
          height="55"
          viewBox="0 0 55 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            opacity={opacity}
            x="0.5"
            y="0.5"
            width="54"
            height="54"
            rx="12"
            stroke={color}
            stroke-linecap="round"
          />
          <path
            d="M41.5 27C41.5 35.0081 35.0081 41.5 27 41.5C18.9919 41.5 12.5 35.0081 12.5 27C12.5 18.9919 18.9919 12.5 27 12.5C29.3091 12.5 31.4922 13.0398 33.4299 14"
            stroke={color}
          />
          <path
            d="M21 23L28.5 30.5L43 16"
            stroke={color}
            stroke-width="3"
          />
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
        <div className="mt-13 grid text-white md:grid-cols-3 relative gap-y-12.5 md:gap-y-0">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className={clsx(
                "relative flex-1 pl-0 md:pl-25 flex flex-row md:flex-col",
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
                    <div className="absolute rotate-90 origin-[-25px_0] md:rotate-0 left-13.5 md:left-38.5 top-7 h-px w-26 md:w-full bg-[#2A2F3A] z-1">
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
              <div className="space-y-5 mt-0 md:mt-7 ml-2.5 md:ml-0">
                <h3 className="text-[20px] md:text-[26px] font-light md:font-normal leading-none">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-sm md:text-base font-light leading-[120%] text-white/60">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section >
  );
};

export default HowItWorks;
