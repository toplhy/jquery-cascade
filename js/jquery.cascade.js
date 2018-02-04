;(function ($) {

    //插件默认值
    var defaults = {
        //ajax默认参数
        url : undefined,
        method : 'get',
        async : true,
        cache : true,
        contentType : 'application/json',
        dataType : 'json',
        //插件特性默认参数
        depth : 3,
        titles : ['一级','二级','三级']
    };

    $.fn.cascade = function(options) {
        $(this).on('click', function (){
            return new Cascade(this, options);
        });
    };

    var Cascade = function(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this.init();
    };

    Cascade.prototype.init = function () {
        this.initServer();
    };

    Cascade.prototype.initCascadeLabel = function() {
        var html = [],that = this;
        html.push("<div class='cascade_label'>");
        html.push("<div class='cascade_label_titles'>");
        html.push("<span title='关闭' class='close_label'>关闭</span>");
        if(this.settings.depth) {
            $.each(this.settings.titles,function(index, value){
                if(that.settings.depth > index){
                    html.push("<span class='level level"+index+"' data-level='"+(index+1)+"'>"+value+"</span>");
                }
            });
        }
        html.push("</div>");
        html.push("<div class='cascade_content'>");
        html = html.concat(this.data);
        html.push("</div>");
        html.push("</div>");
        this.pop(html.join(''));
        $('.close_label').off('click').on('click', function(){
            that.closeCascade();
        });
        $('.cascade_data').off('click').on('click', function (){
            var id = $(this).attr('data-id');
            var level = $(this).attr('data-level');
            var text = $(this).attr('data-text');
            $(this).addClass('active').siblings('.cascade_data[data-level="'+level+'"]').removeClass('active');
            $('.level'+level).addClass('active').siblings().removeClass('active');
            $('.level'+(level-1)).attr('active-data-id',id);
            $('.level'+(level-1)).attr('active-data-value',text);
            if($('.cascade_data[data-parent-id="'+id+'"]').length < 1){
                var str = [],ids = [];
                for (var i=0;i<=level;i++){
                    str.push($('.level'+i).attr('active-data-value'));
                    ids.push($('.level'+i).attr('active-data-id'));
                }
                $(that.element).html(str.join(' '));
                $(that.element).attr('select-ids',ids.join(','));
                that.closeCascade();
            }else{
                $('.cascade_data').each(function(index, ele){
                    if($(ele).attr('data-parent-id') == id){
                        $(ele).show();
                    }else{
                        $(ele).hide();
                    }
                });
            }
        });
        $('.level').off('click').on('click',function () {
            var level = $(this).attr('data-level');
            var parentId = $('.level'+(level-2)).attr('active-data-id');
            $(this).addClass('active').siblings().removeClass('active');
            if(typeof(parentId) == 'undefined' && level != 1){
                $('.cascade_data').hide();
            }else{
                $('.cascade_data').each(function(index, ele){
                    if($(ele).attr('data-level') == level && (level == 1 || $(ele).attr('data-parent-id') == parentId)){
                        $(ele).show();
                    }else{
                        $(ele).hide();
                    }
                });
            }
        });
        $('.level0').trigger('click');
    };

    Cascade.prototype.pop = function(html) {
        var $a = document.getElementsByTagName("body").item(0);
        var $b = document.createElement("div");
        $b.setAttribute('class', 'cascade_container');
        this.closeCascade();
        if($a && $('.cascade_container').length < 1) {
            $a.appendChild($b);
            $b.innerHTML = html;
        }
    };

    Cascade.prototype.closeCascade = function() {
        if($('.cascade_container').length > 0){
            document.body.removeChild($('.cascade_container')[0]);
        }
    };

    Cascade.prototype.initServer = function() {
        var data = {}, that=this;
        var request = {
            type : this.settings.method,
            url : this.settings.url,
            async : this.settings.async,
            cache : this.settings.cache,
            data : this.settings.contentType === 'application/json' && this.settings.method === 'post' ? JSON.stringify(data) : data,
            contentType: this.settings.contentType,
            dataType: this.settings.dataType,
            success: function (res) {
                that.initData(res);
                that.initCascadeLabel();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        };
        this._xhr = $.ajax(request);
    };

    Cascade.prototype.initData = function(res) {
        var html = [], that = this;
        $.each(res, function(index, value){
            that.generateData(value, -1, 1, html);
        });
        this.data = html;
    };

    Cascade.prototype.generateData = function(value, parentId, depth , html) {
        var that = this;
        if(depth <= that.settings.depth){
            html.push("<div class='cascade_data' style='display: none;' data-id='"+value.id+"' data-parent-id='"+parentId+"' data-level='"+depth+"' data-text='"+value.text+"'>"+value.text+"</div>");
            if(value.children){
                depth++;
                $.each(value.children, function(i, v){
                    that.generateData(v, value.id, depth, html);
                });
            }
        }
    };


})(jQuery);