import jelly, { createEffect, createState, createUnmountEffect } from "jelly";

const [state, setState, modifyState] = createState(0);

const Component = ({ children }: { children?: Component[] }) => {
  setState(0);

  const id = setInterval(() => {
    modifyState((x) => x + 1);
  }, 10);

  createUnmountEffect(() => {
    clearInterval(id);
  });

  return (
    <div>
      {() => state().toString()}
      {children}
    </div>
  );
};

export default Component;
