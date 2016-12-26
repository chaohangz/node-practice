// 读取几个文本文件的内容，并输出单词在整个文件中出现的次数

// 异步任务并行执行
// 同时读取几个文件的内容并计数，全部执行完成后返回

var fs = require('fs')
var completedTasks = 0
var tasks = []
var wordCounts = {}
var filesDir = './text'


// 当所有任务完成，打印出结果
function checkIfComplete() {
	completedTasks++
	if (completedTasks === tasks.length) {
		for (var index in wordCounts) {
			console.log(index + ': ' + wordCounts[index])
		}
	}
}


// 对单词计数
function countWordsInText(text) {
	var words = text
		.toString()
		.toLowerCase()
		.split(/\W+/)  // \W为所有非单词字符
		.sort()

	for (var index in words) {
		var word = words[index]
		if (word) {
			wordCounts[word] = (wordCounts[word]) ? wordCounts[word] + 1 : 1
		}
	}
}

fs.readdir(filesDir, function(err, files) {
	if (err) throw err

	for (var index in files) {
		var task = (function(file) {
			return function() {
				fs.readFile(file, function(err, text) {
					if (err) throw err
					countWordsInText(text)
					checkIfComplete()
				})
			}
		}) (filesDir + '/' + files[index])
		tasks.push(task)
	}
	for (var task in tasks) {
		tasks[task] ()
	}
})