## MMM-EveryNews

* Over 30,000 News sources!
* Choose up to 10 at once.
* Simplified addition to your config entry.
* Now with QR code option to read full text article on your mobile device.

## Examples

![](images/1.png), ![](images/2.png), ![](images/3.png), ![](images/4.png),

## Installation
1. To install the module, use your terminal to navigate to your MagicMirror's modules folder. If you are using the default installation directory, use the command:<br />`cd ~/MagicMirror/modules`
2. Clone the module:<br />`git clone https://github.com/themox/MMM-EveryNews`
3. Install required apis:<br />`npm newsapi --save`
4. Get FREE API key --> https://newsapi.org/register; add this to your config.js
5. Update your custom.css accordingly.  Annotated .css file included for your convenience.

## Update Instructions

From the MagicMirror\modules\MMM-Oura2\ path:
1. Pull down the latest files from GitHub:<br/>`git pull` 
2. Remove the old npm files:<br/> `rm -rf node_modules package-lock.json`
3. Install new/updated apis:<br />`npm install`

## Config.js entry and options
```
{
    disabled: false,
    module: 'MMM-EveryNews',
    position: 'bottom center',
    config: {
      sources: 'bbc-news,cbs-news',                  // any source from https://newsapi.org/sources; up to 10 at once
      lang: 'en',                                    // see https://newsapi.org/ for supported languages
      scroll: true,                                  // description scroll or static
      scrollSpeed: "3",                              // if scroll is true
      apiKey: 'YOUR API KEY GOES HERE',              // free API key from https://newsapi.org/register
      useHeader: true,                               // False if you don't want a header
      header: "Over 30,000 News Sources!",           // Any text you want. useHeader must be true
      maxWidth: "350px",
      animationSpeed: 3000,                          // fade speed
      rotateInterval: 5 * 60 * 1000,
      userAgent: "MagicMirror",                      // User-Agent for API requests in accordance with NewsAPI's requirements (can be customized to any valid UserAgent string; must not be blank)
      qrPosition: "top-left",                // Options: top-left, top-right, bottom-left, bottom-right
      useQr: false,                           // whether to use QR code or not; default is no.
      qrWidth: 120,                           // width, in px, of the QR code; recommend something like 120-150px, depending on your situation
    }
},
```

## For multiple News sources

* Separate sources by commas
* (Ex. 'bbc-news,national-geographic'). Any source from https://newsapi.org/sources
* Up to 10 at a time

## Sources

Open the "sources.json" file in a code editor (or text editor) and use the id's (as written) in your config entry. This is just a sample of the news sources available for this module. You can use any source from https://newsapi.org/sources.
Use up to 10 at a time.

Update 4/4/2025 - I added the ability to get a QR code for the news articles in case you see one and you want to read more of it.  Let me know if you'd like any other new features or find any bugs.

## Developer commands
- `node --run lint` - Run linting checks.
- `node --run lint:fix` - Fix automatically fixable linting errors.