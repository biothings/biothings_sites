let lastUpdated='';
$.ajax({
  type: 'GET',
  url:'//mygene.info/v3/metadata',
  dataType: 'json',
  success: function(data){
    // console.log(data);
    document.getElementById("sources").innerHTML= Object.keys(data.src).length;

    var date = new Date(data.build_date);
    var formattedTime = (date.getMonth()+1)+'-'+date.getDate()+'-'+date.getFullYear();
    document.getElementById("buildDateTarget").innerHTML= formattedTime;
  }
});

// api stats url

// MyGene
var geneURL= 'https://gasuperproxy-1470690417190.appspot.com/query?id=ahxzfmdhc3VwZXJwcm94eS0xNDcwNjkwNDE3MTkwchULEghBcGlRdWVyeRiAgICAgICACgw';
// MyVariant
var variantURL = 'https://gasuperproxy-1470690417190.appspot.com/query?id=ahxzfmdhc3VwZXJwcm94eS0xNDcwNjkwNDE3MTkwchULEghBcGlRdWVyeRiAgICA-MKECgw';
//myChem
var myChemURL= 'https://gasuperproxy-1470690417190.appspot.com/query?id=ahxzfmdhc3VwZXJwcm94eS0xNDcwNjkwNDE3MTkwchULEghBcGlRdWVyeRiAgICA2uOGCgw';
// render api stats and count up to result
$.ajax({url: geneURL, success:function(result){
    var sessionsCount = result.totalsForAllResults['ga:sessions'];
    var options = {
      useEasing: true,
      useGrouping: true,
      separator: ',',
      decimal: '.',
    };
    var demo = new CountUp('testNum', 0, sessionsCount, 0, 2.5, options);
    if (!demo.error) {
        demo.start();
    } else {
        console.error(demo.error);
    }
},
error: function(err){
  $('#apiStatus').html('Not Available');
}});

// API status via UpTime Robot API

// monitor-specific api_key for myVariant
// let apiKey= 'm776973331-492ae87d5b86bf6741009dbf';

// monitor-specific api_key for myGene
let apiKey= 'm142169-2fd3ec3375da41d76e77d604';

// monitor-specific api_key for myChem
// let apiKey= 'm780201416-03e5f5583f5e9a0cd392c68c';

//get uptime range from 7 days ago to today
let currentDate = Math.trunc( new Date().getTime()/1000 );
let today = new Date();
let daysAgo1 = Date.parse(new Date(today.getTime() - (1 * 24 * 60 * 60 * 1000)))/1000;
let daysAgo2 = Date.parse(new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000)))/1000;
let daysAgo3 = Date.parse(new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000)))/1000;
let daysAgo4 = Date.parse(new Date(today.getTime() - (4 * 24 * 60 * 60 * 1000)))/1000;
let daysAgo5 = Date.parse(new Date(today.getTime() - (5 * 24 * 60 * 60 * 1000)))/1000;
let daysAgo6 = Date.parse(new Date(today.getTime() - (6 * 24 * 60 * 60 * 1000)))/1000;
let sevenDaysAgo = Date.parse(new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)))/1000;
let daysAgo8 = Date.parse(new Date(today.getTime() - (8 * 24 * 60 * 60 * 1000)))/1000;
let oneMonthAgo = Date.parse(new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)))/1000;
let twoMonthsAgo = Date.parse(new Date(today.getTime() - (60 * 24 * 60 * 60 * 1000)))/1000;
// console.log(currentDate);
// console.log(sevenDaysAgo);
//final output for ajax call to uptimerobot API
let finalUptimeRange =
//today
daysAgo1+'_'+currentDate+'-'+
//yesterday
daysAgo2+'_'+daysAgo1+'-'+
// 2 days ago
daysAgo3+'_'+daysAgo2+'-'+
// 3 days
daysAgo4+'_'+daysAgo3+'-'+
// 4 days
daysAgo5+'_'+daysAgo4+'-'+
// 5 days
daysAgo6+'_'+daysAgo5+'-'+
// 6 days
sevenDaysAgo+'_'+daysAgo6+'-'+
// 7 days
daysAgo8+'_'+sevenDaysAgo+'-'+
// this week
sevenDaysAgo+'_'+currentDate+'-'+
// one month
oneMonthAgo+'_'+currentDate+'-'+
// two months
twoMonthsAgo+'_'+currentDate;

