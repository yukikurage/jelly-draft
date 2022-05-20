import Component from "component";
import jelly, { Context, createState, Getter, render } from "./jelly";

const App = () => {
  const [boolState, setBoolState, modifyBoolState] = createState(true);

  const [helloWorld, setHelloWorld] = createState("Hello World");

  const helloWorldLength: Getter<number> = (c) => helloWorld(c).length;

  setTimeout(() => {
    setHelloWorld("Hello World 2");
  }, 1000);

  return (
    <div>
      <button onclick={() => modifyBoolState((s) => !s)}>switch</button>

      <Component />

      {(c: Context) =>
        boolState(c) ? (
          <p>
            this is boolean test. Now, true.
            <div>{helloWorld}</div>
            <div>{helloWorldLength}</div>
          </p>
        ) : (
          <div>this is boolean test. Now, false.</div>
        )
      }
    </div>
  );
};

render(document.body, App());
