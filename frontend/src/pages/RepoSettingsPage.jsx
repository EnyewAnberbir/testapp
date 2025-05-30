import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { repoService } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

function RepoSettingsPage() {
  const { repoId } = useParams(); // Assuming route is /repo/:repoId/settings
  const navigate = useNavigate();
  const { user } = useAuth();

  const [repoName, setRepoName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [codingStandards, setCodingStandards] = useState([""]);
  const [codeMetrics, setCodeMetrics] = useState([""]); // Initialize as array for multiple inputs
  const [llmPreference, setLlmPreference] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [githubID, setGithubID] = useState("");
  useEffect(() => {
    if (!repoId || !user) {
      setError("Repository ID is missing or user is not authenticated.");
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    repoService
      .getRepositoryDetails(repoId)
      .then((response) => {
        const data = response.data;
        setRepoName(data.repo_name || "");
        setRepoUrl(data.repo_url || "");
        setDescription(data.description || "");
        setGithubID(data.github_native_id || "");
        setCodingStandards(
          data.coding_standards && data.coding_standards.length > 0
            ? data.coding_standards
            : [""]
        );
        setCodeMetrics(
          data.code_metrics && data.code_metrics.length > 0
            ? data.code_metrics
            : [""]
        );
        setLlmPreference(data.llm_preference || "");
        setInitialLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching repository details:", err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to fetch repository details."
        );
        setInitialLoading(false);
      });
  }, [repoId, user]);

  // Handlers for Coding Standards
  const handleAddStandard = () => {
    setCodingStandards([...codingStandards, ""]);
  };

  const handleStandardChange = (index, value) => {
    const updatedStandards = [...codingStandards];
    updatedStandards[index] = value;
    setCodingStandards(updatedStandards);
  };

  const handleRemoveStandard = (index) => {
    if (codingStandards.length === 1 && index === 0) {
      // Keep at least one empty input if it's the last one
      setCodingStandards([""]);
      return;
    }
    const updatedStandards = codingStandards.filter((_, i) => i !== index);
    setCodingStandards(updatedStandards);
  };

  // Handlers for Code Metrics
  const handleAddMetric = () => {
    setCodeMetrics([...codeMetrics, ""]);
  };

  const handleMetricChange = (index, value) => {
    const updatedMetrics = [...codeMetrics];
    updatedMetrics[index] = value;
    setCodeMetrics(updatedMetrics);
  };

  const handleRemoveMetric = (index) => {
    if (codeMetrics.length === 1 && index === 0) {
      // Keep at least one empty input
      setCodeMetrics([""]);
      return;
    }
    const updatedMetrics = codeMetrics.filter((_, i) => i !== index);
    setCodeMetrics(updatedMetrics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setLoading(true);

    if (!user) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    const settingsData = {
      // repo_name, repo_url, description are typically not updated here,
      // but if they are, ensure your backend API supports it.
      // For now, focusing on standards, metrics, and LLM preference.
      repo_name: repoName,
      repo_url: repoUrl,
      coding_standards: codingStandards.filter(
        (standard) => standard.trim() !== ""
      ),
      code_metrics: codeMetrics.filter((metric) => metric.trim() !== ""),
      llm_preference: llmPreference,
    };

    try {
      await repoService.updateRepositorySettings(repoId, settingsData);
      setSuccessMessage("Repository settings updated successfully!");
      // Optionally, navigate away or refresh data
      // navigate(`/repo/${repoId}/overview`);
    } catch (err) {
      console.error("Error updating repository settings:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to update repository settings."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <p>Loading repository settings...</p>;
  }

  return (
    <div>
      <h1>Repository Settings for {repoName}</h1>
      <form onSubmit={handleSubmit}>
        {/* Basic Info - usually not editable here, or handled separately */}
        <div>
          <label htmlFor="repoName">Repository Name:</label>
          <input type="text" id="repoName" value={repoName} disabled readOnly />
        </div>
        <div>
          <label htmlFor="repoUrl">Repository URL:</label>
          <input type="url" id="repoUrl" value={repoUrl} disabled readOnly />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={description} disabled readOnly />
        </div>

        <hr />

        <div>
          <h3>Coding Standards</h3>
          {codingStandards.map((standard, index) => (
            <div key={`standard-${index}`}>
              <input
                type="text"
                value={standard}
                onChange={(e) => handleStandardChange(index, e.target.value)}
                placeholder={`Standard ${index + 1}`}
              />
              {(codingStandards.length > 1 ||
                (codingStandards.length === 1 && standard.trim() !== "")) && (
                <button
                  type="button"
                  onClick={() => handleRemoveStandard(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddStandard}>
            Add Standard
          </button>
        </div>

        <hr />

        <div>
          <h3>Code Metrics</h3>
          {codeMetrics.map((metric, index) => (
            <div key={`metric-${index}`}>
              <input
                type="text"
                value={metric}
                onChange={(e) => handleMetricChange(index, e.target.value)}
                placeholder={`Metric ${index + 1}`}
              />
              {(codeMetrics.length > 1 ||
                (codeMetrics.length === 1 && metric.trim() !== "")) && (
                <button type="button" onClick={() => handleRemoveMetric(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddMetric}>
            Add Metric
          </button>
        </div>

        <hr />

        <div>
          <label htmlFor="llmPreference">LLM Preference:</label>
          <select
            id="llmPreference"
            value={llmPreference}
            onChange={(e) => setLlmPreference(e.target.value)}
          >
            <option value="">Select a Model</option>
            {/* These should ideally come from a config or API */}
            <option value="CEREBRAS::llama-3.3-70b">
              Llama 3.3 70B (Cerebras)
            </option>
            <option value="HYPERBOLIC::llama-3.3-70b">
              Llama 3.3 70B (Hyperbolic)
            </option>
            {/* Add more models as needed */}
          </select>
        </div>

        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
        <Link to={`/repo/${githubID}/overview`} style={{ marginLeft: "10px" }}>
          <button type="button">Back to Overview</button>
        </Link>
      </form>
    </div>
  );
}

export default RepoSettingsPage;
