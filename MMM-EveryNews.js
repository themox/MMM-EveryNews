/* MagicMirror²
 * Module: MMM-EveryNews
 *
 * originally by Mykle1; updated by themox
 *
 */
Module.register("MMM-EveryNews", {

    // Module config defaults.
    defaults: {
        useHeader: true,                        // False if you don't want a header
        header: "MMM-EveryNews",                // Any text you want. useHeader must be true
        maxWidth: "350px",                      // should be bigger than qrWidth or you'll have problems
        scroll: true,
        scrollSpeed: 3,
        animationSpeed: 3000,                   // fade speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        rotateInterval:  40 * 1000,
        updateInterval: 30 * 60 * 1000,
    	userAgent: "MagicMirror",		        // keeping default simple but can be customized by the user; cannot be blank
        qrPosition: "top-left",                // Options: top-left, top-right, bottom-left, bottom-right
        useQr: true,
        qrWidth: 120,
    },

    getStyles: function() {
        return ["MMM-EveryNews.css"];
    },

    getScripts: function() {
        return ["qrcode.min.js"]; 
    },

    createQRCodeElement: function (url, size = 100) {
        const qrWrapper = document.createElement("div");

        new QRCode(qrWrapper, {
          text: url,
          width: size,
          height: size,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      
        return qrWrapper;
      },

    start: function() {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);

        //  Set locale.

	    // Initialize variables for module
        this.NewsChunk = [];
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
	    this.loaded = false;
        this.hasError = false;
        this.errorText = "";

        const style = document.createElement("style");
        style.innerHTML = `
            .MMM-EveryNews .qr-code {
                width: ${this.config.qrWidth}px;
                height: ${this.config.qrWidth}px;
            }`;
        document.head.appendChild(style);
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded && !this.hasError) {
            wrapper.innerHTML = "NewsAPI v2 Presents . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        } else if (!this.loaded && this.hasError) {
	        wrapper.innerHTML = "NewsAPI v2 Presents . . .<br>" + this.errorText;
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
	    }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        // loop the obects
        var keys = Object.keys(this.NewsChunk);
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }
            var NewsChunk = this.NewsChunk[keys[this.activeItem]];
            
            const content_wrapper = document.createElement("div");
            content_wrapper.className = "everynews-wrapper";

            // The source of the article
            var source = document.createElement("div");
            source.className = "source";
            source.innerHTML = NewsChunk.source.name;
            content_wrapper.appendChild(source);

            // The title
            var title = document.createElement("div");
            title.className = "title";
            title.innerHTML = NewsChunk.title;
            content_wrapper.appendChild(title);

            // The picture
            var imgblock = document.createElement("div");
            imgblock.className = "image-block";

            var imgWrapper = document.createElement("div");
            imgWrapper.className = "image-wrapper";
            
            var img = document.createElement("img");
            img.className = "photo";
            img.src = NewsChunk.urlToImage;

            // Handle image load failure
            img.onerror = () => {
                // Create a fallback <div>
                const fallback = document.createElement("div");
                fallback.className = "photo fallback-image";
                fallback.innerText = "No Image Available";
                fallback.style.height = `${this.config.qrWidth * 2 || 200}px`;

                // Replace the <img> with the fallback
                img.replaceWith(fallback);
            };

            imgWrapper.appendChild(img);

            // Convert URL to QR Code
            if (this.config.useQr == true && NewsChunk.url) {

                const qr_container =  document.createElement("div");
                qr_container.className = "qr-container";
                
                const qr_url = this.createQRCodeElement(NewsChunk.url, this.config.qrWidth);
                qr_url.className = "qr-code";
                qr_url.classList.add("qr-code", this.config.qrPosition);
        
                qr_container.appendChild(qr_url);

                // Create and add QR code overlay
                imgWrapper.appendChild(qr_container);
            }

            imgblock.appendChild(imgWrapper)
            content_wrapper.appendChild(imgblock);
            wrapper.appendChild(content_wrapper);

            // The description
            var description = document.createElement("div");
            description.className =  "description";
            if (this.config.scroll == true) {
                description.innerHTML = '<marquee behavior="scroll" direction="left" scrollamount="'+this.config.scrollSpeed+'">' + NewsChunk.description + '</marquee>';
            } else {
                description.innerHTML = NewsChunk.description;
            }
            wrapper.appendChild(description);         
		}
        return wrapper;
    },

    processNews: function(data) {
        this.NewsChunk = data;
      console.log(this.NewsChunk);
        this.loaded = true;
    },

    scheduleCarousel: function() {
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

   scheduleUpdate: function() {
        setInterval(() => {
            this.getNews();
        }, this.config.updateInterval);

        setTimeout(() => {
            this.getNews();
        }, this.config.initialLoadDelay);
    },

    getNews: function() {
        this.sendSocketNotification('GET_NEWS');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEWS_RESULT") {
            // reset error if we get a real result
            this.hasError = false;
            this.errorText = "";
            this.processNews(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        } else if (notification === "NEWS_ERROR") {
            // Cue up an error code and set the error message based on the returned results
            this.hasError = true;
            this.errorText = payload;

            // Still need to cue the animation etc. so the error message gets displayed.
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
	    }
    },
});
