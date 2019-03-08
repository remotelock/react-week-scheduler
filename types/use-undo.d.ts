declare module 'use-undo' {
  import { SetStateAction } from 'react';

  type State<Value> = {
    present: Value;
    past: Value[];
    future: Value[];
  };

  function useUndo<Value>(
    initialValue: Value
  ): [
    State<Value>,
    {
      set(updater: Value): void;
      reset(updater: Value): void;
      undo: () => void;
      redo: () => void;
      canUndo: boolean;
      canRedo: boolean;
    }
  ];

  export default useUndo;
}
