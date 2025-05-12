import { Rule } from "../rule";

type AntiKnightState = object;
type AntiKnightData = object;

export const antiKnightRule: Rule<AntiKnightState, AntiKnightData> = {
  name: "antiKnight",
  initialState: {},
  initialData: () => {
    return {};
  },
  eventTypes: [],
  reducer: () => {
    return {};
  },
  render: () => {
    return [];
  },
};
