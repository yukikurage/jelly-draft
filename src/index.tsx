import Component from "component";
import jelly, { Context, createState, Getter, render } from "./jelly";

const [boolState, setBoolState] = createState(true);

const [helloWorld, setHelloWorld] = createState("Hello World");

const helloWorldLength: Getter<number> = (c) => helloWorld(c).length;

const App = () => (
  <div>
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

render(document.body, App());

setTimeout(() => {
  setHelloWorld("Hello World 2");
}, 1000);

setTimeout(() => {
  setBoolState(false);
}, 3000);
