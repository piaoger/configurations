

function ncp (source, dest, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  var basePath = process.cwd(),
      currentPath = path.resolve(basePath, source),
      targetPath = path.resolve(basePath, dest),
      filter = options.filter,
      transform = options.transform,
      clobber = options.clobber !== false,
      errs = null,
      started = 0,
      finished = 0,
      running = 0,
      limit = options.limit || ncp.limit || 16;

  limit = (limit < 1) ? 1 : (limit > 512) ? 512 : limit;

  startCopy(currentPath);

  function startCopy(source) {
    started++;
    if (filter) {
      if (filter instanceof RegExp) {
        if (!filter.test(source)) {
          return cb(true);
        }
      }
      else if (typeof filter === 'function') {
        if (!filter(source)) {
          return cb(true);
        }
      }
    }
    return getStats(source);
  }

  function defer(fn) {
    if (typeof(setImmediate) === 'function')
      return setImmediate(fn);
    return process.nextTick(fn);
  }

  function getStats(source) {
    if (running >= limit) {
      return defer(function () {
        getStats(source);
      });
    }
    running++;
    fs.lstat(source, function (err, stats) {
      var item = {};
      if (err) {
        return onError(err);
      }

      // We need to get the mode from the stats object and preserve it.
      item.name = source;
      item.mode = stats.mode;

      if (stats.isDirectory()) {
        return onDir(item);
      }
      else if (stats.isFile()) {
        return onFile(item);
      }
      else if (stats.isSymbolicLink()) {
        // Symlinks don't really need to know about the mode.
        return onLink(source);
      }
    });
  }

  function onFile(file) {
    var target = file.name.replace(currentPath, targetPath);
    isWritable(target, function (writable) {
      if (writable) {
        return copyFile(file, target);
      }
      if(clobber)
        rmFile(target, function () {
          copyFile(file, target);
        });
    });
  }

  function copyFile(file, target) {
    var readStream = fs.createReadStream(file.name),
        writeStream = fs.createWriteStream(target, { mode: file.mode });
    if(transform) {
      transform(readStream, writeStream,file);
    } else {
      readStream.pipe(writeStream);
    }
    readStream.once('end', cb);
  }

  function rmFile(file, done) {
    fs.unlink(file, function (err) {
      if (err) {
        return onError(err);
      }
      return done();
    });
  }

  function onDir(dir) {
    var target = dir.name.replace(currentPath, targetPath);
    isWritable(target, function (writable) {
      if (writable) {
        return mkDir(dir, target);
      }
      copyDir(dir.name);
    });
  }

  function mkDir(dir, target) {
    fs.mkdir(target, dir.mode, function (err) {
      if (err) {
        return onError(err);
      }
      copyDir(dir.name);
    });
  }

  function copyDir(dir) {
    fs.readdir(dir, function (err, items) {
      if (err) {
        return onError(err);
      }
      items.forEach(function (item) {
        startCopy(dir + '/' + item);
      });
      return cb();
    });
  }

  function onLink(link) {
    var target = link.replace(currentPath, targetPath);
    fs.readlink(link, function (err, resolvedPath) {
      if (err) {
        return onError(err);
      }
      checkLink(resolvedPath, target);
    });
  }

  function checkLink(resolvedPath, target) {
    isWritable(target, function (writable) {
      if (writable) {
        return makeLink(resolvedPath, target);
      }
      fs.readlink(target, function (err, targetDest) {
        if (err) {
          return onError(err);
        }
        if (targetDest === resolvedPath) {
          return cb();
        }
        return rmFile(target, function () {
          makeLink(resolvedPath, target);
        });
      });
    });
  }

  function makeLink(linkPath, target) {
    fs.symlink(linkPath, target, function (err) {
      if (err) {
        return onError(err);
      }
      return cb();
    });
  }

  function isWritable(path, done) {
    fs.lstat(path, function (err, stats) {
      if (err) {
        if (err.code === 'ENOENT') return done(true);
        return done(false);
      }
      return done(false);
    });
  }

  function onError(err) {
    if (options.stopOnError) {
      return callback(err);
    }
    else if (!errs && options.errs) {
      errs = fs.createWriteStream(options.errs);
    }
    else if (!errs) {
      errs = [];
    }
    if (typeof errs.write === 'undefined') {
        errs.push(err);
    }
    else {
        errs.write(err.stack + '\n\n');
    }
    return cb();
  }

  function cb(skipped) {
    if (!skipped) running--;
    finished++;
    if ((started === finished) && (running === 0)) {
      return errs ? callback(errs) : callback(null);
    }
  }
};



var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    https = require('https'),
    child_process = require('child_process');

var platform = os.platform(),
    versions = process.versions;

var noop = function() {
    // no op
}


// npm CA Certification
// see https://npmjs.org/install.sh
var cacert =
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

/**
* Generates an unique id.
* @param {String} elements
* @return {String} returns an unique id
*/
function uniqueId(elements) {
    elements |= 5;
    var text = "";
    var candidates = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var length = candidates.length;
    for (var i = 0; i < elements; i++ ) {
        text += candidates.charAt(Math.floor(Math.random() * length));
    }
    return text;
};

