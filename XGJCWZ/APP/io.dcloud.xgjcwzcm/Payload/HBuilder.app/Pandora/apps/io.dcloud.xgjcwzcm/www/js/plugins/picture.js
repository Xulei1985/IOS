/*
 * 描述: 用于拍照或相册中图片的上传
 * 功能: 
 *    1. 拍照上传
 *    2. 像册多张上传
 *    3. 可以删除上传的照片
 * 作者: xl
 * 时间: 2018-05-11
 * 
 * */

(function() {
	window.PicturePick = function PicturePick() {
		var args = [];
		args = Array.prototype.concat.apply([], arguments);
		this.init.apply(this, args);
	};

	PicturePick.defaultOptions = {
		// 相册选择
		gallery: true,
		// 可拍照上传
		camera: true,
		urlPrex: null,
		// 相册多选
		multiple: true,
		readonly: false,
		dom: null,
		// 缩略图类
		thumbnailClass: "",
		// 预览
		preview: true,
		// 图片保存类型
		imageType: "image/png",
		// 最多上传的图片数量
		maximum: 5,
		// 图片转换率
		imageRate: 1,
		// 转换图片的宽度
		compressImgWidth: 300,
		// 转换图片的高度
		compressImgHeight: 300,
		data: null
	};
	PicturePick.prototype = {
		constructor: PicturePick,
		options: null,
		/*
		 * key: guid
		 * val:{url:url,data:data}
		 * */
		cache: null,
		$dom: null,
		$plus: null,

		guid: null,
		getGuid: function() {
			return 'img_' + this.guid++;
		},
		init: function(options) {
			this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
			if(!this.options.dom) {
				throw new Error("dom can not be null.");
			}
			this.$dom = $(this.options.dom);
			this.cache = {};
			this.guid = 0;
			this.initDom();
			this.initEvent();
			if(this.options.data) {
				this.setData(this.options.data);
			}
		},

		setData: function(data) {
			var that = this;
			if(data) {
				if(data instanceof Array) {
					$.each(data, function() {
						that.addData(this);
					});
				} else {
					this.addData(data);
				}
			}
		},

		

		addData: function(data) {
			this.loadImg(data);
		},

		getData: function() {
			var key, val, datas = [];
			for(key in this.cache) {
				val = this.cache[key];
				datas.push(val);
			}
			return datas;
		},

		compress: function(url, name, callback) {
			// load image
			var
				that = this,
				$img = this.createImg(url, name).on("error", function(e) {
					console.log("图片读取失败.地址:" + url + ", 错误:" + e);
				}).on("load", function() {
					var img = $img[0],
						imgWidth = img.width,
						imgHeight = img.height,
						rate = imgWidth / imgHeight,
						// update width and height
						width = that.options.compressImgWidth,
						height = that.options.compressImgHeight,
						$canvas = $('<canvas></canvas>'),
						canvas = $canvas[0],
						content = canvas.getContext("2d");
					if(width && height) {

					} else if(width) {
						height = width / rate;
					} else if(height) {
						width = height * rate;
					} else {
						width = imgWidth;
						height = imgHeight;
					}

					canvas.width = width;
					canvas.height = height;
					content.drawImage(img, 0, 0, width, height);
					var data = canvas.toDataURL(that.options.imageType, that.options.imageRate || 1),
						guid = that.getGuid(),
						$tmpImg = that.createImg(data);

					that.renderImg($tmpImg);
					$img.remove();
					$tmpImg.attr("data-guid", guid);
					that.addCache(guid, {
						url: url,
						title: "",
						path: "",
						data: data
					});
					callback && callback.call(that, $tmpImg);
				});
		},

		renderImg: function($img) {
			// 最后一个元素为添加图片按钮
			$img.appendTo(this.createContainer()
				.insertBefore(this.$dom.find('a.mui-icon-plusempty').parent()));
		},
		// data:{data:data,path:""}
		loadImg: function(data) {
			var guid = this.getGuid(),
				url = data.path ? this.options.urlPrex + data.path : "",
				$img = this.createImg(url || data.data);
				//console.log(url);
			$img.attr("data-guid", guid);
			this.renderImg($img);
			this.addCache(guid, data);
		},

		createImg: function(source, alt) {
			var img = ['<img class="thumbnail-img" src="', source, '" alt="', alt || '', '"/>'].join("");
			return $(img);
		},

		initDom: function() {
			// create add button
			this.$plus = this.createContainer()
				.html(['<a class="thumbnail-add mui-icon mui-icon-plusempty" href="javascript:;"></a>'].join(""))
				.appendTo(this.$dom);
			if(this.options.readonly) {
				this.$plus.hide();
			}
		},

		setReadonly:function(){
			this.$plus.hide();
			this.$dom.find(".thumbnail-delete").hide();
		},

		createContainer: function() {
			return $(['<div class="thumbnail-container  ', this.options.thumbnailClass,
				'">',
				this.options.readonly ? '' : '<a class="thumbnail-delete mui-icon mui-icon-closeempty" href="javascript:;"></a>',
				'</div>'
			].join(""));
		},

		showAdd: function() {
			var that = this;
			if(that.getCacheLength() >= that.options.maximum) {
				this.$plus.hide();
			} else {
				this.$plus.show();
			}
		},

		initEvent: function() {
			var that = this;
			// 添加图片
			this.$plus.on("tap", function() {
				// check max pictures
				if(!that.options.maximum || that.getCacheLength() < that.options.maximum) {
					// camera and pick picture
					if(that.options.camera && that.options.gallery) {
						that.actionSheet();
					}
					// if only pick picture
					else if(that.options.gallery) {
						that.pickPicture();
					}
					// if only camera	
					else {
						that.camera();
					}

				} else {
					mui.toast("图片数量已达上限:" + that.options.maximum + "张.");
				}

			});

			this.$dom.on("tap", "a.thumbnail-delete", function(e) {
				e.preventDefault();
				var $this = $(this),
					$parent = $this.parent(),
					$img = $parent.find("img.thumbnail-img"),
					guid = $img.attr("data-guid");
				// remove from data
				delete that.cache[guid];
				// remove dom
				$parent.remove();

				that.showAdd();
			});
			// preview
			if(this.options.preview) {
				this.$dom.on("tap", "img", function() {
					var
						$this = $(this),
						src = $this.attr("src");
					webview = mui.openWindow({
						name: "imageviewer",
						url: that.options.preview
					});

					webview.addEventListener('loaded', function() {
						webview.evalJS('loadMedia("' + src + '")');
					}, false);

				});

			}
		},
		//
		pickPicture: function() {
			var that = this;

			function readFile(files, callback) {
				if(files.length) {
					that.readImage(files.pop(), false, function() {
						readFile(files, callback);
					});
				} else {
					callback && callback();
				}
				that.showAdd();
			}

			plus.gallery.pick(function(p) {
				tiza.showWaiting("加载图片中...");
				// 如果是数组
				if(p.files) {
					var concat = [].concat(p.files);
					readFile(concat, function() {
						tiza.closeWaiting();
					});
				} else {
					that.readImage(p, false, function() {
						tiza.closeWaiting();
					});
				}
			}, function(e) {}, {
				filename: "_doc/camera/",
				filter: "image",
				multiple: that.options.multiple,
				maximum: that.options.maximum ? that.options.maximum - that.getCacheLength() + this.getSelectedUrl() : Infinity,
				onmaxed: function() {
					mui.toast("图片总数量已达上限:" + that.options.maximum + "张.")
				},
				selected: this.getSelectedUrl(),
				system: false
			});
		},

		getCacheLength: function() {
			var length = 0,
				key;
			for(key in this.cache) {
				length++;
			}
			return length;
		},

		getSelectedUrl: function() {
			var key,
				val,
				url,
				result = [];

			for(key in this.cache) {
				val = this.cache[key];
				if(val.url) {
					result.push(val.url);
				}
			}
			return result;
		},

		addCache: function(key, val) {
			this.cache[key] = val;
		},

		delCache: function(key) {
			delete this.cache[key];
		},
		getCache: function(key) {
			return this.cache[key];
		},

		cacheExist: function(url) {
			var key, val, result = false;
			for(key in this.cache) {
				val = this.cache[key];
				if(val.url == url) {
					result = true;
					break;
				}
			}
			return result;
		},

		readImage: function(p, isCamera, callback) {
			// convert url
			var
				that = this;

			p = this.handlerImgUrl(p);
			if(isCamera) {
				plus.io.resolveLocalFileSystemURL(p, function(entry) {
					var url = that.handlerImgUrl(entry.toLocalURL())
					if(!that.cacheExist(url)) {
						that.compress(url, entry.name, callback);
					}
				}, function(e) {
					mui.toast("error when read image：" + e.message);
					callback && callback();
				});
			} else {
				this.compress(p, null, callback);
			}

		},

		handlerImgUrl: function(url) {
			// if android, remove fileprex, exception: error encode.
			var filePrex = "file://";
			if(!url.indexOf(filePrex)) {
				url = url.replace(filePrex, "");
			}
			return url;
		},
		//
		camera: function() {
			var cmr = plus.camera.getCamera(),
				that = this;
			cmr.captureImage(function(p) {
				tiza.showWaiting("加载图片中...");
				that.readImage(p, true, function() {
					tiza.closeWaiting();
					that.showAdd();
				});
			}, function(e) {}, {
				filename: "_doc/camera/",
				index: 1
			});
		},
		//
		actionSheet: function() {
			var
				// 配置方法调用
				config = {
					1: "camera",
					2: "pickPicture"
				},
				that = this,
				actionbuttons = [{
					title: "拍照"
				}, {
					title: "相册选取"
				}],
				actionstyle = {
					title: "选择照片",
					cancel: "取消",
					buttons: actionbuttons
				};

			plus.nativeUI.actionSheet(actionstyle, function(e) {
				var mtd = that[config[e.index]];
				mtd && mtd.call(that);
			});
		}
	};

})()