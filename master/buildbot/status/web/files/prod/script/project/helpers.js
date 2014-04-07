define(["screensize","text!templates/popups.mustache","mustache"],function(e,t,n){var r,i={SUCCESS:"success",WARNINGS:"warnings",FAILURE:"failure",SKIPPED:"skipped",EXCEPTION:"exception",RETRY:"retry",CANCELED:"exception",RUNNING:"running",NOT_STARTED:"not_started",None:""};return String.prototype.format=function(){var e=arguments;return this.replace(/{(\d+)}/g,function(t,n){return typeof e[n]!="undefined"?e[n]:t})},Number.prototype.clamp=function(e,t){return Math.min(Math.max(this,e),t)},r={init:function(){r.setCurrentItem(),r.authorizeUser(),$("#buildslave_page").length&&r.displaySum($("#currentJobs"),$("#runningBuilds_onBuildslave").find("li")),$("#builddetail_page").length>0&&r.summaryArtifactTests(),$("#tb-root").length!=0,$("#builder_page").length!=0&&r.codeBaseBranchOverview($("#brancOverViewCont")),r.menuItemWidth(e.isMediumScreen()),$(window).resize(function(){r.menuItemWidth(e.isMediumScreen())}),r.selectBuildsAction(),$(function(){var t=/chrome/.test(navigator.userAgent.toLowerCase()),n=navigator.platform.toUpperCase().indexOf("WIN")!==-1;t&&$("body").addClass("chrome"),n&&$("body").addClass("win")}),r.toolTip(".ellipsis-js"),r.parseReasonString(),r.runIndividualBuild(),r.setFullName($("#buildForm .full-name-js, #authUserName")),$("#authUserBtn").click(function(){r.eraseCookie("fullName1","","eraseCookie")}),r.tooltip($(".tooltip"))},tooltip:function(e){e.hover(function(e){var t=$('<div class="tooltip-cont" />');this.t=this.title,this.title="";var n=e.pageY+5,r=e.pageX+5;$(e.target).click(function(){t.remove()}),t.html(this.t).appendTo("body").css({top:n,left:r}).fadeIn("fast")},function(){this.title=this.t;var e=$(".tooltip-cont");e.fadeOut("fast",function(){$(this).remove()})})},authorizeUser:function(){var e=window.location;if(e.search.match(/user=/)&&e.search.match(/autorized=True/)){var t=decodeURIComponent(e.search.split("&").slice(0)[1].split("=")[1]);r.setCookie("fullName1",t),window.location="/"}else r.getCookie("fullName1")===""?window.location="/login":r.setCookie("fullName1",r.getCookie("fullName1"))},setCurrentItem:function(){var e=window.location.pathname.split("/");$(".top-menu a").each(function(t){var n=this.href.split("/");(this.id==e[1].trim().toLowerCase()||this.id=="home"&&e[1].trim().toLowerCase().length===0)&&$(this).parent().addClass("selected")})},jCenter:function(e){var t=$(window).height(),n=$(window).width(),r=e.outerHeight(),i=e.outerWidth();return t<r+5?e.css({top:5+$(window).scrollTop()+"px",height:t-60}):e.css({top:(t-r)/2+$(window).scrollTop()+"px",height:"auto"}),e.css("left",(n-i)/2+$(window).scrollLeft()+"px"),e},setFullName:function(e){var t,n=r.getCookie("fullName1");e.each(function(){t=$(this).is("input")?"val":"text",$(this)[t](n)})},runIndividualBuild:function(){$("#tablesorterRt").delegate(".run-build-js","click",function(e){$(".remove-js").remove(),e.preventDefault();var t=$(this).prev(),n=t.attr("data-b"),i=t.attr("data-indexb"),s=t.attr("data-returnpage"),o='<div id="bowlG"><div id="bowl_ringG"><div class="ball_holderG"><div class="ballG"></div></div></div></div>',u=$(this).prev().attr("data-b_name");$("body").append(o).show();var a=location.protocol+"//"+location.host+"/forms/forceBuild",f={rt_update:"extforms",datab:n,dataindexb:i,builder_name:u,returnpage:s};f=r.codebasesFromURL(f),$.get(a,f,"json").done(function(e,t,n){$("#bowlG").remove();var i=$("<div/>").attr("id","formCont").append($(e)).appendTo("body").hide();r.setFullName($("#usernameDisabled, #usernameHidden",i));var o=i.find("form").ajaxForm();$(o).ajaxSubmit(function(e){requirejs(["realtimePages"],function(t){var n=s.replace("_json","");t.updateSingleRealTimeData(n,e)})})})})},parseReasonString:function(){$(".codebases-list .reason-txt").each(function(){var e=$(this).text().trim();e==="A build was forced by '':"&&$(this).remove()})},selectBuildsAction:function(){function s(e){$("body").append(r).show();var t=$("#tablesorterRt").dataTable();return e+="&ajax=true",$.ajax({type:"POST",url:"buildqueue/_selected/cancelselected",data:e,success:function(e){r.remove(),t.fnClearTable(),$.each(e,function(e,n){var r=[n];t.fnAddData(r)}),i.prop("checked",!1)}}),!1}var e=n.render(t,{preloader:"true"}),r=$(e),i=$("#selectall");i.click(function(){var e=$("#tablesorterRt").dataTable(),t=e.fnGetNodes();$(".fi-js",t).prop("checked",this.checked)}),$("#submitBtn").click(function(e){e.preventDefault();var t=$("#tablesorterRt").dataTable(),n=t.fnGetNodes(),r=$(".fi-js",n),i="";r.each(function(){$(this).is(":checked")&&(i+="cancelselected="+$(this).val()+"&")});var o=i.slice(0,-1);o!=""&&s(o)}),$("#tablesorterRt").delegate(".force-individual-js","click",function(e){e.preventDefault();var t=$(this).prev().prev().val(),n="cancelselected="+t;s(n)})},updateBuilders:function(){$.ajax({url:"/json/builders/?filter=0",dataType:"json",type:"GET",cache:!1,success:function(e){function i(e){var t=0;return $.each(e,function(){t+=parseFloat(this)||0}),t}var t=[],n=[],r=[];$.each(e,function(e,i){t.push(e),n.push(i.pendingBuilds),i.state=="building"&&r.push(i.currentBuilds)}),$("#pendingBuilds").text(i(n))}}),$.ajax({url:"/json/slaves/?filter=0",dataType:"json",type:"GET",cache:!1,success:function(e){var t=[];$.each(e,function(e){t.push(e)}),$("#slavesNr").text(t.length)}})},codeBaseBranchOverview:function(e){var t=decodeURIComponent(window.location.search),n=t.split("&"),r=$('<div class="border-table-holder"><div id="overScrollJS" class="inner-table-holder"><table class="codebase-branch-table"><tr class="codebase"><th>Codebase</th></tr><tr class="branch"><th>Branch</th></tr></table></div></div>');r.appendTo(e),$(n).each(function(e){var t=this.split("=");if(t[0].indexOf("_branch")>0){var n=this.split("_branch")[0];e==0&&(n=this.replace("?","").split("_branch")[0]);var r=this.split("=")[1];$("tr.codebase").append("<td>"+n+"</td>"),$("tr.branch").append("<td>"+r+"</td>")}})},menuItemWidth:function(e){if(e){var t=0;$(".breadcrumbs-nav li").each(function(){t+=$(this).outerWidth()}),$(".breadcrumbs-nav").width(t+100)}else $(".breadcrumbs-nav").width("")},toolTip:function(e){$(e).parent().hover(function(){var t=$(e,this).attr("data-txt"),n=$("<div/>").addClass("tool-tip").text(t);$(this).append($(n).css({top:$(e,this).position().top-10,left:$(e,this).position().left-20}).show())},function(){$(".tool-tip").remove()}),$(document).bind("click touchstart",function(e){$(".tool-tip").remove(),$(this).unbind(e)})},displaySum:function(e,t){e.text(t.length)},summaryArtifactTests:function(){var e=$("li.artifact-js"),t=$("#showArtifactsJS"),n=$("#noArtifactsJS");if(e.length>0){n.hide();var r=t.show().text("("+e.length+") Artifacts ").next().find(".builders-list").html(e)}else n.show();var i=$(".s-logs-js"),s=$("#testsListJS"),o=[];$(i).each(function(){var e=$(this).text().split(".").pop();(e==="xml"||e==="html")&&o.push($(this))}),o.length>0&&(s.html($("<li>Test Results</li>")),s.append(o))},setCookie:function(e,t,n){var r=new Date,i=new Date(r.getTime()+2592e6),s=n===undefined?i.toGMTString():"Thu, 01 Jan 1970 00:00:00 GMT;";document.cookie=e+"="+escape(t)+"; path=/; expires="+s},startCounter:function(e,t){function o(){var t=Math.floor(s/86400),n=Math.floor(s/3600)%24,r=Math.floor(s/60%60),i=Math.floor(s%60),o=[];t>0&&o.push(t==1?"1 day ":t+" days"),n>0&&o.push(n==1?"1 hr ":n+" hrs"),(r>0||n>0)&&o.push(r>1?r+" mins":r+" min"),(i>0||r>0||n>0)&&o.push(i>1?i+" secs":i+" sec"),e.html(o.join(" "))}var n=parseInt(t),r=Math.round(+(new Date)/1e3),i=r-n,s=Math.round(i);o(),function u(){s++,o(),setTimeout(u,1e3)}()},inDOM:function(e){return e.closest(document.documentElement).size()>0},delegateToProgressBar:function(e){$.each(e,function(e,t){var n=$(t);r.progressBar(n.attr("data-etatime"),n,n.attr("data-starttime"))})},verticalProgressBar:function(e,t){e.height("{0}%".format(t))},progressBar:function(e,t,n,i){function f(){var r=100,f=moment.lang();if(a){var l=moment(),c=i===undefined?e--:e++,h=moment().add("s",c),p=l+e*1e3;r=100-(h-l)/(h-s)*100,r=r.clamp(0,100),moment.lang("progress-bar-en"),u.html(moment(p).fromNow()),l>p&&t.addClass("overtime")}else moment.lang("progress-bar-no-eta-en"),u.html(moment(parseInt(n*1e3)).fromNow());moment.lang(f),o.css("width",r+"%")}var s=moment.unix(n),o=t.children(".percent-inner-js"),u=t.children(".time-txt-js"),a=e>0;i&&t.addClass("overtime"),f(),function l(){f(),setTimeout(function(){r.inDOM(o)&&l()},1e3)}()},startCounterTimeago:function(e,t){function n(){var n=parseInt(t),r=moment.unix(n).fromNow();e.html(r)}n(),function i(){n(),setTimeout(function(){r.inDOM(e)&&i()},1e3)}()},getTime:function(e,t){t===null&&(t=Math.round(+(new Date)/1e3));var n=t-e,r=Math.round(n),i=Math.floor(n/86400)==0?"":Math.floor(n/86400)+" days ",s=Math.floor(n/3600)==0?"":Math.floor(n/3600)%24+" hours ",o=Math.floor(r/60)==0?"":Math.floor(r/60)%60+" mins, ",u=r-Math.floor(r/60)*60+" secs ";return i+s+o+u},getResult:function(e){var t=["success","warnings","failure","skipped","exception","retry","canceled"];return t[e]},getSlavesResult:function(e,t){return e===!1?"Not connected":t.length>0?"Running":"idle"},getClassName:function(e,t){var n=r.getSlavesResult(e,t);return n==="Not connected"?"status-td offline":n==="Running"?"status-td building":"status-td idle"},getCurrentPage:function(){var e=document.getElementsByTagName("body")[0].id;return e},hasfinished:function(){var e=!1,t=$("#isFinished").attr("data-isfinished");return t===undefined&&(e=!1),t===!0&&(e=!0),e},isRealTimePage:function(){var e=!1,t=["buildslaves_page","builders_page","builddetail_page","buildqueue_page"],n=r.getCurrentPage();return $.each(t,function(t,r){r===n&&(e=!0)}),e},getCookie:function(e){var t=new RegExp(e+"=([^;]+)"),n=t.exec(document.cookie);return n!=null?decodeURI(n[1]):""},eraseCookie:function(e,t,n){r.setCookie(e,t,n)},closePopup:function(e,t){var n=$(".close-btn").add(document);n.bind("click touchstart",function(n){if(!$(n.target).closest(e).length||$(n.target).closest(".close-btn").length)t===undefined?e.remove():e.slideUp("fast",function(){$(this).remove()}),$(this).unbind(n)})},codebasesFromURL:function(e){var t=window.location.search.substring(1),n=t.split("&");return $.each(n,function(t,n){var r=n.split("=");r[0].indexOf("_branch")>=0&&(e[r[0]]=r[1])}),e},urlParamsToString:function(e){var t=[];return $.each(e,function(e,n){t.push(e+"="+n)}),t.join("&")},getCssClassFromStatus:function(e){var t=Object.keys(i).map(function(e){return i[e]});return t[e]}},r});