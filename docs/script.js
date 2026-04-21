let repos = [];
let starsDesc = true;
let currentLang = "ja";

const i18n = {
  ja: {
    pageTitle: "空間ID関連OSS一覧表",
    pageSubtitle: "GitHubに登録された空間IDに関連する情報を自動収集し、その結果を一覧で表示しています。",
    notice: "🚧 本ページは工事中です。掲載内容および分類基準は今後変更される可能性があります。",
    overviewTitle: "概要",
    overviewBody: "本ページは、GitHubに登録された空間IDに関連する情報を自動収集し、その結果を一覧で表示するものです。データは GitHub API を用いて定期的に更新されます。",
    generatedAtLabel: "一覧生成日時：",
    methodTitle: "一覧表作成方法",
    method1: "GitHub 上の公開リポジトリを対象に、空間IDに関するキーワードで候補を収集しています。",
    method2: "判定対象は、リポジトリ名、リポジトリの説明文、README、Topics です。",
    method3: "表記ゆれに対応するため、複数のキーワードを用いて検索しています。",
    method4: "GitHub Search API だけでは README の記載内容を十分に確認できない場合があるため、候補リポジトリごとに README を取得し、キーワードの有無を追加で確認しています。",
    method5: "自動収集結果には、管理者が設定した除外リポジトリを反映しています。",
    keywordsLabel: "使用キーワード：",
    linksTitle: "関連リンク",
    guidelineLink: "4次元時空間情報利活用のための空間IDガイドライン",
    repoLink: "Open Data Spaces 4次元時空間ID 関連リポジトリ",
    notesTitle: "注意事項",
    note1: "本一覧は自動収集により生成されています",
    note2: "掲載されている情報は評価・推奨を意味するものではありません",
    note3: "一覧は Stars 数の多い順を基本に表示しています",
    tableTitle: "一覧",
    footerText: "空間ID関連OSS一覧表 | GitHub API を用いて自動生成",
    colNo: "No.",
    colRepository: "Repository",
    colUrl: "URL",
    colDescription: "Description",
    colLanguage: "Language",
    colStars: "⭐ Stars",
    colUpdated: "Updated",
    colTopics: "Topics",
    colLicense: "License",
    colFork: "Fork",
    colIssues: "Issues",
    colWatchers: "Watchers",
    colForks: "Forks",
    linkText: "Link",
    yes: "Yes",
    no: "No",
    loading: "読み込み中...",
    catalogLoadError: "catalog.json を読み込めませんでした"
  },
  en: {
    pageTitle: "Spatial ID OSS Catalog",
    pageSubtitle: "This page automatically collects information related to Spatial ID registered on GitHub and displays the results in a list.",
    notice: "🚧 This page is under construction. The listed content and classification criteria may change.",
    overviewTitle: "Overview",
    overviewBody: "This page automatically collects information related to Spatial ID registered on GitHub and displays the results in a list. The data is updated regularly using the GitHub API.",
    generatedAtLabel: "Generated at: ",
    methodTitle: "How this list is created",
    method1: "Candidate repositories are collected from public GitHub repositories using keywords related to Spatial ID.",
    method2: "The checked fields are repository name, repository description, README, and topics.",
    method3: "Multiple keywords are used to account for variations in notation.",
    method4: "Because GitHub Search API alone may not fully confirm README content, the README of each candidate repository is additionally fetched and checked for keyword matches.",
    method5: "The automatically collected results also reflect repositories excluded by the administrator.",
    keywordsLabel: "Keywords used: ",
    linksTitle: "Related links",
    guidelineLink: "Spatial ID Guideline for Utilization of 4D Spatio-Temporal Information",
    repoLink: "Open Data Spaces Spatial ID Related Repositories",
    notesTitle: "Notes",
    note1: "This list is generated automatically",
    note2: "Listing does not imply evaluation or recommendation",
    note3: "Repositories are shown primarily in descending order of stars",
    tableTitle: "List",
    footerText: "Spatial ID OSS Catalog | Automatically generated using GitHub API",
    colNo: "No.",
    colRepository: "Repository",
    colUrl: "URL",
    colDescription: "Description",
    colLanguage: "Language",
    colStars: "⭐ Stars",
    colUpdated: "Updated",
    colTopics: "Topics",
    colLicense: "License",
    colFork: "Fork",
    colIssues: "Issues",
    colWatchers: "Watchers",
    colForks: "Forks",
    linkText: "Link",
    yes: "Yes",
    no: "No",
    loading: "Loading...",
    catalogLoadError: "Failed to load catalog.json"
  }
};

function formatGeneratedAt(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;

  if (currentLang === "ja") {
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

  return d.toLocaleString("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }) + " JST";
}

function applyTranslations(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  const dict = i18n[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const generatedAtEl = document.getElementById("generatedAt");
  if (generatedAtEl && generatedAtEl.dataset.iso) {
    generatedAtEl.textContent = formatGeneratedAt(generatedAtEl.dataset.iso);
  }

  renderTable(repos);
}

fetch("data/catalog.json")
  .then(res => {
    if (!res.ok) throw new Error("catalog.json not found");
    return res.json();
  })
  .then(data => {
    const generatedAtEl = document.getElementById("generatedAt");

    if (generatedAtEl) {
      generatedAtEl.dataset.iso = data.generated_at || "";
      generatedAtEl.textContent = formatGeneratedAt(data.generated_at);
    }

    repos = Array.isArray(data.repos) ? data.repos : [];
    renderTable(repos);
  })
  .catch(err => {
    console.error(err);
    document.querySelector("#catalog tbody").innerHTML =
      `<tr><td colspan="13">${i18n[currentLang].catalogLoadError}</td></tr>`;
  });

function renderTable(data) {
  const tbody = document.querySelector("#catalog tbody");
  tbody.innerHTML = "";

  data.forEach((repo, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${repo.full_name || ""}</td>
      <td><a href="${repo.url}" target="_blank" rel="noopener noreferrer">${i18n[currentLang].linkText}</a></td>
      <td>${repo.description || ""}</td>
      <td>${repo.language || ""}</td>
      <td>${repo.stars || 0}</td>
      <td>${repo.updated_at ? repo.updated_at.slice(0, 10) : ""}</td>
      <td>${repo.topics ? repo.topics.join(", ") : ""}</td>
      <td>${repo.license && repo.license.name ? repo.license.name : ""}</td>
      <td>${repo.fork ? i18n[currentLang].yes : i18n[currentLang].no}</td>
      <td>${repo.open_issues_count || 0}</td>
      <td>${repo.watchers_count || 0}</td>
      <td>${repo.forks_count || 0}</td>
    `;

    tbody.appendChild(tr);
  });

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13">-</td></tr>`;
  }
}

document.getElementById("sortStars").addEventListener("click", () => {
  repos.sort((a, b) =>
    starsDesc
      ? (b.stars || 0) - (a.stars || 0)
      : (a.stars || 0) - (b.stars || 0)
  );
  starsDesc = !starsDesc;
  renderTable(repos);
});

document.getElementById("langSelect").addEventListener("change", (e) => {
  applyTranslations(e.target.value);
});

applyTranslations("ja");
