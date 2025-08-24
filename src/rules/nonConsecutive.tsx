import { Rule } from "../rule";

type NonConsecutiveState = object;
type NonConsecutiveData = object;

export const nonConsecutiveRule: Rule<NonConsecutiveState, NonConsecutiveData> =
  {
    name: "nonConsecutive",
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
    exportToPenpa: () => {
      return { items: [], margin: 0 };
    },
  };
