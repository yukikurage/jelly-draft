import Component from "component";
import jelly, { Context, createState, render } from "./jelly";

const App = () => {
  const [boolState, , modifyBoolState] = createState(true);

  return (
    <div>
      <button onclick={() => modifyBoolState((s) => !s)}>switch</button>

      {(c: Context) =>
        boolState(c) ? (
          <p>
            this is boolean test. Now, true.
            <Component />
          </p>
        ) : (
          <p>
            <div>this is boolean test. Now, false.</div>
          </p>
        )
      }
    </div>
  );
};

render(document.body, App());
