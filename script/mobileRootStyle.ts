import * as fs from 'node:fs'

// 向 dist/index.html 写入android样式，用于解决安卓webview中深色模式下背景闪屏问题
const style = `  <style>
    body {
      background-color: white;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: black;
      }
    }
  </style>`

// write styleStr to dist/index.html after </body> tag
function writeStyle(styleStr) {
  const indexHtml = fs.readFileSync('dist/index.html', 'utf-8')
  const newHtml = indexHtml.replace('</body>', `</body>\n${styleStr}`)
  fs.writeFileSync('dist/index.html', newHtml)
}

writeStyle(style)
