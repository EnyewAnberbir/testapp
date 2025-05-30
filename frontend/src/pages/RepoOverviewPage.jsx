import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { repoService, prService, commitService } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

const PER_PAGE_ITEMS = 5; // Number of items to fetch per page for PRs and Commits

function RepoOverviewPage() {
  const { repoId: githubRepoIdFromParams } = useParams(); // Get GitHub ID from route param
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [repoDetails, setRepoDetails] = useState(null); // This will store the full repo object including internal ID
  const [pullRequests, setPullRequests] = useState([]);
  const [commits, setCommits] = useState([]);
  const [githubCollaborators, setGithubCollaborators] = useState([]);
  const [registeredCollaborators, setRegisteredCollaborators] = useState([]);
  const [webhookStatus, setWebhookStatus] = useState(null);
  const [loading, setLoading] = useState(true); // For initial page load
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // PR Pagination and loading
  const [prPage, setPrPage] = useState(1);
  const [hasMorePRs, setHasMorePRs] = useState(true);
  const [loadingPRs, setLoadingPRs] = useState(false);

  // Commit Pagination and loading
  const [commitPage, setCommitPage] = useState(1);
  const [hasMoreCommits, setHasMoreCommits] = useState(true);
  const [loadingCommits, setLoadingCommits] = useState(false);

  // Filters
  const [prFilters, setPrFilters] = useState({
    status: "",
    author: "",
    date_from: "",
    date_to: "",
  });
  const [commitFilters, setCommitFilters] = useState({
    author: "",
    date_from: "",
    date_to: "",
  });

  const fetchPullRequestsData = useCallback(
    async (internalRepoId, page, filters, resetList = false) => {
      if (!internalRepoId) return;
      setLoadingPRs(true);
      try {
        const prsRes = await prService.getPullRequests(internalRepoId, {
          ...filters,
          page: page,
          per_page: PER_PAGE_ITEMS,
        });
        const newPRs = prsRes.data || [];
        setPullRequests((prevPRs) =>
          resetList || page === 1 ? newPRs : [...prevPRs, ...newPRs]
        );
        setHasMorePRs(newPRs.length === PER_PAGE_ITEMS);
      } catch (err) {
        console.error("Error fetching pull requests:", err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to load pull requests."
        );
        // Optionally clear PRs or show specific error for PRs
      } finally {
        setLoadingPRs(false);
      }
    },
    []
  );

  const fetchCommitsData = useCallback(
    async (internalRepoId, page, filters, resetList = false) => {
      if (!internalRepoId) return;
      setLoadingCommits(true);
      try {
        const commitsRes = await commitService.getCommits(internalRepoId, {
          ...filters,
          page: page,
          per_page: PER_PAGE_ITEMS,
        });
        const newCommits = commitsRes.data || [];
        setCommits((prevCommits) =>
          resetList || page === 1 ? newCommits : [...prevCommits, ...newCommits]
        );
        setHasMoreCommits(newCommits.length === PER_PAGE_ITEMS);
      } catch (err) {
        console.error("Error fetching commits:", err);
        setError(
          err.response?.data?.detail || err.message || "Failed to load commits."
        );
        // Optionally clear commits or show specific error for commits
      } finally {
        setLoadingCommits(false);
      }
    },
    []
  );

  const fetchInitialRepoData = useCallback(async () => {
    if (!githubRepoIdFromParams || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setPrPage(1);
    setCommitPage(1);

    try {
      const detailsRes = await repoService.getRepositoryDetailsByGithubId(
        githubRepoIdFromParams
      );
      const currentRepoDetails = detailsRes.data;
      setRepoDetails(currentRepoDetails);
      const internalRepoId = currentRepoDetails.id;

      if (currentRepoDetails.owner.id === user.id) {
        setIsOwner(true);
      }

      // Fetch initial PRs and Commits
      await fetchPullRequestsData(internalRepoId, 1, prFilters, true);
      await fetchCommitsData(internalRepoId, 1, commitFilters, true);

      const ghCollaboratorsRes = await repoService.getRepoCollaborators(
        internalRepoId
      );
      setGithubCollaborators(ghCollaboratorsRes.data || []);

      if (currentRepoDetails.owner_id === user.id) {
        const regCollaboratorsRes =
          await repoService.getRegisteredRepoCollaborators(internalRepoId);
        setRegisteredCollaborators(regCollaboratorsRes.data || []);
        setWebhookStatus({
          status: "Mocked: Active", // Replace with actual status if available
          last_event: "push",
          details: currentRepoDetails.webhook_url,
        });
      }
    } catch (err) {
      console.error("Error fetching initial repository data:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load repository data."
      );
    } finally {
      setLoading(false);
    }
  }, [
    githubRepoIdFromParams,
    user,
    fetchPullRequestsData,
    fetchCommitsData,
    prFilters,
    commitFilters,
  ]); // Added prFilters and commitFilters

  useEffect(() => {
    if (!authLoading && user) {
      fetchInitialRepoData();
    } else if (!authLoading && !user) {
      navigate("/login");
    }
  }, [
    githubRepoIdFromParams,
    user,
    authLoading,
    fetchInitialRepoData,
    navigate,
  ]);

  // Separate useEffect for webhook status
  useEffect(() => {
    if (repoDetails && repoDetails.id) {
      repoService
        .getWebhookStatus(repoDetails.id)
        .then((data) => {
          setWebhookStatus(data);
        })
        .catch((error) => {
          console.error("Error fetching webhook status:", error);
        });
    }
  }, [repoDetails]);

  const handlePrFilterChange = (e) => {
    setPrFilters({ ...prFilters, [e.target.name]: e.target.value });
  };

  const handleCommitFilterChange = (e) => {
    setCommitFilters({ ...commitFilters, [e.target.name]: e.target.value });
  };

  const applyPrFilters = () => {
    if (!repoDetails) return;
    setPrPage(1); // Reset page to 1
    fetchPullRequestsData(repoDetails.id, 1, prFilters, true);
  };

  const applyCommitFilters = () => {
    if (!repoDetails) return;
    setCommitPage(1); // Reset page to 1
    fetchCommitsData(repoDetails.id, 1, commitFilters, true);
  };

  const handleLoadMorePRs = () => {
    if (!repoDetails || !hasMorePRs || loadingPRs) return;
    const nextPage = prPage + 1;
    setPrPage(nextPage);
    fetchPullRequestsData(repoDetails.id, nextPage, prFilters);
  };

  const handleLoadMoreCommits = () => {
    if (!repoDetails || !hasMoreCommits || loadingCommits) return;
    const nextPage = commitPage + 1;
    setCommitPage(nextPage);
    fetchCommitsData(repoDetails.id, nextPage, commitFilters);
  };

  if (authLoading || (loading && !repoDetails))
    return <p>Loading repository overview...</p>; // Adjusted loading condition
  if (error && !repoDetails)
    return <p style={{ color: "red" }}>Error: {error}</p>; // Show general error if repoDetails failed
  if (!repoDetails) return <p>Repository not found or not loaded.</p>;

  return (
    <div>
      <h1>{repoDetails.repo_name} Overview</h1>
      <p>
        <strong>Description:</strong> {repoDetails.description || "N/A"}
      </p>
      <p>
        <strong>URL:</strong>{" "}
        <a
          href={repoDetails.repo_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {repoDetails.repo_url}
        </a>
      </p>
      <p>
        <strong>Registered LLM Preference:</strong>{" "}
        {repoDetails.llm_preference || "Default"}
      </p>
      <p>
        <strong>Code Metrics:</strong>{" "}
        {repoDetails.code_metrics?.join(", ") || "N/A"}
      </p>
      <p>
        <strong>Coding Standards:</strong>
      </p>
      {repoDetails.coding_standards &&
      repoDetails.coding_standards.length > 0 ? (
        <ul>
          {repoDetails.coding_standards.map((standard, index) => (
            <li key={index}>{standard}</li>
          ))}
        </ul>
      ) : (
        <p>No specific coding standards defined.</p>
      )}

      {isOwner && repoDetails && (
        <Link to={`/repo/${repoDetails.id}/settings`}>
          {" "}
          {/* Ensure settings link uses internal ID if needed */}
          <button>Edit Repository Settings</button>
        </Link>
      )}

      <hr />

      <h2>Pull Requests</h2>
      {error && <p style={{ color: "red" }}>Error loading PRs: {error}</p>}
      <div>
        {/* PR Filters */}
        <select
          name="status"
          value={prFilters.status}
          onChange={handlePrFilterChange}
          disabled={loadingPRs}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="merged">Merged</option>
        </select>
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={prFilters.author}
          onChange={handlePrFilterChange}
          disabled={loadingPRs}
        />
        <input
          type="date"
          name="date_from"
          value={prFilters.date_from}
          onChange={handlePrFilterChange}
          disabled={loadingPRs}
        />
        <input
          type="date"
          name="date_to"
          value={prFilters.date_to}
          onChange={handlePrFilterChange}
          disabled={loadingPRs}
        />
        <button onClick={applyPrFilters} disabled={loadingPRs || loading}>
          Apply PR Filters
        </button>
      </div>
      {pullRequests.length > 0 ? (
        <ul>
          {pullRequests.map((pr) => (
            <li key={pr.pr_github_id || pr.id}>
              {" "}
              {/* Ensure unique key, pr_github_id is better if available */}
              <Link to={`/repo/${repoDetails.id}/pulls/${pr.pr_number}`}>
                {pr.title || `PR #${pr.pr_number}`}
              </Link>{" "}
              - Status: {pr.status} - Author: {pr.pr_author || pr.user_login}
            </li>
          ))}
        </ul>
      ) : (
        !loadingPRs && <p>No pull requests found for the current filters.</p>
      )}
      {loadingPRs && <p>Loading PRs...</p>}
      {hasMorePRs && !loadingPRs && (
        <button onClick={handleLoadMorePRs} disabled={loadingPRs}>
          Load More PRs
        </button>
      )}
      {!hasMorePRs && pullRequests.length > 0 && !loadingPRs && (
        <p>No more pull requests to load.</p>
      )}

      <hr />

      <h2>Commits</h2>
      {error && <p style={{ color: "red" }}>Error loading commits: {error}</p>}
      <div>
        {/* Commit Filters */}
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={commitFilters.author}
          onChange={handleCommitFilterChange}
          disabled={loadingCommits}
        />
        <input
          type="date"
          name="date_from"
          value={commitFilters.date_from}
          onChange={handleCommitFilterChange}
          disabled={loadingCommits}
        />
        <input
          type="date"
          name="date_to"
          value={commitFilters.date_to}
          onChange={handleCommitFilterChange}
          disabled={loadingCommits}
        />
        <button
          onClick={applyCommitFilters}
          disabled={loadingCommits || loading}
        >
          Apply Commit Filters
        </button>
      </div>
      {commits.length > 0 ? (
        <ul>
          {commits.map((commit) => (
            <li key={commit.id || commit.commit_hash}>
              {" "}
              {/* Ensure unique key */}
              <Link
                to={`/repo/${repoDetails.id}/commits/${commit.commit_hash}`}
              >
                {commit.message?.substring(0, 70)}...
              </Link>{" "}
              - Author: {commit.author_name} - SHA:{" "}
              {commit.commit_hash?.substring(0, 7)}
            </li>
          ))}
        </ul>
      ) : (
        !loadingCommits && <p>No commits found for the current filters.</p>
      )}
      {loadingCommits && <p>Loading commits...</p>}
      {hasMoreCommits && !loadingCommits && (
        <button onClick={handleLoadMoreCommits} disabled={loadingCommits}>
          Load More Commits
        </button>
      )}
      {!hasMoreCommits && commits.length > 0 && !loadingCommits && (
        <p>No more commits to load.</p>
      )}

      <hr />

      <h2>GitHub Collaborators</h2>
      {githubCollaborators.length > 0 ? (
        <ul>
          {githubCollaborators.map((collab) => (
            <li key={collab.id}>
              {collab.login} (
              {collab.permissions &&
                Object.entries(collab.permissions)
                  .filter(([, value]) => value)
                  .map(([key]) => key)
                  .join(", ")}
              )
            </li>
          ))}
        </ul>
      ) : (
        <p>No GitHub collaborators found or failed to load.</p>
      )}

      {isOwner && (
        <>
          <hr />
          <h2>Registered Collaborators (System)</h2>
          {registeredCollaborators.length > 0 ? (
            <ul>
              {registeredCollaborators.map((collab) => (
                <li key={collab.user_id}>
                  User ID: {collab.user_id} - Role: {collab.role}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No collaborators registered in the system for this repository.
            </p>
          )}

          <hr />
          <h2>Webhook Details</h2>
          {webhookStatus ? (
            <div>
              <p>
                <strong>URL:</strong> <code>{webhookStatus.webhook_id}</code>
              </p>
              <p>
                <strong>Status:</strong> {webhookStatus.last_event_received}
              </p>
            </div>
          ) : (
            <p>Webhook status not available or not configured.</p>
          )}
        </>
      )}
    </div>
  );
}

export default RepoOverviewPage;
