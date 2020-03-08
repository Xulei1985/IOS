/// <reference path="../jquery-2.2.4.js"/>
/*
 * 功能: 实现区域联动选择
 * 引用: jquery
 * 作者: xl
 * 时间: 2018-09-29 
 *
 */

(function($) {
	"use strict";

	window.DistrictSelect = function DistrictSelect() {
		var args = [];
		Array.prototype.push.apply(args, arguments);
		this.init.apply(this, args);
	}

	DistrictSelect.defaultOption = {
		dom: null,
		// 数据来源:ajax/array:
		// [{"code":"110","name":"北京","children":[],"level":1}]
		//
		source: null,
		//
		title: {
			1: "省",
			2: "市",
			3: "区(县,市)",
			4: "镇"
		},
		nameSplit: " ",
		valueSplit: ",", 
		valueField: "code",
		onlyLast: true,

		// 
		onSelected: function(val) {},

		onChanged: function(oldVal, newVal) {}
	};

	DistrictSelect.prototype = {
		option: null,
		dom: null,
		valueDom: null,
		cache: null,
		titleContainer: null,
		contentContainer: null,
		container: null,
		close: null,
		confirm: null,
		constructor: DistrictSelect,
		vals: null,
		clear: null,
		valueField: null,
		init: function(option) {
			this.option = $.extend(true, {}, this.constructor.defaultOption, option);
			if(!this.option.dom) {
				throw new Error("dom can not be null");
			}
			this.valueField = this.option.valueField || "code";
			this.dom = $(this.option.dom);
			this.cache = {};
			this.createValueContainer();
			this.createContainer();
			this.initEvent();
			if(this.dom.val()|| this.dom[0].value) {			
				this.setValue(this.dom.val());
			} else {
				this.renderDistrict();
			}
		},

		createValueContainer: function() {
			if(this.dom.is(":hidden")) {
				this.valueDom = this.dom;
				this.dom = $('<input type="text" dir="rtl"/>').appendTo(this.dom.parent());
			} else {
				this.valueDom = $(['<input type="hidden" name="', this.dom.attr("name"),
						'" />'
					].join(""))
					.appendTo(this.dom.parent());
				this.dom.removeAttr("name");
			}
		},

		getSelect: function() {
			var that = this,
				result = [];
			this.titleContainer.find(".district-select-title").each(function() {
				var $this = $(this),
					code = $this.data("key"),
					value = $this.data("value"),
					name = $this.data("name");
				if(code) {
					result.push({
						code: code,
						name: name,
						value: value
					});
				}
			});

			return result;
		},

		getValue: function(result) {
			result = result || this.getSelect();
			var
				result,
				vals = [];
			$.each(result, function() {
				vals.push(this.value);
			});
			if(this.option.onlyLast) {
				result = [vals.pop()];
			} else {
				result = vals;
			}
			return result;
		},

		setValue: function(value) {
			if(value) {
				this.vals = value.split(this.option.valueSplit);
			} else {
				this.vals = null;
			}
			this.destroy();
			this.renderDistrict();
		},

		destroy: function() {
			this.contentContainer.empty();
			this.titleContainer.empty();
		},

		getName: function(result) {
			result = result || this.getSelect();
			var vals = [];
			$.each(result, function() {
				vals.push(this.name);
			});

			return vals;
		},

		initEvent: function() {
			var that = this;
			this.dom
				.prop("readonly", true)
				.css("cursor", "pointer")
				.on("tap", function(e) {
					e.stopPropagation();
				});
			this.option.readonly!==true && this.dom.on("tap", function(e) {
					mui(that.container[0]).popover('show');
				})
			// close the dialog
			this.close.on("tap", function(e) {
				e.preventDefault();
				mui(that.container[0]).popover('hide');
			});
			// confirm and close
			this.confirm.on("tap", function(e) {
				e.preventDefault();
				that.setDomValue();
				that.close.trigger("tap");
			});

			$(document).on("tap", function() {
				if(that.container.is(":not(:hidden)")) {
					that.confirm.trigger("tap");
				}
			});
			this.container.on("tap", function(e) {
				e.stopPropagation();
			});
			// select the district
			this.contentContainer.on("tap", ".district-select-item", function(e) {

				var $this = $(this),
					name = $this.data("name"),
					code = $this.data("key"),
					level = $this.data("level"),
					value = $this.data("value"),
					selectClass = "district-select-item-active",
					parentContent = $this.parents('.district-select-content'),
					parent = parentContent.data("parent"),
					title = that.titleContainer.find(".district-select-title[data-parent='" + parent + "']"),
					titleCode = title.data("key");
				//if(titleCode != code) {
					parentContent.find(".district-select-item").removeClass(selectClass);
					$this.addClass(selectClass)
					title.data("key", code).data("name", name).text(name).data("value", value).data("level", level);
					// destroy title and content
					title.nextAll().each(function() {
						var $this = $(this),
							code = $this.data("parent") || "";
						that.contentContainer.find(".district-select-content[data-parent='" + code + "']").remove();
						$this.remove();
					});
					that.renderDistrict(code, level);
				//}
			});

			// tab changed
			this.titleContainer.on("tap", ".district-select-title", function() {
				var $this = $(this),
					parent = $this.data("parent") || "",
					selectedClass = "district-select-title-active";
				// 判断当前是否已选中
				if(!$this.hasClass(selectedClass)) { 
					that.titleContainer.find(".district-select-title").removeClass(selectedClass);
					$this.addClass(selectedClass);
					that.contentContainer.find(".district-select-content").hide();
					that.contentContainer.find(".district-select-content[data-parent='" + parent + "']").show();
				}

			});

			// clear
			this.clear.on("tap", function(e) {
				that.setValue();
			});
		},

		setDomValue: function() {
			var select = this.getSelect(),
				vals = this.getValue(select),
				names = this.getName(select);
			this.dom.val(names.join(this.option.nameSplit));
			this.valueDom.val(vals.join(this.option.valueSplit));
			//this.valueDom[0].value = vals.join(this.option.valueSplit)
			this.option.onSelected && this.option.onSelected(vals.join(this.option.valueSplit));
		},

		renderDistrict: function(parent, level) {
			var that = this;
			this.getSource(parent, function(result) {
				if(result && result.children && result.children.length) {
					var title = that.createTitle(result);
					that.createContent(result);
					title.trigger("tap");
					if(that.vals) {
						if(that.vals.length) {
							var val = that.vals.shift(); 
							if(val){
								that.contentContainer.find(".district-select-item[data-value='" + val + "']").trigger("tap");
								if(that.vals && !that.vals.length) {
									that.vals = null;
								}
							}else{
								that.confirm.trigger("tap");
								that.vals = null;
							}
							//console.log(that.contentContainer.find(".district-select-item[data-value='" + val + "']").length)

						} else {
							that.confirm.trigger("tap");
							that.vals = null;
						}
					}
				} else {
					that.confirm.trigger("tap");
				}
			}, level);
		},

		createContainer: function() {
			this.container = $(['<div class="district-select-container mui-popover mui-popover-bottom mui-popover-action ">',
					'<ul class="district-select-title-container"></ul>',
					'<div class="district-select-content-container"></div>',
					'<a href="javascript:;" class="district-select-confirm" style="display:none;"  title="确认">确认</a>',
					'<a href="javascript:;" class="district-select-clear" style="display:none;"   title="清除">清除</a>',
					'<a href="javascript:;" class="district-select-close" style="display:none;" title="关闭">X</a><div style="clear:both;"></div></div>'
				]
				.join("")).appendTo('body');

			this.titleContainer = this.container.find(".district-select-title-container");
			this.contentContainer = this.container.find(".district-select-content-container");
			this.close = this.container.find(".district-select-close");
			this.confirm = this.container.find(".district-select-confirm");
			this.clear = this.container.find(".district-select-clear");
		},

		createContent: function(data) {
			var html = [],
				that = this;
			if(data.children) {
				html.push('<dl class="mui-scroll">');
				$.each(data.children, function() {
					html.push(['<dd data-key="', this.code, '" data-name="', this.name,
						'" class="district-select-item"  data-value="', this[that.valueField],
						'" data-level="', this.level, '" title="', this.name,
						'">', this.name, '</dd>'
					].join(""));
				});
				html.push('</dl><div style="clear:both;"></div>');
				$(html.join("")).appendTo($('<div data-parent="' + data.code + '" data-parent-value="' +
						data[this.valueField] + '" class="district-select-content  mui-scroll-wrapper"></div>')
					.appendTo(this.contentContainer));
				mui(".mui-scroll-wrapper[data-parent='" + data.code + "']").scroll();
			}
		},

		createTitle: function(data) {
			var
				child = data.children[0],
				level = child.level,
				title = this.option.title[level] || "区域";
			return $(['<li data-parent="', data.code, '" class="district-select-title" data-parent-value="', data[this.valueField], '">',
				title, '</li>'
			].join("")).appendTo(this.titleContainer);
		},

		getSource: function(parent, callback, level) {
			parent = parent || "";
			level = level || 0;
			// from cache
			var
				that = this,
				data = this.getCache(parent);
			if(data) {
				callback && callback.call(this, data);
			} else {
				// ajax
				if(typeof this.option.source === "string") {
					util.ajax({
						url: this.option.source,
						needLogin: false,
						data: {
							parent: parent,
							level: level
						},
						success: function(data, result) {
							that.setCache(parent, data);
							callback && callback.call(that, that.getCache(parent));
						},
						error: function() {}
					});
				}
				// array
				if(this.option.source instanceof Array) {
					data = this.mapSource(parent, this.option.source);
					this.setCache(parent, data);
					callback && callback.call(this, that.getCache(parent));
				}
			}
		},

		getCache: function(key) {
			return this.cache[key];
		},

		setCache: function(key, val) {
			if($.isArray(val)) {
				val = {
					code: key,
					name: key,
					children: val,
					level: 0
				};
			}
			this.cache[key] = val;
		},

		mapSource: function(key, source) {
			var result,
				that = this;
			if(!key) {
				result = source;
			} else {
				$.each(source, function() {
					if(this.code == key) {
						result = this;
						return false;
					} else if(this.children) {
						result = that.mapSource(key, this.children);
						if(result) {
							return false;
						}
					}
				});
			}
			return result;
		}
	};

	$.fn.district = function() {
		var args = [],
			result = this;
		Array.prototype.push.apply(args, arguments);

		this.each(function() {
			var $this = $(this),
				tmp = $this.data("district");
			if(!tmp) {
				if(!args.length || (args.length == 1 && typeof args[0] === "object")) {
					$this.data("district", new DistrictSelect($.extend({}, args[0], {
						dom: $this
					})));
				}
			} else {
				if(args.length>0){
            		result = tmp[args.shift()].apply(tmp, args) || result;
            	}
			}
		});

		return result;
	};
})(jQuery);