// ==UserScript==
// @name         Legend Express (newjackagario-hash dev)
// @namespace    Legend Express Agario Mod - newjackagario-hash dev
// @version      1.8.2.2
// @description  Agario Mod - Legend,Ogario,Kitty,Old Skins,Animated Skins,Language Packs,Manual User Scripts,Chat,60++ Macros/Hotkeys(Tricksplit,Doublesplit,Quick Feeding,Popsplit,Auto Coins,Freeze Cell Macro,Auto respawn)
// @homepage     https://jimboy3100.github.io
// @author       Jimboy3100
// @license      MIT
// @icon         https://jimboy3100.github.io/banners/CropedImage128.gif
// @match        https://agar.io/*
// @downloadURL  https://raw.githubusercontent.com/newjackagario-hash/jimboy3100.github.io/dev/LMexpress/LMexpress.dev.user.js
// @updateURL    https://raw.githubusercontent.com/newjackagario-hash/jimboy3100.github.io/dev/LMexpress/LMexpress.dev.user.js
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      hslo.io
// @connect      agartool.io
// @connect      imasters.org.ru
// @connect      cdn.ogario.ovh
// @connect      deltav4.glitch.me
// @connect      jimboy3100.github.io
// @connect      legendmod.ml
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Legend Mod by Jimboy3100
/*MIT License*/

/*
 * Legend Express loader - TEST BUILD for newjackagario-hash's fork.
 *
 * Same as LMexpress.user.js, except that it installs and updates from the fork's
 * "dev" branch and loads play.html from there, so changes pushed to that branch can
 * be tried on agar.io before they go into a pull request. The scripts play.html
 * pulls in still come from jimboy3100.github.io, except the ones in forkScripts,
 * which come from the same branch of the fork.
 *
 * Personal testing only: keep this file out of pull requests to jimboy3100, since
 * raw.githubusercontent.com would be a new @connect domain (CLAUDE.md rule 2).
 * Turn off the normal Legend Express script in Tampermonkey while this one is on;
 * both would try to replace the page.
 *
 * agar.io/<mode> picks what runs in place of agar.io's own page: an HTML page
 * written over it (loadPage) or a userscript fetched and run (runUserscript).
 * Unknown paths, agar.io/ and agar.io/legendmod load Legend Mod's play.html.
 */

GM_registerMenuCommand('Legend Mod Website', function () {
    window.open('https://jimboy3100.github.io');
}, 'w');
GM_registerMenuCommand('My fork on GitHub', function () {
    window.open('https://github.com/' + githubUser + '/' + githubRepo + '/tree/' + githubBranch);
}, 'g');
GM_registerMenuCommand('LM Library', function () {
    window.open('https://github.com/jimboy3100/jimboy3100.github.io/');
}, 'l');
GM_registerMenuCommand('Donate for Legend Mod', function () {
    window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CM3GDVCW6PBF6');
}, 'd');

/* Where this test build loads play.html from */
var githubUser = 'newjackagario-hash';
var githubRepo = 'jimboy3100.github.io';
var githubBranch = 'dev';
/* Timestamp so a just-pushed play.html isn't served from cache */
var cacheBust = Date.now();
var forkFileBase = 'https://raw.githubusercontent.com/' + githubUser + '/' + githubRepo + '/' + githubBranch + '/';
var legendPage = forkFileBase + 'play.html?t=' + cacheBust;
/*
 * Scripts taken from the fork instead of jimboy3100.github.io: play.html loads each
 * from https://jimboy3100.github.io/<path>. raw.githubusercontent.com serves files as
 * text/plain with nosniff, so the browser refuses them as <script src>. They are
 * fetched here and written into the page inline, in the same place, so they still
 * run in the same order. Add a path when the fork changes another script.
 */
var forkScripts = [
    'ogario/ogario.v4.js',
    'ogario/hotkeysCommand.js'
];
var requestTimeoutMs = 30000;
/* The /neo and /mobile add-on scripts run this long after the Legend page is written */
var extraScriptDelayMs = 5000;

/*
 * page:   HTML page written over agar.io
 * script: userscript fetched and run
 * legend: the page is Legend Mod's play.html, so it gets the init(<version>) call
 * extra:  userscript run on top of the Legend page
 */
