function loadRssPushToDom(channel) {

	console.log('Load RSSPushToDom called');
 
	//feed to parse
	var feed = "https://cors-anywhere.herokuapp.com/" + channel.rss;

	$.ajax(feed, {
		method: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		crossDomain: true,
		accepts: {
			xml: "application/rss+xml"
		},
		dataType: "xml",
		success: function (data) {

			var highlights = [];
			$(data).find("item").each(function () {
				fnfNewsEl = $(this);

				fnfNewsTitle = fnfNewsEl.find('title').text();
				fnfNewsLink = fnfNewsEl.find('link').text();

				if (fnfNewsTitle)
					highlights.push('<a href="' + fnfNewsLink + '"><img class="fnfNewsLogo" src="' + channel.icon + '" />' + fnfNewsTitle + '</a>');


			});
			if (highlights.length > 0) {
				$('#fnfShowingNews').html(highlights);
			} else {
				$('#fnfShowingNews').html('No news found in ' + channel.name + '!! Try another channel !');
			}

		},

		error: function (xhr, ajaxOptions, thrownError) {
			$('#fnfShowingNews').html('<span style="font-weight: bold;">' + ajaxOptions.toUpperCase() + '</span> !! Try another channel or reload page !');
		}

	});
	$('#fnfShowingNews').html('Loading news from - ' + channel.name);
}


/**
 * Toggle settings div
 */
function showSetting() {

	console.log('Toggle settings called');

	$('#settingsMenu').slideToggle();
	$('#fnfNewsfeedNews').slideToggle();

	if (fnfSettingsMenuClicked % 2 == 1) {
		if (fnfChannelChanged) {

			loadSelectedChannelRss();
			fnfChannelChanged = false;
		}

		
	}

	fnfSettingsMenuClicked++;
}


/**
 * Initialization
 */
window.onload = function () {

	
	console.log('Window Onload called !!');



	/**
	 * Settings menu click count
	 */

	fnfSettingsMenuClicked = 0;

	/**
	 * Global variables
	 */
	fnfChannelChanged = false;
	 

	/**
     * Retrieving base path of files
     */
	var scripts = document.getElementsByTagName("script"),
		src = scripts[scripts.length - 1].src;

	basePath = src.substring(0, src.lastIndexOf("/")) + "/";

	/**
	 * loading news channel rss link and icon link
	 */
	loadChannel();

	 
	

	/**
	 * Defined Css
	 */
	var css = document.createElement('link');

	css.href = basePath + 'fnfNewsTicker.css';
	css.rel = 'stylesheet';

	/**
	 * Add Css to document body
	 */
	document.head.appendChild(css);


	loadHtmlPushToDom();

	/**
	 * Check and load jquery
	 */

	if (typeof jQuery == 'undefined') {

		/**
		 * Jquery CDN
		 */
		let jqueryScript = document.createElement('script');
		jqueryScript.src = 'https://code.jquery.com/jquery-3.3.1.min.js';
		jqueryScript.integrity = "sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=";
		jqueryScript.crossOrigin = "anonymous";
		/**
		 * Add Jquery
		 */
		document.head.appendChild(jqueryScript);


		jqueryScript.onload = function () {
			createNewsFeedPushToDom();
			mouserOverActions();
		}

	} else {
		createNewsFeedPushToDom();
		mouserOverActions();
	}

}




function loadHtmlPushToDom() {

	console.log('LoadHtmlPushToDom called');

	var newsTickerDivs = document.getElementsByClassName('fnfNewsFeedContainer');
	var i, len = newsTickerDivs.length;

	
	for (var i = 0; i < len; i++) {
		newsTickerDivs[i].innerHTML = `
		<div class="fnfSticker">
			Breaking News
			<span id="fnfSettings" aria-hidden="false" >
				<img id="fnfSettingsIcon" width="16" height="16" onclick="showSetting()"/>
				
			</span>
		</div>

		<div id="settingsMenu" style="display: none;">
			 
        </div>
		<div id="fnfNewsfeedNews">
			<div class="marquee" id="fnfShowingNews" >Loading News...</div>
		</div>`;
	}
	console.log(len);

}


