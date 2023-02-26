import { createSignal, from } from "solid-js";
import { Reactive, reactive, stabilize } from "./reactively";
import { fromReactively } from "./util";

export function TestReactively() {
  const [count, setCount] = createSignal(0);

  const countReactively = reactive(0);

  const fromCountReactively = fromReactively<number>(countReactively);

  return (
    <div>
      <h1>Solid Signals</h1>
      <p>You clicked {count()} times</p>
      <button onClick={() => setCount(count() + 1)}>Click me</button>
      <h1>Reactively Signals</h1>
      <p>You clicked {fromCountReactively()} times</p>
      <button onClick={() => countReactively.set(countReactively.get() + 1)}>
        Click me
      </button>
    </div>
  );
}
