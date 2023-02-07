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

export type Kind = "signal" | "computation" | "effect" | "dead";

export type CodeCellProps = {
  kind?: Kind;
};

export const CodeCell = (props: CodeCellProps) => {
  const [kind, setKind] = createSignal<Kind>(props.kind ?? "signal");

  const {
    editorView,
    ref: editorRef,
    createExtension,
  } = createCodeMirror({
    // The initial value of the editor
    value: kind(),
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
      <div ref={editorRef} />
    </div>
  );
};
