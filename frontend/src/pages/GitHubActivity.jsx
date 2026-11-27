import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import githubService from "../services/githubService";

export default function GitHubActivity() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [usernameInput, setUsernameInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [pulls, setPulls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [error, setError] = useState("");

  const loadGitHubData = async () => {
    try {
      const [reposRes, issuesRes, pullsRes] = await Promise.all([
        githubService.getRepositories(),
        githubService.getIssues(),
        githubService.getPullRequests(),
      ]);
      const repoList = reposRes.repositories || [];
      setRepositories(repoList);
      setIssues(issuesRes.issues || []);
      setPulls(pullsRes.pulls || []);

      if (repoList.length > 0) {
        const first = repoList[0];
        setSelectedRepo(first.full_name);
        const [owner, repo] = first.full_name.split("/");
        const commitsRes = await githubService.getRepoCommits(owner, repo);
        setCommits(commitsRes.commits || []);
      }
    } catch (err) {
      setError(err.message || "Could not load GitHub activity.");
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const status = await githubService.getStatus();
        if (!ignore && status.connected) {
          setConnected(true);
          setProfile(status.profile || { github_username: status.github_username });
          await loadGitHubData();
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setError("");
    if (!usernameInput.trim() && !tokenInput.trim()) {
      setError("Please enter your GitHub username.");
      return;
    }
    setConnecting(true);
    try {
      const res = await githubService.connectAccount({
        github_username: usernameInput.trim(),
        access_token: tokenInput.trim(),
      });
      setConnected(true);
      setProfile(res.profile || { github_username: res.github_username });
      setUsernameInput("");
      setTokenInput("");
      await loadGitHubData();
    } catch (err) {
      setError(err.message || "Failed to link GitHub account.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError("");
    try {
      await githubService.disconnectAccount();
      setConnected(false);
      setProfile(null);
      setRepositories([]);
      setCommits([]);
      setIssues([]);
      setPulls([]);
      setSelectedRepo(null);
    } catch (err) {
      setError(err.message || "Failed to disconnect GitHub account.");
    }
  };

  const handleSelectRepo = async (fullName) => {
    setSelectedRepo(fullName);
    setLoadingCommits(true);
    try {
      const [owner, repo] = fullName.split("/");
      const res = await githubService.getRepoCommits(owner, repo);
      setCommits(res.commits || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCommits(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F4F4F0", color: "#111", fontFamily: "Arial, sans-serif", margin: 0 }}>
      {/* TOP NAV */}
      <header style={{ background: "#111", color: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", minHeight: "88px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
            <Link to="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img
                src="/Focus%20flow.jpg.jpeg?v=3"
                alt="FocusFlow"
                style={{ height: "76px", width: "auto", objectFit: "contain", mixBlendMode: "lighten" }}
              />
            </Link>
            <nav style={{ display: "flex", gap: "24px", fontSize: "12px" }}>
              <Link to="/dashboard" style={{ color: "#a1a1aa", textDecoration: "none" }}>Overview</Link>
              <Link to="/projects" style={{ color: "#a1a1aa", textDecoration: "none" }}>Projects</Link>
              <Link to="/tasks" style={{ color: "#a1a1aa", textDecoration: "none" }}>Task board</Link>
              <Link to="/notes" style={{ color: "#a1a1aa", textDecoration: "none" }}>Personal workspace</Link>
              <Link to="/github-activity" style={{ color: "white", textDecoration: "none", borderBottom: "2px solid #C6F24E", paddingBottom: "4px" }}>GitHub</Link>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px" }}>
            {user && <span style={{ color: "#a1a1aa" }}>{user.email || user.name}</span>}
            <button onClick={handleLogout} style={{ background: "white", color: "black", padding: "6px 12px", fontWeight: "600", border: "none", cursor: "pointer" }}>
              Log out
            </button>
          </div>
        </div>

        {/* HERO */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "2px", color: "#71717a", textTransform: "uppercase", margin: 0 }}>Developer Integration</p>
            <h1 style={{ fontSize: "40px", fontWeight: "bold", letterSpacing: "-1px", margin: "8px 0 0" }}>
              GitHub Activity
            </h1>
            <p style={{ color: "#a1a1aa", fontSize: "14px", marginTop: "8px" }}>
              Link your GitHub username to track repositories, commits, issues, and pull requests.
            </p>
          </div>
          {connected && (
            <button
              onClick={handleDisconnect}
              style={{ background: "#27272a", color: "white", border: "1px solid #3f3f46", padding: "8px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
            >
              Disconnect @{profile?.github_username}
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 64px" }}>
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b", padding: "12px 16px", fontSize: "13px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#71717a", fontSize: "14px" }}>Checking GitHub connection...</p>
        ) : !connected ? (
          /* LINK ACCOUNT FORM */
          <div style={{ maxWidth: "480px", background: "white", border: "1px solid #e4e4e7", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ width: "12px", height: "12px", background: "#C6F24E", display: "inline-block" }} />
              <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Link your GitHub account</h2>
            </div>
            <p style={{ fontSize: "13px", color: "#71717a", lineHeight: "1.5", marginTop: 0 }}>
              Enter your GitHub username to sync your public repositories, recent commits, open issues, and pull requests.
            </p>

            <form onSubmit={handleConnect} style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                  GitHub Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. torvalds"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #d4d4d8", fontSize: "14px" }}
                  required
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowTokenInput((v) => !v)}
                  style={{ background: "none", border: "none", padding: 0, fontSize: "12px", color: "#52525b", textDecoration: "underline", cursor: "pointer" }}
                >
                  {showTokenInput ? "Hide Personal Access Token" : "+ Add Personal Access Token (optional, for private repos)"}
                </button>
                {showTokenInput && (
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #d4d4d8", fontSize: "14px", marginTop: "8px" }}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={connecting}
                style={{ background: "#111", color: "white", padding: "12px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", marginTop: "4px" }}
              >
                {connecting ? "Linking GitHub Account..." : "Link GitHub Account"}
              </button>
            </form>
          </div>
        ) : (
          /* CONNECTED GITHUB ACTIVITY VIEW */
          <div>
            {/* PROFILE BANNER */}
            <div style={{ background: "white", border: "1px solid #e4e4e7", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt={profile.github_username} style={{ width: "52px", height: "52px", borderRadius: "50%", border: "2px solid #C6F24E" }} />
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>{profile?.name || profile?.github_username}</h2>
                    <span style={{ background: "#C6F24E", color: "#111", fontSize: "11px", fontWeight: "bold", padding: "2px 8px" }}>Connected</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#71717a", margin: "4px 0 0" }}>
                    @{profile?.github_username} {profile?.bio ? `• ${profile.bio}` : ""}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
                <div>
                  <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>{repositories.length}</p>
                  <p style={{ fontSize: "11px", color: "#71717a", margin: 0 }}>Repositories</p>
                </div>
                <div>
                  <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>{issues.length}</p>
                  <p style={{ fontSize: "11px", color: "#71717a", margin: 0 }}>Open Issues</p>
                </div>
                <div>
                  <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>{pulls.length}</p>
                  <p style={{ fontSize: "11px", color: "#71717a", margin: 0 }}>Pull Requests</p>
                </div>
              </div>
            </div>

            {/* REPOS + COMMITS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <section>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 12px" }}>Repositories</h3>
                <div style={{ background: "white", border: "1px solid #e4e4e7", maxHeight: "420px", overflowY: "auto" }}>
                  {repositories.length === 0 ? (
                    <p style={{ padding: "16px", fontSize: "13px", color: "#71717a" }}>No public repositories found.</p>
                  ) : (
                    repositories.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => handleSelectRepo(repo.full_name)}
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #e4e4e7",
                          cursor: "pointer",
                          background: selectedRepo === repo.full_name ? "#f7fee7" : "white",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "600", fontSize: "14px" }}>{repo.name}</span>
                          <a href={repo.html_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: "11px", color: "#52525b" }}>
                            Open ↗
                          </a>
                        </div>
                        {repo.description && <p style={{ fontSize: "12px", color: "#71717a", margin: "4px 0 0" }}>{repo.description}</p>}
                        <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#71717a", marginTop: "6px" }}>
                          {repo.language && <span>• {repo.language}</span>}
                          <span>★ {repo.stargazers_count}</span>
                          <span>Issues: {repo.open_issues_count}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 12px" }}>
                  Recent Commits {selectedRepo ? `(${selectedRepo})` : ""}
                </h3>
                <div style={{ background: "white", border: "1px solid #e4e4e7", maxHeight: "420px", overflowY: "auto" }}>
                  {loadingCommits ? (
                    <p style={{ padding: "16px", fontSize: "13px", color: "#71717a" }}>Loading commits...</p>
                  ) : commits.length === 0 ? (
                    <p style={{ padding: "16px", fontSize: "13px", color: "#71717a" }}>Select a repository to inspect recent commits.</p>
                  ) : (
                    commits.map((c) => (
                      <div key={c.full_sha} style={{ padding: "12px 16px", borderBottom: "1px solid #e4e4e7" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                          <a href={c.html_url} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: "600", color: "#111", textDecoration: "none" }}>
                            {c.message}
                          </a>
                          <code style={{ fontSize: "11px", background: "#f4f4f5", padding: "2px 6px" }}>{c.sha}</code>
                        </div>
                        <p style={{ fontSize: "11px", color: "#71717a", margin: "4px 0 0" }}>
                          {c.author_name} • {new Date(c.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* ISSUES & PULL REQUESTS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
              <section>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 12px" }}>Open Issues ({issues.length})</h3>
                <div style={{ background: "white", border: "1px solid #e4e4e7" }}>
                  {issues.length === 0 ? (
                    <p style={{ padding: "16px", fontSize: "13px", color: "#71717a", margin: 0 }}>No open issues authored by @{profile?.github_username}.</p>
                  ) : (
                    issues.map((issue) => (
                      <div key={issue.id} style={{ padding: "12px 16px", borderBottom: "1px solid #e4e4e7" }}>
                        <a href={issue.html_url} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: "600", color: "#111", textDecoration: "none" }}>
                          #{issue.number} {issue.title}
                        </a>
                        <p style={{ fontSize: "11px", color: "#71717a", margin: "4px 0 0" }}>{issue.repository}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 12px" }}>Open Pull Requests ({pulls.length})</h3>
                <div style={{ background: "white", border: "1px solid #e4e4e7" }}>
                  {pulls.length === 0 ? (
                    <p style={{ padding: "16px", fontSize: "13px", color: "#71717a", margin: 0 }}>No open pull requests by @{profile?.github_username}.</p>
                  ) : (
                    pulls.map((pr) => (
                      <div key={pr.id} style={{ padding: "12px 16px", borderBottom: "1px solid #e4e4e7" }}>
                        <a href={pr.html_url} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: "600", color: "#111", textDecoration: "none" }}>
                          #{pr.number} {pr.title}
                        </a>
                        <p style={{ fontSize: "11px", color: "#71717a", margin: "4px 0 0" }}>{pr.repository}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
