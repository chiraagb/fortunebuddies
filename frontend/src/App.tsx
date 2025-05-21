import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginHomePage from "./auth/LoginHomePage";
import LoginMainPage from "./auth/LoginMainPage";
import FormQuestions from "./main/FormQuestions";
import ThankYou from "./main/ThankYouPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginHomePage />} />
        <Route path="/login" element={<LoginMainPage />} />
        <Route path="/form-questions" element={<FormQuestions />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
