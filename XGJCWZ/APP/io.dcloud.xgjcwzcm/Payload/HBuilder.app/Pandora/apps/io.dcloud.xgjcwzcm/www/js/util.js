/************************************************
 ** Copyright (C) 2000-2019 DingYe
 ** 类    名：util.js
 ** 作    者：xl
 ** 描    述：通用功能
 ** 生成日期：2019-01-07
 ** 修改日志：
 *     1. 初版    2019-01-07
 *************************************************/
(function() {
	window.util = window.util || {
		// 是否调试
		DEBUG: false,
		// 结果类型
		// 成功代码
		SUCCESS_CODE: "001",
		// 失败代码
		ERROR_CODE: "002",
		// 未授权代码
		UNAUTHORIZED_CODE: "003",
		// 服务器host
		HOST_NAME: "",
		// 生产环境下的Url地址
		// PRO_HOST_NAME: "http://192.168.43.177:8000", //测试用本机地址
		// PRO_HOST_NAME: "http://39.100.114.146:8000", //测试用本机地址
		 //PRO_HOST_NAME: "http://192.168.1.103:8110", //测试用本机地址
		//PRO_HOST_NAME: "http://10.18.3.19/api", //测试用本机地址
		PRO_HOST_NAME: "http://58.218.196.219:30012/api",
		DEV_HOST_NAME: "http://58.218.196.219:30012/api",
		// 测试环境下Url地址
		// DEV_HOST_NAME: "http://192.168.43.177:8000", //测试用本机地址
		// DEV_HOST_NAME: "http://39.100.114.146:8000", //测试用本机地址
		 //DEV_HOST_NAME: "http://192.168.1.103:8110", //测试用本机地址		// DEV_HOST_NAME: "http://58.218.196.212:18088", //测试用本机地址
		// 用户登陆key
		LOGIN_KEY: "login-info",
		// 根目录Key
		ROOT_PATH_KEY: "root-path",
		// 是否跳转
		IS_DIRECT_KEY: "direct-key",

		init: function() {
			this.initEvent();
			if (this.DEBUG) {
				// 如果测试环境
				this.HOST_NAME = this.DEV_HOST_NAME;
			} else {
				this.HOST_NAME = this.PRO_HOST_NAME;
			}
		},
		// 注册事件
		initEvent: function() {
			//取消浏览器的所有事件，使得active的样式在手机上正常生效
			document.addEventListener('touchstart', function() {
				return false;
			}, true);
			// 禁止选择

			document.oncontextmenu = function() {
				return false;
			};
		},
		// 当前天
		nowDate: function() {
			return new Date().format("yyyy-MM-dd");
		},
		// 当前时间
		nowTime: function() {
			return new Date().format("yyyy-MM-dd HH:mm:ss");
		},
		// 当前时间
		nowTimes: function() {
			return new Date().format("HH:mm:ss");
		},
		//判断是否联网
		isConnect: function() {
			return plus.networkinfo.getCurrentType() != 1;
		},
		//判断获取地址
		isAddress: function() {
			if (this.DEBUG) {
				// 如果测试环境
				return this.DEV_HOST_NAME;
			} else {
				return this.PRO_HOST_NAME;
			}
		},
		//判断是否登录
		isLogin: function() {
			var info = this.getLoginInfo();
			//console.log(info.username)

			return info && info.token // info && info.user && info.user.userNo;
		},

		// 获取登陆信息
		getLoginInfo: function() {
			var info = localStorage.getItem(this.LOGIN_KEY),
				result = {};

			if (info) {
				result = JSON.parse(info);
			}
			return result;
		},
		// 设置登陆信息
		setLoginInfo: function(info) {
			if (info) {
				localStorage.setItem(this.LOGIN_KEY, JSON.stringify(info));
			}
		},
		// 转换时间为字符串
		convertTime: function(time, format) {
			time = time.replace(/T/g, " ");
			time = new Date(time);
			return time.format(format);
		},
		// 转换字符串为时间戳
		convertTimeTamp: function(time) {
			time = time.replace(/-/g, ':').replace(' ', ':');
			time = time.split(':');
			time = new Date(time[0], (time[1] - 1), time[2]);
			return time;
		},

		convertLeaveTime: function(time) {
			time = time.split(" ");
			time1 = time[0];
			time2 = time[1];
			time1 = time1.split("-");
			time2 = time2.split(":");
			time = new Date(time1[0], (time1[1] - 1), time1[2], time2[0], time2[1]);
			return time;
		},
		/*
		 * userinfo:{
		 * // 用户Id
		 * userId:"",
		 * // 用户名称
		 * userName:"",
		 * // 登陆名称
		 * loginName:"",
		 * // 登陆令牌
		 * token:""
		 * 
		 * }
		 */
		// 清除用户的信息
		clearLoginInfo: function() {
			localStorage.removeItem(this.LOGIN_KEY);
		},

		// 清除登陆token
		clearLoginToken: function() {
			var info = this.getLoginInfo();
			delete info.token;
			this.setLoginInfo(info);
		},
		getIntervalHour: function(startDate, endDate) {

			var ms = this.convertTimeTamp(endDate).getTime() - this.convertTimeTamp(startDate).getTime();
			if (ms < 0) return -1;
			var num = Number(ms / 1000 / 60 / 60).toFixed(3);

			return num.substring(0, num.indexOf(".") + 2);
		},
		// ajax请求
		ajax: function(options) {
			var that = this;
			if (this.isConnect()) {
				var defaultOptions = {
						dataType: "json",
						timeout: 100000,
						//contentType: "application/json",
						data: {},
						success: function(response, status, xhr) {
							if (that.DEBUG) {
								// console.log(options.url);
								// console.log(JSON.stringify(response)); 
							}
							that.handlerResponse(response, success, status, xhr);
						},
						error: function(xhr, type, errorThrown) {
							// console.log(options.url)
							if (xhr.status == 401) {
								//this.clearDirectLogin();
								//this.directLogin();
								that.clearDirectLogin();
								that.clearLoginInfo();
								that.clearLoginToken();
								that.directLogin();
							}
							if (that.DEBUG) {
								// console.log(options.url)
								console.log(options.url)
								console.log(xhr.responseText);
								console.log("ajax错误描述:" + type + ",异常对象：" + errorThrown);
							}
							try{
								var result = JSON.parse(xhr.responseText);
								mui.toast(result.message||result.error.message)
							}catch(ex){
								
							}
							error && error(xhr, type, errorThrown);

							if (xhr.status == 404) {
								//that.directLogin();
							}
						},
						complete: function(context, xhr, status) {
							complete && complete(context, xhr, status);
							that.closeWaiting();
						}
					},
					success = options.success,
					error = options.error,
					complete = options.complete;

				delete options.success;
				delete options.error;
				delete options.complete;

				options = $.extend({}, defaultOptions, options);
				if (options.needLogin != false) {
					if (this.isLogin()) {
						var loginInfo = this.getLoginInfo();
						var token = loginInfo.token;
						options.beforeSend = function(xhr) {
							xhr.setRequestHeader("Authorization", "Bearer " + token);
							//alert("Authorization");
							//alert(token);
						}
						// $.extend(options.data, {
						// 	// userId: loginInfo.id,
						// 	userName: loginInfo.username,
						// 	// token: loginInfo.token
						// });
					} else {
						//return this.directLogin();
					}
				}

				options.url = !options.url.indexOf("http") ? options.url : (this.HOST_NAME + options.url);
				this.showWaiting();
				mui.ajax(options.url, options);
			} else {
				mui.toast("当前网络连接不可用");
				options.error && options.error.call(null);
				options.complete && options.complete.call(null);
			}
		},

		// 调用页面的reload方法
		pageReload: function(view) {
			view.evalJS("Page.init()");
		},

		// go to login
		directLogin: function() {
			this.clearDirectLogin();
			if (!this.isDirectLogin()) {
				mui.openWindow({
					id: "login",
					url: "/html/login.html",
					extras: {

					}
				});
				this.setDirectLogin();
			}
		},

		getAbsolutePath: function(path) {
			return this.getRootPath() + path;
		},

		getRootPath: function() {
			var path = localStorage.getItem(this.ROOT_PATH_KEY);
			if (!path) {
				path = plus.io.convertLocalFileSystemURL("_www/");
				localStorage.setItem(this.ROOT_PATH_KEY, path);
			}
			return path;
		},

		hasPermission: function(key, callback) {
			this.getPermission(function(data) {
				//console.log(JSON.stringify(data))
				var has = map(data, key);
				callback(has);
			});

			function map(array, key) {
				var has = false;
				$.each(array, function() {
					if (this.code == key) {
						has = true;
						return false;
					}

					if (this.children && this.children.length) {
						has = map(this.children, key);
						if (has) {
							return false;
						}
					}
				})
				return has;
			}
		},

		getPermission: function(callback) {
			var key = "permission";
			localStorage.removeItem(key)
			if (localStorage[key]) {
				console.log(localStorage[key])
				callback(JSON.parse(localStorage[key]))
			} else {
				this.ajax({
					url: '/resource/assignable',
					success: function(data) {
						localStorage[key] = JSON.stringify(data);
						callback(data);
					}
				});
			}

		},

		// 处理请求数据结果
		handlerResponse: function(data, callback, status, xhr) {
			callback && callback(data);
			// 
			// 
			// if(data.success == false) {
			// 	mui.toast("请求失败:" + data.errorMessages[0]);
			// } else {
			// 	// alert(JSON.stringify(data))
			// 	// console.log(JSON.stringify(data)) 
			// 	callback && callback(data);
			// }
			// //			if(data) {
			// //				switch(data.code) {
			// //					callback && callback(data.data, data);
			// //					case this.SUCCESS_CODE:
			// //						callback && callback(data.data, data);
			// //						break;
			// //					case this.ERROR_CODE:
			// //						mui.toast("请求失败:" + data.message);
			// //						break;
			// //					case this.UNAUTHORIZED_CODE:
			// //						mui.toast("请重新登陆");
			// //						// 跳转至登陆页
			// //						this.directLogin();
			// //						break;
			// //				}
			// //			}
		},

		// 是否已跳转至登陆页
		isDirectLogin: function() {
			return localStorage.getItem(this.IS_DIRECT_KEY) == "1";
		},

		// 已经跳转
		setDirectLogin: function() {
			localStorage.setItem(this.IS_DIRECT_KEY, "1");
		},

		// 清除已跳转
		clearDirectLogin: function() {
			localStorage.removeItem(this.IS_DIRECT_KEY);
		},

		// 用0填充
		zeroize: function(value, num) {
			if (typeof value !== "string" && $.isNumeric(value)) {
				value = value.toString();
			}

			while (value.length < num) {
				value = "0" + value;
			}
			return value;
		},

		// 发送请求内容
		sendRequest: function(params) {
			//URL参数的传递
			var isJson = typeof(params) == "object" &&
				Object.prototype.toString.call(params).toLowerCase() == "[object object]" && !params.length;
			if (isJson) {
				return encodeURI(encodeURI(JSON.stringify(params)));
			} else {
				return encodeURI(encodeURI(params));
			}
		},

		// 获取链接内容
		getRequest: function() {
			//URL参数的获取
			var url = location.search;
			var theRequest = {};
			if (url.indexOf("?") != -1) {
				var str = url.substr(1);
				strs = str.split("&");
				for (var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = decodeURI(decodeURI(strs[i].split("=")[1]));
				}
			}
			return theRequest;
		},

		// 显示等待
		showWaiting: function(text, onclose, autoClose, size) {
			var waiting = plus.nativeUI.showWaiting(text || "", {
				//透明背景 雪花样式
				//等待框背景区域宽度，默认根据内容自动计算合适宽度
				//modal: true,
				size: size || "20px",
				//style: 'black',
				//点击是否关闭等待框
				padlock: !!autoClose
			});
			waiting.onclose = onclose || null;
			return waiting;
		},
		// 设置待标题
		setWaitingTitle: function(waiting, text) {
			waiting && waiting.setTitle(text);
		},

		// 关闭等待
		closeWaiting: function(waiting) {
			if (waiting) {
				waiting.close();
			} else {
				plus.nativeUI.closeWaiting();
			}
		},


		// 退出
		appBack: function() {
			//双击后退退出登录
			var preTime = 0;
			mui.back = function() {
				var wvB = plus.webview.currentWebview(); //获取当前窗口的WebviewObject对象，即B  
				var wvA = wvB.opener(); //获取当前窗口的创建者，即A  
				wvA.evalJS("Page.backInit()"); //执行父窗口中的方法  A中的showAG方法  
				wvB.close();
			};
		},


		// 退出
		appQuit: function() {
			//双击后退退出登录
			var preTime = 0;
			mui.back = function() {
				var now = new Date().getTime();
				if (now - preTime > 2000) {
					preTime = now;
					mui.toast('再按一次退出应用');

				} else {
					plus.runtime.quit();
				}
			};
		},
		timestampToTime: function(timestamp) {
			var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
			var Y = date.getFullYear() + '-';
			var M;
			M = (date.getMonth() + 1) + '-'

			var D;
			if (date.getDate() <= 9) {
				D = '0' + date.getDate() + ' '
			} else {
				D = date.getDate() + ' '
			}
			var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
			var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '';

			return Y + M + D + h + m;
		},
		timestampToDate: function(timestamp) {
			var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
			var Y = date.getFullYear() + '/';
			var M = (date.getMonth() + 1) + '/';
			var D = date.getDate() + ' ';


			return Y + M + D;
		},
		timestampToDD: function(timestamp) {
			var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
			var Y = date.getFullYear() + '-';
			var M = (date.getMonth() + 1) + '-';
			var D = date.getDate() + ' ';

			return Y + M + D;
		},
		// 		timestampToTime: function(timestamp) {
		// 			var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
		// 			var Y = date.getFullYear() + '-';
		// 			var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
		// 			var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
		// 			var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
		// 			var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
		// 			var s = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '';
		// 		
		// 			return Y + M + D + h + m + s;
		// 		},
		timestampToDay: function(timestamp) {
			var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
			var Y = date.getFullYear() + '-';
			var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
			var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
			var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
			var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
			var s = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '';

			return Y + M + D;
		},
		androidOpenNotify: function() {
			if (!localStorage["notify-set"] && plus.os.name === "Android") {


				var main = plus.android.runtimeMainActivity();
				var pkName = main.getPackageName();
				var NotificationManagerCompat = plus.android.importClass("android.support.v4.app.NotificationManagerCompat");
				var packageNames = NotificationManagerCompat.from(main);
				//console.log(JSON.stringify(packageNames));  
				// if (packageNames.areNotificationsEnabled()) {  
				//     console.log('已开启通知权限');  
				// }else{  
				plus.nativeUI.confirm('请先打开APP通知权限', function(i) {
					if (0 == i.index) {
						var Intent = plus.android.importClass('android.content.Intent');
						var intent = new Intent('android.settings.APP_NOTIFICATION_SETTINGS'); //可设置表中所有Action字段  
						intent.putExtra('android.provider.extra.APP_PACKAGE', pkName);
						main.startActivity(intent);
					}


				}, "提示", ["确定", "取消"]);
				// }
				localStorage["notify-set"] = "1";
			}
		},
		// 转换为JSON数据
		toJson: function(selector) {
			var result = {};
			$(selector).each(function() {
				var $this = $(this),
					name = $this.attr("name"),
					val = $this.val();
				result[name] = val;
			});

			return result;
		},
		// 获取当前主机Url
		getHostName: function() {
			return this.HOST_NAME;
		},
		// 获取当前时间
		getNowDate: function() {
			var date = new Date();
			var sign1 = "-";
			var sign2 = ":";
			var year = date.getFullYear() // 年
			var month = date.getMonth() + 1; // 月
			var day = date.getDate(); // 日
			var hour = date.getHours(); // 时
			var minutes = date.getMinutes(); // 分
			var seconds = date.getSeconds() //秒
			var weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
			var week = weekArr[date.getDay()];
			// 给一位数数据前面加 “0”
			if (month >= 1 && month <= 9) {
				month = "0" + month;
			}
			if (day >= 0 && day <= 9) {
				day = "0" + day;
			}
			if (hour >= 0 && hour <= 9) {
				hour = "0" + hour;
			}
			if (minutes >= 0 && minutes <= 9) {
				minutes = "0" + minutes;
			}
			if (seconds >= 0 && seconds <= 9) {
				seconds = "0" + seconds;
			}
			var currentdate = year + sign1 + month + sign1 + day + " " + hour + sign2 + minutes + sign2 + seconds + " " +
				week;
			return currentdate;
		},

		// 上下拉刷新配置
		pullRefreshOptions: {
			container: '#pullrefresh',
			domContainer: "",
			noContentDom: "",
			type: "GET",
			down: true,
			up: true,
			source: "",
			params: {},
			contentType: "application/json",
			template: "template",
			limitField: "rows",
			offsetField: "page",
			limit: 10,
			rowsField: "rows",
			totalField: "total",
			resultHandler: null
		},
		// 上下拉刷新
		/*
		 * option {
		 * 			container: '#pullrefresh',
					down: true,
					up: true,
					source:url|function,
					params:object|function,
					template:"id",
					limitField:"limit"
		 * }
		 * 
		 * */
		pullRefresh: function(options) {
			$.extend(this.pullRefreshOptions, options);
			var opt = {};
			var that = this;
			opt.container = this.pullRefreshOptions.container;
			if (this.pullRefreshOptions.up) {
				opt.up = {
					contentrefresh: '数据加载中...',
					contentnomore: '没有更多数据了',
					callback: function() {
						if (mui.os.plus) {
							setTimeout(function() {
								that.pullRefreshRequest("up");
							}, 500);
						} else {
							that.pullRefreshRequest("up");
						}
					}
				};
			}
			if (this.pullRefreshOptions.down) {
				opt.down =$.extend({
					style: 'circle',
					callback: function() {
						that.pullRefreshRequest("down");
						// console.log(that.pullRefreshOptions.url)
					}},this.pullRefreshOptions.down);
			}

			if (this.pullRefreshOptions.down && this.pullRefreshOptions.up) {
				opt.up.auto = true;
			} else if (this.pullRefreshOptions.down) {
				opt.down.auto = true;
			} else if (this.pullRefreshOptions.up) {
				opt.up.auto = true;
			}
			mui.init({
				pullRefresh: opt
			});

		},
		pullRefreshCount: 0,
		// 上下拉请求,
		// type:down,下拉刷新；up:上拉更多
		pullRefreshRequest: function(type) {
			var params = {},
				that = this,
				url = this.pullRefreshOptions.source;
			if ($.isFunction(this.pullRefreshOptions.params)) {
				params = this.pullRefreshOptions.params();
			} else {
				params = this.pullRefreshOptions.params;
			}

			if (type == "down") {
				this.pullRefreshCount = 0;
			}
			// limit and offset
			params[this.pullRefreshOptions.limitField] = this.pullRefreshOptions.limit;

			//this.pullRefreshCount = this.pullRefreshCount + 1;
			params[this.pullRefreshOptions.offsetField] = this.pullRefreshCount;

			if ($.isFunction(this.pullRefreshOptions.source)) {
				url = this.pullRefreshOptions.source();
			}
			var $noContentDom = $(that.pullRefreshOptions.noContentDom),
				$container = mui(that.pullRefreshOptions.container);
			this.ajax({
				url: url,
				data: params,
				type: this.pullRefreshOptions.type,
				contentType: this.pullRefreshOptions.contentType,
				error: function(err) {

					$container.pullRefresh().endPulldownToRefresh(true);
					$container.pullRefresh().disablePullupToRefresh();
				},
				success: function(data) {

					//alert(JSON.stringify(data.content))
					var rowField = that.pullRefreshOptions.rowField,
						totalField = that.pullRefreshOptions.totalField,
						rows = data.data,
						$dom,
						total = data.total;


					if ($.isFunction(that.pullRefreshOptions.resultHandler)) {
						data = that.pullRefreshOptions.resultHandler(data);
					}

					if ($.isFunction(that.pullRefreshOptions.domContainer)) {
						$dom = $(that.pullRefreshOptions.domContainer());
					} else if (typeof that.pullRefreshOptions.domContainer === "string") {
						$dom = $(that.pullRefreshOptions.domContainer);
					}
					if (total) {
						$dom.show();
						$noContentDom.hide();
						if (rows.length) {
							if (type == "down") {
								// 下拉刷新当前数据
								$dom.empty();
							}

							var temp = that.pullRefreshOptions.template;
							if ($.isFunction(temp)) {
								temp = temp();
							}
							if(temp){
								$dom.append(template(temp, data));
							}
							
							if (type == "down") {
								$container.pullRefresh().endPulldownToRefresh();
								$container.pullRefresh().refresh(true);
							}
							//that.pullRefreshCount += rows.length;
							that.pullRefreshCount++;
							$container.pullRefresh().endPullupToRefresh(total <= ((that.pullRefreshCount) * that.pullRefreshOptions
								.limit + rows.length));
						} else {
							$container.pullRefresh().endPulldownToRefresh(true);
							$container.pullRefresh().disablePullupToRefresh();
						}
					} else {
						$dom.hide();
						$noContentDom.show();
						$container.pullRefresh().endPulldownToRefresh(true);
						$container.pullRefresh().disablePullupToRefresh();
					}
				}
			});
		}
	};
	util.init();
})(window, mui);

//全局配置
mui.initGlobal({
	swipeBack: false
});

Date.prototype.format = function(fmt) {
	var o = {
		//月份
		"M+": this.getMonth() + 1,
		//日
		"d+": this.getDate(),
		//小时
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
		//小时
		"H+": this.getHours(),
		//分
		"m+": this.getMinutes(),
		//秒
		"s+": this.getSeconds(),
		//季度
		"q+": Math.floor((this.getMonth() + 3) / 3),
		//毫秒
		"S": this.getMilliseconds()
	};
	var week = {
		"0": "/u65e5",
		"1": "/u4e00",
		"2": "/u4e8c",
		"3": "/u4e09",
		"4": "/u56db",
		"5": "/u4e94",
		"6": "/u516d"
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") +
			week[this.getDay() + ""]);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}
