import { Rule } from "../rule";

type NonConsecutiveState = {};
type NonConsecutiveData = {};

export const nonConsecutiveRule: Rule<NonConsecutiveState, NonConsecutiveData> =
  {
    name: "nonConsecutive",
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
