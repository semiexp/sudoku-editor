import { useState } from "react";

import { Editor, defaultProblem } from "./editor"

function App() {
  const [problem, setProblem] = useState(defaultProblem(9));

  return (
    <>
      <Editor problem={problem} onChangeProblem={setProblem} />
    </>
  )
}

export default App
