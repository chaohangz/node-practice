// 从一个随机选择的RSS预定源中获取一篇文章的title and URL,并显示出来

// 串行化流程控制
// 让几个异步任务按顺序执行

var fs = require('fs')
var request = require('request')
var htmlparser = require('htmlparser')
var configFilename = './rss_feeds.txt'

function checkForRSSFile() {
	fs.exists(configFilename, function(exists) {
		if (!exists)
			return next(new Error('Missing RSS file: ' + configFilename))

		next(null, configFilename)
	})
}

function readRSSFile(configFilename) {
	fs.readFile(configFilename, function(err, feedList) {
		if (err)
			return next(err)

		feedList = feedList
										.toString()
										.replace(/^\s+ | \s+$/g, '')
										.split("\n")
		var random = Math.floor(Math.random() * feedList.length)
		next(null, feedList[random])
	})
}

function downloadRSSFeed(feedUrl) {
	request({url: feedUrl}, function(err, res, body) {
		if (err) return next(err)
		if (res.statusCode != 200)
			return next(new Error('Abnormal response status code'))

		next(null, body)
	})
}

function parseRSSFeed(rss) {
	var handler = new htmlparser.RssHandler()
	var parser = new htmlparser.Parser(handler)
	parser.parseComplete(rss)
	if (!handler.dom.items.length)
		return next(new Error('No RSS items found'))

	var item = handler.dom.items.shift()
	console.log(item.title)
	console.log(item.link)
}

// 把需要执行的任务放入数组内
var tasks = [ checkForRSSFile,
							readRSSFile,
							downloadRSSFeed,
							parseRSSFeed ]

// Next函数把几个异步任务链接起来，并进行参数传递
function next(err, result) {
	if (err) throw err

	var currentTask = tasks.shift()
	if (currentTask) {
		currentTask(result)
	}
}

next()