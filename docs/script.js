let repos = [];
let starsDesc = true;
let currentLang = "ja";

const i18n = {
  ja: {
    pageTitle: "空間ID関連OSSリスト",
    overviewTitle: "概要",
    overviewBody: "本ページは、GitHub上で公開されている空間ID関連OSSの候補を自動収集し、リストとして表示するものです。",
    generatedAtLabel: "リスト生成日時：",
    methodTitle: "作成方法",
    method1: "GitHub API を用いて、公開リポジトリからキーワードに一致する候補を収集します。",
    method2: "リポジトリ検索に加え、README等のMarkdownファイル検索からも候補を収集します。",
    method3: "候補リポジトリごとにメタデータとREADMEを取得し、検索対象項目にキーワードが含まれるかを確認します。",
    method4: "除外リストに登録されたリポジトリを除外し、Stars数及び更新日時を基準に並べ替えてリストデータを生成します。",
    targetTitle: "検索対象項目",
    target1: "リポジトリ名（name）",
    target2: "リポジトリ概要（description）",
    target3: "Topics",
    target4: "README",
    keywordsLabel: "使用キーワード：",
    keywordNote: "英字の大文字・小文字は区別せずに判定します。",
    linksTitle: "関連リンク",
    guidelineLink: "4次元時空間情報利活用のための空間IDガイドライン",
    repoLink: "Open Data Spaces 4次元時空間ID 関連リポジトリ",
    notesTitle: "注意事項",
    note1: "本リストはキーワードに基づく自動収集により生成しています。",
    note2: "掲載されているリポジトリは、評価・推奨・認定を意味するものではありません。",
    note3: "キーワード検索の特性上、空間IDと直接関係しないリポジトリが含まれる場合があります。",
    note4: "GitHub API の仕様や検索条件により、すべての関連OSSを網羅できるとは限りません。",
    tableTitle: "OSSリスト",
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
    catalogLoadError: "リストデータを読み込めませんでした"
  },
  en: {
    pageTitle: "Spatial ID OSS List",
    overviewTitle: "Overview",
    overviewBody: "This page automatically collects candidate OSS repositories related to Spatial ID on GitHub and displays them as a list.",
    generatedAtLabel: "List generated at: ",
    methodTitle: "How this list is created",
    method1: "The GitHub API is used to collect candidate public repositories that match the keywords.",
    method2: "In addition to repository search, candidates are also collected through README and other Markdown file searches.",
    method3: "For each candidate repository, metadata and README content are retrieved and checked against the search target fields.",
    method4: "Repositories registered in the exclusion list are removed, and the list data is generated after sorting by stars and update date.",
    targetTitle: "Search target fields",
    target1: "Repository name",
    target2: "Repository description",
    target3: "Topics",
    target4: "README",
    keywordsLabel: "Keywords used: ",
    keywordNote: "Alphabetic uppercase and lowercase letters are not distinguished during matching.",
    linksTitle: "Related links",
    guidelineLink: "Spatial ID Guideline for Utilization of 4D Spatio-Temporal Information",
    repoLink: "Open Data Spaces Spatial ID Related Repositories",
    notesTitle: "Notes",
    note1: "This list is generated automatically based on keyword matching.",
    note2: "Listing does not imply evaluation, recommendation, or certification.",
    note3: "Due to the nature of keyword search, repositories not directly related to Spatial ID may be included.",
    note4: "Due to GitHub API specifications and search conditions, this list may not cover all related OSS repositories.",
    tableTitle: "OSS List",
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
    catalogLoadError: "Failed to load list data"
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

function createTextCell(text) {
  const td = document.createElement("td");
  td.textContent = text ?? "";
  return td;
}

function createLinkCell(url) {
  const td = document.createElement("td");

  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = i18n[currentLang].linkText;
    td.appendChild(a);
  }

  return td;
}

function renderTable(data) {
  const tbody = document.querySelector("#catalog tbody");
  tbody.innerHTML = "";

  data.forEach((repo, i) => {
    const tr = document.createElement("tr");

    tr.appendChild(createTextCell(i + 1));
    tr.appendChild(createTextCell(repo.full_name || ""));
    tr.appendChild(createLinkCell(repo.url));
    tr.appendChild(createTextCell(repo.description || ""));
    tr.appendChild(createTextCell(repo.language || ""));
    tr.appendChild(createTextCell(repo.stars || 0));
    tr.appendChild(createTextCell(repo.updated_at ? repo.updated_at.slice(0, 10) : ""));
    tr.appendChild(createTextCell(Array.isArray(repo.topics) ? repo.topics.join(", ") : ""));
    tr.appendChild(createTextCell(repo.license && repo.license.name ? repo.license.name : ""));
    tr.appendChild(createTextCell(repo.fork ? i18n[currentLang].yes : i18n[currentLang].no));
    tr.appendChild(createTextCell(repo.open_issues_count || 0));
    tr.appendChild(createTextCell(repo.watchers_count || 0));
    tr.appendChild(createTextCell(repo.forks_count || 0));

    tbody.appendChild(tr);
  });

  if (data.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 13;
    td.textContent = "-";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
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

    const tbody = document.querySelector("#catalog tbody");
    tbody.innerHTML = "";

    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 13;
    td.textContent = i18n[currentLang].catalogLoadError;
    tr.appendChild(td);
    tbody.appendChild(tr);
  });

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
