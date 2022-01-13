const fs = require('fs')
const http = require('http')

const path = __dirname + '/../example'
const server = http.createServer(function (req, res) {
    console.log(path + req.url)

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', `public, max-age=${7 * 24 * 60 * 60}`)

    fs.readFile(path + req.url, (err, data) => {
        if (err) {
            res.writeHead(404)
            res.end(JSON.stringify(err))
            return
        }

        res.writeHead(200)
        res.end(data)
    })
})

const port = 9966
server.listen(port, '127.0.0.1', function () {
    console.log('Loader server listening on port', port)
})
