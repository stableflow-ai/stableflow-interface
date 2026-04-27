import { IS_PRODUCTION } from "@/config/api";
import { csl, type StyleColor, type StyleScale } from "./log";

export class ExecTime {
  private type: string;
  private logStyle: `${StyleColor}-${StyleScale}`;
  private startTimestamp: number = 0;
  private currentTimestamp: number = 0;
  private isPerformance: boolean;
  private readonly performanceThreshold: number = 1000;

  constructor(options: { type: string; logStyle?: `${StyleColor}-${StyleScale}`; isPerformance?: boolean; }) {
    const { type, logStyle, isPerformance } = options;
    this.type = type;
    this.logStyle = logStyle ?? "stone-500";
    this.isPerformance = isPerformance ?? true;

    if (IS_PRODUCTION) return;

    this.startTimestamp = performance.now();
    this.currentTimestamp = this.startTimestamp;
  }

  public breakpoint() {
    if (IS_PRODUCTION) return;
    this.currentTimestamp = performance.now();
  }

  public log(subType: string, str?: string, ...params: any[]) {
    const duration = performance.now() - this.currentTimestamp;
    if (this.isPerformance) {
      if (duration <= this.performanceThreshold) {
        return;
      }
    }
    csl(this.type, this.logStyle, `<${subType}>cost: %c%sms%c${str ? ", " + str : ""}`, "color:red;font-weight:bold;", duration.toFixed(0), "color:black;font-weight:normal;", ...params);
  }

  public logTotal(subType: string, str?: string, ...params: any[]) {
    const duration = performance.now() - this.startTimestamp;
    csl(this.type, this.logStyle, `<${subType}>total cost: %c%sms%c${str ? ", " + str : ""}`, "color:red;font-weight:bold;", duration.toFixed(0), "color:black;font-weight:normal;", ...params);
  }

}
