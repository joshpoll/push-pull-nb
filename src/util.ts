import { from } from "solid-js";
import { reactive, Reactive } from "./reactively";

export const fromReactively = <T>(r: Reactive<any>) =>
  from<T>((set) => {
    reactive(() => {
      set(r.get());
    }, true);
    return () => {};
  });
