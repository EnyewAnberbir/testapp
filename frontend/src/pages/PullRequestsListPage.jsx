import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { prService } from "../services/apiService";

function PullRequestsListPage() {
  const { repoId } = useParams(); // Get repoId from URL
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15); // Or make this configurable
  const [hasMorePRs, setHasMorePRs] = useState(true);
  // TODO: Add state for filters (e.g., status, author)

  const fetchPullRequests = useCallback(
    async (currentPage) => {
      if (!repoId) return;
      setLoading(true);
      try {
        // TODO: Include other filters like status, author when implemented
        const filters = { page: currentPage, per_page: perPage, state: "all" };
        const { data } = await prService.getPullRequests(repoId, filters);

        if (data && data.length > 0) {
          setPullRequests((prevPRs) =>
            currentPage === 1 ? data : [...prevPRs, ...data]
          );
          setHasMorePRs(data.length === perPage);
        } else {
          setHasMorePRs(false);
          if (currentPage === 1) {
            setPullRequests([]);
          }
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching pull requests:", err);
        setError(err.message || "Failed to fetch pull requests.");
        if (currentPage === 1) setPullRequests([]);
      } finally {
        setLoading(false);
      }
    },
    [repoId, perPage]
  );

  useEffect(() => {
    setPullRequests([]);
    setPage(1);
    setHasMorePRs(true);
    fetchPullRequests(1); // Fetch first page on mount or repoId change
  }, [repoId, fetchPullRequests]);

  const handleLoadMore = () => {
    if (hasMorePRs && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPullRequests(nextPage);
    }
  };

  // TODO: Implement filter change handlers that reset page to 1 and refetch

  if (loading && page === 1) return <p>Loading pull requests...</p>;
  if (error && pullRequests.length === 0) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Pull Requests for Repository</h1>
      {error && (
        <p style={{ color: "red" }}>Error fetching more PRs: {error}</p>
      )}
      {/* TODO: Add filter UI elements here */}
      {pullRequests.length > 0 ? (
        <ul>
          {pullRequests.map((pr) => (
            <li key={pr.pr_github_id || pr.id}>
              {" "}
              {/* Use pr_github_id or a unique key */}
              <Link to={`/repo/${repoId}/pulls/${pr.pr_number}`}>
                <strong>
                  #{pr.pr_number}: {pr.title}
                </strong>
              </Link>
              <p>Author: {pr.user_login}</p>
              <p>Status: {pr.status}</p>
              <p>Created: {new Date(pr.created_at_gh).toLocaleString()}</p>
              <p>Source: {pr.source}</p>
              {/* TODO: Add manual review trigger button if applicable */}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No pull requests found for this repository.</p>
      )}
      {hasMorePRs && (
        <button onClick={handleLoadMore} disabled={loading}>
          {loading ? "Loading..." : "Load More Pull Requests"}
        </button>
      )}
      {!hasMorePRs && pullRequests.length > 0 && (
        <p>No more pull requests to load.</p>
      )}
    </div>
  );
}

export default PullRequestsListPage;
