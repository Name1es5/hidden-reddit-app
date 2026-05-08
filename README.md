# Reddimail

A browser extension that reskins [old.reddit.com](https://old.reddit.com) to look like Gmail.

![Extension preview](https://img.shields.io/badge/version-1.0.0-blue) ![Manifest V3](https://img.shields.io/badge/manifest-v3-green) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Features

- **Inbox view** — posts displayed as email rows with sender (subreddit), subject (title), domain snippet, score, comment count, and timestamp
- **Read/unread tracking** — unread posts are bold and white; visited posts go gray, persisted in `localStorage`
- **Star posts** — click the star icon on any row to flag a post
- **Left navigation** — Gmail-style sidebar with sort links (Inbox, Hot, New, Rising, Top) and your subscribed subreddits as color-coded labels
- **Comments page** — opening post rendered as an email card with title, meta chips (author, subreddit, score, time, domain), and selftext body
- **No Reddit branding** — alien logo replaced with a mail envelope icon, wordmark replaced with "Mail"
- **Clean search bar** — Reddit's search restyled as Gmail's rounded search input

## Installation

This extension is not on the Chrome Web Store. Install it manually as an unpacked extension.

### Chrome / Brave / Edge

1. Download or clone this repository
2. Open your browser and navigate to `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the folder containing this repository
6. Visit [old.reddit.com](https://old.reddit.com)

### Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file from this repository
4. Visit [old.reddit.com](https://old.reddit.com)

> **Note:** Firefox temporary add-ons are removed on browser restart. For permanent installation, the extension would need to be signed by Mozilla.

## File Structure

```
├── manifest.json   # Extension manifest (Manifest V3)
├── content.js      # DOM transformation logic
├── gmail.css       # Gmail-style stylesheet
└── README.md
```

## How It Works

The extension injects a content script and stylesheet into every `old.reddit.com` page.

- **`content.js`** reads Reddit's existing DOM, extracts post data (title, author, subreddit, score, etc.), hides the original elements, and injects new Gmail-structured HTML
- **`gmail.css`** overrides Reddit's layout with a fixed header, fixed left nav, and an email-list card for the post feed
- Read/unread state is stored in `localStorage` under the key `reddimail_read`, capped at 2,000 entries

## Supported Pages

| Page | Behaviour |
|---|---|
| Front page (`/`) | Full inbox view |
| Subreddit listing (`/r/...`) | Full inbox view |
| Sort pages (`/hot`, `/new`, `/top`, `/rising`) | Full inbox view, active sort highlighted in nav |
| Comments page (`/comments/...`) | OP post as email card + styled comment thread |

## Development

No build step required — plain HTML/CSS/JS.

1. Edit `content.js` or `gmail.css`
2. Go to `chrome://extensions` and click the **refresh** icon on the Reddimail card
3. Hard-refresh (`Ctrl+Shift+R`) any old.reddit.com tab