var modes = {
    legendmod: { page: legendPage, legend: true },
    normal:    { page: 'https://agar.io' },
    hslo:      { script: 'https://hslo.io/install.user.js' },
    agartool:  { script: 'https://www.agartool.io/agartool.user.js' },
    /* https only: code fetched over plain http could be swapped by anyone on the network path and would run on agar.io */
    vanilla:   { script: 'https://imasters.org.ru/agar/js/vanilla.user.js' },
    ogario:    { script: 'https://cdn.ogario.ovh/v4/beta/ogario.v4.user.js' },
    delta:     { page: 'https://deltav4.glitch.me/v4/index.html' },
    neo:       { page: legendPage, legend: true, extra: 'https://jimboy3100.github.io/ExampleScripts/Neoprivate.js' },
    mobile:    { page: legendPage, legend: true, extra: 'https://www.legendmod.ml/ExampleScripts/gamepad.user.js' },
    captcha:   { page: 'https://www.legendmod.ml/ogario/captcha.html' }
};

var modVersion = GM_info.script.version;
/* "/Normal/" and "/normal" are the same mode */
var modeName = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
var mode = Object.prototype.hasOwnProperty.call(modes, modeName) ? modes[modeName] : modes.legendmod;

/*
 * LMexpress.js reads the launch link (?sip=, ?pass=, ?replay=...) from localStorage "url".
 * Save it on every visit that loads the Legend page. It used to be saved on agar.io/ only,
 * so a later visit to agar.io/legendmod re-applied the previous link's server or replay.
 */
if (mode.legend) {
    try {
        localStorage.setItem('url', location.href);
    } catch (e) {
        console.error('[LMexpress] Could not save the launch link', e);
    }
}

/* Stop agar.io's own page; the mode's page or userscript replaces it */
document.documentElement.innerHTML = '';

if (mode.page) {
    loadPage(mode.page, mode.legend, mode.extra);
} else {
    runUserscript(mode.script, true);
}

function isHttps(url) {
    return /^https:\/\//i.test(String(url || ''));
}

/* Returns why a response is not usable, or '' if it is. An error page (404/5xx) or a redirect away from https is not the code we asked for. */
function responseProblem(res) {
    if (!res || !(res.status >= 200 && res.status < 300)) {
        return 'status ' + (res ? res.status : 'none');
    }
    if (res.finalUrl && !isHttps(res.finalUrl)) {
        return 'redirected off https to ' + res.finalUrl;
    }
    return '';
}

/* GET a URL over https and hand its text to onText, or a reason to onFail */
function fetchText(url, onText, onFail) {
    /* Never fetch code that is not served over https */
    if (!isHttps(url)) {
        onFail('not https');
        return;
    }
    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        timeout: requestTimeoutMs,
        onload: function (res) {
            var problem = responseProblem(res);
            if (problem) {
                onFail(problem);
                return;
            }
            onText(res.responseText);
        },
        onerror: function (err) {
            onFail('network error', err);
        },
        ontimeout: function () {
            onFail('timed out after ' + (requestTimeoutMs / 1000) + ' s');
        }
    });
}

/* Htmlscript: fetch an HTML page and write it over agar.io */
function loadPage(pageUrl, isLegendPage, extraScriptUrl) {
    fetchText(pageUrl, function (html) {
        if (!isLegendPage) {
            writePage(html);
            return;
        }
        inlineForkScripts(addInitCall(html), writePage);
    }, function (problem, err) {
        console.error('[LMexpress] Could not load page ' + pageUrl + ' (' + problem + ')', err || '');
        showLoadError(pageUrl, problem);
    });

    function writePage(html) {
        document.open();
        document.write(html);
        document.close();
        if (extraScriptUrl) {
            setTimeout(function () {
                runUserscript(extraScriptUrl, false);
            }, extraScriptDelayMs);
        }
    }
}

/*
 * Fetch the forkScripts from the fork and put each one inline in place of its
 * <script src="https://jimboy3100.github.io/<path>"> tag. A script that can't be
 * fetched or placed keeps jimboy3100.github.io's copy, with an error in the console.
 */
