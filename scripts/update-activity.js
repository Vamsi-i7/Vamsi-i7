'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const username = process.env.GITHUB_USERNAME || 'Vamsi-i7';
const token = process.env.GITHUB_TOKEN;
const readmePath = path.resolve(process.cwd(), 'README.md');

const startMarker = '<!-- RECENT_ACTIVITY_START -->';
const endMarker = '<!-- RECENT_ACTIVITY_END -->';

async function fetchRecentActivity() {
  const url = `https://api.github.com/users/${encodeURIComponent(username)}/events`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': `${username}-activity-updater`,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  const events = await response.json();
  if (!Array.isArray(events)) {
    throw new Error('Expected array of events');
  }

  const activityLines = [];
  const profileRepo = `${username}/${username}`.toLowerCase();

  for (const event of events) {
    if (!event.repo || event.repo.name.toLowerCase() === profileRepo) {
      continue;
    }

    const repoName = event.repo.name;
    const repoUrl = `https://github.com/${repoName}`;
    const date = new Date(event.created_at);
    const timeAgo = formatTimeAgo(date);

    let line = null;

    switch (event.type) {
      case 'PushEvent': {
        const count = event.payload.commits ? event.payload.commits.length : 1;
        const commitWord = count === 1 ? 'commit' : 'commits';
        line = `- 🚀 **Pushed ${count} ${commitWord}** to [\`${repoName}\`](${repoUrl}) · _${timeAgo}_`;
        break;
      }
      case 'CreateEvent': {
        const refType = event.payload.ref_type || 'repository';
        line = `- 🎉 **Created ${refType}** in [\`${repoName}\`](${repoUrl}) · _${timeAgo}_`;
        break;
      }
      case 'WatchEvent': {
        line = `- ⭐ **Starred repository** [\`${repoName}\`](${repoUrl}) · _${timeAgo}_`;
        break;
      }
      case 'ForkEvent': {
        line = `- 🍴 **Forked** [\`${repoName}\`](${repoUrl}) · _${timeAgo}_`;
        break;
      }
      case 'PullRequestEvent': {
        const action = event.payload.action;
        const prNumber = event.payload.pull_request ? `#${event.payload.pull_request.number}` : '';
        line = `- 🔀 **${capitalize(action)} PR ${prNumber}** in [\`${repoName}\`](${repoUrl}) · _${timeAgo}_`;
        break;
      }
      case 'IssuesEvent': {
        const action = event.payload.action;
        const issueNumber = event.payload.issue ? `#${event.payload.issue.number}` : '';
        line = `- 💬 **${capitalize(action)} issue ${issueNumber}** in [\`${repoName}\`](${repoUrl}) · _${timeAgo}_`;
        break;
      }
      default:
        break;
    }

    if (line && !activityLines.includes(line)) {
      activityLines.push(line);
    }

    if (activityLines.length >= 6) {
      break;
    }
  }

  if (activityLines.length === 0) {
    return '_No recent public activity detected._';
  }

  return activityLines.join('\n');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function main() {
  const readme = await fs.readFile(readmePath, 'utf8');

  const startIndex = readme.indexOf(startMarker);
  const endIndex = readme.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    console.warn(`Activity markers missing in README.md. Skipping.`);
    return;
  }

  const activity = await fetchRecentActivity();

  const updatedReadme =
    readme.slice(0, startIndex + startMarker.length) +
    '\n' +
    activity +
    '\n' +
    readme.slice(endIndex);

  await fs.writeFile(readmePath, updatedReadme, 'utf8');
  console.log('Successfully updated recent activity in README.md');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
