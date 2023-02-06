# Push-Pull Notebook

This is a prototype of a push/pull reactive notebook building on the fine-grained reactive
primitives of systems like SolidJS. (SolidJS is not the first to do it, but where I first really
grokked it!)

The motivation is to take the great things about lazy and eager notebooks and combine them in a
principled way that also gets rid of some of their limitations. Lazy notebooks are great for
control. It's really easy to control how and when cells run, but it's hard to keep values in sync,
and provenance is easily lost. Eager notebooks are great for keeping things up-to-date, but too
eagerly run expensive computations. Moreover, eager notebooks are hard to run like normal code
top-down while lazy notebooks are easy to map onto that model. (Not sure if push/pull addresses
that, but we'll see!)

Notice that similar problems are faced in reactive programming. When we don't want to needlessly
re-run things, we use a memo. Memos are pure and pull-based. When we want to keep things up to date,
we use an effect. Effects are impure and push-based.

If you implement every cell as an effect, then you get an eager notebook. Note that Jupyter-style
lazy notebooks do not have a clear analog, because they cannot be automatically kept up to date.

The kind of workflow this enables is something like:
- You are working on a complex ML model. Coding coding coding.
- Finally, you've tweaked the hyperparameters and cleaned the data by running some cells and you are
  ready to run your model! You run your model cell (which is a computation cell), any values that depend on your updated
  hyperparameters etc. will be automatically updated since computation cells are pull-based. But
  also your model cell waited until you pulled it! (When you pull a cell, a call like `model()` is
  appended to the file/history.)
- Once your model is finished, your graphs update automatically, because they are presentation
  cells! And presentation cells are push-based, so you see the results whenever the dependencies
  update.

## Random Thoughts...

I think we can track the lineage of a computation by capturing the evaluation context?

Notice also that if we do this using a SolidJS style system then we can do this in a pretty
language-agnostic way! Just need a signal library (and possibly access to evaluation contexts...)

Every time you manually run a cell, we can just append a call to that cell to the bottom of the
document in a dead cell basically.

Maybe we can associate markdown cells and presentation cells together so that the separation is
clearer and the user doesn't have to separately pick file type and presentation vs. computation.

The problem with the existing fine-grained reactive model is it doesn't give us enough control over
the effect updating by default. So in scenario in the previous section, during the first step we
will be updating signals that update the presentation cells that ultimately force the model to
update too soon! So we need to think about this a bit more.

Maybe a presentation cell is a component? Maybe a notebook is a component?

## Cell Types

In push/pull reactivity we have three kinds of things:
- signals
- derivations/memos
- effects

In our notebook we will also have three (four?) things that map onto these:
- interactive widgets (like Jupyter and Observable)
- computation cells (with view side effects) (closest to Jupyter cells except with pull-based updates (_kinda_
  like nbsafety))
- view/presentation cells (kinda like Hex?)
- dead cells? no reactivity. (maybe there's always a way to use effects for this?)

# Dev Stuff

## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
