import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginWrapper = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (token) {
      navigate("/form-questions");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins">
      {/* 🔪 Shared Background Image Section */}
      <div
        className="relative h-[50vh] w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/dinner.jpg')" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* 📱 Page-specific content */}
      <div className="flex-1 px-6 pt-10 pb-10 text-center bg-white">
        {children}
      </div>
    </div>
  );
};

export default LoginWrapper;
