/* MagicMirror²
 * Module: MMM-EveryNews
 *
 * By Mykle1
 * Updated by themox
 *
 */
const NodeHelper = require('node_helper');
const NewsAPI = require('newsapi');

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
        this.config = null;
        this.pendingNews = false;
    },

    // Gets news
    getNews: function() {

        if (!this.config || !this.config.sources || !this.config.apiKey) {
            console.error("MMM-EveryNews: missing config", this.config);
            return;
        }
        
        var newsapi = new NewsAPI(this.config.apiKey);

        newsapi.v2.topHeadlines({
            sources: this.config.sources,
            language: this.config.lang,  
        }).then(response => {

            if (response.status == "ok") {
                var result = response.articles;              
                this.sendSocketNotification('NEWS_RESULT', result);
                return;
            } else {
                // add error checking so the user gets a visible error they will need to do some troubleshooting
                // this will be in lieu of the infinite loading indicator
                var errorString = "Error loading NewsAPI data. <br>  Error # " + response.status;
                this.sendSocketNotification('NEWS_ERROR', errorString);
                console.log(response);
                return;
            }

        });

    },

    socketNotificationReceived: function(notification, payload) {

        // let API know we've received a config so we can go get the rest of the stuff
        if (notification === 'CONFIG') {
            this.config = payload;

            if (this.pendingNews) {
                this.pendingNews = false;
                this.getNews();
            }
            return;
        }

        // defer trying to get the news until after the config is loaded
        // sometimes MM tries to load this before there is a config it seems 
        if (notification === 'GET_NEWS') {
            if (!this.config) {
                console.log("MMM-EveryNews: config not ready; deferring GET_NEWS");
                this.pendingNews = true;
                return;
            }

            this.getNews();
        }

    }
});
