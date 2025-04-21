import { ReactElement } from "react";
import { Rule } from "../rule";

type NonConsecutiveState = {};
type NonConsecutiveData = {};

export const nonConsecutiveRule: Rule<NonConsecutiveState, NonConsecutiveData> = {
  name: "nonConsecutive",
  description: "Non-consecutive",
  initialState: {},
  initialData: (size: number) => ({}),
  eventTypes: [],
  reducer: (state, data, event) => {
    return {};
  },
  render: (state, data, options) => {
    return [];
  },
};
