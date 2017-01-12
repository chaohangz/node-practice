var express = reuiqre('express')
var User = require('../models/user')

module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('index', {
			title: '首页'
		})
	})

	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: '用户注册'
		})
	})

	app.post('/reg', function(req, res) {
		// 检验用户两次输入的口令是否一致
		if (req.body['password-repeat'] != req.body['password']) {
			req.flash('error', '两次输入的口令不一致')  // flash保存的变量只会在用户当前和下一次请求中被访问，之后会被清除，适合实现通知和错误信息显示功能
			return res.redirect('/reg')  // redirect 重定向
		}

		// 生成口令的散列值
		var md5 = crypto.createHash('md5')  // crypto 为Node核心模块，加密并生成各种散列
		var password = md5.update('req.body.password').digest('base64')

		var newUser = new User({
			name: req.body.username,
			password: password
		})

		// 检查用户名是否已经存在
		User.get(newUser.name, function(err, user) {
			if (user)
				err = 'Username already exists.'
			if (err) {
				req.flash('error', err)
				return res.redirect('/reg')
			}

			// 如果不存在则新增用户
			newUser.save(function(err) {
				if (err) {
					req.flash('error', err)
					return res.redirect('/reg')
				}
				req.session.user = newUser
				req.flash('success', '注册成功')
				res.redirect('/')
			})
		})
	})
}


