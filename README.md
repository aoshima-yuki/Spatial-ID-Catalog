---

# Spatial ID OSS List

本リポジトリは、GitHub上で公開されている空間ID（Spatial ID）関連OSSの候補を自動収集し、リストとして可視化するためのものです。

公開ページ：
https://aoshima-yuki.github.io/Spatial-ID-OSS-List/

---

## 概要

本リストは、GitHub上で公開されている空間ID関連OSSの候補を自動収集し、参照しやすい形で表示することを目的としています。

主な目的は以下のとおりです。

* 空間ID関連OSSの発見性向上
* 実装例・関連ツールの把握
* 空間IDの活用事例や関連実装の把握

本リストは、キーワードに基づく自動収集結果であり、掲載されたリポジトリの評価・推奨・認定を意味するものではありません。

---

## システム構成

```text
Spatial-ID-OSS-List/
├─ .github/workflows/
│  └─ collect.yml        # OSS情報収集の自動化
├─ docs/
│  ├─ index.html         # Webページ
│  ├─ script.js          # 表示ロジック
│  ├─ style.css
│  └─ data/
│     └─ catalog.json    # リストデータ（自動生成）
├─ scripts/
│  └─ collect.py         # GitHub API 収集スクリプト
├─ config/
│  └─ exclude_repos.json # 除外リスト（手動管理）
└─ README.md
```

---

## データ更新の仕組み

1. GitHub Actions（collect.yml）を実行します。
2. `collect.py` により、GitHub API から候補リポジトリを収集します。
3. リポジトリ検索に加え、README等のMarkdownファイル検索からも候補を収集します。
4. 候補リポジトリごとにメタデータとREADMEを取得します。
5. 検索対象項目にキーワードが含まれるかを確認します。
6. 除外リストに登録されたリポジトリを除外します。
7. `docs/data/catalog.json` を生成し、GitHub Pages に反映します。

---

## 実行方法

### 手動実行

GitHub Actions の以下から実行できます。

```text
Actions → Collect Spatial ID OSS → Run workflow
```

### 自動実行

以下のスケジュールで自動実行されます。

* 毎日 09:00 JST

---

## 検索条件

以下のキーワードを対象に収集しています。
英字の大文字・小文字は区別せずに判定します。
たとえば、`SpatialID`、`spatialid`、`SPATIALID` は同じ扱いになります。

```text
空間ID
空間ＩＤ
spatial-id
spatialid
```

検索対象項目は以下です。

* リポジトリ名（name）
* リポジトリ概要（description）
* Topics
* README

---

## 並び順

リストは以下の優先順位で表示されます。

1. Stars数（降順）
2. 更新日時（新しい順）

---

## 除外方法

キーワードベースの自動収集のため、空間IDと直接関係しないリポジトリが含まれる場合があります。
その場合は、以下のファイルで除外できます。

### 対象ファイル

```text
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

* `full_name`（例：org/repo）で指定します。
* 完全一致で除外します。
* 次回の GitHub Actions 実行時に反映されます。

---

## 注意事項

* 本リストはキーワードに基づく自動収集により生成しています。
* 掲載されているリポジトリは、評価・推奨・認定を意味するものではありません。
* キーワード検索の特性上、空間IDと直接関係しないリポジトリが含まれる場合があります。
* GitHub API の仕様や検索条件により、すべての関連OSSを網羅できるとは限りません。

---
