import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const checkSystem = async () => {
    try {
      setStatus("Loading...");
      setError("");

      const healthRes = await fetch("http://localhost:3000/api/health");
      if (!healthRes.ok) throw new Error("Unable to connect to TokTickIT API");

      const categoriesRes = await fetch("http://localhost:3000/api/categories");
      if (!categoriesRes.ok) throw new Error("Unable to load categories");

      const healthData = await healthRes.json();
      const categoriesData = await categoriesRes.json();

      setStatus(`System Status: Online (${healthData.service})`);
      setCategories(categoriesData.map((c: { name: string }) => c.name));
    } catch (err) {
      setStatus("");
      setError("System Status: Offline - Unable to connect to TokTickIT API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>TokTickIT IT Service Desk</h2>

      <button className="btn btn-primary my-3" onClick={checkSystem}>
        [Check System]
      </button>

      {loading && <div className="alert alert-info">Loading...</div>}

      {status && <div className="alert alert-success">{status}</div>}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && categories.length > 0 && (
        <div>
          <h4>Supported Request Categories</h4>
          <ul>
            {categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
