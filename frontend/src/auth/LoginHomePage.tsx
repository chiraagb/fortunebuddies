import { useNavigate } from "react-router-dom";
import LoginWrapper from "./LoginWrapper";
import { MdPhoneIphone } from "react-icons/md";

const LoginHomePage = () => {
  const navigate = useNavigate();

  return (
    <LoginWrapper>
      <div className="flex-1 px-6 pt-10 pb-10 text-center bg-white">
        <h1 className="text-3xl font-semibold mb-2 leading-snug text-black">
          Join us now & eat <br /> with confidence
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Sign Up Now & Dine with New Friends!
        </p>

        {/* 🎯 Button */}
        <button
          onClick={() => navigate("/login")}
          className="my-3 w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-[#f37b4c] hover:bg-[#e86a3c] text-white font-semibold py-3 rounded-full shadow transition duration-200 cursor-pointer"
        >
          <MdPhoneIphone className="text-xl" />
          <span>Continue with Mobile Number</span>
        </button>

        {/* 🔐 Login link */}
        <p className="text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-semibold underline text-black">
            Log In!
          </a>
        </p>
      </div>
    </LoginWrapper>
  );
};

export default LoginHomePage;
