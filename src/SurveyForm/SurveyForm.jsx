import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { InputOtp } from "primereact/inputotp";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Smartphone,
  Mail,
  User,
  Send,
  RefreshCw,
  Sparkles,
  Phone,
  MessageCircle,
  Lock,
  Clock,
  Zap,
  Activity,
  Target,
  Locate,
  LocationEdit,
  AlignEndHorizontal,
} from "lucide-react";

import {
  saveSurveyForm,
  sendOtp,
  verifyOtp,
  getModel,
  getModelPublic,
} from "@/apis/manageuser/manageuser";

import UniversalTextArea from "@/components/common/UniversalTextArea";
import UniversalButton from "@/components/common/UniversalButton";
import InputField from "@/components/common/InputField";
import DropdownWithSearch from "@/components/common/DropdownWithSearch";
import UniversalRadioButton from "@/components/common/UniversalRadioButton";
import Verify from "@/assets/animation/Verify.json";
import Marketing from "@/assets/animation/Marketing.json";
import Consulting from "@/assets/animation/Consulting.json";
import Lottie from "lottie-react";
import Loader from "@/components/loaders/Loader";
import { FaYammer } from "react-icons/fa";

// --- NEW COMPONENT: SUBMISSION OVERLAY ---
const SubmissionOverlay = ({ isSubmitting }) => {
  return (
    <AnimatePresence>
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-64 h-64"
          >
            <Lottie animationData={Verify} loop={false} autoplay />
          </motion.div>
          <h2 className="text-4xl font-extrabold text-blue-600 mt-6 playf animate-pulse">
            Submitting Feedback...
          </h2>
          <p className="text-xl text-gray-600 mt-2 text-center">
            One moment, we're securely processing your response.
          </p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mt-8"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SurveyForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [otpId, setOtpId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [brandList, setBrandList] = useState([]);
  const [toggleValue, setToggleValue] = useState(false);
  const [isPurchase, setIsPurchase] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (isPurchase) {
      setFormData((prev) => ({ ...prev, type: "" }));
    } else {
      setFormData((prev) => ({ ...prev, brand_id: "" }));
    }
  }, [isPurchase]);

  const [formData, setFormData] = useState({
    consumer_name: "",
    contact_number: "",
    pincode: "",
    brand_id: "",
    gender: "",
    type: "",
    age: "",
  });

  const genderList = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      setInvalidToken(false);
    } else {
      setInvalidToken(true);
      toast.error("Invalid or missing token. Please use a valid link.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.contact_number.trim()) {
      setErrors((prev) => ({
        ...prev,
        contact_number: "Contact number is required",
      }));
      return;
    }
    if (!/^\d{10}$/.test(formData.contact_number)) {
      setErrors((prev) => ({
        ...prev,
        contact_number: "Enter a valid 10-digit number",
      }));
      return;
    }

    setLoadingOtp(true);
    try {
      const res = await sendOtp({ mobile: formData.contact_number });
      if (res?.status) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
        setOtpId(res.otpId); // <-- STORE OTP ID
        setTimer(30); // <-- START TIMER
      } else {
        toast.error(res?.message || "Failed to send OTP");
      }
    } catch (err) {
      const networkErrorMessage =
        err?.message || "Failed to send OTP. Please check your connection.";
      toast.error(networkErrorMessage);
    } finally {
      setLoadingOtp(false);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await getModelPublic();

      if (res?.status === true) {
        setBrandList(
          res?.data?.map((item) => ({
            label: item.name,
            value: item.id,
          })) || []
        );
      } else {
        toast.error(res?.message || "Failed to load brands");
      }
    } catch (err) {
      console.error("fetchBrands", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Unexpected error"
      );
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch brands if a token is present
    if (token) {
      fetchModels();
    } else if (invalidToken) {
      // If token is explicitly invalid, stop loading right away
      setInitialLoading(false);
    }
  }, [token, invalidToken]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 5) {
      toast.error("Enter 5-digit OTP");
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await verifyOtp({
        mobile: formData.contact_number,
        otp,
        otpId, // <-- PASS OTP ID
      });
      if (res?.status) {
        setOtpVerified(true);
        toast.success("Mobile number verified successfully!");
      } else {
        toast.error(res?.message || "Invalid OTP");
      }
    } catch (err) {
      //   toast.error("OTP verification failed");
      const networkErrorMessage =
        err?.message || "Failed to send OTP. Please check your connection.";
      toast.error(networkErrorMessage);
    } finally {
      setLoadingVerify(false);
    }
  };

  const validateAndSubmit = async () => {
    setErrors({}); // Clear previous errors

    // Step-by-step validation with single toast per error
    if (!formData.consumer_name.trim()) {
      setErrors({ consumer_name: "Name required" });
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.contact_number.trim()) {
      setErrors({ contact_number: "Mobile number required" });
      toast.error("Please enter your mobile number");
      return;
    }

    if (!/^\d{10}$/.test(formData.contact_number.trim())) {
      setErrors({ contact_number: "Invalid mobile number" });
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    // if (!otpVerified) {
    //   setErrors({ contact_number: "Verify mobile number" });
    //   toast.error("Please verify your mobile number with OTP");
    //   return;
    // }

    if (!formData.gender.trim()) {
      setErrors({ gender: "Gender required" });
      toast.error("Please select your gender");
      return;
    }

    if (isPurchase === null) {
      toast.error("Please choose feedback type");
      return;
    }

    if (!formData.brand_id) {
      setErrors({ brand_id: "Brand is required" });
      toast.error("Please select an interested brand");
      return;
    }

    // if (isPurchase === false && !formData.type.trim()) {
    //   setErrors({ type: "Feedback required" });
    //   toast.error("Please enter your feedback");
    //   return;
    // }
    // if (formData?.age) {
    //   setErrors({ age: "Age required" });
    //   toast.error("Please enter your age");
    //   return;
    // }

    // All valid → submit
    setSubmitting(true);
    try {
      const res = await saveSurveyForm({
        token,
        ...formData,
      });
      if (res?.status) {
        // await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Thank you! Your response has been recorded.");
        navigate("/thank-you", {
          replace: true,
          state: { consumer_name: formData.consumer_name },
        });
      } else {
        toast.error(res?.message || "Submission failed");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to Submit. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return <Loader />;
  }

  if (invalidToken || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-red-600">Invalid Link</h2>
          <p className="text-gray-600 mt-3">
            This survey link is not valid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <SubmissionOverlay isSubmitting={submitting} />

      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <motion.div
          animate={{ y: [0, -40, 0], rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-5 w-[450px] h-[450px] bg-blue-300/30 rounded-full blur-[100px]"
        />

        <motion.div
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-5 w-[550px] h-[550px] bg-indigo-300/20 rounded-full blur-[120px]"
        />

        <motion.div
          animate={{ x: [-30, 30, -30] }}
          transition={{ duration: 35, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[110px] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="text-center space-y-8">
              {/* <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Phone className="w-32 h-32 mx-auto text-blue-600" />
              </motion.div> */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                className="mx-auto w-80 h-62"
              >
                <Lottie animationData={Consulting} loop autoplay />
              </motion.div>

              <div>
                <h1 className="text-6xl font-extrabold text-gray-800 leading-tight playf">
                  We Value Your
                  <br />
                  <p className="text-gray-700 font-medium flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6 text-sky-600" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500  to-indigo-700 playf">
                      Feedback
                    </span>
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </p>
                </h1>
                <p className="text-2xl text-gray-600 mt-6 playf">
                  Help us improve your experience with vivo products
                </p>
              </div>
              <div className="flex justify-center gap-6 mt-10">
                {/* 1. Quick & Easy */}
                <motion.div
                  // Entrance: Start below (y: 30) and fade in
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: 1,
                    y: [0, -5, 0], // Infinite floating animation
                  }}
                  transition={{
                    // Staggered delay for entrance
                    delay: 0.2,
                    duration: 0.6,
                    // Float animation settings
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
                  }}
                  className="text-center p-4 rounded-full border border-blue-200 bg-blue-50/50 shadow-md"
                >
                  <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-blue-700 whitespace-nowrap">
                    Quick & Easy
                  </p>
                </motion.div>

                {/* 2. Your Voice Matters */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: 1,
                    y: [0, 5, 0], // Infinite floating animation (opposite direction for contrast)
                  }}
                  transition={{
                    delay: 0.4,
                    duration: 0.6,
                    y: {
                      duration: 4.5, // Slightly different speed
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
                  }}
                  className="text-center p-4 rounded-full border border-indigo-200 bg-indigo-50/50 shadow-md"
                >
                  <MessageCircle className="w-8 h-8 text-indigo-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-indigo-700 whitespace-nowrap">
                    Your Voice Matters
                  </p>
                </motion.div>

                {/* 3. Secure & Private */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: 1,
                    y: [0, -4, 0], // Infinite floating animation
                  }}
                  transition={{
                    delay: 0.6,
                    duration: 0.6,
                    y: {
                      duration: 3.8, // Slightly different speed
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
                  }}
                  className="text-center p-4 rounded-full border border-purple-200 bg-purple-50/50 shadow-md"
                >
                  <Lock className="w-8 h-8 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-700 whitespace-nowrap">
                    Secure & Private
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:max-w-lg"
          >
            <div className="flex items-center justify-center relative">
              <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 w-[99.4%] absolute z-[9999] top-0 rounded-t-full" />
            </div>
            <div className="bg-white/95 backdrop-blur-2xl rounded-t-2xl rounded-b-3xl shadow-2xl border border-white/60 p-4  md:p-10  ">
              <div className="text-center">
                <img
                  src="/vivologonew.png"
                  alt="vivo"
                  className="h-14 mx-auto mb-4"
                />
              </div>
              <div className="text-center mb-5 ">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-gray-800 playf">
                    Customer Feedback
                  </h2>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 mt-7 text-sm text-gray-600">
                  <div className="flex  items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>100% Anonymous</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    <span>Secure & Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>2 Minutes Only</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col  ">
                {/* Form fields same as before but cleaner */}

                <InputField
                  label="Full Name"
                  placeholder="Enter your name"
                  value={formData.consumer_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      consumer_name: e.target.value,
                    }))
                  }
                  icon={<User className="w-5 h-5 text-gray-500" />}
                />

                <div className="space-y-4 w-full ">
                  <InputField
                    label="Mobile Number"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_number: e.target.value,
                      }))
                    }
                    icon={<Smartphone className="w-5 h-5 text-gray-500" />}
                    // disabled={otpVerified}
                  />

                  {/* {!otpVerified && otpSent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200"
                    >
                      <p className="text-center text-emerald-800 font-medium mb-4">
                        Enter OTP
                      </p>
                      <div className="flex justify-center gap-3 mb-5">
                        <InputOtp
                          value={otp}
                          onChange={(e) => setOtp(e.value)}
                          length={5}
                          integerOnly
                          inputStyle={{
                            width: "3.2rem",
                            height: "3.2rem",
                            fontSize: "1.4rem",
                            borderRadius: "12px",
                          }}
                        />
                      </div>
                      <UniversalButton
                        label={loadingVerify ? "Verifying..." : "Verify OTP"}
                        icon={
                          loadingVerify ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )
                        }
                        onClick={handleVerifyOtp}
                        disabled={loadingVerify || otp.length !== 5}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      />
                      {timer > 0 ? (
                        <p className="text-center text-xs text-gray-600 mt-3">
                          Resend in {timer}s
                        </p>
                      ) : (
                        <button
                          onClick={handleSendOtp}
                          className="block mx-auto mt-3 text-emerald-600 font-medium underline text-sm"
                        >
                          Resend OTP
                        </button>
                      )}
                    </motion.div>
                  ) : !otpVerified ? (
                    <UniversalButton
                      label={loadingOtp ? "Sending..." : "Send OTP"}
                      onClick={handleSendOtp}
                      disabled={loadingOtp}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-6 h-6" />
                      Verified Successfully
                    </div>
                  )} */}
                </div>
                <InputField
                  label="Enter Your Age"
                  placeholder="Enter your age"
                  value={formData?.age}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }))
                  }
                />
                <DropdownWithSearch
                  label="Select Gender"
                  placeholder="Select gender"
                  value={formData.gender}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, gender: v }))
                  }
                  options={genderList}
                />


                <InputField
                  label="Pincode"
                  type="pincode"
                  placeholder="98xxxx"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pincode: e.target.value }))
                  }
                  icon={<LocationEdit className="w-5 h-5 text-gray-500" />}
                />



                <DropdownWithSearch
                  label="Current Mobile Brand"
                  placeholder="Choose brand"
                  value={formData.brand_id}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, brand_id: v }))
                  }
                  options={brandList}
                  loading={loading}
                />



                <UniversalButton
                  label={submitting ? "Submitting..." : "Submit Feedback"}
                  icon={<Send className="w-5 h-5" />}
                  onClick={validateAndSubmit}
                  disabled={submitting}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-xl"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <p className="text-lg font-bold text-gray-800">
                  Yingjia Communication Pvt. Ltd.
                </p>
                <p className="text-sm text-gray-600">
                  Official Partner • Powered by{" "}
                  <span className="font-bold text-blue-600">vivo</span>
                </p>
                <p className="text-xs text-gray-400 mt-5">
                  © {new Date().getFullYear()} All rights reserved.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
