import { useState } from "react";

import { Editor, defaultProblem } from "./editor";
import "./i18n/configs";

function App() {
  const [problem, setProblem] = useState(defaultProblem(9, 3));

  return (
    <>
      <Editor problem={problem} onChangeProblem={setProblem} />
      <a href="licenses.txt">Licenses</a>
    </>
  );
}

export default App;
