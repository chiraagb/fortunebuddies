export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 font-poppins">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">
          🎉 Thank You!
        </h1>
        <p className="text-lg mb-2">Your payment was successful.</p>
        <p>We’ve received your Meetup registration.</p>
        <p>Your group details will be messaged on your phone number</p>
      </div>
    </div>
  );
}
