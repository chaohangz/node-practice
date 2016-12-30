var fs = require('fs')
var path = require('path')

// 返回一个包含命令行参数的数组
// 除去前两个参数-- 'node server.js'
var args = process.argv.splice(2)
// 取出第一个参数
var command = args.shift()
// 合并剩余参数
var taskDescription = args.join(' ')
// 根据当前的工作目录解析数据库的相对路径
var file = path.join(process.cwd(), '/.tasks')

switch (command) {
	case 'list':
		listTasks(file)
		break
	case 'add':
		addTask(file, taskDescription)
		break
	default:
		console.log('Usage: ' + process.argv[0]
			+ ' list|add [taskDescription]')
}

// 从文本文件中加载用JSON编码的数据
function loadOrOnitializeTaskArray(file, cb) {
	// 检查文件是否存在
	fs.exists(file, function(exists) {
		var tasks = []
		if (exists) {
			fs.readFile(file, 'utf8', function(err, data) {
				if (err) throw err
				// data是该文件的内容
				// console.log(typeof(data)) //data是什么数据类型
				// data is a string
				var data = data.toString()
				// data 为JSON数据
				var tasks = JSON.parse(data || '[]')
				cb(tasks)
			})
		} else {
			cb([])
		}
	})
}

// 列出所有任务
function listTasks(file) {
	loadOrOnitializeTaskArray(file, function(tasks) {
		for(var i in tasks) {
			console.log(tasks[i])
		}
	})
}

// 把任务保存到磁盘中
// 保存为JSON数据
function storeTask(file, tasks) {
	fs.writeFile(file, JSON.stringify(tasks), 'utf8', function(err) {
		if (err) throw err
		console.log('Saved.')
	})
}

// 添加任务并保存
function addTask(file, taskDescription) {
	loadOrOnitializeTaskArray(file, function(tasks) {
		tasks.push(taskDescription)
		storeTask(file, tasks)
	})
}