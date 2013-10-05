
var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    https = require('https');

var child_process = require('child_process');

var platform = os.platform();
var versions = process.versions
console.log(versions);

function uniqueId(elements) {
    elements |= 5;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < elements; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};


// Generate a file in /tmp folder
// and write the code sent into it

function createTmpFile(code, callback) {

    var tempdir = path.resolve(os.tmpdir());
    var tmpFile = path.join(tempdir, 'temp_' + uniqueId());

    fs.writeFile(tmpFile, code, function(err) {
        if (err) {
            callback(null, {
                success : false,
                info : 'Error while writing file'
            });
        } else {
            callback(tmpFile, null);
        }
    });
}


/**
* Spawn a new child process to start the application
* It pass results back through this process.
* @param {String[]} args Array List of string arguments
* @param (Object) options Object used for options.
*/
function runCurl(args, options) {

    var child = child_process.spawn('curl', args, options);
    console.log('Spawned child pid: ' + child.pid);

    child.stdout.on('data', function(data ) {
        console.log('std.out: ' + data);
    });

    child.stderr.on('data', function(data ) {
        console.error('std.err: ' + data);
    });

    // This event is emitted when the stdio streams of a child process have all terminated.
    // This is distinct from 'exit', since multiple processes might share the same stdio streams.
    child.on('close', function (code, signal) {
        console.log('Child process closed with code ' + code + ' due to receipt of signal '+ signal);
        //var npmjson = fs.readFileSync(options.path);
       // var config = JSON.parse(npmjson);

       // console.log(config.dist.tarball);
        //console.log(config.version);
    });

    // This event is emitted after the child process ends.
    // If the process terminated normally, code is the final exit code of the process, otherwise null.
    // If the process terminated due to receipt of a signal, signal is the string name of the signal, otherwise null.
    child.on('exit', function(code, signal) {
        console.log('Child process terminated with code ' + code + ' due to receipt of signal '+ signal);
        if (code) {
            // Wait before the current process is ready to exit
            // before setting the exit code (otherwise, all the console
            // output doesn't make it)
            process.on('exit', function() {
                process.exit(code);
            });
        }
    });
}


var npmconfig = {
    hostname: 'registry.npmjs.org',
    version: '/npm/1.1'
}

var hostname = npmconfig.hostname + npmconfig.version

var cacert =  // the npm CA certificate.
      "-----BEGIN CERTIFICATE-----\n"+
      "MIIChzCCAfACCQDauvz/KHp8ejANBgkqhkiG9w0BAQUFADCBhzELMAkGA1UEBhMC\n"+
      "VVMxCzAJBgNVBAgTAkNBMRAwDgYDVQQHEwdPYWtsYW5kMQwwCgYDVQQKEwNucG0x\n"+
      "IjAgBgNVBAsTGW5wbSBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkxDjAMBgNVBAMTBW5w\n"+
      "bUNBMRcwFQYJKoZIhvcNAQkBFghpQGl6cy5tZTAeFw0xMTA5MDUwMTQ3MTdaFw0y\n"+
      "MTA5MDIwMTQ3MTdaMIGHMQswCQYDVQQGEwJVUzELMAkGA1UECBMCQ0ExEDAOBgNV\n"+
      "BAcTB09ha2xhbmQxDDAKBgNVBAoTA25wbTEiMCAGA1UECxMZbnBtIENlcnRpZmlj\n"+
      "YXRlIEF1dGhvcml0eTEOMAwGA1UEAxMFbnBtQ0ExFzAVBgkqhkiG9w0BCQEWCGlA\n"+
      "aXpzLm1lMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLI4tIqPpRW+ACw9GE\n"+
      "OgBlJZwK5f8nnKCLK629Pv5yJpQKs3DENExAyOgDcyaF0HD0zk8zTp+ZsLaNdKOz\n"+
      "Gn2U181KGprGKAXP6DU6ByOJDWmTlY6+Ad1laYT0m64fERSpHw/hjD3D+iX4aMOl\n"+
      "y0HdbT5m1ZGh6SJz3ZqxavhHLQIDAQABMA0GCSqGSIb3DQEBBQUAA4GBAC4ySDbC\n"+
      "l7W1WpLmtLGEQ/yuMLUf6Jy/vr+CRp4h+UzL+IQpCv8FfxsYE7dhf/bmWTEupBkv\n"+
      "yNL18lipt2jSvR3v6oAHAReotvdjqhxddpe5Holns6EQd1/xEZ7sB1YhQKJtvUrl\n"+
      "ZNufy1Jf1r0ldEGeA+0ISck7s+xSh9rQD2Op\n"+
      "-----END CERTIFICATE-----\n"


// Download npm from http://nodejs.org/dist/npm/
// Download node.js from

var callback = function(err) {

 if(false) {
     var args    = [];
        //curl -SsL --cacert "$cacert" https://registry.npmjs.org/npm/$t;
        //args.push('curl');
        args.push('-SsL');
        args.push('--cacert');
        args.push('cert.pem');
        args.push('--output');
        args.push('npm.json');
        args.push('https://registry.npmjs.org/npm/latest');
        runCurl(args, {path:'npm.json'});
    } else {
        var args    = [];
        //curl -SsL --cacert "$cacert" https://registry.npmjs.org/npm/$t;
        //args.push('curl');
        console.log('download zip');
        args.push('--output');
        args.push('npm.zip');
        args.push('http://nodejs.org/dist/npm/npm-1.3.7.zip');
        runCurl(args, {});
    }

}

//createTmpFile('xx', callback);


// Why I cannot use https.request????

var options = {
    hostname: 'registry.npmjs.org',
    port: 443,
    path: '/npm/latest',
    ca: [cacert],
    rejectUnauthorized: true,
    agent: false
};
console.log(options);

var req = https.get(options, function(res) {
    var npmjson = '';

    res.on('data', function(d) {
      //process.stdout.write(d);
      npmjson += d;
    });

    res.on('end', function(d) {
        var config = JSON.parse(npmjson);
        console.log(config.dist.tarball);
        console.log(config.version);
        console.log('download zip');

        var args = [];
        args.push('-SsL');
        args.push('--output');
        args.push('npm.zip');
        args.push('http://nodejs.org/dist/npm/npm-' + config.version + '.zip');
        runCurl(args, {});
    });

    res.on('error', function(d) {
      console.log('error.....');
    });
});