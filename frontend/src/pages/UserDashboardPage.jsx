import React, { useEffect, useState, useCallback } from "react";
import { repoService, authService } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Typography,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  GitHub as GitHubIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

function UserDashboardPage() {
  const [ownedRepos, setOwnedRepos] = useState([]);
  const [collaboratorRepos, setCollaboratorRepos] = useState([]);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pagination state for repositories
  const [reposPage, setReposPage] = useState(1);
  const [reposPerPage] = useState(10); // Or make this configurable
  const [hasMoreRepos, setHasMoreRepos] = useState(true);

  // Pagination state for organizations
  const [orgsPage, setOrgsPage] = useState(1);
  const [orgsPerPage] = useState(10); // Or make this configurable
  const [hasMoreOrgs, setHasMoreOrgs] = useState(true);

  const fetchDashboardData = useCallback(
    async (fetchRepos = true, fetchOrgs = true) => {
      if (!user) return;
      try {
        setLoading(true);
        // setError(null); // Clear error only when initiating a full refresh

        if (fetchRepos) {
          const { data: allUserRepos } = await repoService.getUserRepositories(
            reposPage,
            reposPerPage
          );
          if (allUserRepos && allUserRepos.length > 0) {
            const owned = allUserRepos.filter(
              (r) => r.owner_login === user.username
            );
            const collab = allUserRepos.filter(
              (r) => r.owner_login !== user.username
            );

            setOwnedRepos((prev) =>
              reposPage === 1 ? owned : [...prev, ...owned]
            );
            setCollaboratorRepos((prev) =>
              reposPage === 1 ? collab : [...prev, ...collab]
            );
            setHasMoreRepos(allUserRepos.length === reposPerPage);
          } else {
            setHasMoreRepos(false);
            if (reposPage === 1) {
              // Only clear if it's the first page and no data
              setOwnedRepos([]);
              setCollaboratorRepos([]);
            }
          }
        }

        if (fetchOrgs) {
          const { data: organizations } =
            await authService.getUserOrganizations(orgsPage, orgsPerPage);
          if (organizations && organizations.length > 0) {
            setUserOrganizations((prev) =>
              orgsPage === 1 ? organizations : [...prev, ...organizations]
            );
            setHasMoreOrgs(organizations.length === orgsPerPage);
          } else {
            setHasMoreOrgs(false);
            if (orgsPage === 1) {
              setUserOrganizations([]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    },
    [user, reposPage, reposPerPage, orgsPage, orgsPerPage]
  );

  useEffect(() => {
    // Initial fetch
    setError(null); // Clear previous errors on initial load or user change
    setReposPage(1);
    setOrgsPage(1);
    setOwnedRepos([]);
    setCollaboratorRepos([]);
    setUserOrganizations([]);
    setHasMoreRepos(true);
    setHasMoreOrgs(true);
    fetchDashboardData(true, true); // Fetch both on initial load
  }, [user]); // Rerun if user changes

  useEffect(() => {
    if (reposPage > 1) {
      fetchDashboardData(true, false); // Fetch only repos if reposPage changes
    }
  }, [reposPage]);

  useEffect(() => {
    if (orgsPage > 1) {
      fetchDashboardData(false, true); // Fetch only orgs if orgsPage changes
    }
  }, [orgsPage]);

  const handleLoadMoreRepos = () => {
    if (hasMoreRepos && !loading) {
      setReposPage((prevPage) => prevPage + 1);
    }
  };

  const handleLoadMoreOrgs = () => {
    if (hasMoreOrgs && !loading) {
      setOrgsPage((prevPage) => prevPage + 1);
    }
  };

  const handleRepoSelection = (repo) => {
    // Assuming backend flags registered repos: repo.is_registered_in_system
    const isRegistered = repo.is_registered_in_system; // Use actual flag from backend

    if (repo.owner_login === user.username) {
      if (isRegistered) {
        navigate(`/repo/${repo.id}/overview`); // repo.id should be your system's ID
      } else {
        navigate("/register-repo", { state: { repoData: repo } });
      }
    } else {
      if (isRegistered) {
        navigate(`/repo/${repo.id}/overview`);
      } else {
        alert(
          "This repository is not registered. Only owners can register repositories."
        );
      }
    }
  };

  const handleDeleteRepository = async (repoId, repoName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the repository "${repoName}" from the system? This action cannot be undone.`
      )
    ) {
      try {
        await repoService.deleteRepository(repoId); // repoId is your system's ID for the repository
        alert(`Repository "${repoName}" deleted successfully.`);
        // Refresh the list of repositories
        fetchDashboardData();
      } catch (err) {
        console.error("Error deleting repository:", err);
        setError(err.message || "Failed to delete repository.");
        alert(
          `Failed to delete repository: ${
            err.response?.data?.detail || err.message
          }`
        );
      }
    }
  };

  const renderRepoCard = (repo) => (
    <Grid item xs={12} sm={6} md={4} key={repo.id + (repo.system_id || "") + repo.full_name}>
      <Card 
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {repo.full_name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={repo.private ? <LockIcon /> : <PublicIcon />}
              label={repo.private ? "Private" : "Public"}
              size="small"
              color={repo.private ? "default" : "primary"}
              variant="outlined"
            />
            <Chip
              icon={repo.is_registered_in_system ? <CheckCircleIcon /> : <WarningIcon />}
              label={repo.is_registered_in_system ? "Registered" : "Not Registered"}
              size="small"
              color={repo.is_registered_in_system ? "success" : "warning"}
              variant="outlined"
            />
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={() => handleRepoSelection(repo)}
            sx={{ mr: 1 }}
          >
            {repo.is_registered_in_system ? "View" : "Register"}
          </Button>
          
          {repo.is_registered_in_system && user && repo.owner_login === user.username && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteRepository(repo.system_id, repo.full_name)}
              sx={{ ml: 'auto' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  const renderRepoSection = (repos, title, emptyMessage) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
        {title}
      </Typography>
      {repos.length > 0 ? (
        <Grid container spacing={3}>
          {repos.map(renderRepoCard)}
        </Grid>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            backgroundColor: 'action.hover',
            borderRadius: 2
          }}
        >
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Paper>
      )}
      {hasMoreRepos && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleLoadMoreRepos}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ mr: 1 }} />
            ) : null}
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );

  if (loading && reposPage === 1 && orgsPage === 1) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Dashboard
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {renderRepoSection(
        ownedRepos,
        "Your Repositories",
        "You don't have any repositories yet."
      )}

      <Divider sx={{ my: 4 }} />

      {renderRepoSection(
        collaboratorRepos,
        "Collaborated Repositories",
        "You're not collaborating on any repositories yet."
      )}

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Your Organizations
        </Typography>
        {userOrganizations.length > 0 ? (
          <Grid container spacing={3}>
            {userOrganizations.map((org) => (
              <Grid item xs={12} sm={6} md={4} key={org.id}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        component="img"
                        src={org.avatar_url}
                        alt={org.login}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          mr: 2,
                        }}
                      />
                      <Typography variant="h6">{org.login}</Typography>
                    </Box>
                    {org.description && (
                      <Typography variant="body2" color="text.secondary">
                        {org.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 2
            }}
          >
            <Typography color="text.secondary">
              You're not a member of any organizations yet.
            </Typography>
          </Paper>
        )}
        {hasMoreOrgs && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleLoadMoreOrgs}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ mr: 1 }} />
              ) : null}
              {loading ? "Loading..." : "Load More Organizations"}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default UserDashboardPage;
