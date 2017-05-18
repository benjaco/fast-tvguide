/**
 * Created by Benjamin on 04-05-2017.
 */
$(function () {
    materialFramework.init();
});



// http://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
function getDates(startDate, stopDate) {
    var dateArray = [];
    var dayOverviewTitles = [];

    var currentDate = moment(startDate);
    stopDate = moment(stopDate);

    while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
        dayOverviewTitles.push(capitalizeFirstLetter(moment(currentDate).format("ddd D.")));

        currentDate = moment(currentDate).add(1, 'days');
    }

    return [dateArray, dayOverviewTitles];
}
// http://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.replace(/^./, function (match) {
        return match.toUpperCase();
    });
}

function ancherTimestamp() {
    var d = new Date();
    d.setHours(0,0,0,0);
    return d.getTime() / 1000;
}

var module = angular
    .module("tv_module", ['ngAnimate', angularDragula(angular)]);

module.filter('timeOnDay', function() {
    return function(time) {
        return moment(time*1000).format("HH:mm")
    };
});
module.filter('dato', function() {
    return function(time) {
        return moment(time*1000).format("LL")
    };
});
module.filter('timeFromHalfHoureInt', function() {
    return function(time) {
        if( time % 2 === 1 ) {
            return Math.floor(time / 2) + ":30";
        }else{
            return (time / 2) + ":00";
        }
    };
});
// http://stackoverflow.com/questions/11873570/angularjs-for-loop-with-numbers-ranges
module.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);

        for (var i=0; i<total; i++) {
            input.push(i);
        }

        return input;
    };
});
module.controller("tvguide", function ($scope, $http, $interval, $window) {

    function timestamp() {
        return Math.round(Date.now() / 1000 );
    }

    $scope.now = timestamp();
    $interval(function () {
        $scope.now = timestamp();
    }, 5000);

    var updateLayout = function(){
        if( window.innerWidth > 700 ) {
            $scope.height = 66;
            $scope.widthPrHoure = 220;
            $scope.program_padding = 9;
        }else{
            $scope.height = 45;
            $scope.widthPrHoure = 140;
            $scope.program_padding = 2;
        }
    };
    angular.element($window).bind('resize', updateLayout);
    updateLayout();

    var today = moment();
    var inSixDays = moment().add(0, "days");

    $scope.anchorTimestamp = ancherTimestamp();

    console.log($scope.anchorTimestamp);


    var datesBetween = getDates(today, inSixDays);
    $scope.datesBetweenUrlFormat = datesBetween[0];
    $scope.datesBetweenUserFormat = datesBetween[1];

    $scope.channelData = [];
    $scope.channels = [];
    $scope.channelNames = [];

    $scope.loadChannelsFormLocalstoarge = function () {
        if (localStorage.getItem("angular_channels") === null) {
            $scope.channels = [
                "dr1.dr.dk",
                "dr2.dr.dk",
                "dr3.dr.dk",
                "tv2.dk",
                "zulu.tv2.dk",
                "charlie.tv2.dk",
                "news.tv2.dk",
                "tv3.dk",
                "puls.tv3.dk",
                "tv3plus.dk",
                "dk4.dk",
                "kanal4.dk",
                "kanal5.dk",
                "6-eren.dk",
                "canal9.dk"
            ]
        }else{
            $scope.channels = localStorage.getItem("angular_channels").split(",");
        }

        console.log($scope.channels);

    };
    $scope.saveChannels = function () {
        localStorage.setItem("angular_channels", $scope.channels);
    };

    $scope.getData = function () {
        var url = "../server/get_overview.php?" + jQuery.param( {
                channels: $scope.channels,
                dates: $scope.datesBetweenUrlFormat
            } );

        return $http.get(url).then(function (data) {
            $scope.channelData = data.data.channels;
        })

    };


    $scope.init = function () {
        $scope.loadChannelsFormLocalstoarge();
        $http.get("../server/data/channels/dk_channel_names_manuel.json").then(function (data) {
            $scope.channelNames = data.data;



            $scope.getData().then(function () {


            });
        });
    };

    $scope.program = false;

    $scope.showProgram = function (channel, dayNo, programmNo, title) {
        $scope.program = { title:{ da: title } };

        $http.get("../server/get_all_info.php?channel="+channel+"&date="+$scope.datesBetweenUrlFormat[dayNo]+"&no="+programmNo).then(function (data) {
            $scope.program = data.data.program

        })
    };
    $scope.closePopup = function () {
        $scope.program = false;
    };


    $scope.redigerkanaler = false;
    $scope.gem_kanaler = function () {
        var kanaler = [];
        $("[data-valgt-kanal]:checked").each(function () {
            kanaler.push($(this).attr("data-valgt-kanal"))
        });
        $scope.redigerkanaler = false;
        $scope.channels = kanaler;
        $scope.saveChannels();
        $scope.getData();

    };


    $scope.init();

    requestAnimationFrame(function () {
        document.getElementsByClassName("channel-programs")[0].scrollLeft = (new Date()).getHours() * $scope.widthPrHoure - 50;
    });

    $scope.scrollToDay = function (day) {
        document.getElementsByClassName("channel-programs")[0].scrollLeft = (day * 24 * $scope.widthPrHoure  ) + 10 * $scope.widthPrHoure ;
    }

});


