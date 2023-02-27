import type { Component } from "solid-js";

import { CodeCell } from "./CodeCell";
import { TestReactively } from "./Test";
import { createStore } from "solid-js/store";

const App: Component = () => {
  // const cells = {};
  const [cells, setCells] = createStore({});

  return (
    <>
      <CodeCell
        cells={cells}
        setCells={setCells}
        cellName={"x"}
        initialCode={"10"}
      />
      <br />
      <CodeCell
        cells={cells}
        setCells={setCells}
        cellName={"y"}
        initialCode={"5"}
      />
      <br />
      <CodeCell
        cells={cells}
        setCells={setCells}
        cellName={"z"}
        initialCode={"return cells.x + cells.y"}
        kind="computation"
      />
      <br />
      <CodeCell
        cells={cells}
        setCells={setCells}
        cellName={"dead"}
        initialCode={"cells.x = 100"}
        kind="dead"
      />
      {/* <br />
      <CodeCell
        cells={cells}
        setCells={setCells}
        cellName={"x"}
        kind="computation"
      />
      <br />
      <CodeCell
        cells={cells}
        setCells={setCells}
        cellName={"x"}
        kind="computation"
      />
      <br />
      <CodeCell
        cells={cells}
        setCells={setCells}
        cellName={"x"}
        kind="computation"
      /> */}
    </>
  );
};

export default App;
