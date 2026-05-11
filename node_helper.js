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
    getNews: async function() {
        if (!this.config || !this.config.sources || !this.config.apiKey) {
            const msg = "MMM-EveryNews: missing config";
            console.error(msg, this.config);
            this.sendSocketNotification("NEWS_ERROR", msg);
            return;
        }

        try {
            var newsapi = new NewsAPI(this.config.apiKey);

            const response = await newsapi.v2.topHeadlines({
                sources: this.config.sources,
                language: this.config.lang,
            });

            if (response.status === "ok") {
                this.sendSocketNotification("NEWS_RESULT", response.articles);
                return;
            }

            this.sendSocketNotification(
                "NEWS_ERROR",
                `NewsAPI error: ${response.status}`
            );
        } catch (err) {
            const code = err.code || err.name || "unknown";
            const message = err.message || String(err);

            console.error("", code, message);

            this.sendSocketNotification(
                "NEWS_ERROR",
                `NewsAPI error: ${code}<br>${message}`
            );
        }
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
