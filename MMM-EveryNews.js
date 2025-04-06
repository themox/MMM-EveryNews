/* Magic Mirror
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
        animationSpeed: 3000,                   // fade speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        rotateInterval:  5 * 60 * 1000,
        updateInterval: 30 * 60 * 1000,
    	userAgent: "MagicMirror",		        // keeping default simple but can be customized by the user; cannot be blank
        qrPosition: "top-left",                // Options: top-left, top-right, bottom-left, bottom-right
        useQr: false,
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
        requiresVersion: "2.1.0",

        //  Set locale.

	    // Initialize variables for module
        this.NatGeo = [];
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
	    this.loaded = false;
        this.hasError = false;
        this.errorText = "";

        // Dynamically assign qr-code size based on configuration
        style.innerHTML = `
            .MMM-EveryNews .qr-code {
                width: ${this.config.qrWidth}px;
                height: ${this.config.qrWidth}px;
            }`;
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded && !this.hasError) {
            wrapper.innerHTML = "AnyNews Presents . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        } else if (!this.loaded && this.hasError) {
	        wrapper.innerHTML = "AnyNews Presents . . .<br>" + this.errorText;
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
        var keys = Object.keys(this.NatGeo);
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }
            var NatGeo = this.NatGeo[keys[this.activeItem]];
            
            const content_wrapper = document.createElement("div");
            content_wrapper.className = "everynews-wrapper";

            // The source of the article
            var source = document.createElement("div");
            source.className = "source";
            source.innerHTML = NatGeo.source.name;
            content_wrapper.appendChild(source);

            // The title
            var title = document.createElement("div");
            title.className = "title";
            title.innerHTML = NatGeo.title;
            content_wrapper.appendChild(title);

            // The picture
            var imgblock = document.createElement("div");
            imgblock.className = "image-block";

            var imgWrapper = document.createElement("div");
            imgWrapper.className = "image-wrapper";
            
            var img = document.createElement("img");
            img.className = "photo";
            img.src = NatGeo.urlToImage;

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
            if (this.config.useQr == true && NatGeo.url) {

                const qr_container =  document.createElement("div");
                qr_container.className = "qr-container";
                
                const qr_url = this.createQRCodeElement(NatGeo.url, this.config.qrWidth);
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
                description.innerHTML = '<marquee behavior="scroll" direction="left" scrollamount="'+this.config.scrollSpeed+'">' + NatGeo.description + '</marquee>';
            } else {
                description.innerHTML = NatGeo.description;
            }
            wrapper.appendChild(description);         
		}
        return wrapper;
    },

    processNatGeo: function(data) {
        this.NatGeo = data;
      console.log(this.NatGeo);
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
            this.getNatGeo();
        }, this.config.updateInterval);
        this.getNatGeo(this.config.initialLoadDelay);
    },

    getNatGeo: function() {
        this.sendSocketNotification('GET_NATGEO');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NATGEO_RESULT") {
            // reset error if we get a real result
            this.hasError = false;
            this.errorText = "";
            this.processNatGeo(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        } else if (notification === "NATGEO_ERROR") {
            // Cue up an error code and set the error message based on the returned results
            this.hasError = true;
            this.errorText = payload;

            // Still need to cue the animation etc. so the error message gets displayed.
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
	    }
        this.updateDom(this.config.initialLoadDelay);
    },
});
