import { BrowserRouter, Route, Routes } from "react-router-dom";
import EnterPhoneNumber from "./auth/EnterPhoneNumber";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnterPhoneNumber />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
