import requests
import json
import os
import sys
import base64
from time import sleep
from datetime import datetime, timezone

# 保存先ディレクトリ作成
os.makedirs("docs/data", exist_ok=True)
os.makedirs("config", exist_ok=True)

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    print("Error: GITHUB_TOKEN is not set")
    sys.exit(1)

HEADERS = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {GITHUB_TOKEN}"
}

REPO_SEARCH_URL = "https://api.github.com/search/repositories"
CODE_SEARCH_URL = "https://api.github.com/search/code"

# リポジトリ検索用クエリ
REPO_QUERY = (
    '"空間ID" OR "空間ＩＤ" OR "spatialid" OR "spatial-id" '
    'in:name,description,topics'
)

# README/Markdown 検索用クエリ
CODE_QUERY = (
    '("空間ID" OR "空間ＩＤ" OR "spatialid" OR "spatial-id") '
    'filename:README.md OR filename:README.rst OR extension:md'
)

# 検索・判定に使用するキーワード
# 英字は大文字・小文字を区別せず判定する。
KEYWORDS = [
    "空間ID",
    "空間ＩＤ",
    "spatialid",
    "spatial-id"
]

EXCLUDE_FILE = "config/exclude_repos.json"


def load_exclude_repos():
    if not os.path.exists(EXCLUDE_FILE):
        return set()

    try:
        with open(EXCLUDE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return set(data)
    except Exception as e:
        print(f"Warning: failed to load {EXCLUDE_FILE}: {e}")
        return set()


def github_get(url, params=None):
    res = requests.get(url, headers=HEADERS, params=params)

    if res.status_code != 200:
        print(f"GitHub API error: {res.status_code}")
        print(res.text)
        return None

    return res.json()


def search_repositories():
    params = {
        "q": REPO_QUERY,
        "per_page": 100,
        "page": 1,
        "sort": "updated",
        "order": "desc"
    }

    items = []

    while True:
        data = github_get(REPO_SEARCH_URL, params=params)
        if data is None:
            break

        page_items = data.get("items", [])
        if not page_items:
            break

        items.extend(page_items)

        # API使用量を抑えるため、最大4ページまで取得する
        if params["page"] >= 4 or len(page_items) < 100:
            break

        params["page"] += 1
        sleep(1)

    return items


def search_code_repositories():
    params = {
        "q": CODE_QUERY,
        "per_page": 100,
        "page": 1
    }

    repo_full_names = set()

    while True:
        data = github_get(CODE_SEARCH_URL, params=params)
        if data is None:
            break

        page_items = data.get("items", [])
        if not page_items:
            break

        for item in page_items:
            repo = item.get("repository")
            if repo and repo.get("full_name"):
                repo_full_names.add(repo["full_name"])

        # API使用量を抑えるため、最大2ページまで取得する
        if params["page"] >= 2 or len(page_items) < 100:
            break

        params["page"] += 1
        sleep(1)

    return repo_full_names


def fetch_repo(full_name):
    url = f"https://api.github.com/repos/{full_name}"
    return github_get(url)


def fetch_readme_text(full_name):
    readme_url = f"https://api.github.com/repos/{full_name}/readme"

    try:
        res = requests.get(readme_url, headers=HEADERS)
        if res.status_code != 200:
            return ""

        readme_data = res.json()
        content = base64.b64decode(readme_data["content"]).decode(
            "utf-8",
            errors="ignore"
        )
        return content
    except Exception as e:
        print(f"Error fetching README for {full_name}: {e}")
        return ""


def contains_keyword(text):
    if not text:
        return False

    normalized_text = text.lower()
    return any(keyword.lower() in normalized_text for keyword in KEYWORDS)


def repo_matches(repo, readme_text):
    name = repo.get("name") or ""
    description = repo.get("description") or ""
    topics = repo.get("topics") or []

    if contains_keyword(name):
        return True

    if contains_keyword(description):
        return True

    if any(contains_keyword(topic) for topic in topics):
        return True

    if contains_keyword(readme_text):
        return True

    return False


def build_list_item(repo):
    return {
        "name": repo.get("name"),
        "full_name": repo.get("full_name"),
        "url": repo.get("html_url"),
        "description": repo.get("description"),
        "language": repo.get("language"),
        "stars": repo.get("stargazers_count", 0),
        "updated_at": repo.get("updated_at"),
        "topics": repo.get("topics", []),
        "license": repo.get("license"),
        "fork": repo.get("fork", False),
        "open_issues_count": repo.get("open_issues_count", 0),
        "watchers_count": repo.get("watchers_count", 0),
        "forks_count": repo.get("forks_count", 0)
    }


def updated_at_timestamp(item):
    value = item.get("updated_at") or "1970-01-01T00:00:00Z"

    try:
        return int(datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp())
    except ValueError:
        return 0


def main():
    exclude_repos = load_exclude_repos()

    # 1. リポジトリ検索により候補を収集
    repo_search_items = search_repositories()
    print(f"Found {len(repo_search_items)} repositories from repository search")

    repo_map = {}
    for repo in repo_search_items:
        full_name = repo.get("full_name")
        if full_name:
            repo_map[full_name] = repo

    # 2. README等のMarkdownファイル検索により候補を追加収集
    code_repo_names = search_code_repositories()
    print(f"Found {len(code_repo_names)} repositories from code search")

    for full_name in code_repo_names:
        if full_name not in repo_map:
            repo_data = fetch_repo(full_name)
            if repo_data and repo_data.get("full_name"):
                repo_map[full_name] = repo_data
                sleep(0.2)

    print(f"Total candidate repositories: {len(repo_map)}")

    oss_list = []

    # 3. 候補ごとにREADMEを取得し、検索対象項目にキーワードが含まれるか確認
    for full_name, repo in repo_map.items():
        if full_name in exclude_repos:
            print(f"Excluded: {full_name}")
            continue

        readme_text = fetch_readme_text(full_name)

        if repo_matches(repo, readme_text):
            oss_list.append(build_list_item(repo))

        sleep(0.2)

    # 4. Stars降順、同点の場合は更新日時の新しい順で並び替え
    oss_list.sort(
        key=lambda item: (
            -(item.get("stars") or 0),
            -updated_at_timestamp(item),
            item.get("full_name") or ""
        )
    )

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "repo_count": len(oss_list),
        "repos": oss_list
    }

    with open("docs/data/catalog.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Collected {len(oss_list)} repositories containing keywords")
    print("Wrote docs/data/catalog.json")


if __name__ == "__main__":
    main()
