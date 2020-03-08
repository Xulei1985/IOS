/*
 
 * 描述: 用于首页面加载
 * 功能: 
 *     1. 生成底部原生tabbar的
 *     2. 预加载Tab页面
 *     3. 原生tabbar之间的切换
 * 作者: xl
 * 时间: 2018-08-23
 * */

var MainPage = {
	defaultOption: {
		page: {
			interval: 100,
			animate: "fade-in",
			style: {
				top: 0,
				bottom: 50
			},
			reload: false
		},
		icon: {
			normal: {
				position: {
					top: "6px",
					height: "26px"
				},
				textStyle: {
					"fontSrc": "_www/fonts/iconfont.ttf",
					"align": "center",
					"size": "24px",
					color: "#666"
				}
			},
			active: {
				position: {
					top: "6px",
					height: "26px"
				},
				textStyle: {
					"fontSrc": "_www/fonts/iconfont.ttf",
					"align": "center",
					"size": "24px",
					color: "#42a9e2"
				}
			}
		},

		text: {
			normal: {
				position: {
					top: "26px",
					height: "24px"
				},
				textStyle: {
					"align": "center",
					"size": "10px",
					color: "#666"
				}
			},
			active: {
				position: {
					top: "26px",
					height: "24px"
				},
				textStyle: {
					"align": "center",
					"size": "10px",
					color: "#42a9e2"
				}
			}
		},
		tabs: null,
		tabBar: null
	},
	tabBar: null,
	option: null,
	guid: 1,
	inited: false,
	// Tab 宽度
	width: null,
	// 当前选中index
	curIndex: null,

	getId: function() {
		return 'main-page-' + this.guid++;
	},
	init: function(option) {
		var that = this;
		if(this.inited) {
			this.destroy();
		}
		this.option = $.extend({}, this.defaultOption, option);
		if(!this.option.tabBar) {
			throw new Error("tabBar can not be null.");
		}

		var globalPage = this.option.page,
			globalIcon = this.option.icon,
			globalText = this.option.text;
		// 扩展option中各tab
		$.each(this.option.tabs, function(index, item) {
			var width = that.getTabWidth() + "%",
				left = that.getTabLeft(index) + "%";
			this.icon = this.icon && $.extend(true, {}, globalIcon, this.icon) || null;
			if(this.icon) {
				this.icon.normal.position.width = width;
				this.icon.active.position.width = width;
				this.icon.normal.position.left = left;
				this.icon.active.position.left = left;
				if(!this.icon.id) {
					this.icon.id = that.getId();
				}
			}
			this.text = this.text && $.extend(true, {}, globalText, this.text) || null;
			if(this.text) {
				this.text.normal.position.width = width;
				this.text.active.position.width = width;
				this.text.normal.position.left = left;
				this.text.active.position.left = left;
				if(!this.text.id) {
					this.text.id = that.getId();
				}
			}
			if(!this.icon && !this.text) {
				throw new Error("icon and text can not be null.");
			}

			if(!this.page || !this.page.url) {
				throw new Error("page ,page.url can not be null.");
			}
			this.page = $.extend(true, {}, globalPage, this.page);
			if(!this.page.id) {
				this.page.id = that.getId();
			}

		});

		if(!this.inited) {
			this.tabBar = this.option.tabBar;
			this.initEvent();
			this.inited = true;
		} else {

		}

		this.initTabBar();
		this.initPages();

	},

	// 初始化TabBar, 加载Tags
	initTabBar: function() {
		var
			that = this,
			tmp;

		$.each(this.option.tabs, function(index, item) {
			// icon
			tmp = $.extend({
				id: item.icon.id
			}, item.icon.normal);

			that.tabBar.drawText(tmp.text, tmp.position, tmp.textStyle, tmp.id);
			// text
			tmp = $.extend({
				id: item.text.id
			}, item.text.normal);

			that.tabBar.drawText(tmp.text, tmp.position, tmp.textStyle, tmp.id);
		});
	},

	// 预加载各页面
	initPages: function() {
		var isImmersedStatusbar = plus.navigator.isImmersedStatusbar(),
			isAndroid = mui.os.android,
			barHeight = plus.navigator.getStatusbarHeight(),
			currentPage = plus.webview.currentWebview(),
			titleView = currentPage.getTitleNView();
		$.each(this.option.tabs, function() {
			if(isAndroid) {
				if(isImmersedStatusbar) {
					this.page.style.top += barHeight;
				}
				if(titleView) {
					this.page.style.top += titleView.getStyle().height;
				}
			}

			if(this.page.isMain) {
				this.webView = currentPage;
			} else {
				var sub = plus.webview.getWebviewById(this.page.id);
				if(!sub) {
					sub = plus.webview.create(this.page.url, this.page.id, this.page.style);
				}
				// 缓存
				this.webView = sub;

				//初始化隐藏
				sub.hide();
				// append到当前父webview
				currentPage.append(sub);
			}
		});
	},

	getTabWidth: function() {
		if(!this.width) {
			this.width = Math.floor(100 / this.option.tabs.length);
		}
		return this.width;
	},

	getTabLeft: function(index) {
		return this.getTabWidth() * index;
	},

	getIndex: function(clientX) {
		return Math.floor(clientX / window.innerWidth * 100 / this.getTabWidth());
	},

	// 加载事件
	initEvent: function() {
		var that = this;
		this.tabBar.addEventListener("click", function(e) {
			var clientX = e.clientX,
				index = that.getIndex(clientX);
			that.changeTab(index);
		});
	},
	// 切换Tab
	changeTab: function(index) {
		
		if(index != this.curIndex) {
			var opt = this.option.tabs[index],
				icon = opt.icon,
				text = opt.text,
				webView = opt.webView;
			// 修改Tab icon选中样式
			this.tabBar.drawText(icon.active.text, icon.active.position, icon.active.textStyle, icon.id);
			this.tabBar.drawText(text.active.text, text.active.position, text.active.textStyle, text.id);
			// 显示页面
			if(opt.page.reload) {
				//webView.reload();
				//webView.eval("Page.reload()");
				util.pageReload(webView);
			}
			if(opt.page.isMain) {
				$.each(this.option.tabs, function() {
					if(!this.page.isMain) {
						this.webView.hide();
					}
				});
			} else {
				plus.webview.show(webView, opt.page.animate, opt.page.interval);
			}

			if($.isNumeric(this.curIndex)) {
				var preOpt = this.option.tabs[this.curIndex],
					preIcon = preOpt.icon,
					preText = preOpt.text,
					preView = preOpt.webView;
				// 调整原有的样式
				this.tabBar.drawText(preIcon.normal.text, preIcon.normal.position,
					preIcon.normal.textStyle, preIcon.id);
				this.tabBar.drawText(preText.normal.text, preText.normal.position,
					preText.normal.textStyle, preText.id);
				// 隐藏原来显示的页面
				//plus.webview.hide(preView,"fade-out",300);
			}

			this.curIndex = index;
		}
	},

	reloadPage: function(id) {
		if(id) {
			var webview = plus.webview.getWebviewById(id);
			webview && webview.reload();
		} else {
			// reload all
			$.each(this.option.tabs, function() {
				this.webView.reload();
			});
		}
	},
	destroy: function() {
		if(this.tabBar) {
			var that = this;
			this.width = undefined;
			this.curIndex = undefined;
			//this.tabBar.clear();
			$.each(this.option.tabs, function() {
				that.tabBar.drawText(" ", {}, {}, this.icon.id);
				that.tabBar.drawText(" ", {}, {}, this.text.id);
				if(!this.page.isMain){
					this.webView && plus.webview.close(this.webView);
				}
				
			});
		}
	}
};