//console.log(finalUptimeRange);

$.ajax({
  type: "POST",
  dataType: 'json',
  url: 'https://api.uptimerobot.com/v2/getMonitors',
  data: {
    api_key: apiKey,
    logs: '1',
    format: 'json',
    custom_uptime_ranges: finalUptimeRange,
    custom_uptime_ratios: '1-7'
  },
  success: function(data){
    //console.log(data);
    //display api status in API Status Button
    displayStatus(data.monitors[0].status);
    var parts = data.monitors[0].custom_uptime_ranges.split('-');
    //ratios will be in a single string separated by -
    for (var i = 0; i < parts.length; i++) {
      var options = {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
      };

      var demo = new CountUp('daysRange'+(i+1), 0, Math.trunc(parts[i]), 0, 1.5, options);
      if (!demo.error) {
          demo.start();
      } else {
          console.error(demo.error);
      }
    }

  },
  fail: function(err){
    $('#APIStatusInterface').hide();
  }
});

// // MORE APIS MODAL
// // Get the modal
// var modal = document.getElementById('myModal');
//
// // Get the button that opens the modal
// var btn = document.getElementById("moreApisButton");
//
// // Get the <span> element that closes the modal
// var span = document.getElementsByClassName("close")[0];
//
// // When the user clicks on the button, open the modal
// btn.onclick = function() {
// modal.style.display = "block";
// }
//
// // When the user clicks on <span> (x), close the modal
// span.onclick = function() {
// modal.style.display = "none";
// }
//
// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
// if (event.target == modal) {
//   modal.style.display = "none";
// }
// }


function displayStatus(code){
  switch (code) {
    case 0:
        $('#apiStatus').html('PAUSED');
        $('#apiStatus').addClass('text-muted');
      break;
    case 2:
        $('#apiStatus').html('UP');
        $('#apiStatus').addClass('text-blue');
      break;
    case 9:
        $('#apiStatus').html('DOWN');
        $('#apiStatus').addClass('text-danger');
      break;
    default:
      $('#apiStatus').html('N/A');
      $('#apiStatus').addClass('text-warning');
      break;
  }
}

  // Plug-in to hide empty tags in Swagger UI

  // const HideEmptyTagsPlugin = () => {
  //   return {
  //     statePlugins: {
  //       spec: {
  //         wrapSelectors: {
  //           taggedOperations: (ori) => (...args) => {
  //             return ori(...args)
  //               .filter(tagMeta => tagMeta.get("operations") && tagMeta.get("operations").size > 0)
  //           }
  //         }
  //       }
  //     }
  //   }
  // };

  // SwaggerUI Bundle

  // const ui = SwaggerUIBundle({
  //   url: "http://smart-api.info/api/metadata/09c8782d9f4027712e65b95424adba79",
  //   dom_id: '#swagger-ui',
  //   deepLinking: true,
  //   presets: [
  //     SwaggerUIBundle.presets.apis,
  //     // SwaggerUIStandalonePreset
  //     // disables TopBar
  //   ],
  //   plugins: [
  //     SwaggerUIBundle.plugins.DownloadUrl,
  //     // plug-in to hide empty tags
  //     HideEmptyTagsPlugin
  //   ],
  //   // layout: "StandaloneLayout"
  //   // disables TopBar
  // })
  // window.ui = ui;
  //
  // Smooth Scrolling to Anchors
  // Select all links with hashes
  $('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
      // On-page links
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
        &&
        location.hostname == this.hostname
      ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000, function() {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
              return false;
            } else {
              $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
              $target.focus(); // Set focus again
            };
          });
        }
      }
    });
