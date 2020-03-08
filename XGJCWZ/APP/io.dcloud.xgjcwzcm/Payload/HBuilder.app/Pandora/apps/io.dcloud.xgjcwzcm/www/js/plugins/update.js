/*
 * 描述: 进行APP版本检查,升级
 * 功能: 
 *     1. 获取当前版本号
 *     2. 获取最新版本号
 *     3. 更新当前版本:1) 强制更新; 2) 询问式更新
 * 作者：xl
 * 时间：2018-09-10
 * */

var AppUpdate = {
	// 上一次检查信息
	CHECK_UPDATE_KEY: "check_version",
	// 查询间隔
	//interval: 86400000,
	interval: 0,
	plat: null,
	isAndroid: function() {
		return(this.plat || (this.plat = plus.os.name)) === "Android";
	},
	// 获取当前软件版本
	getCurrentVersion: function(callback) {
		return plus.runtime.getProperty(this.getAppId(), callback);
	},

	// 检查版本, ver1是否高于ver2
	compareVersion: function(ver1, ver2) {
		var ver1s = ver1.split(".", 4),
			ver2s = ver2.split(".", 4),
			result = false,
			tmp1,
			tmp2,
			len = ver1s.length,
			i = 0;
		for(; i < len; i++) {
			tmp1 = parseInt(ver1s[i]);
			tmp2 = parseInt(ver2s.length > i && ver2s[i] || "0");
			if(tmp1 > tmp2) {
				result = true;
				break;
			} else if(tmp1 < tmp2) {
				break;
			}
		}
		return result;
	},

	getAppId: function() {
		return plus.runtime.appid;
	},

	upgrade: function() {
		if(this.checkUpgrade()) {
			this.getLastVersion(this.handleVersion);
		}
	},

	checkUpgrade: function() {
		var result = true,
			item = localStorage.getItem(this.CHECK_UPDATE_KEY);
		if(item) {
			item = JSON.parse(item);
			if(new Date() - new Date(item.time) <= this.interval) {
				result = false;
			}
		}

		return result;
	},

	/*{
	 * 	version:1.1.0,
	 *  path:"",
	 * 	content:"",
	 * type:1,
	 *  force:false
	 * }*/
	handleVersion: function(data, manual) {
		var that = this;
		var item = localStorage.getItem(that.CHECK_UPDATE_KEY);
		if(item) {
			item = JSON.parse(item);
		} else {
			item = {
				//time: moment().format("YYYY-MM-DD hh:mm:ss")
			};
		}
		this.getCurrentVersion(function(info) {
			// console.log(JSON.stringify(info))
			// 如果不是忽略的版本
			if((manual || item.ignoreVersion != data.version) &&
				that.compareVersion(data.version, info.version)) {
				if(data.force) {
					if(that.isAndroid()) {
						that.androidUpgrade(data);
					} else {
						that.iosUpgrade(data);
					}
				} else {
					plus.nativeUI.confirm(data.content, function(i) {
						if(0 == i.index) {
							if(that.isAndroid()) {
								// console.log(JSON.stringify(data));
								that.androidUpgrade(data);
							} else {
								that.iosUpgrade(data);
							}
						}

						localStorage.setItem(that.CHECK_UPDATE_KEY, JSON.stringify(item));
					}, "更新提醒", ["立即更新", "取消"]);
				}
			}
		});
	},

	androidUpgrade: function(data) {
		var that = this;
		switch(data.type) {
			case '1':
				// 整包更新
			case '2':
				// 资源更新
			case '3':
				// 差量更新
			default:
				that.download(data.path, data.force);
				break;
		}
	},

	download: function(path, force) {
		var that = this;
		!force && plus.nativeUI.showWaiting("下载更新中...");
		plus.downloader.createDownload(util.HOST_NAME + path, {
			filename: "_doc/update/"
		}, function(d, status) {
			if(status == 200) {
				console.log("下载成功：" + d.filename);
				// 安装
				that.install(d.filename, force);
			} else {
				console.log("下载失败！");
				!force && plus.nativeUI.alert("更新失败！");
			}!force && plus.nativeUI.closeWaiting();
		}).start();
	},

	install: function(path, force) {
		if(/\.wgt$/.test(path)) {
			plus.runtime.install(path, {
				force: true
			}, function() {

				if(force) {
					plus.runtime.restart();
				} else {
					plus.nativeUI.alert("升级成功,点击确定后重新启动.", function() {
						plus.runtime.restart();
					});
				}

			}, function(e) {
				console.log(e.message);
				console.log(e.code);
			});
		} else if(/\.apk$/.test(path)) {
			mui.toast("install");
			plus.runtime.install(path, {
				force: true
			}, function() {
				if(force) {
					plus.runtime.restart();
				} else {
					plus.nativeUI.alert("升级成功,点击确定后重新启动.", function() {
						plus.runtime.restart();
					});
				}
			}, function(e) {
				console.log(e.message);
				mui.alert(e.message);
			});
		}

	},

	iosUpgrade: function(data) {
		switch(data.type) {
			case '1':
				// 整包更新
				// open url
				plus.runtime.openURL(data.path.replace(/^http(s*)/, "itms-apps"));
				break;
			case '2':
			case '3':
				this.download(data.path, data.force);
				// 差量更新
				break;
		}
	},

	getLastVersion: function(callback) {
		var that = this;
		util.ajax({
			type: 'get',
			url: '/app/version',
			data: {
				appId: this.getAppId(),
				appType: this.isAndroid() ? 1 : 2
			},
			success: function(result) {	
				console.log(result.version)
				callback && callback.call(that, result);
			},
			error: function() {

			}
		});
	}
};