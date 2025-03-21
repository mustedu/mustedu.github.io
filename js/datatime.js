// 计算时间差
function DownTime(EndTime) {
        //如果为时间戳
    var EndTimes = new Date(EndTime).getTime();//结束时间

    var NowTime = new Date().getTime();//当前时间

    var DeltaT = EndTimes-NowTime;
    //计算出相差天数
    var days=Math.floor(DeltaT/(24*3600*1000));

    //计算出小时数

    var leave1=DeltaT%(24*3600*1000);
    var H=Math.floor(leave1/(3600*1000));
    //计算相差分钟数
    var leave2=leave1%(3600*1000);
    var M=Math.floor(leave2/(60*1000));
    //计算相差秒数
    var leave3=leave2%(60*1000);
    var S=Math.round(leave3/1000);
    var reminder;
    if (DeltaT>0){
        if(days !=""){
          reminder = days+" 天 "+H+" 时 "+M+" 分 "+S+" 秒";
        }else if(days =="" || H !=""){
            reminder = H+" 时 "+M+" 分 "+S+" 秒";
        }
    }else {
        reminder = "会议已开始！";
    }
   return reminder;

}