/**
* Aync create a file in /tmp folder and write the content.
* It pass results back through this process.
* @param {String} content The content written to temp file
* @param (String) prefix Prefix of file name
*/
function createTmpFile(content, prefix, callback) {
    prefix = prefix ? prefix + '_' : 'tmp_';
    var tempdir = path.resolve(os.tmpdir());
    var tmpFile = path.join(tempdir, prefix  + uniqueId());

    fs.writeFile(tmpFile, content, function(err) {
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
function shellExecute(command, args, options, callback) {
    callback = callback || function(){};
    var child = child_process.spawn(command, args, options);
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
        callback();
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


function curl(options, callback) {
    // curl -SsL --output filename url
    var args = [];
    args.push('-SsL');

    if (options.cacert) {
        args.push('--cacert');
        args.push(options.cacert);
    }

    args.push('--output');
    args.push(options.output);
    args.push(options.url);

    console.log('curl: ' + options.url);
    shellExecute('curl', args, {}, callback || function(){});
}

/*
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
        shellExecute('curl', args, {path:'npm.json'}, function(){

        });
    } else {
        var args    = [];
        //curl -SsL --cacert "$cacert" https://registry.npmjs.org/npm/$t;
        //args.push('curl');
        console.log('download zip');
        args.push('--output');
        args.push('npm-1.3.7.zip');
        args.push('http://nodejs.org/dist/npm/npm-1.3.7.zip');
        shellExecute('curl', args, {}, function(){
            var sevenzip = path.join(__dirname , '7zip', '7z.exe');
            var extracted = 'GetGnuWin32-0.6.3';
            shellExecute(sevenzip, ['x', '-o' + extracted, output], undefined, function(){
                fs.unlink(path, extracted);
            });
        });
    }
}

//createTmpFile('xx', callback);
*/

// Download npm from http://nodejs.org/dist/npm/
var options = {
    hostname: 'registry.npmjs.org',
    port: 443,
    path: '/npm/latest',
    ca: [cacert],
    rejectUnauthorized: true,
    agent: false
};
// Why I cannot use https.request????
var req = https.get(options, function(res) {
    var npmjson = '';
    res.on('data', function(data) {
        npmjson += data;
    });
    res.on('end', function(d) {
        var config = JSON.parse(npmjson),
            filename,
            args;

        filename = 'npm-' + config.version + '.zip'
        var npmzip = {
            url: 'http://nodejs.org/dist/npm/' + filename,
            output: filename
        };

        curl(npmzip, function(){
            var sevenzip = path.join(__dirname , '7zip', '7z.exe');
            var extracted = 'node';
            shellExecute(sevenzip, ['x', '-o' + extracted, filename], undefined, function(){
                fs.unlink(filename, noop);
            });
        });
    });
    res.on('error', function(data) {
        console.log(data);
    });
});

// gnuwin32
var getgnuwin32 = {
    url: 'http://sourceforge.net/projects/getgnuwin32/files/getgnuwin32/0.6.30/GetGnuWin32-0.6.3.exe',
    output: 'GetGnuWin32-0.6.3.exe'
}
curl(getgnuwin32, function(){
    // "7zip/7z.exe" x -ogetgunwin32 getgnuwin32.exe
    var sevenzip = path.join(__dirname , '7zip', '7z.exe');
    var extracted = 'GetGnuWin32-0.6.3';
    shellExecute(sevenzip, ['x', '-o' + extracted, getgnuwin32.output], undefined, function(){
        console.log('remove ' + getgnuwin32.output);
        fs.unlink(getgnuwin32.output, noop);

        function installGnuWin32(name) {
            function removePause(filepath) {
                var content = fs.readFileSync(filepath, {encoding : 'utf8'});
                fs.renameSync(filepath, filepath + '_backup');
                content = content.replace(/pause/g, ' ');
                fs.writeFileSync(filepath, content);
            }

            var dir = path.join(__dirname, name, 'GetGnuWin32');
            var downloatbat = path.join(dir, 'download.bat');
            var installbat = path.join(dir, 'install.bat');
            removePause(downloatbat);
            removePause(installbat);

            shellExecute(downloatbat, undefined, undefined, function() {
                shellExecute(installbat, undefined, undefined, function(){
                    var gnnwin32 = path.join(dir, 'gnuwin32');
                    var bindgnuwin32 = __dirname
                    ncp(gnnwin32, bindgnuwin32);
                });
            });
        }

        installGnuWin32(extracted);
    });
});


// msysgit
var msysgit = {
    url: 'https://msysgit.googlecode.com/files/PortableGit-1.8.4-preview20130916.7z',
    output: 'PortableGit-1.8.4-preview20130916.7z',
    cacert: 'cacert.pem'
}
curl(msysgit, function(){
    // "7zip/7z.exe" x -ogetgunwin32 getgnuwin32.exe
    var sevenzip = path.join(__dirname , '7zip', '7z.exe');
    var extracted = 'git';
    shellExecute(sevenzip, ['x', '-o' + extracted, msysgit.output], undefined, function(){
        console.log('remove ' + msysgit.output);
        fs.unlink(msysgit.output, noop);
    });
});
