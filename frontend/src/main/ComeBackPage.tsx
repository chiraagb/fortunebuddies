import { useLocation } from "react-router-dom";

const ComeBackPage = () => {
  const location = useLocation();
  const nextAllowedSubmission = location.state?.nextAllowedSubmission;

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4 font-poppins">
      <section className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">
          🎉 Thank You!
        </h1>
        <p className="mb-2">We've received your meetup registration.</p>

        {nextAllowedSubmission && (
          <>
            <p className="text-sm text-gray-300">
              ⏳ You can register again after:{" "}
              <span className="text-orange-400 font-semibold">
                {nextAllowedSubmission}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-3 italic">
              Great things take time — hang tight, we'll see you again soon! 🚀
            </p>
            <p className="text-sm text-gray-500 italic">
              Your next chance is just around the corner. Stay tuned! 🔔
            </p>
          </>
        )}
      </section>
    </main>
  );
};

export default ComeBackPage;