function createNewsFeedPushToDom() {

	console.log('CreateNewsFeedPushToDom called ');

	$('#fnfSettingsIcon').attr('src', basePath + 'fnf_news_ticker_logo/settings.png');

	var i, j, len = fnfChannels.length, channelItem, inCategoryChannel;

	var selectedChannel = getSelectedChannel();


	var channelMenu = '<article id="fnfSelectedChannel"  class="fnfUtilitySetting"> <p  id="fnfSelectedChannelName">' + selectedChannel.name + '</p>';

	channelMenu += `<p>		<label for="fnfScrollDirection">Direction</label>
								<select id="fnfScrollDirection" name="fnfScrollDirection" class="styled-select semi-square" onchange="fnfChangeDirection(this)">
									<option value="-1">Choose Scrolling Direction</option>
									<option value="1">Left to Right</option>
									<option value="2">Right to Left</option>
								</select>
						</p>`;

	channelMenu += `<p>
						<label for="fnfScrollSpeed">Speed</label>
						<input type="range" id="fnfScrollSpeed" name="fnfScrollSpeed" 
							min="0" max="100" value="50" step="10" onchange="fnfChangeSpeed(this.value)"/>
					</p>
					</article>`;

	channelMenu += "<article class='fnfUtilitySetting'>";

	for (i = 0; i < len; i++) {
		channelItem = fnfChannels[i];

		if (i == 0) {
			channelMenu += "<p id='fnfFirstPara'><h4>" + channelItem.category + "</h4><select class='styled-select semi-square fnfChannelSelect' onchange='fnfSelectChannel(this," + i + ")'>";
		} else {
			channelMenu += "<p><h4>" + channelItem.category + "</h4><select class='styled-select semi-square fnfChannelSelect' onchange='fnfSelectChannel(this," + i + ")'>";
		}

		channelMenu += "<option value='-1'>Select One</option>";
		for (j = 0; j < channelItem.channels.length; j++) {

			inCategoryChannel = channelItem.channels[j];


			if (selectedChannel.name === inCategoryChannel.name) {

				channelMenu += "<option value='" + j + "' selected>" + inCategoryChannel.name + "</option>";
			} else {
				channelMenu += "<option value='" + j + "'>" + inCategoryChannel.name + "</option>";
			}
		}
		channelMenu += "</select></p>";

	}
	channelMenu += "</article>";

	document.getElementById('settingsMenu').innerHTML = channelMenu;

	var scrollDirection = getScrollDirection() , scrollSpeed = getScrollSpeed();

	fnfChangeSpeed(scrollSpeed);

	$('#fnfScrollDirection')[0].selectedIndex = scrollDirection;
	$('#fnfScrollSpeed').attr('value', scrollSpeed);

	var dir = ['', 'reverse', 'normal'];
	$('.marquee').css('animation-direction', dir[scrollDirection]);

	loadSelectedChannelRss();

	/**
	 * Global variable of select tags
	 */
	selectTags = document.querySelectorAll("select.fnfChannelSelect");

 
}


function loadSelectedChannelRss() {

	console.log('LoadSelectedChannelRss called');

	var choosedChannel = getSelectedChannel();

	loadRssPushToDom(choosedChannel);
}


function fnfSelectChannel(ch, cat) {
		cat = parseInt(cat);
		ch = parseInt(ch.value);

	console.log('FnfSelectChannel called '+ cat);

	if (ch != -1) {

		console.log('Length : '+selectTags.length);

		for (var i = 0; i < selectTags.length; i++) {
			if (i != cat && selectTags[i].selectedIndex != 0) selectTags[i].selectedIndex = 0;
		}


		fnfChannelChanged = true;
		var selectedChannel = fnfChannels[cat].channels[ch];

		console.log(cat);

		localStorage.setItem('fnfSelectedChannel', JSON.stringify(selectedChannel));

		$('#fnfSelectedChannelName').html(selectedChannel.name);

	} else {
		var options = selectTags[cat].options;
		var selectedChannelName = getSelectedChannel();

		for (var i = 0; i < options.length; i++) {
			if (options[i].innerHTML === selectedChannelName.name) {
				selectTags[cat].selectedIndex = i;
			}
		}
	}

}


