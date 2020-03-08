/*
 *
 * 描述: 用于原生底部TabBar的消息提示
 * 功能: 提示消息
 * 作者: xl
 * 时间: 2018-08-17
 * */

(function() {

	var guid = 0;

	function getGuid() {
		return 'tab_bar_' + guid++;
	}

	var TabBarTip = window.TabBarTip = function() {
		var args = Array.prototype.concat.apply([], arguments);
		this.init.apply(this, args);
	};

	TabBarTip.defaultOption = {
		tabBar: null,
		num: null,
		// 如果超过这个数, 显示为 99+
		maxNum: 99,
		showNullText: false,
		position: {},
		textStyle: {},
		rectStyle: {}
	};

	TabBarTip.prototype = {
		constructor: TabBarTip,
		option: null,
		rectId: null,
		tabBar: null,
		textId: null,
		init: function(option) {
			this.option = $.extend({}, this.constructor.defaultOption, option);
			this.rectId = getGuid();
			this.textId = getGuid();
			this.tabBar = this.option.tabBar;
			if(this.option.num) {
				this.setNum(this.option.num);
			}
		},

		setNum: function(num) {
			var text = this._getText(num);
			this._drawBackground(text);
			this._drawText(text);
		},

		// 根据文字长度,改变背景大小
		_drawBackground: function(text) {
			if(this.option.showNullText) {
				text = " ";
			}
			if(!text) {
				var position = $.extend({}, this.option.position, {
					width: 0
				});
				this.tabBar && this.tabBar.drawRect(this.option.rectStyle, position, this.rectId);
				this.tabBar && this.tabBar.clearRect(this.rectId);
				this._drawText(" ");
				//console.log("clear");
			} else {
				var position = $.extend({}, this.option.position, {
					width: this._getWidth(text)
				});
				this.tabBar && this.tabBar.drawRect(this.option.rectStyle, position, this.rectId);
				//console.log("draw");
			}
		},

		_drawText: function(text) {
			// 
			var position = $.extend({}, this.option.position, {
				width: this._getWidth(text)
			});

			this.tabBar && this.tabBar.drawText(text, position, this.option.textStyle, this.textId);
		},

		_getWidth: function(text) {
			return text.length * parseFloat(this.option.textStyle.size || 9);
		},
		_getText: function(num) {
			var text = num + "";
			if(num > this.option.maxNum) {
				text = this.option.maxNum + "+";
			}
			return text;
		},
		destroy: function() {
			this.tabBar.clearRect(this.rectId);
			this._drawText("");
			this.tabBar=null;
		}
	};

})();