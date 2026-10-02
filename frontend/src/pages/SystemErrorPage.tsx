import { useNavigate, useSearchParams } from "react-router-dom";

export default function SystemErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");

  const getTitle = () => {
    if (status === "network") {
      return "Connection Error";
    }

    if (status === "404") {
      return "Page Not Found";
    }

    if (status === "400") {
      return "Request Error";
    }

    if (status === "500") {
      return "Server Error";
    }

    return "System Error";
  };

  const getMessage = () => {
    if (status === "network") {
      return "Unable to connect to the Vandristi backend.";
    }

    if (status === "400") {
      return "The system received an invalid request.";
    }

    if (status === "500") {
      return "The Vandristi backend encountered an unexpected error.";
    }

    return "Something went wrong while loading the system.";
  };

  return (
    <div className="min-h-screen bg-[#06111a] text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">

        <div className="text-7xl font-bold text-emerald-400 mb-4">
          {status === "network" ? "!" : status || "500"}
        </div>

        <h1 className="text-3xl font-bold mb-4">
          {getTitle()}
        </h1>

        <p className="text-slate-400 mb-8">
          {getMessage()}
        </p>

        <div className="flex justify-center gap-4">

          <button
            onClick={() => window.location.reload()}
            className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
          >
            Retry
          </button>

          <button
            onClick={() => navigate("/app/dashboard")}
            className="px-5 py-3 rounded-lg border border-slate-600 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    </div>
  );
}