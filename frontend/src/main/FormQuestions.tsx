import { useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define the form structure
interface FormData {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  meetupLocation: string;
  preferredTime: string;
  plusOne: string;
  languages: string[];
  occupation: string;
  mealPreference: string;
  venuePreference: string;
  budget: string;
  groupActivities: string;
  pets: string;
  weekends: string[];
  hobbies: string[];
  movies: string[];
  music: string[];
  cuisine: string[];
}

interface MultiSelectProps {
  options: string[];
  field: keyof FormData;
}

interface CounterProps {
  field: keyof Pick<
    FormData,
    "languages" | "weekends" | "hobbies" | "movies" | "music" | "cuisine"
  >;
}

export default function MeetupForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    age: "",
    gender: "",
    meetupLocation: "",
    preferredTime: "",
    plusOne: "",
    languages: [],
    occupation: "",
    mealPreference: "",
    venuePreference: "",
    budget: "",
    groupActivities: "",
    pets: "",
    weekends: [],
    hobbies: [],
    movies: [],
    music: [],
    cuisine: [],
  });

  const meetupLocations = ["Coffee Shop", "Restaurant", "Bar", "Park", "Mall"];
  const preferredTimes = ["Morning", "Afternoon", "Evening", "Night"];
  const languageOptions = [
    "English",
    "Spanish",
    "French",
    "German",
    "Hindi",
    "Chinese",
    "Japanese",
    "Korean",
    "Russian",
    "Arabic",
  ];
  const occupationOptions = [
    "Undergraduate",
    "Postgraduate",
    "Working Professional",
    "Entrepreneur",
    "Self-Employed",
    "Taking a break",
  ];
  const weekendOptions = [
    "Outdoor activities",
    "Staying in",
    "Shopping",
    "Traveling",
    "Reading",
    "Cooking",
    "Exercising",
    "Visiting friends/family",
  ];
  const hobbyOptions = [
    "Reading",
    "Gaming",
    "Cooking",
    "Gardening",
    "Photography",
    "Painting",
    "Hiking",
    "Swimming",
    "Cycling",
    "Music",
    "Dancing",
    "Writing",
  ];
  const movieOptions = [
    "Action",
    "Comedy",
    "Drama",
    "Romance",
    "Thriller",
    "Horror",
    "Sci-Fi",
    "Fantasy",
    "Documentary",
    "Animation",
  ];
  const musicOptions = [
    "Pop",
    "Rock",
    "Jazz",
    "Classical",
    "Hip Hop",
    "Electronic",
    "Country",
    "R&B",
    "Metal",
    "Folk",
  ];
  const cuisineOptions = [
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Japanese",
    "Thai",
    "French",
    "Mediterranean",
    "American",
    "Middle Eastern",
  ];

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    const current = formData[field] as string[];
    setFormData((prev) => ({
      ...prev,
      [field]: current.includes(value)
        ? current.filter((v) => v !== value)
        : current.length < 3
        ? [...current, value]
        : current,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // Proceed to payment step
  };

  const handleRazorpay = () => {
    navigate("/thank-you");
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const ProgressBar = () => {
    const totalSteps = 6;
    const progress = (step / totalSteps) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 mb-6">
        <div
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const MultiSelectOptions = ({ options, field }: MultiSelectProps) => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {options.map((option) => (
        <div
          key={option}
          onClick={() => handleMultiSelect(field, option)}
          className={`px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between ${
            (formData[field] as string[]).includes(option)
              ? "bg-orange-500 text-white border-orange-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
          }`}
        >
          <span>{option}</span>
          {(formData[field] as string[]).includes(option) && (
            <Check size={16} />
          )}
        </div>
      ))}
    </div>
  );

  const MultiSelectCounter = ({ field }: CounterProps) => (
    <div className="text-sm text-gray-500 mt-1">
      {(formData[field] as string[]).length}/3 selected
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-poppins">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-orange-300 to-transparent z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <div className="text-2xl font-bold">FB</div>
          </div>
          <h1 className="text-3xl font-bold text-center">
            {/* FortuneBuddies: Where Friendships Begin! */}
            Join the Fortune, Find Your Buddies!
          </h1>
          <p className="text-orange-400 mt-2 text-center">
            Let's get to know you better!
          </p>
          <ProgressBar />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
                Personal Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium mb-1"
                  >
                    Can we get your full name please?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your full name"
                  />
                </div>

                {formData.fullName && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      Hi {formData.fullName.split(" ")[0]}, what's your email
                      address? <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="age"
                    className="block text-sm font-medium mb-1"
                  >
                    What is your age? <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="18"
                    max="100"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    What is your gender?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.gender === "male"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.gender === "male" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.gender === "female"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.gender === "female" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Meetup Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
                Meetup Preferences
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="meetupLocation"
                    className="block text-sm font-medium mb-1"
                  >
                    Where would you like to meet?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <select
                    id="meetupLocation"
                    name="meetupLocation"
                    value={formData.meetupLocation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                  >
                    <option value="" disabled>
                      Select a location
                    </option>
                    {meetupLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="preferredTime"
                    className="block text-sm font-medium mb-1"
                  >
                    Preferred time for meetup?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                  >
                    <option value="" disabled>
                      Select a time
                    </option>
                    {preferredTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Note: Time options are managed in the admin panel
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Couples: Would you like to get a plus one?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="plusOne"
                        value="yes"
                        checked={formData.plusOne === "yes"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.plusOne === "yes"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.plusOne === "yes" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="plusOne"
                        value="no"
                        checked={formData.plusOne === "no"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.plusOne === "no"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.plusOne === "no" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    What languages do you speak?{" "}
                    <span className="text-orange-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">
                      (Select up to 3)
                    </span>
                  </label>
                  <MultiSelectOptions
                    options={languageOptions}
                    field="languages"
                  />
                  <MultiSelectCounter field="languages" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Personal Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
                About You
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="occupation"
                    className="block text-sm font-medium mb-1"
                  >
                    What is your occupation?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <select
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                  >
                    <option value="" disabled>
                      Select your occupation
                    </option>
                    {occupationOptions.map((occupation) => (
                      <option key={occupation} value={occupation}>
                        {occupation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meal Preference <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="mealPreference"
                        value="veg"
                        checked={formData.mealPreference === "veg"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.mealPreference === "veg"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.mealPreference === "veg" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">Vegetarian</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="mealPreference"
                        value="non-veg"
                        checked={formData.mealPreference === "non-veg"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.mealPreference === "non-veg"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.mealPreference === "non-veg" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">Non-Vegetarian</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Venue Preference <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="venuePreference"
                        value="food-alcohol"
                        checked={formData.venuePreference === "food-alcohol"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.venuePreference === "food-alcohol"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.venuePreference === "food-alcohol" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">Food & Alcohol</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="venuePreference"
                        value="food-only"
                        checked={formData.venuePreference === "food-only"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          formData.venuePreference === "food-only"
                            ? "bg-orange-500 border-orange-600"
                            : "bg-gray-700 border-gray-500"
                        } flex items-center justify-center`}
                      >
                        {formData.venuePreference === "food-only" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2">Food Only</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    What is your budget for the night out?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label
                      className={`cursor-pointer border p-3 rounded-lg text-center ${
                        formData.budget === "₹"
                          ? "bg-orange-500 border-orange-600 text-white"
                          : "border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value="₹"
                        checked={formData.budget === "₹"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span>₹</span>
                      <p className="text-xs mt-1">Budget</p>
                    </label>
                    <label
                      className={`cursor-pointer border p-3 rounded-lg text-center ${
                        formData.budget === "₹₹"
                          ? "bg-orange-500 border-orange-600 text-white"
                          : "border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value="₹₹"
                        checked={formData.budget === "₹₹"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span>₹₹</span>
                      <p className="text-xs mt-1">Moderate</p>
                    </label>
                    <label
                      className={`cursor-pointer border p-3 rounded-lg text-center ${
                        formData.budget === "₹₹₹"
                          ? "bg-orange-500 border-orange-600 text-white"
                          : "border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value="₹₹₹"
                        checked={formData.budget === "₹₹₹"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span>₹₹₹</span>
                      <p className="text-xs mt-1">Premium</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Activities & Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
                Activities & Interests
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    In a group setting what activities do you enjoy?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Dancing/Clubs",
                      "Games/Sports",
                      "Just Chatting",
                      "Karaoke and Live Music",
                    ].map((activity) => (
                      <label
                        key={activity}
                        className={`cursor-pointer border p-3 rounded-lg ${
                          formData.groupActivities === activity
                            ? "bg-orange-500 border-orange-600 text-white"
                            : "border-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="groupActivities"
                          value={activity}
                          checked={formData.groupActivities === activity}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        {activity}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Do you have any pets?{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Cats", "Dogs", "None"].map((pet) => (
                      <label
                        key={pet}
                        className={`cursor-pointer border p-3 rounded-lg text-center ${
                          formData.pets === pet
                            ? "bg-orange-500 border-orange-600 text-white"
                            : "border-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pets"
                          value={pet}
                          checked={formData.pets === pet}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        {pet}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    How do you ideally spend your weekends?{" "}
                    <span className="text-orange-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">
                      (Select up to 3)
                    </span>
                  </label>
                  <MultiSelectOptions
                    options={weekendOptions}
                    field="weekends"
                  />
                  <MultiSelectCounter field="weekends" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Entertainment & Food Preferences */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
                Entertainment & Food
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    What are your top hobbies?{" "}
                    <span className="text-orange-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">
                      (Select up to 3)
                    </span>
                  </label>
                  <MultiSelectOptions options={hobbyOptions} field="hobbies" />
                  <MultiSelectCounter field="hobbies" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    What type of movies do you enjoy watching?{" "}
                    <span className="text-orange-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">
                      (Select up to 3)
                    </span>
                  </label>
                  <MultiSelectOptions options={movieOptions} field="movies" />
                  <MultiSelectCounter field="movies" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    What type of music do you enjoy?{" "}
                    <span className="text-orange-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">
                      (Select up to 3)
                    </span>
                  </label>
                  <MultiSelectOptions options={musicOptions} field="music" />
                  <MultiSelectCounter field="music" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    What is your favourite type of cuisine?{" "}
                    <span className="text-orange-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">
                      (Select up to 3)
                    </span>
                  </label>
                  <MultiSelectOptions
                    options={cuisineOptions}
                    field="cuisine"
                  />
                  <MultiSelectCounter field="cuisine" />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
                Step 6: Complete Payment
              </h2>
              <p className="text-gray-300">
                Please proceed to pay ₹99 to confirm your Meetup registration.{" "}
                <br />
                Your group details will be messaged on your phone number
              </p>
              <button
                type="button"
                onClick={handleRazorpay}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
              >
                Pay Now
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="ml-1">Previous</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 && (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center hover:bg-orange-600 transition-colors"
              >
                <span className="mr-1">Next</span>
                <ChevronRight size={16} />
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    // const res = await fetch("/api/save-meetup-form", {
                    //   method: "POST",
                    //   headers: {
                    //     "Content-Type": "application/json",
                    //   },
                    //   body: JSON.stringify(formData),
                    // });

                    // if (!res.ok) {
                    //   throw new Error("Failed to submit form");
                    // }

                    // const result = await res.json();
                    // console.log("Form submitted:", result);
                    setStep(6); // Go to Payment step
                  } catch (error) {
                    console.error(error);
                    alert("Error submitting form. Please try again.");
                  }
                }}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg flex items-center hover:bg-orange-600 transition-colors"
              >
                <span className="mr-1">Continue to Payment</span>
              </button>
            )}
          </div>
        </form>

        {/* Form Step Indicator */}
        <div className="mt-6 flex justify-center">
          {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 mx-1 rounded-full ${
                step === stepNumber ? "bg-orange-500" : "bg-gray-600"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
