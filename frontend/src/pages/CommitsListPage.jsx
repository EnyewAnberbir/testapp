import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { commitService } from "../services/apiService";

function CommitsListPage() {
  const { repoId } = useParams(); // Get repoId from URL
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15); // Or make this configurable
  const [hasMoreCommits, setHasMoreCommits] = useState(true);

  const fetchCommits = useCallback(
    async (currentPage) => {
      if (!repoId) return;
      setLoading(true);
      try {
        const filters = { page: currentPage, per_page: perPage };
        const { data } = await commitService.getCommits(repoId, filters);

        if (data && data.length > 0) {
          setCommits((prevCommits) =>
            currentPage === 1 ? data : [...prevCommits, ...data]
          );
          setHasMoreCommits(data.length === perPage);
        } else {
          setHasMoreCommits(false);
          if (currentPage === 1) {
            setCommits([]);
          }
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching commits:", err);
        setError(err.message || "Failed to fetch commits.");
        // If page 1 fails, clear commits. Otherwise, keep existing for better UX.
        if (currentPage === 1) setCommits([]);
      } finally {
        setLoading(false);
      }
    },
    [repoId, perPage]
  );

  useEffect(() => {
    setCommits([]);
    setPage(1);
    setHasMoreCommits(true);
    fetchCommits(1); // Fetch first page on component mount or repoId change
  }, [repoId, fetchCommits]);

  const handleLoadMore = () => {
    if (hasMoreCommits && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCommits(nextPage);
    }
  };

  if (loading && page === 1) return <p>Loading commits...</p>;
  if (error && commits.length === 0) return <p>Error: {error}</p>; // Show error prominently if no commits loaded

  return (
    <div>
      <h1>Commits for Repository</h1>
      {error && (
        <p style={{ color: "red" }}>Error fetching more commits: {error}</p>
      )}{" "}
      {/* Show error for subsequent loads less prominently */}
      {commits.length > 0 ? (
        <ul>
          {commits.map((commit) => (
            <li key={commit.commit_hash}>
              {" "}
              {/* Assuming commit_hash is unique and present */}
              <Link to={`/repo/${repoId}/commits/${commit.commit_hash}`}>
                <strong>{commit.message.split("\n")[0]}</strong>{" "}
                {/* Show first line of message */}
              </Link>
              <p>
                Author: {commit.author_name} ({commit.author_email})
              </p>
              <p>Date: {new Date(commit.timestamp).toLocaleString()}</p>
              <p>SHA: {commit.commit_hash}</p>
              <p>Source: {commit.source}</p>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No commits found for this repository.</p>
      )}
      {hasMoreCommits && (
        <button onClick={handleLoadMore} disabled={loading}>
          {loading ? "Loading..." : "Load More Commits"}
        </button>
      )}
      {!hasMoreCommits && commits.length > 0 && <p>No more commits to load.</p>}
      {/* TODO: Implement filters (date, author) */}
    </div>
  );
}

export default CommitsListPage;
