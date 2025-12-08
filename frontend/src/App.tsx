import { useState, type FormEvent } from "react";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:8000";

function App() {
  const [equation, setEquation] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEquation = equation.trim();
    if (!trimmedEquation) {
      setError("Please enter an equation.");
      setResult("");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/solve?equation=${encodeURIComponent(trimmedEquation)}`
      );
      const data: { result?: string; error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }
      setResult(data.result || "");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-1 mb-4">
        <h1 className="text-2xl font-semibold text-slate-900 m-0">
          Solve equation
        </h1>
      </header>
      <form onSubmit={handleSubmit} className="space-y-2">
        <label
          className="block text-sm font-medium text-slate-900"
          htmlFor="equation"
        >
          Single-Variable Equation (x)
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="equation"
            type="text"
            name="equation"
            placeholder="x^2 + 2x - 10 = 14"
            value={equation}
            onChange={(event) => setEquation(event.target.value)}
            aria-label="Equation"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Solving…" : "Solve"}
          </button>
        </div>
      </form>

      <div className="mt-4 min-h-[48px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        {result && (
          <p className="m-0 text-sm font-semibold text-emerald-700">{result}</p>
        )}
        {error && (
          <p className="m-0 text-sm font-semibold text-red-700">{error}</p>
        )}
        {!result && !error && (
          <p className="m-0 text-sm text-slate-600">No response yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
