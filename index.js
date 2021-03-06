/**
 * Author: petar bojinov - @pbojinov
 * Date: 01/27/16
 */

'use strict';

/**
 * Get client IP address
 *
 * Will return 127.0.0.1 when testing locally
 * Useful when you need the user ip for geolocation or serving localized content
 *
 * @method getClientIp
 * @param req
 * @returns {string} ip
 */
function getClientIp(req) {

    // the ipAddress we return
    var ipAddress;

    // workaround to get real client IP
    // most likely because our app will be behind a [reverse] proxy or load balancer
    if (req.headers) {
        if ((ipAddress = req.headers['x-client-ip'])) {
            return ipAddress;
        }

        var forwardedForAlt = req.headers['x-forwarded-for'];
        // (typically when your node app is behind a load-balancer (eg. AWS ELB) or proxy)
        if (forwardedForAlt) {
            // x-forwarded-for may return multiple IP addresses in the format:
            // "client IP, proxy 1 IP, proxy 2 IP"
            // Therefore, the right-most IP address is the IP address of the most recent proxy
            // and the left-most IP address is the IP address of the originating client.
            // source: http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/x-forwarded-headers.html
            var forwardedIps = forwardedForAlt.split(',');
            return forwardedIps[0];
        }

        // (default nginx proxy/fcgi)
        // alternative to x-forwarded-for, used by some proxies
        if ((ipAddress = req.headers['x-real-ip'])) {
            return ipAdress;
        }

        // (Rackspace LB and Riverbed's Stingray)
        // http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
        // https://splash.riverbed.com/docs/DOC-1926
        if ((ipAddress = req.headers['x-cluster-client-ip'])) {
            return ipAddress;
        }

        if ((ipAddress = req.headers['x-forwarded'])) {
            return ipAddress;
        }

        if ((ipAddress = req.headers['forwarded-for'])) {
            return ipAddress;
        }

        if ((ipAddress = req.headers['forwarded'])) {
            return ipAddress;
        }
    }

    // remote address check
    var reqConnectionRemoteAddress = req.connection ? req.connection.remoteAddress : null;
    var reqSocketRemoteAddress = req.socket ? req.socket.remoteAddress : null;
    var reqConnectionSocketRemoteAddress = (req.connection && req.connection.socket) ? req.connection.socket.remoteAddress : null;
    var reqInfoRemoteAddress = req.info ? req.info.remoteAddress : null;

    // remote address checks
    if ((ipAddress = req.connection && req.connection.remoteAddress)) {
        return ipAddress;
    }
    if ((ipAddress = req.socket && req.socket.remoteAddress)) {
        return ipAddress;
    }
    if ((ipAddress = req.connection && req.connection.socket && req.connection.socket.remoteAddress)) {
        return ipAddress;
    }
    if ((ipAddress = req.info && req.info.remoteAddress)) {
        return ipAddress;
    } 

    // return null if we cannot find an address
    return null;
}

/**
 * Expose mode public functions
 */
exports.getClientIp = getClientIp;


/**
 * Expose a default implemtation for a connect middleware
 * 
 * @options.attributeName - name of attribute to augment request object with
 */
exports.mw = function(options) {
    if (!options) options = {};
    var attr = options.attributeName || "clientIp";
    return function(req, res, next) {
        req[attr] = getClientIp(req);
        next();
    }
};
