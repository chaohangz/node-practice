var mongodb = require('./db')

function User(user) {
	this.name = user.name
	this.password = user.password
}
module.exports = User

User.prototype.save = function save(callback) {
	// 存入Mongodb文档
	var user = {
		name: this.name,
		password: this.password
	}
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err)
		}
		// 读取 users 集合
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close()
				return callback(err)
			}
			// 为name属性添加索引
			collection.ensureIndex('name', {unique: true})
			// 写入user文档
			collection.insert(user, {safe:true}, function(err, user) {
				mongodb.close()
				callback(err, user)
			})
		})
	})
}