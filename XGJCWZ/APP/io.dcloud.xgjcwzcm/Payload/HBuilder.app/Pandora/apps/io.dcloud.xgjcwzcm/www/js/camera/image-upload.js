/*
 * 描述: 用于上传照片
 * 功能: 
 *    1. 选中照片上传
 *    2. 可以多选
 *    3. 可以预览
 *    4. 可以删除
 * 作者: xl
 * 时间: 2018-06-15
 * 
 * */

(function () {
    window.ImageUpload = function ImageUpload() {
        var args = [];
        args = Array.prototype.concat.apply([], arguments);
        this.init.apply(this, args);
    };

    ImageUpload.defaultOptions = {
        multiple: true,
        dom: null,
        // 缩略图类
        thumbnailClass: "",
        // 预览
        preview: true,
        readonly:false,
        compressImgWidth:800,

        // 最多上传的图片数量
        maximum: 5,
        loadUrl:'',
        visible:true,
        onAdd:function(data){}
    };
    ImageUpload.prototype = {
        constructor: ImageUpload,
        options: null,
        $dom: null,
        $plus: null,
        $file: null,
        guid: null,
        cache:null,
        $preview:null,
        $container:null,
        init: function (options) {
            this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
            if (!this.options.dom) {
                throw new Error("dom can not be null.");
            }
            this.cache=[];
            this.guid = 0;
            this.$dom = $(this.options.dom);
            if (!this.$dom.is(":hidden")) {
                this.$dom.hide();
            }
            this.createDomContainer();
            this.initDom();
            this.initEvent();
            //this.createPreviewContainer();
            this.initValue();
            this.setReadonly(this.options.readonly);
        },

        getGuid: function () {
            return 'upload-' + this.guid++;
        },

        createDomContainer: function () {
            var $parent = this.$dom.parent();
            this.$container = $('<div class="image-upload"   '+(this.options.visible===false?  ' style="display:none;"' : "")+'><input  accept="image/*"  type="file" style="display:none;" '
                + (this.options.multiple ? 'multiple="multiple"' : '') + '/></div>').appendTo($parent);
            this.$file = this.$container.find("[type='file']");
            var ua = navigator.userAgent.toLowerCase();
			//if(/iphone|ipad|ipod/.test(ua)) { //苹果手机     
            //	$(".image-upload").find("input[type='file']").removeAttr("capture");
			//}else{ 
			
  			//	$(".image-upload").find("input[type='file']").attr("capture","camera");
			//}

        },

        setReadonly: function (bl) {
            if (bl) {
                this.$plus.hide();
                this.$container.find(".thumbnail-delete ").hide();
            } else {
                this.$plus.show();
                this.$container.find(".thumbnail-delete ").show();
            }
        },

        initValue: function () {
            var val = this.$dom.val(),
                that=this;
            if (val) {
                val = JSON.parse(val);

                $.each(val, function () {
                    this.guid = that.getGuid();
                    that.loadImg(that.options.loadUrl + this.path, this.guid);
                });
                this.$dom.val(JSON.stringify(val));
            }
        },
		// data:{title:"",path:"",data:data,guid:1}
        addValue: function (data) {
            var val = this.$dom.val();
            if (val) {
                val = JSON.parse(val);
            } else {
                val = [];
            }
            var exist = false;
            // 判断是否已存相同的图片
            $.each(val, function () {
                if (this.title == data.title && data.data == this.data) {
                    //exist = true;
                    return false;
                }
            });

            if (!exist) {
                data.guid = this.getGuid();
                val.push(data);
                this.$dom.val(JSON.stringify(val));
                
                this.loadImg(data.data, data.guid);
                if(!this.options.multiple){
                	this.clearCache();
                }
                this.cache.push(data);
                this.options.onAdd && this.options.onAdd(data);
            }
        },

        renderImg: function ($img) {
            // 最后一个元素为添加图片按钮
            $img.appendTo(this.createContainer()
				.insertBefore(this.$container.find('a.glyphicon-plus').parent()));
        },

        loadImg: function (data,guid) {
			var that=this;
			this.createImg(data,null,function($img){
				$img.attr("data-guid", guid);
				that.renderImg($img);						
			});

        },

        createImg: function (source, alt,callback) {
			if(typeof source !=="string"){				
				this.convertImageToBase64(source,function(name,result){				
					callback && callback($(['<img class="thumbnail-img" src="', result, '" alt="', alt || name||'', '"/>'].join("")));
				});
			}else{				
				callback && callback($(['<img class="thumbnail-img" src="', source, '" alt="', alt || '', '"/>'].join("")));
			}
        },

        initDom: function () {
            // create add button
            this.$plus = this.createContainer()
				.html(['<a id="thumbnail-add" class="thumbnail-add glyphicon glyphicon-plus" href="javascript:;" title="新增"><img src="images/photo.png"/></a>'].join(""))
				.appendTo(this.$container)
        },

        createContainer: function () {
            return $(['<div class="thumbnail-container  ', this.options.thumbnailClass,
				'">',  '<a class="thumbnail-delete  glyphicon glyphicon-minus" href="javascript:;" title="删除"></a>',
                '</div>'
            ].join(""));
        },

        initEvent: function () {
            var that = this;
            // 添加图片
            this.$plus && this.$plus.on("tap", function () {
                // check max pictures
                if (!that.isFull()) {
                    //that.$file[0].click();
                    that.actionSheet();
                } else {
                    layer.msg("已达上限"+that.options.maximum+"张, 不能再上传");
                }

            });

            this.$container.on("click", "a.thumbnail-delete", function (e) {
                e.preventDefault();
                var $this = $(this),
					$parent = $this.parent(),
					$img = $parent.find("img.thumbnail-img"),
					guid = $img.attr("data-guid"),
                    idx=-1,
                    idx2=-1;
					val=that.$dom.val();
                // remove from data
                
                 val = JSON.parse(val);
                
                 $.each(val, function (index) {
                        if (this.guid == guid) {
                            idx2 = index;
                            return false;
                        }
                    });
                    
                    if (idx2 > -1) {
                        val.splice(idx2,1);
                        that.$dom.val(JSON.stringify(val));
                        that.refreshFile();
                    }
                if (that.cache) {
                   
                    $.each(that.cache, function (index) {
                        if (this.guid == guid) {
                            idx = index;
                            return false;
                        }
                    });

                    if (idx > -1) {
                        
                        that.cache.splice(idx,1);
                      
                        that.refreshFile();
                    }
                }

                // remove dom
                $parent.remove();
                var num = 0;
                if($("#text").val()!=""){
                	num = JSON.parse($("#text").val()).length;
                }
                if(num<that.options.maximum){
                	that.showAdd();
                }
                
            });

            this.$file.on("change", function () {
                var files = that.$file[0].files;
                var num = 0;
                if($("#text").val()!=""){
                	num = JSON.parse($("#text").val()).length;
                	files = Array.from(files).slice(0,that.options.maximum-JSON.parse($("#text").val()).length);
                }else{
                	files = Array.from(files).slice(0,that.options.maximum);
                }
                
                if(num+files.length>=that.options.maximum){
                	$("#thumbnail-add").parent().hide();
                }
                
                $.each(files, function () {
                    that.addValue({title:this.name,data:this});
                    that.refreshFile();
                    // that.convertImageToBase64(this, function (name, data) {
                    //     if (!that.isFull()) {
                    //         that.addValue({ title: name, data: data });
                    //     }                 
                    // });
                });
                if(num+that.$file[0].files.length>that.options.maximum){
                	layer.msg("最多上传"+that.options.maximum+"张图片");
                }
            });
            // preview
            if (this.options.preview) {
                this.$container.on("click", ".thumbnail-img", function () {
                    var
						$this = $(this),
						src = $this.attr("src");
                    //that.showPreview(src);
                    this.$preview = $('<img id="previewPic" src="'+src+'" height="100%" alt="预览图片"/>').appendTo($("#preview"))
                    
                .on("click", function (e) {
                    	$("#preview").html('');
                        $("#htmleaf-container").hide();
                    });
            
                    //'<img class="image-upload-preview"  src="'+src+'" alt="预览图片"/>').appendTo($("#view"));
                    $("#htmleaf-container").show();
                });
            }
        },

        refreshFile:function(){
            var that=this;
            
            
        },

		showAdd:function(){
			if(this.isFull()){
				$("#thumbnail-add").parent().hide();
			}else{
				$("#thumbnail-add").parent().show();
			}
			
		},

        isFull: function () {
            var  isFull =this.options.multiple ? this.cache.length >= this.options.maximum:false ;          
            return isFull;
        },
        

        createPreviewContainer: function () {
            var that=this;
            this.$preview = $('<img class="image-upload-preview"  src="" alt="预览图片"/>').appendTo($("body"))
                .on("click", function (e) {
                    var $this=$(this);
                    $this.animate({
                        width:0,
                        left:"50%",
                        top:"50%"
                    },function(){
                        that.$preview.hide();
                    });
            });
        },

        showPreview: function (src) {
            this.$preview.attr("src", src).show().animate({
                width: "100%",
                left: 0,
                bottom:0,
                top:45
            });
        },

        convertImageToBase64: function (file,callback) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                callback && callback(file.name,this.result);
            }
        },
        
        readImage: function(p, isCamera, callback) {
			// convert url
			var
				that = this;
			
			p = this.handlerImgUrl(p);
			if(isCamera) {
				plus.io.resolveLocalFileSystemURL(p, function(entry) {
					var url = that.handlerImgUrl(entry.toLocalURL());
					// that.compress(url, entry.name, callback);
					//if(!that.cacheExist(url)) {
						pathToBase64(url).then(function(e){
							that.compress(e, entry.name, callback);
						});
						
						//
					//}
				}, function(e) {
					mui.toast("error when read image：" + e.message);
					callback && callback();
				});
			} else {
				var reg=/\/([^\/]+)$/;
				var match= reg.exec(p);
				var name="";
				if(match){
					name=match[1];
				}
				pathToBase64(p).then(function(e){
					that.compress(e, name, callback);
				});
			
			}

		},
        compress: function(url, name, callback) {
			// load image
			var
				that = this,
				img=new Image();
				img.src=url;
				img.alt=name;
				img.onload=function(){

					var 
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

					var dataUrl = canvas.toDataURL(that.options.imageType, that.options.imageRate || 1),
					imgFile=that.dataURLtoBlob(dataUrl,name);
					imgFile.name=name;
					var data={
						url:url,
						title:"",
						path:"",
						data:imgFile
					};
					
					that.addValue(data);
					callback && callback();
				};
		},
		
		dataURLtoBlob:function(dataUrl,name) {
		    var arr = dataUrl.split(','), 
		        mime = arr[0].match(/:(.*?);/)[1],
		        bstr = atob(arr[1]),
		        n = bstr.length, 
		        u8arr = new Uint8Array(n);
		    while(n--){
		        u8arr[n] = bstr.charCodeAt(n);
		    }
	
		    return new Blob([u8arr], {type:mime,name:name});
		},
		
        pickPicture: function() {
			var that = this;
			function readFile(files, callback) {
				if(files.length) {
					if($("#text").val()!=""){
						// files = Array.from(files).slice(0,that.options.maximum-JSON.parse($("#text").val()).length);
						
						if((files.length+JSON.parse($("#text").val()).length)>=that.options.maximum){
							$("#thumbnail-add").parent().hide();
						}
					}
					that.readImage(files.pop(), false, function() {
						readFile(files, callback);
						if(!files.length){
							//that.showAdd();
						}
					});
				} else {
					callback && callback();
				}
				
			}

			plus.gallery.pick(function(p) {
				util.showWaiting("加载图片中...");
				// 如果是数组
				if(p.files) {
					var concat = [].concat(p.files);
					readFile(concat, function() {
						util.closeWaiting();
					});
				} else {
					that.readImage(p, false, function() {
						util.closeWaiting();
					});
				}
			}, function(e) {}, {
				filename: "_doc/camera/",
				filter: "image",
				multiple: that.options.multiple,
				maximum: that.options.maximum ? that.options.maximum - that.getCacheLength()  : Infinity,
				onmaxed: function() {
					mui.toast("图片总数量已达上限:" + that.options.maximum + "张.")
				},
				//selected: this.getSelectedUrl(),
				system: false
			});
		},

		getCacheLength: function() {
			return this.cache.length;
		},

		clearCache:function(){
			this.cache.splice(0,this.cache.length);
		},

		cacheExist: function(url) {
			var key, val, result = false;
			$.each(this.cache,function(){
				if(this.url==url){
					result=true;
					return false;
				}
			});

			return result;
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
				util.showWaiting("加载图片中...");
				that.readImage(p, true, function() {
					util.closeWaiting();
					
					//拍照后判断图片数量是否达到限制数量
					if($("#text").val()!=""){
						if((JSON.parse($("#text").val()).length+1)>=that.options.maximum){
							$("#thumbnail-add").parent().hide();
						}
					}
					//that.showAdd();
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
		},
        getFiles:function(){
            return this.cache;
        }
    };
})();