function getSelectedChannel() {
	console.log('GetSelected Channel called !');

	 
	var channel;
	if (localStorage.getItem('fnfSelectedChannel') === null) {
		channel = fnfChannels[0].channels[2];

	} else {
		channel = JSON.parse(localStorage.getItem('fnfSelectedChannel'));
	}

	return channel;
}


function fnfChangeDirection(select) {
	console.log('FnfChangeDirection Called');
	if (select.value == -1) {
		select.selectedIndex = getScrollDirection();
	} else {
		var dir = ['', 'reverse', 'normal'];
		$('.marquee').css('animation-direction', dir[select.value]);
		localStorage.setItem('fnfScrollDirection', select.value);
	}

}

function fnfChangeSpeed(value) {
	console.log('FnfChangeSpeed called !');
    var changes;
	if(value<100){
		changes = "marquee "+(100 - value)+"s linear infinite";
	} else {
		changes = "marquee 1s linear infinite";
	}

	$('.marquee').css('animation', changes);
	localStorage.setItem('fnfSpeed', value);
}

function getScrollSpeed() {
	console.log('Get Scroll Speed called');

	if (localStorage.getItem('fnfSpeed') === null) {
		return 50;
	} else {
		return parseInt(localStorage.getItem('fnfSpeed'));
	}
}

function getScrollDirection() {
	console.log('Getscroll Direction called !!');

	if (localStorage.getItem('fnfScrollDirection') === null) {
		return 2;
	} else {
		return parseInt(localStorage.getItem('fnfScrollDirection'));
	}
}


function mouserOverActions(){
	$('.marquee').hover(
		function(){
		$('.marquee').css('animation-play-state', 'paused');
	},
	function(){
		$('.marquee').css('animation-play-state', 'running');
	});
	
}

