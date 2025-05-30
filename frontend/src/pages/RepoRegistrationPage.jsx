import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { repoService } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

function RepoRegistrationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [repoName, setRepoName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [codingStandards, setCodingStandards] = useState([""]);
  const [codeEvaluationMetrics, setCodeEvaluationMetrics] = useState([""]); // Single string for dropdown
  const [llmModel, setLlmModel] = useState(""); // Single string for dropdown
  const [error, setError] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showWebhookInfo, setShowWebhookInfo] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState(""); // New state for webhook secret
  const [webhookInstructions, setWebhookInstructions] = useState(null); // New state for backend-provided instructions
  const [registeredRepoId, setRegisteredRepoId] = useState(null); // New state for the ID of the registered repo

  // Pre-fill from navigation state if available (e.g., from UserDashboardPage)
  useEffect(() => {
    if (location.state?.repoData) {
      const {
        full_name,
        html_url,
        description: desc,
      } = location.state.repoData;
      setRepoName(full_name);
      setRepoUrl(html_url);
      setDescription(desc || "");
    }
  }, [location.state]);

  const handleAddStandard = () => {
    setCodingStandards([...codingStandards, ""]);
  };

  const handleStandardChange = (index, value) => {
    const updatedStandards = [...codingStandards];
    updatedStandards[index] = value;
    setCodingStandards(updatedStandards);
  };

  const handleRemoveStandard = (index) => {
    // Ensure at least one input field remains, even if empty
    if (codingStandards.length === 1 && index === 0) {
      setCodingStandards([""]);
      return;
    }
    const updatedStandards = codingStandards.filter((_, i) => i !== index);
    setCodingStandards(updatedStandards);
  };

  // Handlers for Code Evaluation Metrics
  const handleAddMetric = () => {
    setCodeEvaluationMetrics([...codeEvaluationMetrics, ""]);
  };

  const handleMetricChange = (index, value) => {
    const updatedMetrics = [...codeEvaluationMetrics];
    updatedMetrics[index] = value;
    setCodeEvaluationMetrics(updatedMetrics);
  };

  const handleRemoveMetric = (index) => {
    // Ensure at least one input field remains, even if empty
    if (codeEvaluationMetrics.length === 1 && index === 0) {
      setCodeEvaluationMetrics([""]);
      return;
    }
    const updatedMetrics = codeEvaluationMetrics.filter((_, i) => i !== index);
    setCodeEvaluationMetrics(updatedMetrics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setWebhookUrl("");
    setShowWebhookInfo(false);
    setWebhookSecret("");
    setWebhookInstructions(null);
    setRegisteredRepoId(null);

    if (!user) {
      setError("User not authenticated.");
      return;
    }

    const repoData = {
      repo_name: repoName,
      repo_url: repoUrl,
      description: description,
      github_native_id: location.state?.repoData?.id || null,
      coding_standards: codingStandards.filter(
        (standard) => standard.trim() !== ""
      ),
      code_metrics: codeEvaluationMetrics.filter(
        (metric) => metric.trim() !== ""
      ),
      llm_preference: llmModel,
    };

    try {
      const response = await repoService.registerRepository(repoData);
      if (response.data && response.data.webhook_url) {
        setWebhookUrl(response.data.webhook_url);
        setWebhookSecret(response.data.webhook_secret || ""); // Store webhook secret
        setWebhookInstructions(response.data.webhook_instructions || null); // Store custom instructions
        setRegisteredRepoId(response.data.id || null); // Store registered repo ID from response
        setShowWebhookInfo(true);
      } else {
        setError("Failed to register repository or webhook URL not provided.");
      }
    } catch (err) {
      console.error("Error registering repository:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to register repository."
      );
    }
  };

  const handleProceedToOverview = () => {
    if (webhookUrl && registeredRepoId) {
      alert(
        "Please ensure you have added the webhook to your GitHub repository settings. You will now be redirected to the repository's overview page."
      );
      navigate(`/repo/${location.state?.repoData?.id}/overview`);
    } else if (webhookUrl && !registeredRepoId) {
      alert(
        "Webhook information is available, but the repository ID for navigation is missing. Please ensure you have added the webhook to your GitHub repository settings. You will be redirected to the dashboard."
      );
      navigate("/"); // Fallback to dashboard
    } else {
      setError(
        "Cannot proceed: Webhook information is missing, or repository ID was not available. Registration may have been incomplete."
      );
    }
  };

  if (showWebhookInfo) {
    return (
      <div>
        <h1>Repository Registered Successfully!</h1>
        <p>
          Please add the following webhook URL to your repository settings on
          GitHub:
        </p>
        <p>
          <strong>Webhook URL:</strong> <code>{webhookUrl}</code>
        </p>
        <p>
          <strong>Secret:</strong>{" "}
          {webhookSecret ? (
            <code>{webhookSecret}</code>
          ) : (
            "(Use the webhook secret configured in your application settings or provided by your administrator.)"
          )}
        </p>
        <p>Instructions:</p>
        {webhookInstructions ? (
          <div /* Consider sanitizing if instructions can contain arbitrary HTML */
          >
            {/* This will render plain text as is, or basic HTML if webhookInstructions contains it.
                For Markdown, you would use a Markdown renderer component here. */}
            {webhookInstructions}
          </div>
        ) : (
          <ol>
            <li>Go to your repository on GitHub.</li>
            <li>Click on "Settings".</li>
            <li>In the left sidebar, click on "Webhooks".</li>
            <li>Click on "Add webhook".</li>
            <li>Paste the Webhook URL into the "Payload URL" field.</li>
            <li>For "Content type", select "application/json".</li>
            <li>
              Enter your webhook secret.
              {webhookSecret ? (
                <span>
                  {" "}
                  Use the secret: <code>{webhookSecret}</code>.
                </span>
              ) : (
                <span>
                  {" "}
                  (If your application provides a specific secret for this
                  webhook, use it. Otherwise, use the global webhook secret if
                  one is configured for the application.)
                </span>
              )}
            </li>
            <li>
              Choose which events you would like to trigger this webhook. (e.g.,
              "Just the push event", "Send me everything", or select individual
              events like Pull Requests, Pushes).
            </li>
            <li>Click "Add webhook".</li>
          </ol>
        )}
        <button onClick={handleProceedToOverview}>
          I have added the webhook, proceed to Overview
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Repo Registration Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="repoName">Repository Name (e.g., owner/repo):</label>
          <input
            type="text"
            id="repoName"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="repoUrl">
            Repository URL (e.g., https://github.com/owner/repo):
          </label>
          <input
            type="url"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description (Optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label>Code Standards (add one per line):</label>
          {codingStandards.map((standard, index) => (
            <div key={index}>
              <input
                type="text"
                value={standard}
                onChange={(e) => handleStandardChange(index, e.target.value)}
                placeholder={`Standard ${index + 1}`}
              />
              {codingStandards.length > 1 && (
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

        <div>
          <label>Code Evaluation Metrics (add one per line):</label>
          {codeEvaluationMetrics.map((metric, index) => (
            <div key={`metric-${index}`}>
              <input
                type="text"
                value={metric}
                onChange={(e) => handleMetricChange(index, e.target.value)}
                placeholder={`Metric ${index + 1}`}
              />
              {(codeEvaluationMetrics.length > 1 ||
                (codeEvaluationMetrics.length === 1 &&
                  metric.trim() !== "")) && (
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

        <div>
          <label htmlFor="llmModel">LLM Model Selection:</label>
          <select
            id="llmModel"
            value={llmModel}
            onChange={(e) => setLlmModel(e.target.value)}
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

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Register Repository</button>
      </form>
    </div>
  );
}

export default RepoRegistrationPage;
