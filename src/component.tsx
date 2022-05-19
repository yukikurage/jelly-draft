import jelly, { createState } from "jelly";

const [state, setState] = createState("This is the initial state, and ...");

const Component = () => <div>{state}</div>;

setTimeout(() => {
  setState("This is the second state");
}, 2000);

export default Component;
