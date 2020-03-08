# H5App 说明

------

## 1. 目录结构

> root
>> html 页面
>>> index.html 主页,消息列表
>>> login.html  登陆页
>>> exam 考试
>>> notify 通知
>>> sample 样本
>>> leave 请假
>>> my 我的
>>
>> js javascript
>>> bootstrap
>>> mui
>>> plugins js插件
>>> util.js 工具类
>>
>> css 自定义样式
>>> layout.css
>>> iconfont.css
>>
>> fonts 字体
>>> iconfont.ttf
>>
>> images 图片

## 约定写法

1.每个网页的JS都放到Page类下
2.每个Page下都有一个init方法用于初始化，initEvent方法用于注册事件，reload方法用于重新加载页面数据
3.获取用户信息，上下拉刷新，跳转至登陆页都可以在util.js中找到方法