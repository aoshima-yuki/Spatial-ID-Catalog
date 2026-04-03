let repos = [];
let starsDesc = true;

/* 日時表示用 */
function formatGeneratedAt(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;

  return d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

/* JSON読み込み */
fetch("data/catalog.json")
  .then(res => {
    if (!res.ok) throw new Error("catalog.json not found");
    return res.json();
  })
  .then(data => {
    const generatedAtEl = document.getElementById("generatedAt");
    const repoCountEl = document.getElementById("repoCount");

    if (generatedAtEl) {
      generatedAtEl.textContent = formatGeneratedAt(data.generated_at);
    }
    if (repoCountEl) {
      repoCountEl.textContent = data.repo_count ?? 0;
    }

    repos = Array.isArray(data.repos) ? data.repos : [];
    renderTable(repos);
  })
  .catch(err => {
    console.error(err);
    document.querySelector("#catalog tbody").innerHTML =
      "<tr><td colspan='13'>catalog.json を読み込めませんでした</td></tr>";
  });

/* 表描画 */
function renderTable(data) {
  const tbody = document.querySelector("#catalog tbody");
  tbody.innerHTML = "";

  data.forEach((repo, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${repo.full_name || ""}</td>
      <td><a href="${repo.url}" target="_blank" rel="noopener noreferrer">Link</a></td>
      <td>${repo.description || ""}</td>
      <td>${repo.language || ""}</td>
      <td>${repo.stars || 0}</td>
      <td>${repo.updated_at ? repo.updated_at.slice(0, 10) : ""}</td>
      <td>${repo.topics ? repo.topics.join(", ") : ""}</td>
      <td>${repo.license && repo.license.name ? repo.license.name : ""}</td>
      <td>${repo.fork ? "Yes" : "No"}</td>
      <td>${repo.open_issues_count || 0}</td>
      <td>${repo.watchers_count || 0}</td>
      <td>${repo.forks_count || 0}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* Starsソート */
document.getElementById("sortStars").addEventListener("click", () => {
  repos.sort((a, b) =>
    starsDesc
      ? (b.stars || 0) - (a.stars || 0)
      : (a.stars || 0) - (b.stars || 0)
  );
  starsDesc = !starsDesc;
  renderTable(repos);
});
