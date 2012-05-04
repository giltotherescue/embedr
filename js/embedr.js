$('document').ready(function () {
  $('form').submit(function () {
    searchTweets($('#term').val(), $('#twitter_user').val());
    return false;
  });
});

searchTweets = function (term, twitter_user) {
  $('#tweet_container').html('<div class="loading">Loading...</div>');
  $('#pinboard').html('');
  console.log('Searching for "' + term + '" tweets from ' + twitter_user);
  var twitter_api_url = 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + twitter_user + '&count=200&trim_user=true&callback=?';

  // Enable caching
  $.ajaxSetup({ cache:true });

  // Send JSON request
  // The returned JSON object will have a property called "results" where we find
  // a list of the tweets matching our request query
  $.getJSON(
    twitter_api_url,
    function (data) {
    console.log("Retrieved " + data.length + " tweets");
    $.each(data, function (i, tweet) {
    // console.log(tweet);

    if (tweet.text !== undefined) {
    lower_term = term.toLowerCase();
    if (tweet.text.toLowerCase().indexOf(lower_term) == -1) {
      return;
    }

    var this_tweet_id = tweet.id_str;
    var exp = /(\bhttp:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    var urls = tweet.text.match(exp);
    var tweet_linked = replaceURLWithHTMLLinks(tweet.text);

    if (urls && urls.length) {
      // Build the html string for the current tweet
      var tweet_html = '<div class="span3" style="display: none">';
      tweet_html += '<div id="tweet' + tweet.id_str + '" class="tweet_text">';
      tweet_html += tweet_linked + '</div><button class="btn btn-warning">Squidoo It</button></div>';

      // Append html string to tweet_container div
      $('#pinboard').append(tweet_html);

      $.each(urls, function (index, url) {
        $.embedly(url, {
          maxWidth:210,
          wmode:'transparent',
          method:'beforeParent',
          key:'6fa2df1e93ec11e1b4f54040aae4d8c9',
          success:$.proxy(function (oembed) {
            if (oembed != null) {
              $(this).before(oembed.code);
              $(this).parent().show().find('.embed').addClass('thumbnail');
              return true;
            }
          }, $('#tweet' + this_tweet_id))
        });
      });
    }
    }
    });
    $('#tweet_container .loading').remove();
    }
  );
};

replaceURLWithHTMLLinks = function (text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.replace(exp, "<a href='$1'>$1</a>");
}