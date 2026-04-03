---

# Spatial ID OSS Catalog

本リポジトリは、空間ID（Spatial ID）に関連するオープンソースソフトウェア（OSS）を
GitHub上から自動収集し、一覧化・可視化するカタログです。

公開ページ：
https://aoshima-yuki.github.io/Spatial-ID-Catalog/

---

## 概要

本カタログは以下を目的としています。

* 空間ID関連OSSの発見性向上
* 実装・利用の促進
* OSSを核としたエコシステム形成

GitHub API を用いてリポジトリを収集し、
GitHub Pages にて静的サイトとして公開しています。

---

## システム構成

```
Spatial-ID-Catalog/
├─ .github/workflows/
│   └─ collect.yml        # OSS情報収集の自動化
├─ docs/
│   ├─ index.html         # Webページ
│   ├─ script.js          # 表示ロジック
│   ├─ style.css
│   └─ data/
│       └─ catalog.json   # カタログデータ（自動生成）
├─ scripts/
│   └─ collect.py         # GitHub API 収集スクリプト
├─ config/
│   └─ exclude_repos.json # 除外リスト（手動管理）
└─ README.md
```

---

## データ更新の仕組み

1. GitHub Actions（collect.yml）が実行される
2. `collect.py` によりGitHub APIからリポジトリ情報を取得
3. READMEを含めてキーワード判定
4. `docs/data/catalog.json` を更新
5. GitHub Pages により自動反映

---

## 実行方法

### 手動実行

GitHub Actions の以下から実行できます：

```
Actions → Collect Spatial ID OSS → Run workflow
```

### 自動実行

以下のスケジュールで自動実行されます：

* 毎日 09:00 JST

---

## 検索条件

以下のキーワードを対象に収集しています：

```
空間ID, 空間ＩＤ, spatial-id, spatialid, SPATIAL-ID, SPATIALID
```

対象フィールド：

* リポジトリ名（name）
* 概要（description）
* Topics
* README（個別取得）

---

## 並び順

一覧は以下の優先順位で表示されます：

1. Stars数（降順）
2. 更新日時（新しい順）

---

## 除外方法（重要）

キーワードベースの自動収集のため、
空間IDと無関係なリポジトリが含まれる場合があります。

その場合は、以下のファイルで除外できます。

### 対象ファイル

```
config/exclude_repos.json
```

### 記述方法

```json
[
  "shiguredo/moqt-js",
  "owner/repository-name"
]
```

### ルール

* `full_name`（例：org/repo）で指定
* 完全一致で除外
* 次回のActions実行時に反映

---

## 注意事項

* 本カタログは自動収集に基づくものであり、内容の正確性を保証するものではありません
* 掲載は評価・推奨を意味しません
* GitHub API の仕様により、すべての対象OSSを網羅できない場合があります

---
