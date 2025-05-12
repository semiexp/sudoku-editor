import { useState } from "react";

import { Editor } from "./editor";
import { defaultProblem } from "./puzzle";
import "./i18n/configs";

function App() {
  const [problem, setProblem] = useState(defaultProblem(9, 3));

  return (
    <>
      <Editor problem={problem} onChangeProblem={setProblem} />
    </>
  );
}

export default App;
