/* ZAVIRO Feed-Sync: haelt Versionsangaben, Download-Links und Hashes automatisch aktuell. */
(function () {
  'use strict'

  var FEEDS = {
    hub: 'https://zyhper08.github.io/zaviro-hub-feed/latest.yml',
    launcher: 'https://zyhper08.github.io/zaviro-launcher-feed/latest.yml',
    cleaner: 'https://zyhper08.github.io/zaviro-cleaner-feed/latest.yml'
  }

  function field(text, key) {
    var m = text.match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
  }

  function parse(text) {
    var size = parseInt(field(text, 'size'), 10)
    return {
      version: field(text, 'version'),
      url: field(text, 'path') || field(text, 'url'),
      sha512: field(text, 'sha512'),
      sizeMB: isNaN(size) ? '' : String(Math.round(size / 1048576))
    }
  }

  function setText(app, key, value) {
    if (!value) return
    var nodes = document.querySelectorAll('[data-feed="' + app + ':' + key + '"]')
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value
  }

  function setHref(app, value) {
    if (!value) return
    var nodes = document.querySelectorAll('[data-feed-href="' + app + '"]')
    for (var i = 0; i < nodes.length; i++) nodes[i].setAttribute('href', value)
  }

  function apply(app, data) {
    setText(app, 'version', data.version ? 'v' + data.version : '')
    setText(app, 'sha512', data.sha512)
    setText(app, 'sizeMB', data.sizeMB)
    setHref(app, data.url)
  }

  Object.keys(FEEDS).forEach(function (app) {
    fetch(FEEDS[app] + '?v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status) })
      .then(function (t) { apply(app, parse(t)) })
      .catch(function () { /* statische Werte bleiben als Fallback */ })
  })
})()
