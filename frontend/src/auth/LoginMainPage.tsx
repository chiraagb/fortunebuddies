// src/auth/LoginMainPage.tsx
import { useState, useEffect, useTransition, type FormEvent } from "react";
import LoginWrapper from "./LoginWrapper";
import { toast } from "sonner";
import OtpInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
// import api from "../api/axiosInstance";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "../../firebase"; // your firebase init

type OtpChangeEvent = (v: string) => void;

const LoginMainPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [bgColors, setBg] = useState(Array(6).fill("#FFFFFF"));
  const [borderColors, setBd] = useState(Array(6).fill("#ccc"));
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /* ──────────────────────────────────────────────── reCAPTCHA */
  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response: any) => {
          // Callback function when reCAPTCHA is successfully verified
          console.log("reCAPTCHA verified!", response);
        },
      }
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, [auth]);

  useEffect(() => {
    const hasEnteredAllDigits = otp.length === 6;
    if (hasEnteredAllDigits) {
      handleVerifyOtp();
    }
  }, [otp]);

  /* ──────────────────────────────────────────────── send OTP */
  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setResendCountdown(60);
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    startTransition(async () => {
      setError("");
      if (!recaptchaVerifier) {
        return setError("RecaptchaVerifier is not initialized.");
      }
      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          `+91${phone}`,
          recaptchaVerifier
        );
        setConfirmationResult(confirmationResult);
        setSuccess("OTP sent successfully.");
        toast.success(`OTP sent to +91 ${phone}`);
        setStep("otp");
      } catch (err: any) {
        console.log(err);
        setResendCountdown(0);

        if (err.code === "auth/invalid-phone-number") {
          setError("Invalid phone number. Please check the number.");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many requests. Please try again later.");
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      }
    });
  };

  /* ──────────────────────────────────────────────── verify OTP */
  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    startTransition(async () => {
      setError("");
      try {
        await confirmationResult?.confirm(otp);
        navigate("/form-questions");
      } catch (err: any) {
        console.error(err);
        setError("OTP verification failed");
      }
    });
  };

  /* ──────────────────────────────────────────────── input helpers */
  const handleOtpChange: OtpChangeEvent = (v) => {
    setOtp(v);
    const bg = v.split("").map((d) => (d ? "#FFF2EC" : "#FFFFFF"));
    const bd = v.split("").map((d) => (d ? "#f37b4c" : "#ccc"));
    setBg([...bg, ...Array(6 - bg.length).fill("#FFFFFF")]);
    setBd([...bd, ...Array(6 - bd.length).fill("#ccc")]);
  };

  const loadingIndicator = (
    <div role="status" className="flex justify-center">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );

  /* ──────────────────────────────────────────────── UI */
  return (
    <LoginWrapper>
      <div id="recaptcha-container" />

      <div className="flex-1 px-6 py-4 text-center bg-white font-poppins">
        <h1 className="text-3xl font-semibold mb-2 leading-snug text-black">
          Join us now & eat <br /> with confidence
        </h1>

        {step === "phone" ? (
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
                className="w-full bg-transparent text-base text-gray-800 placeholder-gray-400 outline-none tracking-widest"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={() => requestOtp()}
              className="cursor-pointer mt-6 bg-[#f37b4c] hover:bg-[#e86a3c] text-white font-semibold w-full max-w-sm py-3 rounded-full shadow"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-4">
              Enter the 6-digit OTP sent to <strong>+91 {phone}</strong>
            </p>

            <div className="flex flex-col items-center gap-3">
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                numInputs={6}
                inputType="tel"
                containerStyle={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  marginBottom: "8px",
                }}
                renderInput={(props, i) => (
                  <input
                    {...props}
                    style={{
                      width: "52px",
                      height: "53px",
                      borderRadius: "4px",
                      border: `1px solid ${borderColors[i]}`,
                      backgroundColor: bgColors[i],
                      textAlign: "center",
                      fontSize: "18px",
                      fontWeight: 500,
                      color: "#2B2C2D",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                )}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}

              <button
                onClick={handleVerifyOtp}
                className="cursor-pointer bg-[#f37b4c] hover:bg-[#e86a3c] text-white font-semibold w-[105px] h-[43px] rounded-full shadow"
              >
                Verify
              </button>
              {isPending && loadingIndicator}
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
