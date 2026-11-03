import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";

const complainform = ({
  onSubmitComplaint,
  onBack,
  onViewStatus,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      customerId: "",
      customerName: "",
      category: "",
      description: "",
    },
  });
  const navigate = useNavigate();

  const description = watch("description");

  const onSubmit = async (data) => {
    try {
      if (onSubmitComplaint) {
        await onSubmitComplaint(data);
        reset();
      }
    } catch (error) {
      console.error("Complaint submission failed:", error);
    }
  };

  const inputStyle =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelStyle =
    "mb-2 block text-base font-semibold text-slate-800";

  return (
    <div className="w-full space-y-5 p-3 sm:p-5 lg:p-6">
      {/* Top Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
        >
          <ArrowLeft size={20} />
          Back
        </button>

      {/* <button
  type="button"
  onClick={() => navigate("/complainstatus")}
  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
>
  <ClipboardList size={20} />
  Complaint Status
</button> */}
      </div>

      {/* Complaint Form */}
      <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Details */}
          <section>
            <div className="mb-5 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-3">
              <UserRound size={22} className="shrink-0 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-950 sm:text-xl">
                Customer Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelStyle}>
                  Customer Mob.{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Customer Mobile Number"
                  className={inputStyle}
                  {...register("customerId", {
                    required: "Customer Mobile Number is required",
                  })}
                />

                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.customerId.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelStyle}>
                  Customer Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter Customer Name"
                  className={inputStyle}
                  {...register("customerName", {
                    required: "Customer name is required",
                  })}
                />

                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.customerName.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Complaint Details */}
          <section>
            <div className="mb-5 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-3">
              <AlertTriangle size={22} className="shrink-0 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-950 sm:text-xl">
                Complaint Details
              </h2>
            </div>

            <div>
              <label className={labelStyle}>
                Complaint Category{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                className={inputStyle}
                {...register("category", {
                  required: "Please select a complaint category",
                })}
              >
                <option value="">Select Category</option>
                <option value="Profile Issue">Profile Issue</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Verification Badge Issue">
                  Verification Badge Issue
                </option>
                <option value="Advertisement Issue">
                  Advertisement Issue
                </option>
                <option value="Other">Other</option>
              </select>

              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label className={labelStyle}>
                Complaint Description{" "}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                rows={4}
                maxLength={500}
                placeholder="Describe the complaint in detail..."
                className={`${inputStyle} resize-y`}
                {...register("description", {
                  required: "Complaint description is required",
                  maxLength: {
                    value: 500,
                    message: "Maximum 500 characters allowed",
                  },
                })}
              />

              <div className="mt-1 flex items-center justify-between">
                {errors.description ? (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                ) : (
                  <span />
                )}

                <p className="text-sm text-slate-500">
                  {description?.length || 0} / 500
                </p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default complainform;