import { Component, createEffect } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

import { createCodeMirror } from "solid-codemirror";
import { createSignal, onMount } from "solid-js";
import { Extension, EditorState } from "@codemirror/state";
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
  EditorView,
} from "@codemirror/view";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { javascript } from "@codemirror/lang-javascript";
import {
  reactive,
  createSignal as createSignalR,
  stabilize,
} from "./reactively";
import { SetStoreFunction } from "solid-js/store";
import { fromReactively } from "./util";

export type Kind = "signal" | "computation" | "effect" | "dead";

export type CodeCellProps = {
  kind?: Kind;
  initialCode?: string;
  cellName: string;
  cells: { [key: string]: any };
  setCells: SetStoreFunction<{ [key: string]: any }>;
};

export type CellSignal = {
  value: any;
  code: string;
};

export const CodeCell = (props: CodeCellProps) => {
  const [cellName, setCellName] = createSignal<string>(props.cellName);

  const [kind, setKind] = createSignal<Kind>(props.kind ?? "signal");

  const cell = {
    code: reactive<string>(""),
    value: reactive<any>(undefined),
  };

  createEffect(() => {
    props.setCells(cellName(), {
      get: () => cell.value.get(),
      set: (value: any) => cell.value.set(value),
    });
  });

  const cellCode = fromReactively<string>(cell.code);
  const cellValue = fromReactively<any>(cell.value);

  // createEffect(() => {
  //   console.log("cell", cellName(), cellValue());
  //   console.log("dependencies", cell.value.dependencies());
  // });

  const otherCells = () =>
    Object.keys(props.cells).filter((key) => key !== cellName());

  createEffect(() => {
    console.log("otherCells", cellName(), otherCells());
  });

  const reifiedCells = () =>
    new Proxy(props.cells, {
      get(target, name, receiver) {
        if (name === cellName()) {
          // TODO: This is a hack to prevent infinite recursion, but can we loosen this restriction?
          throw new Error("Cannot reference self in a computation.");
        }
        return Reflect.get(target, name, receiver).get();
      },
      set() {
        throw new Error("Cannot mutate cells in a computation.");
      },
    });

  const mutableReifiedCells = () =>
    new Proxy(props.cells, {
      get(target, name, receiver) {
        if (name === cellName()) {
          // TODO: This is a hack to prevent infinite recursion, but can we loosen this restriction?
          throw new Error("Cannot reference self in a dead cell.");
        }
        return Reflect.get(target, name, receiver).get();
      },
      set(target, name, value, receiver) {
        if (name === cellName()) {
          // TODO: This is a hack to prevent infinite recursion, but can we loosen this restriction?
          throw new Error("Cannot reference self in a dead cell.");
        }
        console.log("setting");
        return Reflect.get(target, name, receiver).set(value);
      },
    });

  const {
    editorView,
    ref: editorRef,
    createExtension,
  } = createCodeMirror({
    // The initial value of the editor
    value: props.initialCode ?? kind(),
    // Fired whenever the editor code value changes.
    // onValueChange: (value) => console.log("value changed", value),
    // Fired whenever a change occurs to the document. There is a certain difference with `onChange`.
    // onModelViewUpdate: (modelView) =>
    //   console.log("modelView updated", modelView),
  });

  createExtension([
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
      // shift+enter runs code
      {
        key: "Shift-Enter",
        run: (e) => {
          if (kind() === "signal") {
            try {
              cell.value.setSignal(eval(e.state.doc.toString()));
            } catch (e) {}
          } else if (kind() === "computation") {
            try {
              cell.value.set(() =>
                Function("cells", e.state.doc.toString())(reifiedCells())
              );
            } catch (e) {}
          } else if (kind() === "effect") {
            // TODO
          } else if (kind() === "dead") {
            try {
              // notice we left out () => here and we're also using mutableReifiedCells
              // the first ensures that we don't auto-update (it acts like a signal, not a
              // computation)
              // the second ensures we can mutate values inside it
              cell.value.set(
                Function("cells", e.state.doc.toString())(mutableReifiedCells())
              );
            } catch (e) {}
          } else {
            throw new Error(`unknown kind of cell ${kind()}`);
          }
          return true;
        },
      },
    ]),
    javascript({
      typescript: true,
    }),
  ]);

  return (
    <div>
      <select
        value={kind()}
        onChange={(e) => setKind((e.target as any).value as Kind)}
      >
        <option value="signal">signal</option>
        <option value="computation">computation</option>
        <option value="effect">effect</option>
        <option value="dead">dead</option>
      </select>
      <br />
      <table>
        <tbody>
          <tr>
            <td>{cellName()} =</td>
            <td>
              <div ref={editorRef} />
            </td>
          </tr>
        </tbody>
      </table>
      <input
        type="text"
        value={cellName()}
        onInput={(e) => setCellName(e.currentTarget.value)}
      />
      {cellValue()}
      {kind() === "signal" && (
        <>
          <br />
          <input
            type="range"
            min={0}
            max={20}
            value={cellValue()}
            onInput={(e) => {
              const value = +e.currentTarget.value;
              cell.value.setSignal(value);
            }}
          />
        </>
      )}
    </div>
  );
};
