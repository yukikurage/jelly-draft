import Component from "component";
import jelly, {
  Context,
  createEffect,
  createState,
  Getter,
  render,
} from "./jelly";

const [boolState, setBoolState] = createState(true);

const [numState, , modifyNumState] = createState(0);

const increment = () => modifyNumState((prev) => prev + 1);

createEffect((c) => {
  console.log("Effect Called");
  if (boolState(c)) {
    console.log(numState(c));
  }
});

increment();
increment();
increment();
increment();
setBoolState(false);
increment();
increment();
increment();
increment();
setBoolState(true);
increment();
increment();
increment();
increment();

// const [helloWorld, setHelloWorld] = createState("Hello World");

// const helloWorldLength: Getter<number> = (c) => helloWorld(c).length;

// const App = () => (
//   <div>
//     <Component />

//     {(c: Context) =>
//       boolState(c) ? (
//         <p>
//           this is boolean test. Now, true.
//           <div>{helloWorld}</div>
//           <div>{helloWorldLength}</div>
//         </p>
//       ) : (
//         <div>this is boolean test. Now, false.</div>
//       )
//     }
//   </div>
// );

// render(document.body, App());

// setTimeout(() => {
//   setHelloWorld("Hello World 2");
// }, 1000);

// setTimeout(() => {
//   setBoolState(false);
// }, 3000);
