

export function expectHtmlFrom(selector) {
  var elems = document.querySelectorAll(selector)
  var html = ''
  for (var i = 0 ; i < elems.length ; i++) {
    html += elems[i].textContent
  }
  return html
}

export function toContainText(text) {
  return (err, html) => {
    if (!html) throw new Error('text "' + text + '" was not found')
    if (html.value.indexOf(text) === -1) throw new Error('text "' + text + '" not found from html: ' + html.value)
  }
}
