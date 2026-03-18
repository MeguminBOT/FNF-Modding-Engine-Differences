(function () {
  "use strict";

  var OWNER = "MeguminBOT";
  var REPO = "FNF-Modding-Engine-Differences";
  var API = "https://api.github.com";
  var PER_PAGE = 20;

  var listEl, statusEl, paginationEl;
  var currentPage = 1;
  var diffCache = {};

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function timeAgo(dateStr) {
    var seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return seconds + "s ago";
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + "m ago";
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    var days = Math.floor(hours / 24);
    if (days < 30) return days + "d ago";
    var months = Math.floor(days / 30);
    if (months < 12) return months + "mo ago";
    return Math.floor(months / 12) + "y ago";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function fetchJSON(url) {
    return fetch(url, {
      headers: { Accept: "application/vnd.github.v3+json" },
    }).then(function (res) {
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("GitHub API rate limit exceeded. Try again later.");
        }
        throw new Error("GitHub API error: " + res.status);
      }
      return res.json().then(function (data) {
        var link = res.headers.get("Link");
        return { data: data, link: link };
      });
    });
  }

  function parseLinkHeader(header) {
    var result = {};
    if (!header) return result;
    header.split(",").forEach(function (part) {
      var m = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
      if (m) result[m[2]] = m[1];
    });
    return result;
  }

  function loadCommits(page) {
    currentPage = page || 1;
    statusEl.textContent = "Loading\u2026";
    listEl.innerHTML = "";
    paginationEl.innerHTML = "";

    var url =
      API +
      "/repos/" +
      OWNER +
      "/" +
      REPO +
      "/commits?per_page=" +
      PER_PAGE +
      "&page=" +
      currentPage;

    fetchJSON(url)
      .then(function (result) {
        var commits = result.data;
        var links = parseLinkHeader(result.link);

        if (!commits.length) {
          listEl.innerHTML = '<div class="cl-empty">No commits found.</div>';
          statusEl.textContent = "";
          return;
        }

        statusEl.textContent =
          "Page " + currentPage + " \u00b7 " + commits.length + " commits";

        commits.forEach(function (c) {
          listEl.appendChild(renderCommit(c));
        });

        renderPagination(links);
      })
      .catch(function (err) {
        listEl.innerHTML =
          '<div class="cl-error">' + escapeHtml(err.message) + "</div>";
        statusEl.textContent = "Error";
      });
  }

  function renderCommit(c) {
    var sha = c.sha.substring(0, 7);
    var msg = c.commit.message;
    var firstLine = msg.split("\n")[0];
    var bodyLines = msg.split("\n").slice(1).join("\n").trim();
    var author = c.commit.author.name;
    var date = c.commit.author.date;

    var el = document.createElement("div");
    el.className = "cl-commit";

    var header = document.createElement("div");
    header.className = "cl-commit-header";

    header.innerHTML =
      '<span class="cl-arrow">\u25b6</span>' +
      '<span class="cl-sha">' +
      escapeHtml(sha) +
      "</span>" +
      '<div class="cl-info">' +
      '<div class="cl-msg">' +
      escapeHtml(firstLine) +
      "</div>" +
      (bodyLines
        ? '<div class="cl-body">' + escapeHtml(bodyLines) + "</div>"
        : "") +
      '<div class="cl-meta">' +
      escapeHtml(author) +
      " \u00b7 " +
      escapeHtml(timeAgo(date)) +
      " \u00b7 " +
      '<a href="https://github.com/' +
      OWNER +
      "/" +
      REPO +
      "/commit/" +
      c.sha +
      '" target="_blank" rel="noopener" style="opacity:0.7">view on GitHub</a>' +
      "</div></div>";

    var diffContainer = document.createElement("div");
    diffContainer.className = "cl-diff-container";
    diffContainer.innerHTML =
      '<div class="cl-diff-loading">Loading diff\u2026</div>';

    header.addEventListener("click", function (e) {
      if (e.target.tagName === "A") return;
      el.classList.toggle("open");
      if (el.classList.contains("open") && !diffContainer.dataset.loaded) {
        loadDiff(c.sha, diffContainer);
      }
    });

    el.appendChild(header);
    el.appendChild(diffContainer);
    return el;
  }

  function loadDiff(sha, container) {
    if (diffCache[sha]) {
      renderDiff(diffCache[sha], container);
      return;
    }

    var url = API + "/repos/" + OWNER + "/" + REPO + "/commits/" + sha;
    fetchJSON(url)
      .then(function (result) {
        diffCache[sha] = result.data;
        renderDiff(result.data, container);
      })
      .catch(function (err) {
        container.innerHTML =
          '<div class="cl-error">' + escapeHtml(err.message) + "</div>";
      });
  }

  function renderDiff(commitData, container) {
    container.dataset.loaded = "1";
    var files = commitData.files || [];

    if (!files.length) {
      container.innerHTML = '<div class="cl-empty">No file changes.</div>';
      return;
    }

    var totalAdd = 0, totalDel = 0;
    files.forEach(function (f) { totalAdd += f.additions; totalDel += f.deletions; });

    var html = '<div class="cl-diff-summary">' +
      '<span>' + files.length + ' file' + (files.length !== 1 ? 's' : '') + ' changed</span>' +
      '<span class="add">+' + totalAdd + '</span>' +
      '<span class="del">-' + totalDel + '</span>' +
      '<button class="cl-expand-all" data-state="collapsed">Expand all</button>' +
      '</div>';

    files.forEach(function (file) {
      html += '<div class="cl-diff-file">';
      html +=
        '<div class="cl-diff-file-header">' +
        '<span class="cl-diff-file-arrow">\u25b6</span>' +
        '<span class="cl-diff-file-name">' +
        escapeHtml(file.filename) +
        " <em>(" +
        escapeHtml(file.status) +
        ")</em></span>" +
        '<span class="cl-diff-stat">' +
        '<span class="add">+' +
        file.additions +
        "</span> " +
        '<span class="del">-' +
        file.deletions +
        "</span></span></div>";

      html += '<div class="cl-diff-body">';
      if (file.patch) {
        html += renderPatch(file.patch);
      } else {
        html +=
          '<div class="cl-diff-hunk">(Binary file or diff too large)</div>';
      }
      html += '</div>';

      html += "</div>";
    });

    container.innerHTML = html;

    // Wire up per-file collapse/expand
    container.querySelectorAll(".cl-diff-file-header").forEach(function (hdr) {
      hdr.addEventListener("click", function () {
        hdr.parentElement.classList.toggle("open");
      });
    });

    // Wire up expand/collapse all button
    var expandBtn = container.querySelector(".cl-expand-all");
    if (expandBtn) {
      expandBtn.addEventListener("click", function () {
        var fileEls = container.querySelectorAll(".cl-diff-file");
        var expanding = expandBtn.dataset.state === "collapsed";
        fileEls.forEach(function (f) {
          if (expanding) { f.classList.add("open"); }
          else { f.classList.remove("open"); }
        });
        expandBtn.dataset.state = expanding ? "expanded" : "collapsed";
        expandBtn.textContent = expanding ? "Collapse all" : "Expand all";
      });
    }
  }

  function renderPatch(patch) {
    var lines = patch.split("\n");
    var html = "";
    var oldLine = 0;
    var newLine = 0;

    lines.forEach(function (line) {
      var hunkMatch = line.match(/^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@(.*)/);
      if (hunkMatch) {
        oldLine = parseInt(hunkMatch[1], 10);
        newLine = parseInt(hunkMatch[2], 10);
        html +=
          '<div class="cl-diff-hunk">' +
          escapeHtml(line) +
          "</div>";
        return;
      }

      var cls = "";
      var lnOld = "";
      var lnNew = "";

      if (line.charAt(0) === "+") {
        cls = " cl-diff-add";
        lnNew = newLine++;
      } else if (line.charAt(0) === "-") {
        cls = " cl-diff-del";
        lnOld = oldLine++;
      } else {
        lnOld = oldLine++;
        lnNew = newLine++;
      }

      html +=
        '<div class="cl-diff-line' +
        cls +
        '">' +
        '<span class="ln">' +
        lnOld +
        "</span>" +
        '<span class="ln">' +
        lnNew +
        "</span>" +
        '<span class="code">' +
        escapeHtml(line.substring(1)) +
        "</span></div>";
    });

    return html;
  }

  function renderPagination(links) {
    paginationEl.innerHTML = "";

    if (links.prev || links.next) {
      var prevBtn = document.createElement("button");
      prevBtn.className = "cl-page-btn";
      prevBtn.textContent = "\u2190 Newer";
      prevBtn.disabled = !links.prev;
      prevBtn.addEventListener("click", function () {
        loadCommits(currentPage - 1);
        scrollToTop();
      });

      var nextBtn = document.createElement("button");
      nextBtn.className = "cl-page-btn";
      nextBtn.textContent = "Older \u2192";
      nextBtn.disabled = !links.next;
      nextBtn.addEventListener("click", function () {
        loadCommits(currentPage + 1);
        scrollToTop();
      });

      var pageInfo = document.createElement("span");
      pageInfo.style.fontSize = "0.8rem";
      pageInfo.style.opacity = "0.6";
      pageInfo.textContent = "Page " + currentPage;

      paginationEl.appendChild(prevBtn);
      paginationEl.appendChild(pageInfo);
      paginationEl.appendChild(nextBtn);
    }
  }

  function scrollToTop() {
    var app = document.getElementById("changelog-app");
    if (app) app.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  ready(function () {
    listEl = document.getElementById("changelog-list");
    statusEl = document.getElementById("changelog-status");
    paginationEl = document.getElementById("changelog-pagination");
    var refreshBtn = document.getElementById("changelog-refresh");

    if (!listEl) return;

    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        diffCache = {};
        loadCommits(currentPage);
      });
    }

    loadCommits(1);
  });
})();
