import { Rule } from "../rule";

type NonConsecutiveState = {};
type NonConsecutiveData = {};

export const nonConsecutiveRule: Rule<NonConsecutiveState, NonConsecutiveData> =
  {
    name: "nonConsecutive",
    title: "Non-consecutive",
    explanation: "Numbers in adjacent cells cannot differ by 1.",
    initialState: {},
    initialData: (_size: number) => ({}),
    eventTypes: [],
    reducer: (_state, _data, _event) => {
      return {};
    },
    render: (_state, _data, _options) => {
      return [];
    },
  };
