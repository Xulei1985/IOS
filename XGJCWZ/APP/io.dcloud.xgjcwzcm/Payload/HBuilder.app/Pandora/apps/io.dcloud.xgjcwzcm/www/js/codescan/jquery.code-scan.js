/*
 * 描述：设备扫描条形码或二维码
 * 功能：
 *         1. 设备扫描条码，显示在div中
 *         2. 可连续扫描，并获取值
 * 作者：xl
 * 时间：2018-11-15
 * 
 * */

(function($) {
	"use strict";

	window.CodeScan = function CodeScan() {
		this.init.apply(this, arguments);
	};

	CodeScan.defaultOptions = {
		dom: null,
		cssClass: null,
		// 条码唯一
		unique: true,
		split: "||",
		validate: null,
		onScan: function(code) {}
	};

	CodeScan.prototype = {
		constructor: CodeScan,
		options: null,
		$dom: null,
		$container: null,
		focused: false,
		SCAN_CODE: "com.android.server.scannerservice.broadcast",
		EX_CODE: "scannerdata",
		$hiddenInput: null,
		init: function(options) {
			this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
			if (!this.options.dom) {
				throw new Error("dom can not be null.");
			}

			this.$dom = $(this.options.dom);
			if (this.$dom.is(":not(:hidden)")) {
				this.$dom.attr("type", "hidden");
			}

			this.renderDom();
			this.initEvent();
		},
		renderDom: function() {
			this.$container = $(['<div class="', this.options.cssClass || "", '"></div>']
				.join("")).insertAfter(this.$dom);
			this.$hiddenInput = $('<input type="text" style="position:absolute;top:-100px;" />')
				.appendTo('body');
		},

		isCurrent: function() {
			// 判断 当前页是否在最上层
			var
				result = false,
				views = plus.webview.getDisplayWebview(),
				view = views && views.length && views[0] || {};
				if(views.length>1){
					view = views[1]
				}
			if (view.id == plus.webview.currentWebview().id) {
				result = true;
			}
			return result;
		},

		initEvent: function() {
			var main = plus.android.runtimeMainActivity();
			var that = this;
			var context = plus.android.importClass("android.content.Context");
			var receiver = plus.android.implements("io.dcloud.feature.internal.reflect.BroadcastReceiver", {
				onReceive: function(context, intent) {
					if (intent.getAction() == that.SCAN_CODE) {
						var code = intent.getStringExtra(that.EX_CODE);
						if (that.isCurrent()) {
							if(that.options.validate && that.options.validate.lastIndex){
								that.options.validate.lastIndex=0;
							}
							if (!that.options.validate || that.options.validate.test(code)) {
								that.options.onScan && that.options.onScan(code);
							} else {
								mui.toast("条码格式不正确，请扫描正确的条码！");
							}
						}
					}
				}
			});
			var IntentFilter = plus.android.importClass("android.content.IntentFilter"); //引入过滤器
			var Intent = plus.android.importClass("android.content.Intent");
			var filter = new IntentFilter();
			filter.addAction(that.SCAN_CODE); //监听登录成功广播		
			main.registerReceiver(receiver, filter); //注册监听
			//			var that = this;
			//
			//			$(document).on("keydown", function(e) {
			//				if(!that.focused) {
			//					that.$hiddenInput.val("").focus();
			//					plus.key.hideSoftKeybord();
			//					that.focused=true;
			//				}
			//			}).on("keypress", function(e) {
			//				if(e.keyCode == 13) {
			//					var val = that.$hiddenInput.val();
			//					if(!val) {
			//						// 没有扫描到码
			//					} else {
			//						var res = true;
			//						if(that.options.unique) {
			//							res = that.checkUnique(val);
			//						}
			//						if(res) {
			//							var preVal = that.$dom.val();
			//							if(preVal) {
			//								preVal += that.options.split;
			//							}
			//							that.$dom.val(preVal + val);
			//							$(['<div>',val,'<a class="btn-code-delete">删除</a></div>'].join("")).appendTo(that.$container);
			//						}
			//						that.options.onScan && that.options.onScan(val);
			//					}
			//					that.focused = false;
			//				}
			//			});
			//			that.$hiddenInput.on("blur",function(){
			//				if(that.focused){
			//					that.$hiddenInput.focus();
			//					//plus.key.hideSoftKeybord();
			//				}
			//			});
			//			
			//			that.$hiddenInput.on("focus",function(){
			//					//that.$hiddenInput.focus();
			//					plus.key.showSoftKeybord();
			//					plus.key.hideSoftKeybord();
			//			});
			//			
			//			this.$container.on("click","a.btn-code-delete",function(){
			//				$(this).parent().remove();
			//			});
		},
		createRow: function() {
			return $(['<div><input type="input"/></div>'].join("")).appendTo(this.$container);
		},
		checkUnique: function(val) {
			var
				valList = this.$dom.val(),
				result = true;
			if (valList) {
				$.each(valList.split(this.options.split), function() {
					if (this == val) {
						result = false;
						return false;
					}
				});
			}
			return result;
		}
	};

	$.fn.codeScan = function(options) {
		if (!this.CodeScan) {
			options.dom = this;
			this.CodeScan = new CodeScan(options);
		}

		return this;
	}

})(jQuery);
