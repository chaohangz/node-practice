var qs = require('querystring')

// 发送html响应
exports.sendHtml = function(res, html) {
	res.setHeader('Content-Type', 'text/html')
	res.setHeader('Content-Length', Buffer.byteLength(html))
	res.end(html)
}

// 解析 HTTP POST 数据
exports.parseReceivedData = function(req, cb) {
	var body = ''
	req.setEncoding('utf8')
	req.on('data', function(chunk) {
		body += chunk
	})
	req.on('end', function() {
		var data = qs.parse(body)
		cb(data)
	})
}

// 渲染表单
exports.actionForm = function(id, path, label) {
	var html = '<form method="POST" action="' + path + '">' +
		'<input type="hidden" name="id" value="' + id + '">' +
		'<input type="submit" value="' + label + '" />' +
		'</form>'
	return html
}

exports.add = function(db, req, res) {
	// 同一个文件内引用暴露的接口为什么还需要exports
	exports.parseReceivedData(req, function(work) {
		db.query(
			// 添加工作记录的sql
			// 三个问号是用来指明应该把参数放在哪里的占位符
			"INSERT INTO work (hours, data, description) " +
			" VALUES (?, ?, ?)",
			// 工作记录数据
			// 用来替代上面的占位符
			[work.hours, work.data, work.description],
			function(err) {
				if (err) throw err
				exports.show(db, res)
			}
		)
	})
}

exports.delete = function(db, req, res) {
	exports.parseReceivedData(req, function(work) {
		db.query(
			// 删除工作记录的sql
			"DELETE FROM work WHERE id = ?",
			// 工作记录ID，替代上面占位符
			[work.id],
			function(err) {
				if (err) throw err
				exports.show(db, res)
			}
		)
	})
}

exports.archive = function(db, req, res) {
	exports.parseReceivedData(req, function(work) {
		db.query(
			"UPDATE work SET archived=1 WHERE id=?",
			[work.id],
			function(err) {
				if (err) throw err
				exports.show(db, res)
			}
		)
	})
}

exports.show = function(db, res, showArchive) {
	var query = "SELECT * FROM work " +
		"WHERE archived=? " +
		"ORDER BY date DESC"
	var archivedValue = (showArchived) ? 1 : 0
	db.query(
		query,
		[archiveVlaue],
		function(err, rows) {
			if (err) throw err
			html = (showArchived)
				? ''
				: '<a href="/archived">Archived Work</a><br/>'
			html += exports.workHitlistHtml(rows)
			html += exports.workFormHtml()
			exports.sendHtml(res, html)
		}
	)
}

// 只显示归档的工作记录
exports.showArchived = function(db, res) {
	exports.show(db, res, true)
}

// 将工作记录渲染为HTML表格
exports.workHitlistHtml = function(rows) {
	var html = '<table>'
	for(var i in rows) {
		html += '<tr>'
		html += '<td>' + rows[i].date + '</td>'
		html += '<td>' + rows[i].hours + '</td>'
		html += '<td>' + rows[i].description + '</td>'
		if (!rows[i].archived) {
			html += '<td>' + exports.workArchiveForm(rowsp[i].id) + '</td>'
		}
		html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>'
		html += '</tr>'
	}
	html += '</table>'
	return html
}

exports.workFormHtml = function() {
	var html = '<form method="POST" action="/">' +
		'<p>Date (YYY-MM-DD):<br/><input name="date" type="text"></p>' +
		'<p>Hours worked:<br/><input name="hours" type="text"></p>' +
		'<p>Description:<br/>' +
		'<textarea name="description"></textarea></p>' +
		'<input type="submit" value="Add" />' +
		'</form>'
	return html
}

exports.workArchiveForm = function(id) {
	return exports.actionForm(id, '/archive', 'Archive')
}

exports.workDeleteForm = function(id) {
	return exports.actionForm(id, '/delete', 'Delete')
}