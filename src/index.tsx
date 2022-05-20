import Component from "component";
import jelly, { createState, render } from "./jelly";

const App = () => {
  const [boolState, , modifyBoolState] = createState(true);

  return (
    <div>
      <button
        onclick={(_, c) => {
          console.log(boolState(c));
          modifyBoolState((s) => !s);
        }}
      >
        switch
      </button>

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
