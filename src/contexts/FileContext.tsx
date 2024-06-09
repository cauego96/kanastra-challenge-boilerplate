import { createContext, useReducer, ReactNode, Dispatch } from 'react';

type State = {
  files: any[];
};

type Action = { type: 'ADD_FILE'; payload: any } | { type: 'SET_FILES'; payload: any[] };

const initialState: State = {
  files: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] };
    case 'SET_FILES':
      return { ...state, files: action.payload };
    default:
      return state;
  }
};

const FileContext = createContext<{ state: State; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

const FileProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <FileContext.Provider value={{ state, dispatch }}>{children}</FileContext.Provider>;
};

export { FileContext, FileProvider };