/**
 * 
 * Channel List No need to scroll down
 */

 function loadChannel() {
fnfChannels = [{
	category: 'News',
	channels: [
		{
			name: 'Wallstreet Journal - World News',
			rss: 'http://jp.wsj.com/xml/rss/3_7085.xml',
			icon: basePath + 'fnf_news_ticker_logo/WSJ.jpg'
		},
		{
			name: 'Fox News Science',
			rss: 'http://feeds.foxnews.com/foxnews/scitech',
			icon: basePath + 'fnf_news_ticker_logo/fox_news.jpg'
		},
		{
			name: 'CNN – Top Stories',
			rss: 'http://rss.cnn.com/rss/cnn_topstories.rss',
			icon: basePath + 'fnf_news_ticker_logo/cnn.jpg'
		},
		{
			name: 'Time Magazine – Top Stories',
			rss: 'http://feeds.feedburner.com/time/topstories',
			icon: basePath + 'fnf_news_ticker_logo/time.jpg'
		},
		{
			name: 'NYTimes',
			rss: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
			icon: basePath + 'fnf_news_ticker_logo/nyt.jpg'
		},
		{
			name: 'Yahoo News',
			rss: 'https://www.yahoo.com/news/rss/topstories',
			icon: basePath + 'fnf_news_ticker_logo/yahoo.jpg'
		},
		{
			name: 'Washington Post',
			rss: 'http://feeds.washingtonpost.com/rss/world',
			icon: basePath + 'fnf_news_ticker_logo/washingtonpost.jpg'
		},
		{
			name: 'Vox',
			rss: 'https://www.vox.com/rss/index.xml',
			icon: basePath + 'fnf_news_ticker_logo/vox.jpg'
		},
		{
			name: 'BBC News',
			rss: 'http://feeds.bbci.co.uk/news/world/rss.xml',
			icon: basePath + 'fnf_news_ticker_logo/bbc.jpg'
		},
		{
			name: 'Huffington Post',
			rss: 'https://www.huffingtonpost.com/section/front-page/feed',
			icon: basePath + 'fnf_news_ticker_logo/huffington.jpg'
		},
		{
			name: 'ABC News',
			rss: 'http://abcnews.go.com/abcnews/topstories',
			icon: basePath + 'fnf_news_ticker_logo/ABC_News.jpg'
		},
		{
			name: 'Reuters',
			rss: 'http://feeds.reuters.com/reuters/topNews?irpc=69',
			icon: basePath + 'fnf_news_ticker_logo/reuters.jpg'
		},
		{
			name: 'Drudge Report',
			rss: 'http://www.drudgereportfeed.com/rss.xml',
			icon: basePath + 'fnf_news_ticker_logo/drudge.jpg'
		},
		{
			name: 'Market Watch',
			rss: 'http://www.marketwatch.com/rss/topstories/',
			icon: basePath + 'fnf_news_ticker_logo/marketW.jpg'
		},
		{
			name: 'Salon',
			rss: 'https://www.salon.com/feed/',
			icon: basePath + 'fnf_news_ticker_logo/salon.jpg'
		},
		{
			name: 'New Yorker',
			rss: 'http://www.newyorker.com/services/rss/feeds/everything.xml',
			icon: basePath + 'fnf_news_ticker_logo/newyorker.jpg'
		},
		{
			name: 'Daily Mail',
			rss: 'http://www.dailymail.co.uk/articles.rss',
			icon: basePath + 'fnf_news_ticker_logo/daily-mail-logo.jpg'
		},
		{
			name: 'New York Post',
			rss: 'https://nypost.com/feed/',
			icon: basePath + 'fnf_news_ticker_logo/newyorkpost.jpg'
		}

	]
},

{
	category: 'Sport',
	channels: [
		{
			name: 'ESPNCricinfo',
			rss: 'http://www.espncricinfo.com/ci/content/rss/feeds_rss_cricket.html',
			icon: basePath + 'fnf_news_ticker_logo/espn.jpg'

		},
		{
			name: 'Cricbuzz',
			rss: 'http://live-feeds.cricbuzz.com/CricbuzzFeed',
			icon: basePath + 'fnf_news_ticker_logo/cricbuzz.jpg'

		},
		{
			name: 'BBC Sports',
			rss: 'http://feeds.bbci.co.uk/sport/rss.xml?edition=int#',
			icon: basePath + 'fnf_news_ticker_logo/bbcsports.jpg'
		},
		{
			name: 'ESPN',
			rss: 'http://www.espn.com/espn/rss/news',
			icon: basePath + 'fnf_news_ticker_logo/espn.jpg'
		},
		{
			name: 'NBA',
			rss: 'http://www.nba.com/rss/nba_rss.xml',
			icon: basePath + 'fnf_news_ticker_logo/nba.jpg'
		},
		{
			name: 'NFL',
			rss: 'http://www.nfl.com/rss/rsslanding?searchString=home',
			icon: ''
		},
		{
			name: 'Yahoo Sports',
			rss: 'https://www.yahoo.com/news/rss/sports',
			icon: basePath + 'fnf_news_ticker_logo/yahoosports.jpg'
		},

		{
			name: 'Fox Sports',
			rss: 'https://api.foxsports.com/v1/rss?partnerKey=zBaFxRyGKCfxBagJG9b8pqLyndmvo7UU',
			icon: basePath + 'fnf_news_ticker_logo/foxSports.jpg'
		},
		{
			name: 'Talk Sports',
			rss: 'https://talksport.com/rss/sports-news/all/feed',
			icon: basePath + 'fnf_news_ticker_logo/talksports.jpg'
		},
		{
			name: 'CBS Sports',
			rss: 'https://rss.cbssports.com/rss/headlines/',
			icon: basePath + 'fnf_news_ticker_logo/cbssports.jpg'
		},
		{
			name: 'FIFA',
			rss: 'www.fifa.com/rss/index.xml',
			icon: basePath + 'fnf_news_ticker_logo/fifa.jpg'
		},
		{
			name: 'NU Sports',
			rss: 'http://nusports.com/rss_feeds.aspx',
			icon: basePath + 'fnf_news_ticker_logo/nusports.jpg'
		},
		{
			name: 'Sport1.de',
			rss: 'https://www.sport1.de/news.rss',
			icon: basePath + 'fnf_news_ticker_logo/sport1.jpg'
		},
		{
			name: 'ISSF',
			rss: 'https://www.issf-sports.org/rss/news.html',
			icon: basePath + 'fnf_news_ticker_logo/issf.jpg'
		}

	]
},

{
	category: 'Technology',
	channels: [
		{
			name: 'Wallstreet Journal - Technology',
			rss: 'http://jp.wsj.com/xml/rss/3_7455.xml',
			icon: basePath + 'fnf_news_ticker_logo/WSJ.jpg'
		},
		{
			name: 'Techcrunch',
			rss: 'http://feeds.feedburner.com/Techcrunch',
			icon: basePath + 'fnf_news_ticker_logo/techcrunch.jpg'
		},
		{
			name: 'Wired',
			rss: 'http://feeds.wired.com/wired/index',
			icon: basePath + 'fnf_news_ticker_logo/wiredtech.jpg'
		},
		{
			name: 'NYTimes – Technology',
			rss: 'http://feeds.nytimes.com/nyt/rss/Technology',
			icon: basePath + 'fnf_news_ticker_logo/nytimesTech.jpg'
		},
		{
			name: 'MacWorld',
			rss: 'http://rss.macworld.com/macworld/feeds/main',
			icon: basePath + 'fnf_news_ticker_logo/macworld.jpg'
		},
		{
			name: 'PCWorld',
			rss: 'http://feeds.pcworld.com/pcworld/latestnews',
			icon: basePath + 'fnf_news_ticker_logo/pcworld.jpg'
		},
		{
			name: 'Techworld',
			rss: 'http://www.techworld.com/news/rss',
			icon: basePath + 'fnf_news_ticker_logo/techworld.webp.jpg'
		},
		{
			name: 'LifeHacker',
			rss: 'https://lifehacker.com/rss',
			icon: basePath + 'fnf_news_ticker_logo/lifehacker-logo.jpg'
		},
		{
			name: 'ReadWriteWeb',
			rss: 'http://feeds.feedburner.com/readwriteweb',
			icon: basePath + 'fnf_news_ticker_logo/readwriteweb.jpg'
		},
		{
			name: 'Engadget',
			rss: 'http://www.engadget.com/rss-full.xml',
			icon: basePath + 'fnf_news_ticker_logo/engadget.jpg'
		},
		{
			name: 'Mashable',
			rss: 'http://feeds.mashable.com/Mashable',
			icon: basePath + 'fnf_news_ticker_logo/mashable.jpg'
		},
		{
			name: 'O’Reilly Rada',
			rss: 'http://feeds.feedburner.com/oreilly/radar/atom',
			icon: basePath + 'fnf_news_ticker_logo/orelay.jpg'
		},
		{
			name: 'Gizmodo',
			rss: 'https://gizmodo.com/rss',
			icon: basePath + 'fnf_news_ticker_logo/Gizmodo.jpg'
		},
		{
			name: 'Technology Review',
			rss: 'https://www.technologyreview.com/topnews.rss',
			icon: basePath + 'fnf_news_ticker_logo/mitTechReview.jpg'
		},
		{
			name: 'VentureBeat',
			rss: 'https://venturebeat.com/2013/09/05/venturebeat-rss/',
			icon: basePath + 'fnf_news_ticker_logo/venturebeat.jpg'
		},
		{
			name: 'Recode.net',
			rss: 'http://www.recode.net/rss/index.xml',
			icon: basePath + 'fnf_news_ticker_logo/Recode.jpg'
		},
		{
			name: 'Computer World',
			rss: 'http://www.computerworld.com/index.rss',
			icon: basePath + 'fnf_news_ticker_logo/computerworld.jpg'
		},
		{
			name: 'MakeUsOf',
			rss: 'http://feeds.feedburner.com/Makeuseof',
			icon: basePath + 'fnf_news_ticker_logo/makesof.jpg'
		},
		{
			name: 'CNet.com',
			rss: 'http://www.cnet.com/rss/news',
			icon: basePath + 'fnf_news_ticker_logo/cnet.jpg'
		},
		{
			name: 'HowToGeek',
			rss: 'http://feeds.howtogeek.com/HowToGeek',
			icon: basePath + 'fnf_news_ticker_logo/howtogeek.jpg'
		}

	]
},

{
	category: 'Business',
	channels: [
		{
			name: 'Wallstreet Journal - Business',
			rss: 'http://jp.wsj.com/xml/rss/3_7014.xml',
			icon: basePath + 'fnf_news_ticker_logo/WSJ.jpg'
		},
		{
			name: 'Atlantic Business Channel',
			rss: 'http://feeds.feedburner.com/AtlanticBusinessChannel',
			icon: basePath + 'fnf_news_ticker_logo/AtlanticBusinessChannel.jpg'
		},
		{
			name: 'Entrepeneur.com',
			rss: 'feeds.feedburner.com/entrepreneur/latest',
			icon: basePath + 'fnf_news_ticker_logo/entrepreneur.jpg'
		},
		{
			name: 'Harvard Business',
			rss: 'http://feeds.harvardbusiness.org/harvardbusiness/',
			icon: basePath + 'fnf_news_ticker_logo/harvardbusiness.jpg'
		},
		{
			name: 'Freakonomics',
			rss: 'http://freakonomics.com//feed/',
			icon: basePath + 'fnf_news_ticker_logo/freaknomics.jpg'
		},
		{
			name: 'The Big Picture',
			rss: 'http://feeds.feedburner.com/TheBigPicture',
			icon: basePath + 'fnf_news_ticker_logo/bigpicture.jpg'
		},
		{
			name: 'Fortune',
			rss: 'http://fortune.com/feed/',
			icon: basePath + 'fnf_news_ticker_logo/fortune.jpg'
		},
		{
			name: 'Economist',
			rss: 'http://www.economist.com/rss/the_world_this_week_rss.xml',
			icon: basePath + 'fnf_news_ticker_logo/economis.jpg'
		},
		{
			name: 'The Non-Profit Times',
			rss: 'http://www.thenonprofittimes.com/feed/',
			icon: basePath + 'fnf_news_ticker_logo/nonprofittimes.jpg'
		},
		{
			name: 'SBN Online',
			rss: 'http://www.sbnonline.com/feed/',
			icon: basePath + 'fnf_news_ticker_logo/sbn.jpg'
		},
		{
			name: 'McKinsey',
			rss: 'https://www.mckinsey.com/insights/rss.aspx',
			icon: basePath + 'fnf_news_ticker_logo/mckinsey-and-co.jpg'
		},

		{
			name: 'Business Insider',
			rss: 'http://feeds2.feedburner.com/businessinsider',
			icon: basePath + 'fnf_news_ticker_logo/businessinsider.jpg'
		},
		{
			name: 'Calculated Risk',
			rss: 'http://feeds.feedburner.com/CalculatedRisk',
			icon: basePath + 'fnf_news_ticker_logo/calculatedrisc.jpg'
		},
		{
			name: 'Huffington Post – Business',
			rss: 'https://www.huffingtonpost.com/section/business/feed',
			icon: basePath + 'fnf_news_ticker_logo/huffington.jpg'
		}

	]
},

{
	category: 'Politics',
	channels: [
		{
			name: 'Slate.com – Politics',
			rss: 'http://www.slate.com/articles/news_and_politics/politics.teaser.all.10.rss/',
			icon: basePath + 'fnf_news_ticker_logo/slatepolitics.jpg'
		},
		{
			name: 'World Affair Journal',
			rss: 'http://www.worldaffairsjournal.org/essay-feed.xml',
			icon: basePath + 'fnf_news_ticker_logo/worldaffair.jpg'
		},
		{
			name: 'Fox News – Politics',
			rss: 'http://feeds.foxnews.com/foxnews/politics',
			icon: basePath + 'fnf_news_ticker_logo/fox_news.jpg'
		},
		{
			name: 'CNN Politics',
			rss: 'http://rss.cnn.com/rss/cnn_allpolitics.rss',
			icon: basePath + 'fnf_news_ticker_logo/cnn.jpg'
		},
		{
			name: 'Reuters – Politcs',
			rss: 'http://feeds.reuters.com/Reuters/PoliticsNews',
			icon: basePath + 'fnf_news_ticker_logo/reuters.jpg'
		},
		{
			name: 'USA Today – Politics',
			rss: 'http://rssfeeds.usatoday.com/TP-OnPolitics',
			icon: basePath + 'fnf_news_ticker_logo/usatoday.jpg'
		},
		{
			name: 'Washington Examiner',
			rss: 'http://www.washingtonexaminer.com/rss/politics',
			icon: basePath + 'fnf_news_ticker_logo/washingtonexaminer.jpg'
		},
		{
			name: 'Wallstreet Journal – Politics',
			rss: 'http://online.wsj.com/xml/rss/3_7087.xml',
			icon: basePath + 'fnf_news_ticker_logo/WSJ.jpg'
		},
		{
			name: 'The Nation',
			rss: 'https://www.thenation.com/feed/?post_type=article',
			icon: basePath + 'fnf_news_ticker_logo/thenation.jpg'
		},
		{
			name: 'Daily Signal',
			rss: 'http://dailysignal.com//feed/',
			icon: basePath + 'fnf_news_ticker_logo/dailysignal.jpg'
		},
		{
			name: 'MSNBC',
			rss: 'http://www.msnbc.com/feeds/latest',
			icon: basePath + 'fnf_news_ticker_logo/msnbc-logo-card.jpg'
		},
		{
			name: 'Politico',
			rss: 'https://www.politico.com/rss/politics.xml',
			icon: basePath + 'fnf_news_ticker_logo/politico-logo.jpg'
		},
		{
			name: 'Realwire',
			rss: 'https://www.realwire.com/rss/feeds.asp?cat=Politics',
			icon: basePath + 'fnf_news_ticker_logo/realwire.jpg'
		}

	]
},

{
	category: 'Gaming',
	channels: [
		{
			name: 'Gamespot',
			rss: 'https://www.gamespot.com/feeds/mashup/',
			icon: basePath + 'fnf_news_ticker_logo/gamespot.jpg'
		},
		{
			name: 'Nintendo Life',
			rss: 'http://www.nintendolife.com/feeds/latest',
			icon: basePath + 'fnf_news_ticker_logo/ni.jpg'
		},
		{
			name: 'Indiegames.com',
			rss: 'http://www.indiegames.com/atom.xml',
			icon: basePath + 'fnf_news_ticker_logo/indiegames.jpg'
		},
		{
			name: 'Arstechnica – Gaming',
			rss: 'http://feeds.arstechnica.com/arstechnica/gaming/',
			icon: basePath + 'fnf_news_ticker_logo/arstechnica.jpg'
		},
		{
			name: 'Polygon',   
			rss: 'https://www.polygon.com/rss/index.xml',
			icon: basePath + 'fnf_news_ticker_logo/politico-logo.jpg'
		},
		{
			name: 'Game Informer',
			rss: 'http://www.gameinformer.com/p/rss.aspx',
		 	icon: basePath + 'fnf_news_ticker_logo/game_informer_gameinformer_logo.jpg'
		},
		{
			name: 'Xbox.com – News',
			rss: 'http://news.xbox.com/feed',
			icon: basePath + 'fnf_news_ticker_logo/xbox-logo-100571878-large.jpg'
		},
		{
			name: 'Reddit',
			rss: 'https://www.reddit.com/r/gamers/.rss',
			icon: basePath + 'fnf_news_ticker_logo/reddit.jpg'
		},

		{
			name: 'Rock Paper Shotgun',
			rss: 'https://www.rockpapershotgun.com/feed',
			icon: basePath + 'fnf_news_ticker_logo/rockpaper.jpg'
		},
		{
			name: 'pcgamesn.com',
			rss: 'https://www.pcgamesn.com/rss',
			icon: basePath + 'fnf_news_ticker_logo/PCGames.jpg'
		},

		{
			name: 'Kotaku',
			rss: 'https://kotaku.com/rss',
			icon: basePath + 'fnf_news_ticker_logo/kotaku.jpg'
		}

	]
}

];
}