import { useState } from "react";
import LoginWrapper from "./LoginWrapper";
import { toast } from "sonner";
import OtpInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance"; // import axios instance

interface OtpChangeEvent {
  (value: string): void;
}

const LoginMainPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("phone");
  const [bgColors, setBgColors] = useState(Array(6).fill("#FFFFFF"));
  const [borderColors, setBorderColors] = useState(Array(6).fill("#ccc"));
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setIsLoading(true); // Set loading to true

    try {
      // Make API call to send OTP
      const response = await api.post("/api/v1/accounts/send-otp/", { phone });
      setVerificationId(response.data.verificationId);
      toast.success(`OTP sent to +91 ${phone}`);
      setStep("otp");
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state after the request is complete
    }
  };

  const handleOtpChange: OtpChangeEvent = (value) => {
    setOtp(value);

    const updatedBg: string[] = value
      .split("")
      .map((digit: string) => (digit ? "#FFF2EC" : "#FFFFFF"));
    const updatedBorder: string[] = value
      .split("")
      .map((digit: string) => (digit ? "#f37b4c" : "#ccc"));

    setBgColors([...updatedBg, ...Array(6 - updatedBg.length).fill("#FFFFFF")]);
    setBorderColors([
      ...updatedBorder,
      ...Array(6 - updatedBorder.length).fill("#ccc"),
    ]);
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{4}$/.test(otp)) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }
    setError("");
    setIsLoading(true); // Set loading to true

    try {
      // Make API call to verify OTP
      const response = await api.post("/api/v1/accounts/verify-otp/", {
        otp,
        phone,
        verificationId,
      });

      // Store tokens in local storage
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      toast.success("OTP verified!");
      navigate("/form-questions");
    } catch (error) {
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state after the request is complete
    }
  };

  return (
    <LoginWrapper>
      <div className="flex-1 px-6 py-4 text-center bg-white font-poppins">
        <h1 className="text-3xl font-semibold mb-2 leading-snug text-black">
          Join the fortune <br /> find your buddies
        </h1>

        {step === "phone" && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Sign Up Now & Dine with New Friends!
            </p>

            <div className="flex items-center w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-full px-5 py-3 shadow-md transition focus-within:ring-2 focus-within:ring-orange-400">
              <span className="text-xl mr-2">🇮🇳</span>
              <span className="text-gray-700 font-medium mr-3">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="Enter your phone number"
                className="w-full bg-transparent text-base text-gray-800 placeholder-gray-400 outline-none tracking-wide"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={handleContinue}
              className="cursor-pointer mt-6 bg-[#f37b4c] hover:bg-[#e86a3c] text-white font-semibold w-full max-w-sm py-3 rounded-full shadow"
            >
              {isLoading ? "Sending OTP..." : "Continue"}{" "}
              {/* Display loading text */}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="text-sm text-gray-700 mb-4">
              Enter the 6-digit OTP sent to <strong>+91 {phone}</strong>
            </p>

            <div className="flex flex-col items-center gap-3">
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                numInputs={4}
                inputType="tel"
                containerStyle={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  marginBottom: "8px",
                }}
                renderInput={(props, index) => (
                  <input
                    {...props}
                    style={{
                      width: "52px",
                      height: "53px",
                      borderRadius: "4px",
                      border: `1px solid ${borderColors[index]}`,
                      backgroundColor: bgColors[index],
                      textAlign: "center",
                      fontSize: "18px",
                      fontWeight: "500",
                      color: "#2B2C2D",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                )}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                className="cursor-pointer bg-[#f37b4c] hover:bg-[#e86a3c] text-white font-semibold w-[105px] h-[43px] rounded-full shadow"
              >
                {isLoading ? "Verifying..." : "Verify"}{" "}
                {/* Display loading text */}
              </button>
            </div>
          </>
        )}

        <p className="text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-semibold underline text-black">
            Log In!
          </a>
        </p>
      </div>
    </LoginWrapper>
  );
};

export default LoginMainPage;
