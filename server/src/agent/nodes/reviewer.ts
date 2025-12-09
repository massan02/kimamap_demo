import { HumanMessage } from "@langchain/core/messages";
import { PlanAgentState } from "../state";

const RETRY_LIMIT = 1; // Max retries allowed
const HARD_LIMIT_BUFFER = 30; // Allow up to +30 mins before forcing retry

export async function reviewerNode(state: typeof PlanAgentState.State) {
  const { plan, durationLimit, retryCount } = state;

  if (!plan) return { error: "No plan to review." };

  const totalDuration = plan.totalDuration;
  const diff = totalDuration - durationLimit;

  console.log(`[Reviewer] Limit: ${durationLimit}, Actual: ${totalDuration}, Diff: ${diff}`);

  // 1. Check Retry Limit
  if (retryCount >= RETRY_LIMIT) {
    console.log("[Reviewer] Retry limit reached. Accepting plan as is.");
    return { 
      isOverTime: diff > 0, // Flag if it's over time
      // No retry message, loop will end
    };
  }

  // 2. Check Hard Limit (Force Retry)
  if (diff > HARD_LIMIT_BUFFER) {
    console.log(`[Reviewer] Plan exceeds hard limit (+${HARD_LIMIT_BUFFER}m). Requesting retry.`);
    return {
      retryCount: retryCount + 1,
      messages: [
        new HumanMessage(
          `The plan takes ${totalDuration} minutes, which significantly exceeds the limit of ${durationLimit} minutes. Please reduce the number of spots or choose closer locations to fit within the limit.`
        ),
      ],
    };
  }

  // 3. Accept (Soft Limit or Perfect)
  console.log("[Reviewer] Plan accepted.");
  return {
    isOverTime: diff > 0,
  };
}
