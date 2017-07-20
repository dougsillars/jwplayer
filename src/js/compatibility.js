/*
    This script is a compatibility bridge between our new API, introduced in JW8, and our old API. Our new API removes
    several methods and properties and may break any scripts interacting with the new player. We provide this script to
    you so that you can upgrade to the latest & greatest immediately; however, we encourage you to read through this source,
    upgrade your usage of our API, and remove this bridge. It will save your page some time & space.
 */
(function(playerLibrary) {
    /*
        Ensure JW Player is loaded before trying to modify it.
        If your script is exiting here, make sure this script is loaded after your player library
    */
    if (!playerLibrary) {
        return;
    }

    /*
        Check if the version of the player requires the compatibility shim. Only versions below 8 require this script.
    */
    if (parseInt(playerLibrary.version, 10) >= 8) {
        var jwplayerCompatible = function(query) {
            var playerInstance = playerLibrary(query);
            if (!playerInstance.trigger) {
                return playerInstance;
            }

            /*
                We've removed a few methods from the public API, and our events now implement Backbone events.
             */
            playerInstance.dispatchEvent = playerInstance.trigger;
            playerInstance.removeEventListener = playerInstance.off;
            playerInstance.getItem = playerInstance.getPlaylistIndex;
            playerInstance.getMeta = playerInstance.getItemMeta;
            playerInstance.getRenderingMode = function() {
                return 'html5';
            };

            /*
                In JW8 we've removed the on* events. They've been replaced by the on() method, which accepts a string and
                a callback. The event name is typically the name as it's on* event, with the "on" removed and the first letter
                decapitalized.
            */
            var callbackMap = {
                onBuffer: 'buffer',
                onPause: 'pause',
                onPlay: 'play',
                onIdle: 'idle',
                onBufferChange: 'bufferChange',
                onBufferFull: 'bufferFull',
                onError: 'error',
                onSetupError: 'setupError',
                onFullscreen: 'fullscreen',
                onMeta: 'meta',
                onMute: 'mute',
                onPlaylist: 'playlist',
                onPlaylistItem: 'playlistItem',
                onPlaylistComplete: 'playlistComplete',
                onReady: 'ready',
                onResize: 'resize',
                onComplete: 'complete',
                onSeek: 'seek',
                onTime: 'time',
                onVolume: 'volume',
                onBeforePlay: 'beforePlay',
                onBeforeComplete: 'beforeComplete',
                onDisplayClick: 'displayClick',
                onControls: 'controls',
                onQualityLevels: 'levels',
                onQualityChange: 'levelsChanged',
                onCaptionsList: 'captionsList',
                onCaptionsChange: 'captionsChanged',
                onAdError: 'adError',
                onAdClick: 'adClick',
                onAdImpression: 'adImpression',
                onAdTime: 'adTime',
                onAdComplete: 'adComplete',
                onAdCompanions: 'adCompanions',
                onAdSkipped: 'adSkipped',
                onAdPlay: 'adPlay',
                onAdPause: 'adPause',
                onAdMeta: 'adMeta',
                onCast: 'cast',
                onAudioTrackChange: 'audioTrackChanged',
                onAudioTracks: 'audioTracks'
            };

            Object.keys(callbackMap).forEach(function(key) {
                playerInstance[key] = function (callback) {
                    return playerInstance.on(callbackMap[key], callback);
                };
            });

            return playerInstance;
        };

        /*
         We've removed our browser/OS inspection utils, is* (isChrome, isAndroid, etc.) and have replaced them with
         an Environment object. This object details the environment in which the player thinks it's in. Refer to our
         API docs for more information.
         */
        var environment = playerLibrary(document.createElement('div')).getEnvironment();
        var utils = playerLibrary.utils;
        var valueFn = function (getter) { return function() { return getter; }; };

        utils.isAndroidNative = valueFn(environment.OS.androidNative);
        utils.isAndroid = valueFn(environment.OS.android);
        utils.isChrome = valueFn(environment.Browser.chrome);
        utils.isEdge = valueFn(environment.Browser.edge);
        utils.isFF = valueFn(environment.Browser.firefox);
        utils.isFacebook = valueFn(environment.Browser.facebook);
        utils.isFlashSupported = valueFn(environment.Features.flash);
        utils.isIE = valueFn(environment.Browser.ie);
        utils.isIETrident = function () { return environment.Browser.ie && environment.Browser.version.major >= 11; };
        utils.isIOS = valueFn(environment.OS.iOS);
        utils.isIPad = valueFn(environment.OS.iPad);
        utils.isIPod = valueFn(environment.OS.iPhone);
        utils.isMSIE = valueFn(environment.Browser.msie);
        utils.isMobile = valueFn(environment.OS.mobile);
        utils.isOSX = valueFn(environment.OS.mac);
        utils.isSafari = valueFn(environment.Browser.safari);

        /*
         Extend new library function with the same properties as the original.
         */
        jwplayerCompatible._ = playerLibrary._;
        jwplayerCompatible.api = playerLibrary.api;
        jwplayerCompatible.events = playerLibrary.events;
        jwplayerCompatible.playlist = playerLibrary.playlist;
        jwplayerCompatible.plugins = playerLibrary.plugins;
        jwplayerCompatible.utils = utils;
        jwplayerCompatible.version = playerLibrary.version;
        jwplayerCompatible.vid = playerLibrary.vid;

        window.jwplayer = jwplayerCompatible;

        var touchEvents = {
            DRAG: 'drag',
            DRAG_START: 'dragStart',
            DRAG_END: 'dragEnd',
            CLICK: 'click',
            DOUBLE_CLICK: 'doubleClick',
            TAP: 'tap',
            DOUBLE_TAP: 'doubleTap',
            OVER: 'over',
            MOVE: 'move',
            OUT: 'out'
        };

        var events = {
            // Script Loaders
            COMPLETE: 'complete',
            ERROR: 'error',

            // Ad events
            JWPLAYER_AD_CLICK: 'adClick',
            JWPLAYER_AD_COMPANIONS: 'adCompanions',
            JWPLAYER_AD_COMPLETE: 'adComplete',
            JWPLAYER_AD_ERROR: 'adError',
            JWPLAYER_AD_IMPRESSION: 'adImpression',
            JWPLAYER_AD_META: 'adMeta',
            JWPLAYER_AD_PAUSE: 'adPause',
            JWPLAYER_AD_PLAY: 'adPlay',
            JWPLAYER_AD_SKIPPED: 'adSkipped',
            JWPLAYER_AD_TIME: 'adTime',
            JWPLAYER_CAST_AD_CHANGED: 'castAdChanged',

            // Events
            JWPLAYER_MEDIA_COMPLETE: 'complete',
            JWPLAYER_READY: 'ready',
            JWPLAYER_MEDIA_SEEK: 'seek',
            JWPLAYER_MEDIA_BEFOREPLAY: 'beforePlay',
            JWPLAYER_MEDIA_BEFORECOMPLETE: 'beforeComplete',
            JWPLAYER_MEDIA_BUFFER_FULL: 'bufferFull',
            JWPLAYER_DISPLAY_CLICK: 'displayClick',
            JWPLAYER_PLAYLIST_COMPLETE: 'playlistComplete',
            JWPLAYER_CAST_SESSION: 'cast',
            JWPLAYER_MEDIA_ERROR: 'mediaError',
            JWPLAYER_MEDIA_FIRST_FRAME: 'firstFrame',
            JWPLAYER_MEDIA_PLAY_ATTEMPT: 'playAttempt',
            JWPLAYER_MEDIA_LOADED: 'loaded',
            JWPLAYER_MEDIA_SEEKED: 'seeked',

            // Setup Events
            JWPLAYER_SETUP_ERROR: 'setupError',

            // Utility
            JWPLAYER_ERROR: 'error',
            JWPLAYER_PLAYER_STATE: 'state',
            JWPLAYER_CAST_AVAILABLE: 'castAvailable',

            // Model Changes
            JWPLAYER_MEDIA_BUFFER: 'bufferChange',
            JWPLAYER_MEDIA_TIME: 'time',
            JWPLAYER_MEDIA_TYPE: 'mediaType',
            JWPLAYER_MEDIA_VOLUME: 'volume',
            JWPLAYER_MEDIA_MUTE: 'mute',
            JWPLAYER_MEDIA_META: 'meta',
            JWPLAYER_MEDIA_LEVELS: 'levels',
            JWPLAYER_MEDIA_LEVEL_CHANGED: 'levelsChanged',
            JWPLAYER_CONTROLS: 'controls',
            JWPLAYER_FULLSCREEN: 'fullscreen',
            JWPLAYER_RESIZE: 'resize',
            JWPLAYER_PLAYLIST_ITEM: 'playlistItem',
            JWPLAYER_PLAYLIST_LOADED: 'playlist',
            JWPLAYER_AUDIO_TRACKS: 'audioTracks',
            JWPLAYER_AUDIO_TRACK_CHANGED: 'audioTrackChanged',
            JWPLAYER_PLAYBACK_RATE_CHANGED: 'playbackRateChanged',

            // View Component Actions
            JWPLAYER_LOGO_CLICK: 'logoClick',

            // Model - Captions
            JWPLAYER_CAPTIONS_LIST: 'captionsList',
            JWPLAYER_CAPTIONS_CHANGED: 'captionsChanged',

            // Provider Communication
            JWPLAYER_PROVIDER_CHANGED: 'providerChanged',
            JWPLAYER_PROVIDER_FIRST_FRAME: 'providerFirstFrame',

            // UI Events
            JWPLAYER_USER_ACTION: 'userAction',
            JWPLAYER_PROVIDER_CLICK: 'providerClick',
            JWPLAYER_VIEW_TAB_FOCUS: 'tabFocus',
            JWPLAYER_CONTROLBAR_DRAGGING: 'scrubbing',
            JWPLAYER_INSTREAM_CLICK: 'instreamClick',
            JWPLAYER_BREAKPOINT: 'breakpoint'
        };

        events.touchEvents = touchEvents;

        var states = {
            BUFFERING: 'buffering',
            IDLE: 'idle',
            COMPLETE: 'complete',
            PAUSED: 'paused',
            PLAYING: 'playing',
            ERROR: 'error',

            // These exist at the provider level, but are converted to BUFFERING at higher levels
            LOADING: 'loading',
            STALLED: 'stalled'
        };

        events.state = states;
        window.jwplayer.events = events;
    }
}(window.jwplayer));
