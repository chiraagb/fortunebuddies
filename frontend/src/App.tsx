// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginHomePage from "./auth/LoginHomePage";
import LoginMainPage from "./auth/LoginMainPage";
import FormQuestions from "./main/FormQuestions";
import ThankYou from "./main/ThankYouPage";
import PrivateRoute from "./PrivateRoute";
import TermsAndConditions from "./auth/TermsAndConditions";
import PrivacyPolicy from "./auth/PrivacyPolicy";
import ComeBackPage from "./main/ComeBackPage";

const App: React.FC = () => (
  <>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route index element={<LoginHomePage />} />
        <Route path="login" element={<LoginMainPage />} />

        {/* All routes under here are protected */}
        <Route element={<PrivateRoute />}>
          <Route path="form-questions" element={<FormQuestions />} />
          <Route path="thank-you" element={<ThankYou />} />
          <Route path="comeback" element={<ComeBackPage />} />
        </Route>

        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
