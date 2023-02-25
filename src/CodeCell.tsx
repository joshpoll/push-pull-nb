import type { Component } from "solid-js";

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
import { reactive, createSignal as createSignalR } from "./reactively";

export type Kind = "signal" | "computation" | "effect" | "dead";

export type CodeCellProps = {
  kind?: Kind;
  initialCode?: string;
  cellName: string;
};

export type CellSignal = {
  value: any;
  code: string;
};

export const CodeCell = (props: CodeCellProps) => {
  const [cellName, setCellName] = createSignal<string>(props.cellName);

  const [kind, setKind] = createSignal<Kind>(props.kind ?? "signal");

  // const [cellSignal, setCellSignal] = createSignal<any>({
  //   value: undefined,
  //   code: "",
  // });

  // const signal = reactive<{ value: any; code: string }>({
  //   value: undefined,
  //   code: "",
  // });

  const [rCellSignal, setRCellSignal] = createSignalR<CellSignal>({
    value: undefined,
    code: "",
  });

  const [updateSignal, setUpdateSignal] = createSignal(0);

  const getRCell = () => {
    // console.log("getRCellSignal", rCellSignal());
    updateSignal();
    return rCellSignal();
  };

  const setRCell = (cellSignal: any) => {
    // console.log("setRCellSignal", cellSignal({}));
    setUpdateSignal((x) => x + 1);
    setRCellSignal(cellSignal);
  };

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
          try {
            console.log(
              "run code",
              e.state.doc.toString(),
              eval(e.state.doc.toString())
            );
            setRCell({
              code: e.state.doc.toString(),
              value: eval(e.state.doc.toString()),
            });
            // signal.value = {
            //   code: e.state.doc.toString(),
            //   value: eval(e.state.doc.toString()),
            // };
          } catch (e) {}
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
      {cellName()} = <div ref={editorRef} />
      <input
        type="text"
        value={cellName()}
        onInput={(e) => setCellName(e.currentTarget.value)}
      />
      {getRCell().value}
      {/* {signal.value.value} */}
      <br />
      <input
        type="range"
        min={0}
        max={20}
        value={getRCell().value}
        // value={signal.value.value}
        onInput={(e) => {
          const value = +e.currentTarget.value;
          setRCell((cellSignal: any) => ({
            code: cellSignal.code,
            value,
          }));
        }}
        // onInput={(e) =>
        //   (signal.value = {
        //     code: signal.value.code,
        //     value: +e.currentTarget.value,
        //   })
        // }
      />
    </div>
  );
};