function inlineForkScripts(html, done) {
    var codes = {};
    var pending = forkScripts.length;
    if (!pending) {
        done(html);
        return;
    }
    forkScripts.forEach(function (path) {
        fetchText(forkFileBase + path + '?t=' + cacheBust, function (code) {
            codes[path] = code;
            finish();
        }, function (problem, err) {
            console.error('[LMexpress dev] Could not load the fork\'s ' + path + ' (' + problem + '); using jimboy3100.github.io\'s copy', err || '');
            finish();
        });
    });

    function finish() {
        if (--pending > 0) return;
        forkScripts.forEach(function (path) {
            if (typeof codes[path] === 'string') {
                html = inlineScript(html, path, codes[path]);
            }
        });
        done(html);
    }
}

function inlineScript(html, path, code) {
    /* Inside an inline script "<!--" can change where the browser ends it. */
    if (code.indexOf('<!--') !== -1) {
        console.error('[LMexpress dev] The fork\'s ' + path + ' contains "<!--", so it can\'t be inlined; using jimboy3100.github.io\'s copy');
        return html;
    }
    var tag = new RegExp('<script\\s+src="https://jimboy3100\\.github\\.io/' +
        path.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + '"[^>]*>\\s*</script>', 'i');
    if (!tag.test(html)) {
        console.error('[LMexpress dev] play.html has no <script> tag for ' + path + '; the fork\'s copy is not used');
        return html;
    }
    /* "</script" would end the inline script early; "<\/script" means the same in JS. */
    var safe = code.replace(/<\/script/gi, '<\\/script');
    console.info('[LMexpress dev] Using ' + path + ' from ' + githubUser + '/' + githubRepo + ' (' + githubBranch + ')');
    /* A function, so "$&" or "$1" in the code is not read as a replacement pattern */
    return html.replace(tag, function () {
        return '<script>/* ' + path + ' from ' + githubUser + '/' + githubRepo + ' (' + githubBranch + ') */\n' +
            safe + '\n</script>';
    });
}

/*
 * Userscript: fetch a userscript and run it with this loader's GM_info and GM_xmlhttpRequest.
 * replacesPage: the script is the whole mode, so a failed download gets the error page.
 */
function runUserscript(scriptUrl, replacesPage) {
    fetchText(scriptUrl, function (code) {
        try {
            new Function('GM_info', 'GM_xmlhttpRequest', code)(GM_info, GM_xmlhttpRequest);
        } catch (err) {
            console.error('[LMexpress] Error running userscript from ' + scriptUrl, err);
        }
    }, function (problem, err) {
        console.error('[LMexpress] Not running userscript from ' + scriptUrl + ' (' + problem + ')', err || '');
        if (replacesPage) {
            showLoadError(scriptUrl, problem);
        }
    });
}

/* Add the mod's init(<version>) call at the end of the Legend page's body, after its own scripts */
function addInitCall(html) {
    /* JSON quoting, with "<" escaped so the version text can never close the script tag */
    var version = JSON.stringify(modVersion).replace(/</g, '\\u003c');
    var call = '<script>' +
        'if (typeof init === "function") { init(' + version + '); }' +
        ' else { console.error("[LMexpress] init() is missing: LMexpress.js did not load"); }' +
        '</script>';
    var bodyEnd = html.toLowerCase().lastIndexOf('</body>');
    if (bodyEnd === -1) {
        return html + call;
    }
    return html.slice(0, bodyEnd) + call + html.slice(bodyEnd);
}

/* agar.io's page is already gone, so say what failed instead of leaving a blank tab */
function showLoadError(url, problem) {
    var page = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Legend Express</title></head>' +
        '<body style="background:#111;color:#eee;font:16px sans-serif;padding:40px;">' +
        '<h2>Legend Express could not load this mode</h2>' +
        '<p>' + escapeHtml(url) + ' (' + escapeHtml(problem) + ')</p>' +
        '<p><a style="color:#6cf;" href="' + escapeHtml(location.href) + '">Try again</a>' +
        ' &middot; <a style="color:#6cf;" href="https://agar.io/normal">Play agar.io without the mod</a></p>' +
        '</body></html>';
    document.open();
    document.write(page);
    document.close();
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
}
