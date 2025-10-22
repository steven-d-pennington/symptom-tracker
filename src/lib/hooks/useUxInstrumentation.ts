import { useCallback, useEffect, useState } from "react";
import { userRepository } from "../repositories/userRepository";
import { uxEventRepository } from "../repositories/uxEventRepository";

interface RecordOptions {
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

interface InstrumentationState {
  userId: string | null;
  analyticsOptIn: boolean;
  ready: boolean;
}

const initialState: InstrumentationState = {
  userId: null,
  analyticsOptIn: false,
  ready: false,
};

export function useUxInstrumentation() {
  const [state, setState] = useState<InstrumentationState>(initialState);

  const resolveCurrentUser = useCallback(async () => {
    try {
      const user = await userRepository.getOrCreateCurrentUser();
      const analyticsOptIn = Boolean(user.preferences?.privacy?.analyticsOptIn);
      setState({
        userId: user.id,
        analyticsOptIn,
        ready: true,
      });
      return {
        userId: user.id,
        analyticsOptIn,
      };
    } catch (error) {
      console.error("[useUxInstrumentation] Failed to resolve current user", error);
      setState({
        userId: null,
        analyticsOptIn: false,
        ready: true,
      });
      return {
        userId: null,
        analyticsOptIn: false,
      };
    }
  }, []);

  useEffect(() => {
    void resolveCurrentUser();
  }, [resolveCurrentUser]);

  const recordUxEvent = useCallback(
    async (eventType: string, options: RecordOptions = {}) => {
      if (!eventType) {
        console.warn("[useUxInstrumentation] Missing eventType");
        return;
      }

      let userId = state.userId;
      let analyticsOptIn = state.analyticsOptIn;

      if (!state.ready) {
        const resolved = await resolveCurrentUser();
        userId = resolved.userId;
        analyticsOptIn = resolved.analyticsOptIn;
      }

      if (!userId || !analyticsOptIn) {
        return;
      }

      try {
        await uxEventRepository.recordEvent({
          userId,
          eventType,
          metadata: options.metadata,
          timestamp: options.timestamp,
        });
      } catch (error) {
        console.error(`[useUxInstrumentation] Failed to record event ${eventType}`, error);
      }
    },
    [state.userId, state.analyticsOptIn, state.ready, resolveCurrentUser],
  );

  return {
    recordUxEvent,
    isAnalyticsEnabled: state.analyticsOptIn,
    isReady: state.ready,
    refreshInstrumentationState: resolveCurrentUser,
  };
}
