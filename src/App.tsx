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
import { CodeCell } from "./CodeCell";

const App: Component = () => {
  return (
    <>
      <CodeCell />
      <br />
      <CodeCell />
      <br />
      <CodeCell kind="computation" />
      <br />
      <CodeCell kind="computation" />
      <br />
      <CodeCell kind="computation" />
      <br />
      <CodeCell kind="computation" />
    </>
  );
};

export default App;
