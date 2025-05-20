import LoginWrapper from "./LoginWrapper";

const EnterPhoneNumber = () => {
  return (
    <>
      <LoginWrapper>
        {/* 📱 Content */}
        <div className="flex-1 px-6 pt-10 pb-10 text-center bg-white">
          <h1 className="text-3xl font-semibold mb-2 leading-snug text-black">
            Join us now & eat <br /> with confidence
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Sign Up Now & Dine with New Friends!
          </p>

          {/* 📞 Phone input */}
          <div className="flex items-center w-full max-w-sm mx-auto border rounded-full px-4 py-3 bg-white shadow">
            <span className="text-gray-700 text-sm mr-2">+91</span>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="w-full outline-none border-none text-sm bg-transparent"
            />
          </div>

          {/* 🎯 Button */}
          <button className="mt-6 bg-[#f37b4c] hover:bg-[#e86a3c] text-white font-semibold w-full max-w-sm py-3 rounded-full shadow">
            Continue
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
    </>
  );
};
export default EnterPhoneNumber;
